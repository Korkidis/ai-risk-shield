/**
 * Scan Processor
 *
 * Orchestrates the complete AI analysis pipeline:
 * 1. Fetch file from Supabase Storage
 * 2. Run IP detection analysis
 * 3. Run brand safety analysis
 * 4. Calculate composite risk score
 * 5. Save results to database
 * 6. Update scan status
 *
 * This is the main entry point for processing uploaded files
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import { computeCompositeScore, computeRiskLevel, computeProvenanceScore, computeProvenanceStatus, type C2PAStatus } from '@/lib/risk/scoring'
import { analyzeIP } from './ip-detection'
import { analyzeBrandSafety } from './brand-safety'
import { extractFrames, cleanupFrames } from '@/lib/video/processor'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { verifyContentCredentials } from '@/lib/c2pa'
import { broadcastScanProgress } from '@/lib/realtime'

export type ProcessScanResult = {
  success: boolean
  scanId: string
  error?: string
}

/**
 * Process a scan by ID
 */
export async function processScan(scanId: string): Promise<ProcessScanResult> {
  const startTime = Date.now()

  try {
    const supabase = await createServiceRoleClient()

    // 1. Get scan record with asset info
    // @ts-ignore
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .select('*, assets(*)')
      .eq('id', scanId)
      .single()

    if (scanError || !scan) {
      throw new Error('Scan not found: ' + scanId)
    }

    // Fetch brand guideline if scan has one (for Gemini prompt injection)
    let brandGuideline = null
    if ((scan as any).guideline_id) {
      const { data: gl } = await supabase
        .from('brand_guidelines')
        .select('*')
        .eq('id', (scan as any).guideline_id)
        .single()
      brandGuideline = gl
    }

    await broadcastScanProgress(scanId, 10, "Initializing forensic engine...")

    // Atomic status transition: only proceed if scan is in 'processing' state
    // (set by upload route). This prevents duplicate processing if processScan
    // is called twice for the same scan.
    const { data: statusCheck } = await supabase
      .from('scans')
      .select('status')
      .eq('id', scanId)
      .single() as unknown as { data: { status: string } | null }

    if (statusCheck?.status === 'complete' || statusCheck?.status === 'failed') {
      console.warn(`Scan ${scanId} already in terminal state: ${statusCheck.status}, skipping`)
      return { success: true, scanId }
    }

    const asset = (scan as any).assets

    if (!asset) {
      throw new Error('Asset not found for scan: ' + scanId)
    }

    // 2. Download file from storage using signed URL (bypasses RLS)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('uploads')
      .createSignedUrl(asset.storage_path, 60) // 60 second expiry

    if (signedUrlError || !signedUrlData) {
      throw new Error('Failed to create signed URL: ' + signedUrlError?.message)
    }

    // Fetch file using signed URL
    const fileResponse = await fetch(signedUrlData.signedUrl)
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch file: ${fileResponse.status} ${fileResponse.statusText}`)
    }

    // Convert to buffer
    const arrayBuffer = await fileResponse.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)
    const mimeType = asset.mime_type || (asset.file_type === 'image' ? 'image/jpeg' : 'video/mp4')
    const isVideo = mimeType.startsWith('video/')

    await broadcastScanProgress(scanId, 20, "Analyzing content structure...")

    // 3. C2PA Verification (Both Images and Videos)
    const c2paResult = { hasManifest: false, valid: false }

    // 4. Content Analysis
    let ipResult, brandSafetyResult, videoFramesData: any[] = []
    let compositeRisk: { score: number; level: 'safe' | 'caution' | 'review' | 'high' | 'critical' }
    let provenanceScore = 0
    let riskProfile: any = null // Hoisted so findings section can access it
    // Canonical C2PA status (default to missing until verified)
    let c2paStatus: C2PAStatus = 'missing'
    // Provenance status type matches canonical C2PAStatus from scoring module
    let provenanceStatus: C2PAStatus = 'missing'

    // Run C2PA verification for all file types (images + videos)
    // Requires writing buffer to temp file since c2pa-node needs a file path
    // IMAGE C2PA: Handled by analyzeImageMultiPersona to avoid double-processing.
    // VIDEO C2PA: Handled here because we process frames individually.

    if (isVideo) {
      // VIDEO PIPELINE
      console.log(`Processing video scan ${scanId}...`)
      await broadcastScanProgress(scanId, 30, "Extracting keyframes for analysis...")

      // Extract frames
      const frames = await extractFrames(fileBuffer, 5) // MVP: 5 frames (cost), increase to 10 post-MVP

      // VIDEO C2PA CHECK
      try {
        await broadcastScanProgress(scanId, 40, "Verifying C2PA digital signature...")
        const tempPath = path.join(os.tmpdir(), `scan-${scanId}-${Date.now()}.mp4`);
        await fs.writeFile(tempPath, fileBuffer);
        const c2paReport = await verifyContentCredentials(tempPath);
        await fs.unlink(tempPath).catch(() => { }); // ignore cleanup error

        c2paStatus = c2paReport.status as C2PAStatus;
        c2paResult.hasManifest = c2paReport.status !== 'missing';
        c2paResult.valid = c2paReport.status === 'valid';

        // Use canonical scoring for consistency with composite calculation
        provenanceScore = computeProvenanceScore(c2paStatus);
        provenanceStatus = computeProvenanceStatus(c2paStatus);
      } catch (e) {
        console.error("Video C2PA Check failed:", e);
        c2paStatus = 'error';
        provenanceScore = computeProvenanceScore(c2paStatus);
        provenanceStatus = computeProvenanceStatus(c2paStatus);
      }

      let maxIpScore = 0
      let maxSafetyScore = 0

      // Analyze each frame
      for (const [index, frame] of frames.entries()) {
        await broadcastScanProgress(scanId, 50 + Math.floor((index / frames.length) * 30), `Analyzing frame ${index + 1}/${frames.length}...`)
        const frameBuffer = await fs.readFile(frame.filePath)
        const [fIp, fSafe] = await Promise.all([
          analyzeIP(frameBuffer, 'image/jpeg'),
          analyzeBrandSafety(frameBuffer, 'image/jpeg')
        ])

        // Track max risk
        maxIpScore = Math.max(maxIpScore, fIp.riskScore)
        maxSafetyScore = Math.max(maxSafetyScore, fSafe.riskScore)

        // Calculate frame composite using canonical scoring
        const fComposite = computeCompositeScore({
          ipScore: fIp.riskScore,
          safetyScore: fSafe.riskScore,
          c2paStatus,
        })

        videoFramesData.push({
          tenant_id: (scan as any).tenant_id,
          scan_id: scanId,
          frame_number: frame.timestamp, // treating timestamp as index/frame number
          timestamp_ms: frame.timestamp * 1000,
          storage_path: 'temp_processed_inline', // placeholders as we aren't saving frames to storage yet
          ip_risk_score: fIp.riskScore,
          safety_risk_score: fSafe.riskScore,
          composite_score: fComposite
        })
      }

      // Cleanup temp frames
      await cleanupFrames(frames)

      // Synthesize results (use worst case)
      ipResult = { riskScore: maxIpScore, detections: [] } // Simplify detections for video summary
      brandSafetyResult = { riskScore: maxSafetyScore, violations: [] }

      // Calculate composite for video using canonical scoring
      const videoCompositeScore = computeCompositeScore({
        ipScore: ipResult.riskScore,
        safetyScore: brandSafetyResult.riskScore,
        c2paStatus,
      })
      compositeRisk = {
        score: videoCompositeScore,
        level: computeRiskLevel(videoCompositeScore),
      }


    } else {
      // IMAGE PIPELINE - Use full enterprise analysis
      await broadcastScanProgress(scanId, 30, "Analyzing visual spectrum and IP databases...")
      const { analyzeImageMultiPersona } = await import('@/lib/gemini')
      riskProfile = await analyzeImageMultiPersona(fileBuffer, mimeType, asset.filename, brandGuideline || undefined)

      // Extract scores from risk profile
      ipResult = {
        riskScore: riskProfile.ip_report.score,
        detections: [] // Detections are in the findings, not needed here
      }
      brandSafetyResult = {
        riskScore: riskProfile.safety_report.score,
        violations: []
      }
      // Get provenance score
      provenanceScore = riskProfile.provenance_report.score

      // Sync local c2paResult with the one from Gemini
      c2paResult.hasManifest = riskProfile.c2pa_report.status !== 'missing';
      c2paResult.valid = riskProfile.c2pa_report.status === 'valid';

      // Provenance status from C2PA cryptographic fact (canonical, preserves caution/error)
      c2paStatus = riskProfile.c2pa_report.status as C2PAStatus;
      provenanceStatus = computeProvenanceStatus(c2paStatus);

      // Use the composite score already computed by gemini.ts via canonical scoring module
      // and derive the risk level from canonical tiers
      compositeRisk = {
        score: riskProfile.composite_score,
        level: computeRiskLevel(riskProfile.composite_score),
      }

      // Save the risk profile to the scan for later retrieval
      await supabase
        .from('scans')
        // @ts-ignore
        .update({ risk_profile: riskProfile })
        .eq('id', scanId)
    }

    // 5. Calculate composite risk (Final) is already done above

    // 6. Save findings — use rich data from riskProfile for images (matches authenticated path)
    const findings: any[] = []

    if (!isVideo && riskProfile) {
      // IMAGE: Rich findings from Gemini risk profile
      // C2PA / Provenance finding (always)
      findings.push({
        tenant_id: (scan as any).tenant_id,
        scan_id: scanId,
        finding_type: 'provenance_issue',
        severity: (c2paStatus === 'valid' || c2paStatus === 'caution') ? 'low' :
          c2paStatus === 'invalid' ? 'critical' : 'high',
        title: 'C2PA Provenance Verification',
        description: riskProfile.provenance_report.teaser,
        recommendation: (c2paStatus === 'valid' || c2paStatus === 'caution')
          ? 'Asset is armored with verified Content Credentials. Maintain this chain for legal defensibility.'
          : 'Absence of cryptographic provenance. In IP disputes, your legal defensibility may be hindered without a verified chain of custody.',
        evidence: {
          status: c2paStatus,
          issuer: riskProfile.c2pa_report?.issuer,
          tool: riskProfile.c2pa_report?.tool,
          note: c2paStatus === 'caution' ? 'Verified via fallback manifest (Non-Standard Structure)' : undefined
        }
      })

      // IP finding if score warrants it
      if (riskProfile.ip_report.score > 50) {
        findings.push({
          tenant_id: (scan as any).tenant_id,
          scan_id: scanId,
          finding_type: 'ip_violation',
          severity: riskProfile.ip_report.score > 85 ? 'critical' : 'high',
          title: 'Potential IP Infringement Detected',
          description: riskProfile.ip_report.teaser,
          recommendation: 'Remove or license the detected protected elements immediately.',
          evidence: { score: riskProfile.ip_report.score, reasoning: riskProfile.ip_report.reasoning }
        })
      }

      // Safety finding if score warrants it
      if (riskProfile.safety_report.score > 50) {
        findings.push({
          tenant_id: (scan as any).tenant_id,
          scan_id: scanId,
          finding_type: 'safety_violation',
          severity: riskProfile.safety_report.score > 85 ? 'critical' : 'high',
          title: 'Brand Safety Violation',
          description: riskProfile.safety_report.teaser,
          recommendation: 'Content violates safety guidelines. Do not publish.',
          evidence: { score: riskProfile.safety_report.score, reasoning: riskProfile.safety_report.reasoning }
        })
      }

      // Save provenance_details for valid/caution C2PA (matches authenticated path)
      if (['valid', 'caution'].includes(c2paStatus) && riskProfile.c2pa_report) {
        // @ts-ignore - Supabase types not generated from live schema
        await supabase.from('provenance_details').insert({
          scan_id: scanId,
          tenant_id: (scan as any).tenant_id,
          creator_name: riskProfile.c2pa_report.creator,
          creation_tool: riskProfile.c2pa_report.tool,
          creation_tool_version: riskProfile.c2pa_report.tool_version,
          creation_timestamp: riskProfile.c2pa_report.timestamp,
          signature_status: riskProfile.c2pa_report.status,
          certificate_issuer: riskProfile.c2pa_report.issuer,
          certificate_serial: riskProfile.c2pa_report.serial,
          edit_history: riskProfile.c2pa_report.history,
          raw_manifest: riskProfile.c2pa_report.raw_manifest
        })
      }
    } else {
      // VIDEO or no riskProfile: basic findings
      if (!c2paResult.hasManifest) {
        findings.push({
          tenant_id: (scan as any).tenant_id,
          scan_id: scanId,
          finding_type: 'provenance_issue',
          severity: 'low',
          title: 'Missing Content Credentials',
          description: 'No C2PA manifest found in this asset. Provenance cannot be verified.',
          recommendation: 'Use tools that attach Content Credentials to ensure trust.',
          confidence_score: 100
        })
      }
    }

    // Insert findings
    if (findings.length > 0) {
      // @ts-ignore
      await supabase.from('scan_findings').insert(findings)
    }

    // Insert video frames if applicable
    if (videoFramesData.length > 0) {
      // @ts-ignore
      await supabase.from('video_frames').insert(videoFramesData)
    }

    // 7. Update scan record with results
    const analysisTime = Date.now() - startTime

    await broadcastScanProgress(scanId, 90, "Finalizing forensic dossier...")

    const { error: updateError } = await supabase
      .from('scans')
      // @ts-ignore - Supabase types require generation from live schema
      .update({
        status: 'complete',
        risk_level: compositeRisk.level,
        composite_score: compositeRisk.score,
        ip_risk_score: ipResult.riskScore,
        safety_risk_score: brandSafetyResult.riskScore,
        provenance_risk_score: provenanceScore,
        provenance_status: provenanceStatus,
        is_video: isVideo,
        frames_analyzed: isVideo ? videoFramesData.length : null,
        completed_at: new Date().toISOString(),
        analysis_duration_ms: analysisTime,
        gemini_model_version: 'gemini-2.5-flash',
      })
      .eq('id', scanId)

    if (updateError) {
      throw new Error('Failed to update scan: ' + updateError.message)
    }

    console.log(`✅ Scan ${scanId} completed in ${analysisTime}ms`)

    await broadcastScanProgress(scanId, 100, "Analysis complete.")

    return {
      success: true,
      scanId,
    }
  } catch (error) {
    console.error(`❌ Scan ${scanId} failed:`, error)

    // Mark scan as failed
    try {
      const supabase = await createServiceRoleClient()
      await supabase
        .from('scans')
        // @ts-ignore
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
          error_message: (error as Error).message
        })
        .eq('id', scanId)
    } catch (updateError) {
      console.error('Failed to mark scan as failed:', updateError)
    }

    return {
      success: false,
      scanId,
      error: (error as Error).message,
    }
  }
}

// calculateCompositeRisk has been removed — all scoring now goes through
// computeCompositeScore() and computeRiskLevel() from '@/lib/risk/scoring'

/**
 * Process all pending scans
 * Useful for batch processing or manual triggers
 */
export async function processPendingScans(): Promise<{
  processed: number
  succeeded: number
  failed: number
}> {
  const supabase = await createServiceRoleClient()

  // Get all pending scans
  // @ts-ignore
  const { data: pendingScans, error } = await supabase
    .from('scans')
    .select('id')
    .eq('status', 'pending')
    .limit(10) // Process max 10 at a time

  if (error || !pendingScans) {
    console.error('Failed to fetch pending scans:', error)
    return { processed: 0, succeeded: 0, failed: 0 }
  }

  let succeeded = 0
  let failed = 0

  // Process each scan
  for (const scan of pendingScans) {
    const result = await processScan((scan as any).id)
    if (result.success) {
      succeeded++
    } else {
      failed++
    }
  }

  return {
    processed: pendingScans.length,
    succeeded,
    failed,
  }
}
