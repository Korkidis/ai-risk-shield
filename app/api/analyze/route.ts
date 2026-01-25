import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getTenantId } from '@/lib/supabase/auth'
import { BrandGuideline } from '@/types/database'
import { RiskProfile } from '@/lib/gemini'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        const guidelineId = formData.get('guidelineId') as string

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const supabase = await createClient()

        // 1. Authenticate & Get Tenant
        let tenantId: string
        try {
            tenantId = await getTenantId()
        } catch (authError) {
            return NextResponse.json(
                { error: 'Authentication required', details: 'Please log in again.' },
                { status: 401 }
            )
        }

        // Initialize Admin Client for RLS Bypass
        const adminSupabase = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // 2. Pre-process File (Convert to Buffer & Calculate Hash)
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Calculate SHA-256 Checksum
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const sha256_checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Calculate Retention (30 days)
        const deleteAfter = new Date();
        deleteAfter.setDate(deleteAfter.getDate() + 30);

        // 3. Upload File to Supabase Storage (via Admin)
        const isImage = file.type.startsWith('image/')
        const fileType = isImage ? 'image' : 'video'
        const fileName = `${tenantId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

        const { data: uploadData, error: uploadError } = await adminSupabase.storage
            .from('uploads')
            .upload(fileName, file, { cacheControl: '3600', upsert: false })

        if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

        // 4. Create Asset Record (via Admin)
        const { data: asset, error: assetError } = await adminSupabase
            .from('assets')
            .insert({
                tenant_id: tenantId,
                filename: file.name,
                file_type: fileType,
                mime_type: file.type,
                file_size: file.size,
                storage_path: uploadData.path,
                storage_bucket: 'uploads',
                uploaded_by: (await supabase.auth.getUser()).data.user?.id,
                sha256_checksum: sha256_checksum,
                delete_after: deleteAfter.toISOString()
            } as any)
            .select()
            .single()

        if (assetError) throw new Error(`Asset creation failed: ${assetError.message}`)

        // 5. Create Initial Scan Record (via Admin)
        const { data: scan, error: scanError } = await adminSupabase
            .from('scans')
            .insert({
                tenant_id: tenantId,
                asset_id: (asset as any).id,
                status: 'processing',
                is_video: fileType === 'video',
                analyzed_by: (await supabase.auth.getUser()).data.user?.id
            } as any)
            .select()
            .single()

        if (scanError) throw new Error(`Scan creation failed: ${scanError.message}`)

        // 5. Fetch Guideline (if applicable)
        let guideline: BrandGuideline | undefined;
        if (guidelineId && guidelineId !== 'none') {
            const query = supabase.from('brand_guidelines').select('*').eq('tenant_id', tenantId);

            if (guidelineId === 'default') {
                query.eq('is_default', true);
            } else {
                query.eq('id', guidelineId);
            }

            const { data } = await query.maybeSingle();
            if (data) guideline = data;
        }

        // 6. Run Forensic Analysis
        const { analyzeImageMultiPersona } = await import('@/lib/gemini');

        const riskProfile: RiskProfile = await analyzeImageMultiPersona(buffer, file.type, file.name, guideline);

        // 7. Update Scan Record with Results
        const { error: updateError } = await adminSupabase
            .from('scans')
            .update({
                status: 'complete',
                risk_level: riskProfile.verdict === 'Critical Risk' ? 'critical' :
                    riskProfile.verdict === 'High Risk' ? 'high' :
                        riskProfile.verdict === 'Medium Risk' ? 'review' : 'safe',
                composite_score: riskProfile.composite_score,
                ip_risk_score: riskProfile.ip_report.score,
                safety_risk_score: riskProfile.safety_report.score,
                provenance_risk_score: riskProfile.provenance_report.score,
                provenance_status: riskProfile.c2pa_report.status,
                provenance_data: riskProfile.c2pa_report
            } as any)
            .eq('id', (scan as any).id)

        if (updateError) console.error("Failed to save scan results:", updateError);

        // 8. Save Detailed Forensic Findings
        const findings: any[] = [
            {
                tenant_id: tenantId,
                scan_id: (scan as any).id,
                finding_type: 'provenance_issue',
                severity: riskProfile.c2pa_report.status === 'valid' ? 'low' :
                    riskProfile.c2pa_report.status === 'invalid' ? 'critical' : 'high',
                title: 'C2PA Provenance Verification',
                description: riskProfile.provenance_report.teaser,
                recommendation: riskProfile.c2pa_report.status === 'valid'
                    ? 'Asset is armored with verified Content Credentials. Maintain this chain for legal defensibility.'
                    : 'Absence of cryptographic provenance. In IP disputes, your legal defensibility may be hindered without a verified chain of custody.',
                evidence: {
                    status: riskProfile.c2pa_report.status,
                    issuer: riskProfile.c2pa_report.issuer,
                    tool: riskProfile.c2pa_report.tool
                }
            }
        ];

        // Add IP finding if high
        if (riskProfile.ip_report.score > 50) {
            findings.push({
                tenant_id: tenantId,
                scan_id: (scan as any).id,
                finding_type: 'ip_violation',
                severity: riskProfile.ip_report.score > 85 ? 'critical' : 'high',
                title: 'Potential IP Infringement Detected',
                description: riskProfile.ip_report.teaser,
                recommendation: 'Remove or license the detected protected elements immediately.',
                evidence: { score: riskProfile.ip_report.score, reasoning: riskProfile.ip_report.reasoning }
            });
        }

        await adminSupabase.from('scan_findings').insert(findings);

        // 9. If VALID, preserve complete provenance details
        if (riskProfile.c2pa_report.status === 'valid') {
            await adminSupabase.from('provenance_details').insert({
                scan_id: (scan as any).id,
                tenant_id: tenantId,
                creator_name: riskProfile.c2pa_report.creator,
                creation_tool: riskProfile.c2pa_report.tool,
                creation_tool_version: riskProfile.c2pa_report.tool_version,
                creation_timestamp: riskProfile.c2pa_report.timestamp,
                signature_status: 'valid',
                certificate_issuer: riskProfile.c2pa_report.issuer,
                certificate_serial: riskProfile.c2pa_report.serial,
                edit_history: riskProfile.c2pa_report.history,
                raw_manifest: riskProfile.c2pa_report.raw_manifest
            });
        }

        // Update guideline usage
        if (guideline) {
            await (adminSupabase.from('brand_guidelines') as any)
                .update({ last_used_at: new Date().toISOString() })
                .eq('id', guideline.id)
        }

        return NextResponse.json(riskProfile);

    } catch (error: any) {
        console.error('Analysis Error:', error);
        return NextResponse.json(
            { error: error.message || 'Deep Analysis Failed', details: error.toString() },
            { status: 500 }
        );
    }
}
