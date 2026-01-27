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
import { analyzeIP } from './ip-detection'
import { analyzeBrandSafety } from './brand-safety'
import { extractFrames, cleanupFrames } from '@/lib/video/processor'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { verifyContentCredentials } from '@/lib/c2pa'

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

    // Update status to 'processing'
    // @ts-ignore
    await supabase.from('scans').update({ status: 'processing' }).eq('id', scanId);

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

    // 3. C2PA Verification (Both Images and Videos)
    // Note: C2PA verification requires a file path, not a buffer
    // For now, we'll skip C2PA verification in the processor
    // TODO: Save buffer to temp file for C2PA verification
    const c2paResult = { hasManifest: false, valid: false }

    // 4. Content Analysis
    let ipResult, brandSafetyResult, videoFramesData: any[] = []
    let compositeRisk: { score: number; level: 'safe' | 'caution' | 'review' | 'high' | 'critical' }
    let provenanceScore = 0

    if (isVideo) {
      // VIDEO PIPELINE
      console.log(`Processing video scan ${scanId}...`)

      // Extract frames
      const frames = await extractFrames(fileBuffer, 5) // Analyze 5 frames max for MVP

      // VIDEO C2PA CHECK
      try {
        const tempPath = path.join(os.tmpdir(), `scan-${scanId}-${Date.now()}.mp4`);
        await fs.writeFile(tempPath, fileBuffer);
        const c2paReport = await verifyContentCredentials(tempPath);
        await fs.unlink(tempPath).catch(() => { }); // ignore cleanup error

        c2paResult.hasManifest = c2paReport.status !== 'missing';
        c2paResult.valid = c2paReport.status === 'valid';

        if (c2paReport.status === 'valid') provenanceScore = 0;
        else if (c2paReport.status === 'invalid') provenanceScore = 100;
        else provenanceScore = 50; // Missing or Untrusted
      } catch (e) {
        console.error("Video C2PA Check failed:", e);
      }

      let maxIpScore = 0
      let maxSafetyScore = 0

      // Analyze each frame
      for (const frame of frames) {
        const frameBuffer = await fs.readFile(frame.filePath)
        const [fIp, fSafe] = await Promise.all([
          analyzeIP(frameBuffer, 'image/jpeg'),
          analyzeBrandSafety(frameBuffer, 'image/jpeg')
        ])

        // Track max risk
        maxIpScore = Math.max(maxIpScore, fIp.riskScore)
        maxSafetyScore = Math.max(maxSafetyScore, fSafe.riskScore)

        // Calculate frame composite
        const fComposite = calculateCompositeRisk(fIp.riskScore, fSafe.riskScore)

        videoFramesData.push({
          tenant_id: (scan as any).tenant_id,
          scan_id: scanId,
          frame_number: frame.timestamp, // treating timestamp as index/frame number
          timestamp_ms: frame.timestamp * 1000,
          storage_path: 'temp_processed_inline', // placeholders as we aren't saving frames to storage yet
          ip_risk_score: fIp.riskScore,
          safety_risk_score: fSafe.riskScore,
          composite_score: fComposite.score
        })
      }

      // Cleanup temp frames
      await cleanupFrames(frames)

      // Synthesize results (use worst case)
      ipResult = { riskScore: maxIpScore, detections: [] } // Simplify detections for video summary
      brandSafetyResult = { riskScore: maxSafetyScore, violations: [] }

      // Calculate composite for video
      compositeRisk = calculateCompositeRisk(ipResult.riskScore, brandSafetyResult.riskScore)

      // Adjust composite with provenance for video
      // If invalid provenance, force critical
      if (provenanceScore >= 90) {
        compositeRisk = { score: 100, level: 'critical' };
      }


    } else {
      // IMAGE PIPELINE - Use full enterprise analysis
      const { analyzeImageMultiPersona } = await import('@/lib/gemini')
      const riskProfile = await analyzeImageMultiPersona(fileBuffer, mimeType, asset.filename)

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

      // Hybrid "Red Flag" Composite Calculation
      // If ANY score is critically high (>=85), it's a dealbreaker - show the max
      // Otherwise, use weighted average with IP emphasis
      const hasRedFlag =
        riskProfile.ip_report.score >= 85 ||
        riskProfile.provenance_report.score >= 85 ||
        riskProfile.safety_report.score >= 85

      if (hasRedFlag) {
        // Critical issue detected - show the worst score
        compositeRisk = {
          score: Math.max(
            riskProfile.ip_report.score,
            riskProfile.provenance_report.score,
            riskProfile.safety_report.score
          ),
          level: riskProfile.verdict === 'Critical Risk' ? 'critical' :
            riskProfile.verdict === 'High Risk' ? 'high' :
              riskProfile.verdict === 'Medium Risk' ? 'review' :
                riskProfile.verdict === 'Low Risk' ? 'caution' : 'safe'
        }
      } else {
        // No critical issues - use weighted average (IP emphasized: 70/20/10)
        compositeRisk = {
          score: Math.round(
            riskProfile.ip_report.score * 0.7 +
            riskProfile.provenance_report.score * 0.2 +
            riskProfile.safety_report.score * 0.1
          ),
          level: riskProfile.verdict === 'Critical Risk' ? 'critical' :
            riskProfile.verdict === 'High Risk' ? 'high' :
              riskProfile.verdict === 'Medium Risk' ? 'review' :
                riskProfile.verdict === 'Low Risk' ? 'caution' : 'safe'
        }
      }

      // Save the risk profile to the scan for later retrieval
      await supabase
        .from('scans')
        // @ts-ignore
        .update({ risk_profile: riskProfile })
        .eq('id', scanId)
    }

    // 5. Calculate composite risk (Final) is already done above

    // 6. Save findings (Aggregated for Video, Detail for Image)
    const findings: any[] = []

    // Add C2PA Finding if missing
    if (!c2paResult.hasManifest) {
      findings.push({
        tenant_id: (scan as any).tenant_id,
        scan_id: scanId,
        finding_type: 'provenance_issue',
        severity: 'low', // Low severity for just missing, high if invalid
        title: 'Missing Content Credentials',
        description: 'No C2PA manifest found in this asset. Provenance cannot be verified.',
        recommendation: 'Use tools that attach Content Credentials to ensure trust.',
        confidence_score: 100
      })
    }

    // Add content findings (only for images, or aggregate for video if we implement aggregation)
    if (!isVideo) {
      ipResult.detections.forEach((detection: any) => {
        findings.push({
          tenant_id: (scan as any).tenant_id,
          scan_id: scanId,
          finding_type: 'ip_violation',
          severity: detection.confidence > 80 ? 'critical' : detection.confidence > 60 ? 'high' : 'medium',
          title: `${detection.type}: ${detection.name}`,
          description: `Detected ${detection.type.toLowerCase()}: ${detection.name}`,
          recommendation: 'Review for potential intellectual property concerns',
          evidence: { type: detection.type, name: detection.name },
          confidence_score: detection.confidence,
        })
      })

      brandSafetyResult.violations.forEach((violation: any) => {
        findings.push({
          tenant_id: (scan as any).tenant_id,
          scan_id: scanId,
          finding_type: 'safety_violation',
          severity: violation.severity,
          title: `${violation.category} content detected`,
          description: violation.description,
          recommendation: 'Review for brand safety compliance',
          evidence: { category: violation.category },
          confidence_score: violation.confidence,
        })
      })
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
        provenance_status: provenanceScore < 30 ? 'valid' : provenanceScore < 70 ? 'invalid' : 'missing',
        is_video: isVideo,
        frames_analyzed: isVideo ? videoFramesData.length : null,
        completed_at: new Date().toISOString(),
        analysis_duration_ms: analysisTime,
        gemini_model_version: 'gemini-1.5-flash',
      })
      .eq('id', scanId)

    if (updateError) {
      throw new Error('Failed to update scan: ' + updateError.message)
    }

    console.log(`✅ Scan ${scanId} completed in ${analysisTime}ms`)

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

/**
 * Calculate composite risk from IP and brand safety scores
 */
function calculateCompositeRisk(
  ipScore: number,
  brandSafetyScore: number
): {
  score: number
  level: 'safe' | 'caution' | 'review' | 'high' | 'critical'
} {
  // Weighted average: IP risk is slightly more important (60/40)
  const compositeScore = Math.round(ipScore * 0.6 + brandSafetyScore * 0.4)

  // Determine level
  let level: 'safe' | 'caution' | 'review' | 'high' | 'critical'

  if (compositeScore >= 90) {
    level = 'critical'
  } else if (compositeScore >= 70) {
    level = 'high'
  } else if (compositeScore >= 50) {
    level = 'review'
  } else if (compositeScore >= 25) {
    level = 'caution'
  } else {
    level = 'safe'
  }

  return { score: compositeScore, level }
}

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
