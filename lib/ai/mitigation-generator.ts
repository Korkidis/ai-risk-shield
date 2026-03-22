/**
 * Sprint 10.9: Extracted Mitigation Report Generator
 *
 * Generates structured MitigationReportContent from scan data via Gemini.
 * Extracted from app/api/scans/[id]/mitigation/route.ts for reuse
 * (PDF export, batch generation, testing).
 */

import { MitigationReportContent } from '@/types/database'
import { getGeminiClient } from '@/lib/ai/gemini'
import { MitigationReportContentSchema, MITIGATION_REPORT_GEMINI_SCHEMA } from '@/lib/schemas/mitigation-schema'

const GENERATOR_VERSION = '1.1.0'

// ============================================================================
// Input Types
// ============================================================================

export interface MitigationGeneratorInput {
    /** Scan-level scores and metadata */
    scan: {
        composite_score: number | null
        risk_level: string | null
        ip_risk_score: number | null
        safety_risk_score: number | null
        provenance_risk_score: number | null
        provenance_status: string | null
    }
    /** Asset file metadata */
    asset: {
        filename: string
        file_type: string
        file_size: number
    } | null
    /** Structured findings from scan_findings table */
    findings: {
        title?: string | null
        severity?: string | null
        description?: string | null
        finding_type?: string | null
        confidence_score?: number | null
    }[]
    /** risk_profile JSONB blob */
    riskProfile: Record<string, unknown> | null
    /** Optional brand guideline context */
    guideline?: {
        name: string
        prohibitions?: string[] | null
        requirements?: string[] | null
        target_markets?: string[] | null
        target_platforms?: string[] | null
    } | null
}

// ============================================================================
// Generator
// ============================================================================

/**
 * Generate a structured mitigation report from scan data via Gemini.
 *
 * @returns Parsed MitigationReportContent matching the JSONB schema
 * @throws Error if Gemini call or JSON parse fails
 */
export async function generateMitigationReport(
    input: MitigationGeneratorInput
): Promise<MitigationReportContent> {
    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: MITIGATION_REPORT_GEMINI_SCHEMA,
        },
    })

    const prompt = buildPrompt(input)
    const result = await model.generateContent([prompt])
    const text = result.response.text()

    // Parse JSON from response (strip markdown fences as fallback — SDK structured output should eliminate them)
    const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    let parsed: Record<string, unknown>
    try {
        parsed = JSON.parse(jsonStr)
    } catch {
        throw new Error(`Failed to parse Gemini response as JSON: ${jsonStr.substring(0, 200)}...`)
    }

    // Runtime validation — replaces unsafe `as unknown as` coercion
    const validated = MitigationReportContentSchema.safeParse(parsed)
    if (!validated.success) {
        console.error('Mitigation report validation failed:', JSON.stringify(validated.error.issues, null, 2))
        throw new Error(`Gemini returned invalid mitigation report structure: ${validated.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}`)
    }

    return validated.data
}

/**
 * Get the current generator version string.
 * Bump this when prompt or schema changes.
 */
export function getGeneratorVersion(): string {
    return GENERATOR_VERSION
}

// ============================================================================
// Prompt Construction
// ============================================================================

function buildPrompt(input: MitigationGeneratorInput): string {
    const { scan, asset, findings, riskProfile, guideline } = input

    const findingsSummary = findings
        .map(f =>
            `- [${f.severity?.toUpperCase() || 'UNKNOWN'}] ${f.finding_type || 'general'}: ${f.title || 'Untitled'} — ${f.description || 'No description'} (confidence: ${f.confidence_score ?? 0}%)`
        )
        .join('\n')

    // Brand guideline context (if present)
    let guidelineSection = ''
    if (guideline) {
        const parts: string[] = [`BRAND GUIDELINE: "${guideline.name}"`]
        if (guideline.prohibitions?.length) {
            parts.push(`Prohibitions: ${guideline.prohibitions.join('; ')}`)
        }
        if (guideline.requirements?.length) {
            parts.push(`Requirements: ${guideline.requirements.join('; ')}`)
        }
        if (guideline.target_markets?.length) {
            parts.push(`Target Markets: ${guideline.target_markets.join(', ')}`)
        }
        if (guideline.target_platforms?.length) {
            parts.push(`Target Platforms: ${guideline.target_platforms.join(', ')}`)
        }
        guidelineSection = `\n${parts.join('\n')}\n`
    }

    // Compliance matrix guidance based on guidelines
    let complianceHint = ''
    if (guideline?.target_markets?.length || guideline?.target_platforms?.length) {
        complianceHint = `\nCOMPLIANCE REQUIREMENTS:
- MUST include these jurisdictions from brand guideline: ${guideline?.target_markets?.join(', ') || 'none specified'}
- MUST include these platforms from brand guideline: ${guideline?.target_platforms?.join(', ') || 'none specified'}
- Tag guideline-sourced entries with "source": "guideline"
- Additionally infer relevant jurisdictions/platforms from content and tag with "source": "inferred"\n`
    }

    return `You are a Chief Risk Mitigation Officer at a digital media compliance firm generating a structured mitigation report.

SCAN CONTEXT:
- Asset: "${asset?.filename || 'Unknown'}" (${asset?.file_type || 'unknown'}, ${asset?.file_size ? Math.round(asset.file_size / 1024) + 'KB' : 'unknown size'})
- Composite Risk Score: ${scan.composite_score || 0}/100
- Risk Level: ${scan.risk_level || 'unknown'}
- IP Risk Score: ${scan.ip_risk_score || 0}/100
- Safety Risk Score: ${scan.safety_risk_score || 0}/100
- Provenance Risk Score: ${scan.provenance_risk_score || 0}/100
- Provenance Status: ${scan.provenance_status || 'missing'}
${guidelineSection}
FINDINGS:
${findingsSummary || 'No specific findings flagged.'}

CHIEF STRATEGY:
${(riskProfile as Record<string, unknown>)?.chief_officer_strategy || 'No strategy available.'}
${complianceHint}
OUTPUT: Generate a JSON object matching this EXACT schema. Output ONLY valid JSON.

{
  "executive_summary": {
    "decision": "clear|watch|hold|block",
    "confidence": <number 0-100>,
    "approver_level": "analyst|manager|legal|executive",
    "rationale": "<2-3 sentence summary>"
  },
  "asset_context": {
    "filename": "${asset?.filename || 'Unknown'}",
    "type": "${asset?.file_type || 'unknown'}",
    "size": ${asset?.file_size || 0},
    "declared_origin": null,
    "c2pa_chain_status": "${scan.provenance_status || 'missing'}",
    "creator_metadata": null
  },
  "ip_analysis": {
    "severity": "critical|high|medium|low|none",
    "confidence": <number 0-100>,
    "exposures": [{"type": "<type>", "description": "<desc>", "evidence_ref": "scan_finding", "legal_rationale": "<rationale>"}],
    "remediation_status": "required|not_required"
  },
  "safety_analysis": {
    "severity": "critical|high|medium|low|none",
    "confidence": <number 0-100>,
    "exposures": [{"type": "<type>", "description": "<desc>", "evidence_ref": "scan_finding", "legal_rationale": "<rationale>"}],
    "remediation_status": "required|not_required"
  },
  "provenance_analysis": {
    "severity": "critical|high|medium|low|none",
    "confidence": <number 0-100>,
    "exposures": [{"type": "<type>", "description": "<desc>", "evidence_ref": "provenance_check", "legal_rationale": "<rationale>"}],
    "remediation_status": "required|not_required"
  },
  "bias_analysis": {
    "applicable": <boolean>,
    "severity": "<severity or null>",
    "confidence": <number or null>,
    "findings": [],
    "not_applicable_reason": "<reason or null>"
  },
  "guideline_mapping": {
    "guideline_name": ${guideline ? `"${guideline.name}"` : 'null'},
    "mappings": []
  },
  "compliance_matrix": {
    "jurisdictions": [{"name": "<jurisdiction>", "source": "inferred", "status": "pass|review|fail|not_applicable", "rationale": "<why>"}],
    "platforms": [{"name": "<platform>", "source": "inferred", "status": "pass|review|fail|not_applicable", "rationale": "<why>"}]
  },
  "mitigation_plan": {
    "actions": [
      {"priority": 1, "domain": "ip|safety|provenance", "action": "<specific action>", "owner": "<role>", "effort": "<time estimate>", "risk_reduction": "<impact>", "verification": "<how to verify>"}
    ]
  },
  "residual_risk": {
    "remaining_risk": "<summary of remaining risk after mitigations>",
    "publish_decision": "approved|conditional|blocked",
    "conditions": ["<condition 1>"],
    "maintenance_checks": ["<periodic check 1>"]
  }
}

Rules:
1. Match the scan data — do NOT invent findings that weren't detected.
2. If a domain score is <25, severity should be "low" or "none".
3. Generate 1-4 mitigation actions, prioritized by risk reduction.
4. compliance_matrix should include 1-3 jurisdictions and 1-2 platforms.${guideline?.target_markets?.length ? ' Include ALL guideline-specified markets.' : ''}${guideline?.target_platforms?.length ? ' Include ALL guideline-specified platforms.' : ''}
5. Be specific and actionable — this is a paid premium report.
6. Output ONLY the JSON object, no markdown fences or commentary.`
}
