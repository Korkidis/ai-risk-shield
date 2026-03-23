/**
 * Findings Synthesizer
 *
 * Converts risk profile data into structured scan findings.
 * Shared by both image and video pipelines for consistent finding generation.
 *
 * Design principles:
 * - Findings are FACTUAL: what was detected, where, why it may matter
 * - Recommendations are null: advice belongs in the mitigation layer
 * - Confidence is graded: detected / probable / possible / unclear
 * - Severity is expanded: critical / high / medium / low (not just binary)
 */

import type { RiskProfile } from '@/lib/gemini-types'
import type { C2PAStatus } from '@/lib/risk/scoring'
import type { IPAnalysisResult } from '@/lib/ai/ip-detection'
import type { BrandSafetyResult } from '@/lib/ai/brand-safety'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SynthesizedFinding {
  tenant_id: string | null
  scan_id: string
  finding_type: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  recommendation: null // Advice belongs in mitigation, not findings
  evidence: Record<string, unknown>
  confidence_score: number
}

type ConfidenceLanguage = 'detected' | 'probable' | 'possible' | 'unclear'

// ─── Score → Severity / Confidence mapping ──────────────────────────────────

function scoreSeverity(score: number): 'critical' | 'high' | 'medium' | 'low' | null {
  if (score >= 85) return 'critical'
  if (score >= 65) return 'high'
  if (score >= 50) return 'medium'
  if (score >= 25) return 'low'
  return null // No finding for scores below 25
}

function scoreConfidenceLanguage(score: number, reportConfidence?: 'high' | 'medium' | 'low'): ConfidenceLanguage {
  // Prefer the LLM's self-reported confidence when available
  if (reportConfidence === 'high') return 'detected'
  if (reportConfidence === 'low') return 'unclear'
  // Fall back to score-derived confidence
  if (score >= 85) return 'detected'
  if (score >= 65) return 'probable'
  if (score >= 50) return 'possible'
  return 'unclear'
}

// ─── Finding Type Classification ────────────────────────────────────────────

function classifyIPFindingType(score: number, confidence?: 'high' | 'medium' | 'low'): string {
  if (score >= 85 && (confidence === 'high' || !confidence)) return 'ip_match'
  return 'ip_similarity'
}

function classifySafetyFindingType(score: number): string {
  if (score >= 70) return 'safety_content' // Direct content safety issue
  return 'safety_context' // Context-dependent safety concern
}

function classifyProvenanceFindingType(c2paStatus: C2PAStatus): string {
  if (c2paStatus === 'valid' || c2paStatus === 'caution') return 'provenance_verified'
  if (c2paStatus === 'invalid') return 'provenance_suspicious'
  return 'provenance_missing'
}

// ─── Title Generation ───────────────────────────────────────────────────────

function ipTitle(confidenceLang: ConfidenceLanguage): string {
  switch (confidenceLang) {
    case 'detected': return 'Protected content detected'
    case 'probable': return 'Probable protected content identified'
    case 'possible': return 'Possible protected content similarity'
    case 'unclear': return 'Unclear content similarity noted'
  }
}

function safetyTitle(confidenceLang: ConfidenceLanguage): string {
  switch (confidenceLang) {
    case 'detected': return 'Brand safety issue detected'
    case 'probable': return 'Probable brand safety concern'
    case 'possible': return 'Possible brand safety concern'
    case 'unclear': return 'Ambiguous brand safety signal'
  }
}

// ─── Image Findings ─────────────────────────────────────────────────────────

export function synthesizeImageFindings(
  scanId: string,
  tenantId: string | null,
  riskProfile: RiskProfile,
  c2paStatus: C2PAStatus,
): SynthesizedFinding[] {
  const findings: SynthesizedFinding[] = []

  // Provenance finding (always created — it's a factual observation)
  const provSeverity: 'critical' | 'high' | 'medium' | 'low' =
    (c2paStatus === 'valid' || c2paStatus === 'caution') ? 'low' :
    c2paStatus === 'invalid' ? 'critical' : 'high'

  const provDescription =
    c2paStatus === 'valid' ? 'Valid C2PA content credentials verified. Cryptographic chain of custody established.' :
    c2paStatus === 'caution' ? 'C2PA credentials present but with non-standard structure. Partial chain of custody.' :
    c2paStatus === 'invalid' ? 'C2PA credentials present but tampered or expired. Chain of custody compromised.' :
    c2paStatus === 'error' ? 'C2PA verification failed due to processing error. Provenance status indeterminate.' :
    'No C2PA content credentials found. Origin and chain of custody cannot be cryptographically verified.'

  findings.push({
    tenant_id: tenantId,
    scan_id: scanId,
    finding_type: classifyProvenanceFindingType(c2paStatus),
    severity: provSeverity,
    title: 'C2PA Provenance Verification',
    description: provDescription,
    recommendation: null,
    evidence: {
      status: c2paStatus,
      issuer: riskProfile.c2pa_report?.issuer,
      tool: riskProfile.c2pa_report?.tool,
      note: c2paStatus === 'caution' ? 'Verified via fallback manifest (Non-Standard Structure)' : undefined,
    },
    confidence_score: 100, // C2PA is cryptographic fact
  })

  // IP finding — always generated (positive or negative)
  const ipScore = riskProfile.ip_report.score
  const ipSeverity = scoreSeverity(ipScore)
  if (ipSeverity) {
    // Score >= 25: flagged finding
    const ipConfLang = scoreConfidenceLanguage(ipScore, riskProfile.ip_report.confidence)
    findings.push({
      tenant_id: tenantId,
      scan_id: scanId,
      finding_type: classifyIPFindingType(ipScore, riskProfile.ip_report.confidence),
      severity: ipSeverity,
      title: ipTitle(ipConfLang),
      description: riskProfile.ip_report.teaser,
      recommendation: null,
      evidence: {
        score: ipScore,
        confidence: riskProfile.ip_report.confidence || null,
        reasoning: riskProfile.ip_report.reasoning,
      },
      confidence_score: ipScore,
    })
  } else {
    // Score < 25: clean finding — confirms what was checked
    findings.push({
      tenant_id: tenantId,
      scan_id: scanId,
      finding_type: 'ip_clear',
      severity: 'low',
      title: 'No intellectual property concerns detected',
      description: riskProfile.ip_report.teaser || 'Visual analysis found no significant similarity to known protected works, trademarks, or celebrity likenesses in our reference database.',
      recommendation: null,
      evidence: {
        score: ipScore,
        confidence: riskProfile.ip_report.confidence || null,
        reasoning: riskProfile.ip_report.reasoning,
      },
      confidence_score: Math.max(100 - ipScore, 75), // High confidence in clean result
    })
  }

  // Safety finding — always generated (positive or negative)
  const safetyScore = riskProfile.safety_report.score
  const safetySeverity = scoreSeverity(safetyScore)
  if (safetySeverity) {
    // Score >= 25: flagged finding
    const safetyConfLang = scoreConfidenceLanguage(safetyScore, riskProfile.safety_report.confidence)
    findings.push({
      tenant_id: tenantId,
      scan_id: scanId,
      finding_type: classifySafetyFindingType(safetyScore),
      severity: safetySeverity,
      title: safetyTitle(safetyConfLang),
      description: riskProfile.safety_report.teaser,
      recommendation: null,
      evidence: {
        score: safetyScore,
        confidence: riskProfile.safety_report.confidence || null,
        reasoning: riskProfile.safety_report.reasoning,
      },
      confidence_score: safetyScore,
    })
  } else {
    // Score < 25: clean finding — confirms what was checked
    findings.push({
      tenant_id: tenantId,
      scan_id: scanId,
      finding_type: 'safety_clear',
      severity: 'low',
      title: 'Content passes brand safety review',
      description: riskProfile.safety_report.teaser || 'Content evaluated against platform policies and brand safety standards. No concerns detected — suitable for standard commercial use.',
      recommendation: null,
      evidence: {
        score: safetyScore,
        confidence: riskProfile.safety_report.confidence || null,
        reasoning: riskProfile.safety_report.reasoning,
      },
      confidence_score: Math.max(100 - safetyScore, 75),
    })
  }

  return findings
}

// ─── Video Findings ─────────────────────────────────────────────────────────

export function synthesizeVideoFindings(
  scanId: string,
  tenantId: string | null,
  c2paStatus: C2PAStatus,
  hasManifest: boolean,
  ipResult: IPAnalysisResult | null,
  brandSafetyResult: BrandSafetyResult | null,
): SynthesizedFinding[] {
  const findings: SynthesizedFinding[] = []

  // Provenance finding for video
  if (!hasManifest) {
    findings.push({
      tenant_id: tenantId,
      scan_id: scanId,
      finding_type: 'provenance_missing',
      severity: 'high',
      title: 'No content credentials found in video',
      description: 'No C2PA manifest found in this video file. Origin and chain of custody cannot be cryptographically verified.',
      recommendation: null,
      evidence: { status: c2paStatus },
      confidence_score: 100,
    })
  } else {
    const provSeverity: 'critical' | 'high' | 'medium' | 'low' =
      (c2paStatus === 'valid' || c2paStatus === 'caution') ? 'low' :
      c2paStatus === 'invalid' ? 'critical' : 'high'
    findings.push({
      tenant_id: tenantId,
      scan_id: scanId,
      finding_type: classifyProvenanceFindingType(c2paStatus),
      severity: provSeverity,
      title: 'C2PA Provenance Verification',
      description: c2paStatus === 'valid' ? 'Valid C2PA credentials verified on video file.' :
        c2paStatus === 'caution' ? 'C2PA credentials present with non-standard structure.' :
        'C2PA credentials present but verification failed.',
      recommendation: null,
      evidence: { status: c2paStatus },
      confidence_score: 100,
    })
  }

  // Video IP finding from frame analysis
  if (ipResult && ipResult.riskScore >= 25) {
    const ipSeverity = scoreSeverity(ipResult.riskScore)
    if (ipSeverity) {
      const confLang = scoreConfidenceLanguage(ipResult.riskScore)
      findings.push({
        tenant_id: tenantId,
        scan_id: scanId,
        finding_type: classifyIPFindingType(ipResult.riskScore),
        severity: ipSeverity,
        title: `${ipTitle(confLang)} in video frames`,
        description: ipResult.summary || `Frame analysis ${confLang === 'detected' ? 'detected' : 'identified possible'} intellectual property risk (score: ${ipResult.riskScore}/100).`,
        recommendation: null,
        evidence: {
          score: ipResult.riskScore,
          detections: ipResult.detections,
          overall_risk: ipResult.overallRisk,
        },
        confidence_score: Math.min(ipResult.riskScore, 95),
      })
    }
  }

  // Video Safety finding from frame analysis
  if (brandSafetyResult && brandSafetyResult.riskScore >= 25) {
    const safetySeverity = scoreSeverity(brandSafetyResult.riskScore)
    if (safetySeverity) {
      const confLang = scoreConfidenceLanguage(brandSafetyResult.riskScore)
      findings.push({
        tenant_id: tenantId,
        scan_id: scanId,
        finding_type: classifySafetyFindingType(brandSafetyResult.riskScore),
        severity: safetySeverity,
        title: `${safetyTitle(confLang)} in video frames`,
        description: brandSafetyResult.summary || `Frame analysis ${confLang === 'detected' ? 'detected' : 'flagged possible'} brand safety issues (score: ${brandSafetyResult.riskScore}/100).`,
        recommendation: null,
        evidence: {
          score: brandSafetyResult.riskScore,
          violations: brandSafetyResult.violations,
          overall_risk: brandSafetyResult.overallRisk,
          platform_compliance: brandSafetyResult.platformCompliance,
        },
        confidence_score: Math.min(brandSafetyResult.riskScore, 95),
      })
    }
  }

  return findings
}
