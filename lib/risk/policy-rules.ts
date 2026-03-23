/**
 * Operational Policy Rules
 *
 * Machine-readable decision rules that inform the mitigation layer.
 * NOT injected into scanner prompts — only used as mitigation context.
 *
 * These rules are distilled from governance principles and industry standards.
 * They give the mitigation LLM a structured decision framework rather than
 * relying entirely on training data for risk guidance.
 */

export type PolicyStance = 'defensible' | 'high_scrutiny' | 'investigate' | 'verify_licensing' | 'escalate' | 'review' | 'document' | 'standard'

export interface PolicyRule {
  stance: PolicyStance
  guidance: string
}

export const PROVENANCE_POLICIES: Record<string, PolicyRule> = {
  c2pa_verified: {
    stance: 'defensible',
    guidance: 'Valid C2PA credentials establish a cryptographic chain of custody. This is the strongest available provenance signal.',
  },
  c2pa_caution: {
    stance: 'review',
    guidance: 'C2PA credentials present but with non-standard structure. Partial chain of custody — may still support defensibility.',
  },
  c2pa_missing_professional: {
    stance: 'high_scrutiny',
    guidance: 'Professional-quality content without provenance credentials warrants investigation of origin. In 2026, absence of C2PA on professional work is a notable gap.',
  },
  c2pa_missing_amateur: {
    stance: 'review',
    guidance: 'Amateur content without provenance credentials is common but origin cannot be verified. Document the sourcing decision.',
  },
  c2pa_invalid: {
    stance: 'escalate',
    guidance: 'C2PA credentials present but tampered or expired. Chain of custody is compromised — we recommend treating this as unverified and investigating the source.',
  },
}

export const IP_POLICIES: Record<string, PolicyRule> = {
  clear_match: {
    stance: 'verify_licensing',
    guidance: 'Clear visual match to known protected content. We recommend verifying licensing status before use. If licensing cannot be confirmed, consider alternative assets.',
  },
  ambiguous_similarity: {
    stance: 'investigate',
    guidance: 'Visual similarity detected but not conclusive. The system cannot determine licensing status or fair use applicability. Human review by someone familiar with the IP landscape is recommended.',
  },
  style_adjacent: {
    stance: 'document',
    guidance: 'Style similarity noted but may be within acceptable creative bounds. Document the creative rationale and sourcing decision for defensibility.',
  },
  no_issue: {
    stance: 'standard',
    guidance: 'No significant IP signals detected. Standard publishing workflow applies.',
  },
}

export const SAFETY_POLICIES: Record<string, PolicyRule> = {
  platform_violation: {
    stance: 'escalate',
    guidance: 'Content may conflict with major platform policies. We recommend reviewing specific platform requirements before distribution.',
  },
  brand_tension: {
    stance: 'review',
    guidance: 'Content may create brand alignment concerns depending on audience and context. Route to brand team for review.',
  },
  context_dependent: {
    stance: 'review',
    guidance: 'Safety assessment is context-dependent. Content may be appropriate for some audiences and channels but not others.',
  },
  no_issue: {
    stance: 'standard',
    guidance: 'No significant safety signals detected. Standard publishing workflow applies.',
  },
}

export const GENERAL_POLICIES = {
  disclaimer: 'This system provides risk signals and operational decision support. It does not provide legal advice, and does not replace professional counsel for legal decisions.',
  scope: 'Scoring reflects automated analysis of visual content. It does not assess licensing agreements, fair use context, editorial intent, or jurisdictional nuances.',
  confidence_note: 'When confidence is low or findings are ambiguous, the system reports what it observes and recommends investigation rather than asserting conclusions.',
}

// ─── Positive-Path Governance ───────────────────────────────────────────────
// Best-practice guidance for low-risk content. These are operational
// recommendations — not restrictions. They help creative teams ship
// confidently while maintaining audit trails.

export const POSITIVE_GOVERNANCE = {
  synthetic_asset_naming: {
    guidance: 'Best practice: include a synthetic-origin indicator in the asset filename or metadata (e.g., "hero-banner_ai-generated.png"). This supports internal tracking, downstream compliance, and audit readiness without affecting creative quality.',
  },
  human_in_loop: {
    guidance: 'Even for low-risk content, a lightweight human review step strengthens defensibility. A simple sign-off ("reviewed by [name], [date]") in your asset management system creates a documented approval chain.',
  },
  distribution_best_practices: {
    guidance: 'Before distributing AI-generated content: (1) confirm the asset has been reviewed by an appropriate stakeholder, (2) attach provenance metadata if available, (3) note the intended channels and audiences in your content management system.',
  },
  channel_disclosure: {
    guidance: 'Disclosure requirements vary by channel. Some platforms require AI-generated content labels, others recommend them. Check each target platform\'s current policy. When in doubt, disclose — transparency builds audience trust and protects against policy changes.',
  },
  c2pa_value: {
    guidance: 'This content has verified C2PA provenance credentials, which establish a cryptographic chain of custody from creation tool to current state. This is the strongest available proof of content origin and significantly strengthens your defensibility posture.',
  },
}

// ─── Decision Mapping ───────────────────────────────────────────────────────
// Explicit composite-score-to-decision rules. These are injected into the
// mitigation prompt to prevent the LLM from defaulting to caution on
// low-risk scans.

export const DECISION_RULES = {
  mapping: `RECOMMENDATION MAPPING (MANDATORY — override any instinct to be cautious on low-risk scans):
- Composite 0-24: recommendation MUST be "proceed", readiness MUST be "ready". This is a LOW-RISK asset. The report should be affirming and constructive — highlight what went right. The UI will display this as "Low Risk" and "Ready to Publish".
- Composite 25-49: recommendation should be "monitor", readiness should be "conditional". Minor observations worth tracking, no blockers. UI displays "Worth Monitoring".
- Composite 50-74: recommendation should be "review", readiness should be "conditional". Specific investigation suggested before publishing. UI displays "Worth Reviewing".
- Composite 75-100: recommendation should be "review" or "escalate", readiness should be "needs_attention" or "conditional". Significant observations worth careful attention. UI displays "Needs Attention".
NOTE: The enum values (proceed/monitor/review/escalate) are internal labels. The user sees friendly descriptions. Never write text that says "we recommend you proceed" or "this is blocked" — instead describe what was found and suggest next steps.`,
}

// ─── Policy Selection ───────────────────────────────────────────────────────

/**
 * Select relevant policy rules based on scan results.
 * Returns 2-5 applicable rules formatted as decision context.
 */
export function selectPolicyContext(scan: {
  composite_score?: number | null
  ip_risk_score: number | null
  safety_risk_score: number | null
  provenance_risk_score?: number | null
  provenance_status: string | null
}): string {
  const rules: string[] = []
  const composite = scan.composite_score || 0

  // Decision mapping is always first — anchors the LLM's decision
  rules.push(DECISION_RULES.mapping)

  // Provenance policy
  const provStatus = scan.provenance_status || 'missing'
  if (provStatus === 'valid') {
    rules.push(`PROVENANCE: ${PROVENANCE_POLICIES.c2pa_verified.guidance}`)
  } else if (provStatus === 'caution') {
    rules.push(`PROVENANCE: ${PROVENANCE_POLICIES.c2pa_caution.guidance}`)
  } else if (provStatus === 'invalid') {
    rules.push(`PROVENANCE: ${PROVENANCE_POLICIES.c2pa_invalid.guidance}`)
  } else {
    const ipScore = scan.ip_risk_score || 0
    rules.push(`PROVENANCE: ${ipScore > 50 ? PROVENANCE_POLICIES.c2pa_missing_professional.guidance : PROVENANCE_POLICIES.c2pa_missing_amateur.guidance}`)
  }

  // IP policy — include "no issue" for low scores so the LLM doesn't invent problems
  const ipScore = scan.ip_risk_score || 0
  if (ipScore >= 85) {
    rules.push(`IP: ${IP_POLICIES.clear_match.guidance}`)
  } else if (ipScore >= 50) {
    rules.push(`IP: ${IP_POLICIES.ambiguous_similarity.guidance}`)
  } else if (ipScore >= 25) {
    rules.push(`IP: ${IP_POLICIES.style_adjacent.guidance}`)
  } else {
    rules.push(`IP: ${IP_POLICIES.no_issue.guidance}`)
  }

  // Safety policy — include "no issue" for low scores
  const safetyScore = scan.safety_risk_score || 0
  if (safetyScore >= 70) {
    rules.push(`SAFETY: ${SAFETY_POLICIES.platform_violation.guidance}`)
  } else if (safetyScore >= 40) {
    rules.push(`SAFETY: ${SAFETY_POLICIES.context_dependent.guidance}`)
  } else if (safetyScore >= 25) {
    rules.push(`SAFETY: ${SAFETY_POLICIES.brand_tension.guidance}`)
  } else {
    rules.push(`SAFETY: ${SAFETY_POLICIES.no_issue.guidance}`)
  }

  // Positive-path governance for low-risk scans
  if (composite < 25) {
    rules.push(`\nBEST PRACTICES FOR LOW-RISK CONTENT:`)
    rules.push(`NAMING: ${POSITIVE_GOVERNANCE.synthetic_asset_naming.guidance}`)
    rules.push(`REVIEW: ${POSITIVE_GOVERNANCE.human_in_loop.guidance}`)
    rules.push(`DISTRIBUTION: ${POSITIVE_GOVERNANCE.distribution_best_practices.guidance}`)
    rules.push(`DISCLOSURE: ${POSITIVE_GOVERNANCE.channel_disclosure.guidance}`)
    if (provStatus === 'valid') {
      rules.push(`C2PA VALUE: ${POSITIVE_GOVERNANCE.c2pa_value.guidance}`)
    }
  }

  // Always include scope and confidence note
  rules.push(`SCOPE: ${GENERAL_POLICIES.scope}`)
  rules.push(`NOTE: ${GENERAL_POLICIES.confidence_note}`)

  return rules.join('\n')
}
