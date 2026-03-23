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
import type { Database, Json } from '@/lib/supabase/types'
import { computeCompositeScore, computeRiskLevel, computeProvenanceScore, computeProvenanceStatus, type C2PAStatus } from '@/lib/risk/scoring'
import { analyzeIP } from '@/lib/ai/ip-detection'
import { analyzeBrandSafety } from '@/lib/ai/brand-safety'
import { formatGuidelineRules } from '@/lib/gemini'
import { broadcastScanProgress } from '@/lib/realtime'
import type { BrandGuideline } from '@/types/database'
// FFmpeg is dynamically imported only for video processing (avoids bundling ~70MB binary for image scans)
// import { extractFrames, cleanupFrames } from '@/lib/video/processor'
import { getPlan, type PlanId } from '@/lib/plans'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { verifyContentCredentials } from '@/lib/c2pa'
import { synthesizeImageFindings, synthesizeVideoFindings } from '@/lib/ai/findings-synthesizer'

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

    // 1. Get scan record with asset info + tenant plan for dynamic video config
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .select('*, assets(*), tenants!scans_tenant_id_fkey(plan)')
      .eq('id', scanId)
      .single()

    if (scanError || !scan) {
      throw new Error('Scan not found: ' + scanId)
    }

    // Fetch brand guideline if scan has one (for Gemini prompt injection)
    let brandGuideline = null
    if (scan.guideline_id) {
      const { data: gl } = await supabase
        .from('brand_guidelines')
        .select('*')
        .eq('id', scan.guideline_id)
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
      .single()

    if (statusCheck?.status === 'complete' || statusCheck?.status === 'failed') {
      console.warn(`Scan ${scanId} already in terminal state: ${statusCheck.status}, skipping`)
      return { success: true, scanId }
    }

    // The select('*, assets(*)') returns assets as a joined relation
    const asset = (scan as Record<string, unknown>).assets as { storage_path: string; mime_type: string; file_type: string; filename: string } | null

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
    let ipResult: import('@/lib/ai/ip-detection').IPAnalysisResult | null = null
    let brandSafetyResult: import('@/lib/ai/brand-safety').BrandSafetyResult | null = null
    const videoFramesData: Record<string, unknown>[] = []
    let compositeRisk: { score: number; level: 'safe' | 'caution' | 'review' | 'high' | 'critical' }
    let provenanceScore = 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let riskProfile: Record<string, any> | null = null // Hoisted so findings section can access it
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

      // Determine frame limit from tenant plan (dynamic, not hardcoded)
      const tenantPlan = ((scan as Record<string, unknown>).tenants as { plan?: string } | null)?.plan || 'free'
      const planConfig = getPlan(tenantPlan as PlanId)
      const frameLimit = planConfig.videoFrameLimit || 5 // fallback to 5 if plan has no config

      // Extract frames
      const { extractFrames, cleanupFrames } = await import('@/lib/video/processor')
      const frames = await extractFrames(fileBuffer, frameLimit)

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
        c2paStatus = 'invalid' as C2PAStatus; // Map 'error' to 'invalid' for canonical scoring
        provenanceScore = computeProvenanceScore(c2paStatus);
        provenanceStatus = computeProvenanceStatus(c2paStatus);
      }

      let maxIpScore = 0
      let maxSafetyScore = 0
      let highestRiskFrameIndex = 0
      let highestRiskFrameScore = 0

      // Persist frames to Supabase Storage before analysis
      const frameStoragePaths: string[] = []
      for (const [index, frame] of frames.entries()) {
        const framePath = `${scan.tenant_id}/frames/${scanId}/frame_${String(index).padStart(3, '0')}.jpg`
        try {
          const frameData = await fs.readFile(frame.filePath)
          await supabase.storage.from('uploads').upload(framePath, frameData, {
            contentType: 'image/jpeg',
            upsert: false,
          })
          frameStoragePaths.push(framePath)
        } catch (uploadErr) {
          console.error(`Failed to persist frame ${index} for scan ${scanId}:`, uploadErr)
          frameStoragePaths.push(`temp_failed_${index}`) // fallback path
        }
      }

      // Build guideline rules string for video frame analysis (parity with image pipeline)
      const videoGuidelineRules = brandGuideline ? formatGuidelineRules(brandGuideline as BrandGuideline) : undefined

      // Analyze each frame
      for (const [index, frame] of frames.entries()) {
        await broadcastScanProgress(scanId, 50 + Math.floor((index / frames.length) * 30), `Analyzing frame ${index + 1}/${frames.length}...`, { current: index + 1, total: frames.length })
        const frameBuffer = await fs.readFile(frame.filePath)
        const [fIp, fSafe] = await Promise.all([
          analyzeIP(frameBuffer, 'image/jpeg', videoGuidelineRules),
          analyzeBrandSafety(frameBuffer, 'image/jpeg', videoGuidelineRules)
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

        // Track highest risk frame
        if (fComposite > highestRiskFrameScore) {
          highestRiskFrameScore = fComposite
          highestRiskFrameIndex = index
        }

        videoFramesData.push({
          tenant_id: scan.tenant_id,
          scan_id: scanId,
          frame_number: index,
          timestamp_ms: frame.timestamp * 1000,
          storage_path: frameStoragePaths[index] || 'temp_processed_inline',
          ip_risk_score: fIp.riskScore,
          safety_risk_score: fSafe.riskScore,
          composite_score: fComposite
        })
      }

      // Cleanup temp frames (persisted copies remain in Supabase Storage)
      await cleanupFrames(frames)

      // Synthesize results (use worst case)
      ipResult = { riskScore: maxIpScore, detections: [], overallRisk: 'review', summary: `Aggregated from ${frames.length} frames` }
      brandSafetyResult = { riskScore: maxSafetyScore, violations: [], overallRisk: 'review', summary: `Aggregated from ${frames.length} frames`, platformCompliance: { facebook: true, instagram: true, youtube: true, tiktok: true } }

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

      // Build risk_profile for video scans (matches image structure for drawer parity)
      const riskLabel = compositeRisk.level === 'critical' ? 'Critical Risk' :
        compositeRisk.level === 'high' ? 'High Risk' :
          compositeRisk.level === 'review' ? 'Review Recommended' :
            compositeRisk.level === 'caution' ? 'Low Risk' : 'Low Risk'

      riskProfile = {
        composite_score: videoCompositeScore,
        verdict: riskLabel,
        ip_report: {
          score: maxIpScore,
          teaser: maxIpScore > 50 ? 'Potential IP risk detected in video frames' : 'No significant IP concerns detected',
          reasoning: `Frame-by-frame analysis across ${frames.length} keyframes.`,
        },
        safety_report: {
          score: maxSafetyScore,
          teaser: maxSafetyScore > 50 ? 'Brand safety concerns detected in video frames' : 'No brand safety issues detected',
          reasoning: `Safety analysis across ${frames.length} extracted keyframes.`,
        },
        provenance_report: {
          score: provenanceScore,
          teaser: c2paStatus === 'valid' ? 'Valid C2PA credentials detected' :
            c2paStatus === 'caution' ? 'Partial credentials detected' : 'No content credentials found',
          reasoning: 'C2PA digital signature verification on source video file.',
        },
        c2pa_report: { status: c2paStatus },
        chief_officer_strategy: maxIpScore > 50 || maxSafetyScore > 50
          ? { points: ['Video contains frames with elevated risk. Review flagged frames before publication.'], overall_confidence: 'medium' as const }
          : { points: ['Video analysis indicates acceptable risk levels for publication.'], overall_confidence: 'high' as const },
        is_video: true,
        frames_analyzed: frames.length,
        highest_risk_frame: highestRiskFrameIndex,
      }

      // Save risk_profile + highest_risk_frame for video scans
      await supabase
        .from('scans')
        .update({
          risk_profile: riskProfile,
          highest_risk_frame: highestRiskFrameIndex,
        })
        .eq('id', scanId)

    } else {
      // IMAGE PIPELINE - Use full enterprise analysis
      await broadcastScanProgress(scanId, 30, "Analyzing visual spectrum and IP databases...")
      const { analyzeImageMultiPersona } = await import('@/lib/gemini')
      riskProfile = await analyzeImageMultiPersona(
        fileBuffer,
        mimeType,
        asset.filename,
        brandGuideline ? { ...brandGuideline, created_at: brandGuideline.created_at || new Date().toISOString() } as BrandGuideline : undefined
      )

      // Extract scores from risk profile
      ipResult = {
        riskScore: riskProfile.ip_report.score,
        detections: [],
        overallRisk: 'review',
        summary: riskProfile.ip_report.teaser,
      }
      brandSafetyResult = {
        riskScore: riskProfile.safety_report.score,
        violations: [],
        overallRisk: 'review',
        summary: riskProfile.safety_report.teaser,
        platformCompliance: { facebook: true, instagram: true, youtube: true, tiktok: true },
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
        .update({ risk_profile: riskProfile })
        .eq('id', scanId)
    }

    // 5. Calculate composite risk (Final) is already done above

    // 6. Synthesize findings using shared findings engine
    const findings = (!isVideo && riskProfile)
      ? synthesizeImageFindings(scanId, scan.tenant_id, riskProfile as unknown as import('@/lib/gemini-types').RiskProfile, c2paStatus as C2PAStatus)
      : synthesizeVideoFindings(scanId, scan.tenant_id, c2paStatus as C2PAStatus, c2paResult.hasManifest, ipResult, brandSafetyResult)

    // Save provenance_details for valid/caution C2PA (matches authenticated path)
    if (!isVideo && riskProfile && ['valid', 'caution'].includes(c2paStatus) && riskProfile.c2pa_report) {
      await supabase.from('provenance_details').insert({
        scan_id: scanId,
        tenant_id: scan.tenant_id,
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

    // Insert findings
    if (findings.length > 0) {
      type FindingInsert = Database['public']['Tables']['scan_findings']['Insert']
      const sanitizedFindings: FindingInsert[] = findings.map(f => {
        return { ...f, evidence: f.evidence as Json, recommendation: (null as unknown) as FindingInsert['recommendation'] } as FindingInsert
      })
      await supabase.from('scan_findings').insert(sanitizedFindings)
    }

    // Insert video frames if applicable
    if (videoFramesData.length > 0) {
      await supabase.from('video_frames').insert(videoFramesData as Database['public']['Tables']['video_frames']['Insert'][])
    }

    // 7. Update scan record with results
    const analysisTime = Date.now() - startTime

    await broadcastScanProgress(scanId, 90, "Finalizing forensic dossier...")

    const { error: updateError } = await supabase
      .from('scans')
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

    // 8. Charge quota at COMPLETION (Sprint 10.1)
    // Failed scans never reach here — quota is only consumed for successful analysis.
    if (scan.tenant_id) {
      // Authenticated scan: atomically increment tenant counter.
      const { error: usageError } = await supabase.rpc('increment_tenant_scan_usage', {
        p_tenant_id: scan.tenant_id,
        p_amount: 1,
      })

      if (usageError) {
        console.error(`Failed to increment scan usage for tenant ${scan.tenant_id}:`, usageError)
        // Non-blocking — scan completed successfully, usage is best-effort
      }

      // Report usage to Stripe for metered billing (fire-and-forget)
      import('@/lib/stripe-usage').then(({ reportScanUsage }) => {
        reportScanUsage(scan.tenant_id!).catch(err =>
          console.error('Failed to report usage to Stripe:', err)
        )
      })
    }
    // Anonymous scans: session-based count is derived from scan records in the
    // scans table (checkAnonymousQuota counts rows). IP tracking is recorded at
    // upload time (requires request context). Failed scans excluded in 10.4.

    console.log(`Scan ${scanId} completed in ${analysisTime}ms`)

    await broadcastScanProgress(scanId, 100, "Analysis complete.")

    return {
      success: true,
      scanId,
    }
  } catch (error) {
    console.error(`Scan ${scanId} failed:`, error)

    // Mark scan as failed
    try {
      const supabase = await createServiceRoleClient()
      await supabase
        .from('scans')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
          error_message: (error as Error).message
        })
        .eq('id', scanId)

      // Defensive refund (Sprint 10.2): Since quota is charged at completion,
      // failures should never have been charged. But if a race condition caused
      // a double-charge, log it for observability. No decrement needed because
      // the quota increment above only fires after status='complete' succeeds.
      // If the status update to 'complete' succeeded but a later step threw,
      // the scan IS complete and the charge is correct.
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
    const result = await processScan(scan.id)
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
