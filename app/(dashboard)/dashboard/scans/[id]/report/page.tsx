import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FullForensicReport } from '@/components/report/FullForensicReport'
import { Entitlements } from '@/lib/entitlements'
import type { ExtendedScan, ExtendedAsset, ScanFinding } from '@/types/database'
import type { Database } from '@/lib/supabase/types'

// Join result types for the deep fetch select
type ScanJoinResult = Database['public']['Tables']['scans']['Row'] & {
    assets: Database['public']['Tables']['assets']['Row'] | null;
    scan_findings: Array<Database['public']['Tables']['scan_findings']['Row']>;
}

// Map DB Row → component-compatible types
function toExtendedScan(row: ScanJoinResult): ExtendedScan {
    return row as unknown as ExtendedScan
}
function toFindings(rows: ScanJoinResult['scan_findings']): ScanFinding[] {
    return rows.map(f => ({
        ...f,
        type: f.finding_type,
        severity: f.severity as ScanFinding['severity'],
        title: f.title ?? '',
        description: f.description ?? '',
        confidence_score: f.confidence_score ?? 0,
    }))
}

// Profile with tenant join
type ProfileJoinResult = Database['public']['Tables']['profiles']['Row'] & {
    tenants: { name: string } | null;
}

export default async function ReportPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const scanId = params.id
    const supabase = await createClient()

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser()

    // 2. Get Scan Data (Deep Fetch)
    const { data: scan, error } = await supabase
        .from('scans')
        .select(`
      *,
      assets (*),
      scan_findings (*)
    `)
        .eq('id', scanId)
        .single()

    if (error || !scan) {
        return <div className="p-12 text-center">Scan not found</div>
    }

    // Cast for join fields (dynamic select can't be statically inferred)
    const typedScan = scan as unknown as ScanJoinResult

    // 3. Get User Profile for Entitlement Check (Tenant ID)
    let userProfile: ProfileJoinResult | null = null
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('*, tenants(name)')
            .eq('id', user.id)
            .single()
        userProfile = profile as unknown as ProfileJoinResult | null
    }

    // 4. Entitlement Check
    const extScan = toExtendedScan(typedScan)
    const canView = Entitlements.canViewFullReport(
        userProfile ? {
            id: userProfile.id,
            tenant_id: userProfile.tenant_id,
            email: user?.email
        } : null,
        extScan
    )

    if (!canView) {
        redirect(`/dashboard/scans/${scanId}?upgrade=true`)
    }

    // 5. Render Report
    const asset = typedScan.assets as unknown as ExtendedAsset
    const findings = toFindings(typedScan.scan_findings || [])

    return (
        <div className="bg-[var(--rs-bg-base)] min-h-screen py-12 print:bg-white print:py-0">
            <div className="print:hidden mb-8 text-center">
                <div className="inline-block bg-[var(--rs-bg-surface)] px-4 py-2 rounded-[var(--rs-radius-element)] border border-[var(--rs-border-primary)] shadow-[var(--rs-shadow-l1)] text-xs font-mono uppercase tracking-widest text-[var(--rs-text-secondary)]">
                    Press <strong className="text-[var(--rs-text-primary)]">Cmd+P</strong> to save as PDF
                </div>
            </div>
            <FullForensicReport
                scan={extScan}
                asset={asset}
                findings={findings}
                tenantName={userProfile?.tenants?.name || 'Anonymous Client'}
                userName={user?.email || 'N/A'}
            />
        </div>
    )
}
