/**
 * Mitigation Report Generator (v3.0.0)
 *
 * Generates structured MitigationReportContent from scan data via Gemini.
 * Persona: "Content Advisor" — calm, experienced, constructive.
 * Never says "block", "required", or "you must". Makes informed suggestions.
 *
 * Key changes from v2:
 * - Advisory vocabulary (proceed/monitor/review/escalate, not clear/hold/block)
 * - Explainability section explains HOW we analyzed, not just WHAT we found
 * - Always-positive framing for low-risk content
 * - Observations (not exposures), context (not legal_rationale)
 * - Governance best practices woven into recommendations
 */

import { MitigationReportContent } from '@/types/database'
import { getGeminiClient } from '@/lib/ai/gemini'
import { MitigationReportContentSchema, MITIGATION_REPORT_GEMINI_SCHEMA } from '@/lib/schemas/mitigation-schema'
import { formatChiefStrategy } from '@/lib/gemini-types'
import { selectPolicyContext, GENERAL_POLICIES } from '@/lib/risk/policy-rules'
import { buildGovernanceContext } from '@/lib/governance/query'
import type { GovernanceDomain } from '@/types/database'

const GENERATOR_VERSION = '3.0.0'

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
        tenant_id?: string | null
    }
    /** Asset file metadata */
    asset: {
        filename: string
        file_type: string
        file_size: number
    } | null
    /** Structured findings from scan_findings table */
    findings: {
        id?: string | null
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
        industry?: string | null
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
            temperature: 0.3,
            responseMimeType: 'application/json',
            responseSchema: MITIGATION_REPORT_GEMINI_SCHEMA,
        },
    })

    const prompt = await buildPrompt(input)
    const result = await model.generateContent([prompt])
    const text = result.response.text()

    // Parse JSON from response
    const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    let parsed: Record<string, unknown>
    try {
        parsed = JSON.parse(jsonStr)
    } catch {
        throw new Error(`Failed to parse Gemini response as JSON: ${jsonStr.substring(0, 200)}...`)
    }

    // Runtime validation
    const validated = MitigationReportContentSchema.safeParse(parsed)
    if (!validated.success) {
        console.error('Mitigation report validation failed:', JSON.stringify(validated.error.issues, null, 2))
        throw new Error(`Gemini returned invalid mitigation report structure: ${validated.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}`)
    }

    return validated.data
}

/**
 * Get the current generator version string.
 */
export function getGeneratorVersion(): string {
    return GENERATOR_VERSION
}

// ============================================================================
// Prompt Construction
// ============================================================================

async function buildPrompt(input: MitigationGeneratorInput): Promise<string> {
    const { scan, asset, findings, riskProfile, guideline } = input

    const compositeScore = scan.composite_score || 0
    const ipScore = scan.ip_risk_score || 0
    const safetyScore = scan.safety_risk_score || 0
    const provScore = scan.provenance_risk_score || 0
    const provStatus = scan.provenance_status || 'missing'

    // Format findings with stable reference IDs
    const findingsSummary = findings
        .map((f, i) => {
            const ref = `FINDING-${i + 1}`
            const severity = f.severity?.toUpperCase() || 'UNKNOWN'
            const type = f.finding_type || 'general'
            const title = f.title || 'Untitled'
            const desc = f.description || 'No description'
            const conf = f.confidence_score ?? 0
            return `- [${ref}] [${severity}] ${type}: ${title} — ${desc} (confidence: ${conf}%)`
        })
        .join('\n')

    // Brand guideline context
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

    // Compliance matrix guidance
    let complianceHint = ''
    if (guideline?.target_markets?.length || guideline?.target_platforms?.length) {
        complianceHint = `\nCOMPLIANCE CONTEXT:
- Include these jurisdictions from brand guideline: ${guideline?.target_markets?.join(', ') || 'none specified'}
- Include these platforms from brand guideline: ${guideline?.target_platforms?.join(', ') || 'none specified'}
- Tag guideline-sourced entries with "source": "guideline"
- Additionally infer relevant jurisdictions/platforms from content and tag with "source": "inferred"\n`
    }

    // Guideline mapping instructions
    let guidelineMappingHint = ''
    if (guideline) {
        const rules: string[] = []
        if (guideline.prohibitions?.length) {
            rules.push(`Prohibitions: ${guideline.prohibitions.map((p, i) => `[P${i + 1}] ${p}`).join('; ')}`)
        }
        if (guideline.requirements?.length) {
            rules.push(`Requirements: ${guideline.requirements.map((r, i) => `[R${i + 1}] ${r}`).join('; ')}`)
        }
        if (rules.length > 0) {
            guidelineMappingHint = `\nGUIDELINE MAPPING:
For each finding, check if it relates to any of these brand rules:
${rules.join('\n')}

For each match, create a mapping entry in guideline_mapping.mappings:
- finding_ref: the finding ID (e.g., "FINDING-1")
- guideline_item: the specific rule text
- status: "violation" (contradicts guideline), "compliant" (aligns), or "not_applicable"\n`
        }
    }

    // Policy context — hardcoded rules (always available as baseline)
    const policyContext = selectPolicyContext(scan)

    // Governance DB context — enriched with real regulatory data and precedents
    let governanceContext = ''
    try {
        // Determine relevant domains based on scan scores
        const domains: GovernanceDomain[] = []
        if (ipScore >= 10) domains.push('ip')
        if (safetyScore >= 10) domains.push('safety')
        domains.push('provenance', 'disclosure') // always relevant

        const govResult = await buildGovernanceContext({
            domains,
            jurisdictions: guideline?.target_markets?.filter(Boolean) as string[] | undefined,
            platforms: guideline?.target_platforms?.filter(Boolean) as string[] | undefined,
            industry: guideline?.industry || null,
            tenantId: scan.tenant_id || null,
            compositeScore,
        })
        governanceContext = govResult.promptText
    } catch (err) {
        // Fail-safe: governance DB unavailable — hardcoded rules still apply
        console.error('Governance DB query failed, using hardcoded rules only:', err instanceof Error ? err.message : err)
    }

    // Strategy from scanner synthesis
    const strategyText = formatChiefStrategy((riskProfile as Record<string, unknown>)?.chief_officer_strategy as string) || 'No strategy available.'

    return `You are an experienced Content Advisor helping creative teams publish with confidence.

YOUR APPROACH:
You've reviewed thousands of AI-generated assets and you understand both the creative process and the compliance landscape. Your role is to explain what you found, why it matters, and what you'd suggest — never to make decisions for the team. You speak clearly, avoid jargon, and always provide constructive guidance. Think of yourself as a calm, knowledgeable colleague — not a gatekeeper.

TONE RULES (MANDATORY):
- Never say "block", "prohibit", "required", "you must", "do not publish", or "cease"
- Use "we recommend", "consider", "you may want to", "a good practice is"
- Frame observations as helpful context, not warnings or threats
- If something looks good, say so warmly and specifically — don't hedge with "however" or "despite"
- This is a premium $29 report. Make every section feel valuable and worth reading.
- Write in clear, conversational English. No legalese. No bureaucratic language.

SCORE SEMANTICS (READ CAREFULLY):
- All scores are RISK scores: 0 = lowest risk (best), 100 = highest risk (worst)
- Provenance Risk Score of ${provScore}/100 means ${provScore === 0 ? 'ZERO provenance risk — the BEST possible score' : provScore < 25 ? 'very low provenance risk — strong' : 'some provenance concerns'}
- Provenance Status "${provStatus}"${provStatus === 'valid' ? ' = C2PA credentials cryptographically verified. This is STRONGLY POSITIVE.' : provStatus === 'caution' ? ' = C2PA present but non-standard.' : provStatus === 'missing' ? ' = no C2PA credentials found.' : ' = C2PA verification issue.'}
- A low score is GOOD. Do NOT confuse low risk with low confidence.

SCAN RESULTS:
- Asset: "${asset?.filename || 'Unknown'}" (${asset?.file_type || 'unknown'}, ${asset?.file_size ? Math.round(asset.file_size / 1024) + 'KB' : 'unknown size'})
- Composite Risk Score: ${compositeScore}/100
- Risk Level: ${scan.risk_level || 'unknown'}
- IP Risk Score: ${ipScore}/100
- Safety Risk Score: ${safetyScore}/100
- Provenance Risk Score: ${provScore}/100
- Provenance Status: ${provStatus}${provStatus === 'valid' ? ' (verified)' : ''}
${guidelineSection}
FINDINGS FROM SCAN:
${findingsSummary || 'No significant findings flagged — all domains scored low.'}

STRATEGY CONTEXT:
${strategyText}

DECISION FRAMEWORK:
${policyContext}
${governanceContext ? `\n${governanceContext}\n` : ''}${complianceHint}${guidelineMappingHint}
SECTION-BY-SECTION INSTRUCTIONS:

1. EXPLAINABILITY (top of report — explains HOW we analyzed):
   - summary: 1-2 sentences explaining that we analyzed this asset across three dimensions
   - ip_methodology: Explain what the IP scanner looked for (visual comparison against known protected works, trademark patterns, celebrity recognition)
   - safety_methodology: Explain what the safety scanner evaluated (platform policy compliance, content appropriateness, brand alignment)
   - provenance_methodology: Explain what provenance verification checked (C2PA credentials, chain of custody, visual forensics)
   - score_explanation: Plain-English explanation of what the composite score of ${compositeScore}/100 means for this specific asset. ${compositeScore < 25 ? 'This is a strong result — emphasize what went right.' : compositeScore < 50 ? 'This is a moderate result — note what was found and what can be improved.' : 'Explain the specific concerns that drove the score up.'}

2. EXECUTIVE SUMMARY:
   - recommendation: ${compositeScore < 25 ? '"proceed" (MANDATORY for scores under 25)' : compositeScore < 50 ? '"monitor" recommended' : compositeScore < 75 ? '"review" recommended' : '"review" or "escalate" recommended'}
   - confidence: Your confidence percentage in this assessment
   - rationale: 2-3 sentences. ${compositeScore < 25 ? 'Lead with what looks good. Be affirming.' : 'Explain the key observations that inform your recommendation.'}
   - disclaimer: "${GENERAL_POLICIES.disclaimer}"

3. DOMAIN ANALYSES (ip_analysis, safety_analysis, provenance_analysis):
   ALL THREE sections must be substantive — even when scores are low.
   - signal_strength: "none", "low", "moderate", "significant", or "strong"
   - confidence: 0-100 percentage
   - observations: Array of what was found. ${compositeScore < 25 ? 'For low-risk domains: describe what was checked and what looked good. e.g., "No visual similarity to known protected works was detected in our reference database." These positive observations ARE the value of the report.' : 'Describe specific observations with evidence references.'}
   - action_suggested: ${compositeScore < 25 ? 'false for all domains under 25' : 'true only when there are concrete steps the team should take'}
   - Each observation description MUST be 2-3 sentences minimum. First sentence: what was found. Second: why it matters. Third: specific context from scan data.
   - Each observation context field MUST be 1-2 sentences on practical implications.
   - For observation.evidence_ref: Link to FINDING-N references when they exist. For positive observations, use "scan_analysis".
   For low-risk domains: Do NOT just say "nothing was found." Describe: (a) what specific checks were performed, (b) what a positive result means practically for the team, and (c) a concrete suggestion for maintaining this status.
   ${provStatus === 'valid' ? '\n   PROVENANCE SPECIAL: C2PA is verified. The provenance_analysis should highlight this as a significant strength. Explain what verified credentials mean (chain of custody from creation tool to now). This is the gold standard — make it feel like a win.' : ''}

4. RECOMMENDATIONS (not "mitigation plan"):
   - ${compositeScore < 25 ? 'Frame as BEST PRACTICES for maintaining content quality, not risk remediation. Examples: asset naming conventions, disclosure practices, workflow documentation, provenance preservation.' : 'Frame as constructive suggestions, not directives. Use "consider" and "we recommend".'}
   - 2-4 actions, prioritized by value to the team
   - Each recommendation action MUST be specific and implementable — not vague advice like "review your content."
   - Include the "why" — what risk does this action address or what benefit does it protect.
   - impact: What this action achieves (positive framing). Quantify when possible (e.g., "reduces similarity flag likelihood by addressing the top visual match").
   - alternatives: Only needed for medium/high-risk items — creative alternatives that preserve intent

5. OUTLOOK (not "residual risk"):
   - summary: Honest, forward-looking statement about where this content stands
   - readiness: ${compositeScore < 25 ? '"ready" (MANDATORY)' : compositeScore < 50 ? '"conditional" recommended' : '"needs_attention" or "conditional" recommended'}
   - conditions: ${compositeScore < 25 ? 'Empty array — no conditions needed for low-risk content' : 'Specific items to address before publishing'}
   - next_steps: Helpful suggestions for the team going forward (governance tips, workflow improvements)

QUALITY BAR: This is a premium $29 report. Each section should feel substantive and worth paying for. A reader should finish feeling informed and confident about their next steps. If a section would fit in a single line, expand it with methodology explanation or practical guidance. Thin, generic responses undermine trust in the product.

OUTPUT: Generate JSON matching the schema. Rules:
1. Match the scan data. Do NOT invent observations that weren't detected.
2. All three domain analyses must have substantive content — positive observations for clean domains.
3. ${compositeScore < 25 ? 'This is low-risk. recommendation MUST be "proceed", readiness MUST be "ready". Do NOT undercut positive results.' : ''}
4. Write like a knowledgeable colleague, not a compliance officer.
5. Output ONLY JSON, no markdown fences.
6. For compliance_matrix: use "governance_db" as source for entries derived from the REGULATORY & GOVERNANCE CONTEXT or PLATFORM-SPECIFIC REQUIREMENTS above. Include the authority citation in the rationale field.
7. When citing precedents, use the exact case_ref text provided. Do not fabricate case names or rulings.`
}
