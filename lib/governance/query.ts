/**
 * Governance Database Query Layer
 *
 * Composable queries for governance policies, precedents, and platform requirements.
 * Used by:
 * - Mitigation generator (enriched policy context for advisory reports)
 * - Governance hub (live stats and data for marketing pages)
 *
 * All queries use the service role client (governance data is internal IP).
 * Tenant-specific policies are filtered by tenant_id when provided.
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import type {
  GovernancePolicy,
  GovernancePrecedent,
  PlatformRequirement,
  GovernanceDomain,
  GovernanceStats,
  EnforcementLevel,
} from '@/types/database'

// Explicit enforcement rank — strict rules surface first in prompt context
const ENFORCEMENT_RANK: Record<EnforcementLevel, number> = { strict: 0, recommended: 1, emerging: 2 }

// ─── Types ────────────────────────────────────────────���─────────────────────

export interface PolicyQueryInput {
  /** Risk domains to query (e.g., ['ip', 'safety', 'disclosure']) */
  domains?: GovernanceDomain[]
  /** Target jurisdictions (e.g., ['EU', 'US']) — from brand guideline target_markets */
  jurisdictions?: string[]
  /** Target platforms (e.g., ['Meta', 'TikTok']) — from brand guideline target_platforms */
  platforms?: string[]
  /** Industry (e.g., 'pharmaceutical') — from brand guideline */
  industry?: string | null
  /** Tenant ID for enterprise custom policies (null = internal only) */
  tenantId?: string | null
  /** Maximum policies to return */
  limit?: number
}

export interface FormattedPolicyContext {
  /** Formatted string for injection into mitigation prompt */
  promptText: string
  /** Raw policies for structured reference */
  policies: GovernancePolicy[]
  /** Relevant precedents */
  precedents: GovernancePrecedent[]
  /** Platform-specific requirements */
  platformRules: PlatformRequirement[]
}

// ─── Policy Queries ──────────────────────��──────────────────────────────────

/**
 * Query governance policies relevant to a scan's context.
 * Composes from: scan risk domains + brand guideline markets/platforms + industry.
 */
export async function queryPoliciesForScan(
  input: PolicyQueryInput
): Promise<GovernancePolicy[]> {
  const supabase = await createServiceRoleClient()
  const { domains, jurisdictions, platforms, industry, tenantId, limit = 25 } = input

  let query = supabase
    .from('governance_policies')
    .select('*')
    .or(`tenant_id.is.null${tenantId ? `,tenant_id.eq.${tenantId}` : ''}`)
    .order('severity_weight', { ascending: false })
    .limit(limit)

  // Filter by domains if specified
  if (domains?.length) {
    query = query.in('domain', domains)
  }

  // Build scope filters: jurisdiction + platform + industry + general
  const scopeFilters: string[] = []

  if (jurisdictions?.length) {
    for (const j of jurisdictions) {
      scopeFilters.push(`and(scope.eq.jurisdiction,scope_value.ilike.${j})`)
    }
  }
  if (platforms?.length) {
    for (const p of platforms) {
      scopeFilters.push(`and(scope.eq.platform,scope_value.ilike.${p})`)
    }
  }
  if (industry) {
    scopeFilters.push(`and(scope.eq.industry,scope_value.ilike.${industry})`)
  }
  // Always include general policies
  scopeFilters.push('scope.eq.general')

  if (scopeFilters.length > 0) {
    query = query.or(scopeFilters.join(','))
  }

  // Filter out expired policies
  const today = new Date().toISOString().split('T')[0]
  query = query.or(`expiry_date.is.null,expiry_date.gte.${today}`)

  const { data, error } = await query

  if (error) {
    console.error('Governance policy query failed:', error.message)
    return []
  }

  return (data || []) as GovernancePolicy[]
}

/**
 * Query precedents relevant to specific risk domains.
 */
export async function queryPrecedentsForDomain(
  domains?: GovernanceDomain[],
  limit = 10
): Promise<GovernancePrecedent[]> {
  const supabase = await createServiceRoleClient()

  let query = supabase
    .from('governance_precedents')
    .select('*')
    .order('relevance_score', { ascending: false })
    .order('date', { ascending: false })
    .limit(limit)

  // Filter by tags matching domains if specified
  if (domains?.length) {
    // Precedents tagged with domain names (e.g., 'copyright' maps to 'ip' domain)
    const tagMap: Record<string, string[]> = {
      ip: ['copyright', 'training-data', 'image-generation', 'visual-art'],
      safety: ['content-moderation', 'safety'],
      provenance: ['c2pa', 'provenance', 'content-credentials'],
      disclosure: ['disclosure', 'transparency'],
      bias: ['bias', 'representation'],
    }
    const relevantTags = domains.flatMap(d => tagMap[d] || [d])
    if (relevantTags.length > 0) {
      query = query.overlaps('tags', relevantTags)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Governance precedent query failed:', error.message)
    return []
  }

  return (data || []) as GovernancePrecedent[]
}

/**
 * Query platform-specific content requirements.
 */
export async function queryPlatformRequirements(
  platforms: string[],
  contentType?: string
): Promise<PlatformRequirement[]> {
  const supabase = await createServiceRoleClient()

  let query = supabase
    .from('platform_requirements')
    .select('*')
    .in('platform', platforms)

  if (contentType) {
    query = query.or(`content_type.eq.${contentType},content_type.eq.all`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Platform requirements query failed:', error.message)
    return []
  }

  // Sort by enforcement rank in application code — strict first
  const results = (data || []) as PlatformRequirement[]
  results.sort((a, b) =>
    (ENFORCEMENT_RANK[a.enforcement_level as EnforcementLevel] ?? 9) -
    (ENFORCEMENT_RANK[b.enforcement_level as EnforcementLevel] ?? 9)
  )

  return results
}

// ─── Formatted Context for Mitigation Prompt ────────────��───────────────────

/**
 * Build a complete, formatted policy context for the mitigation generator.
 * Queries all relevant governance data and formats it for prompt injection.
 */
export async function buildGovernanceContext(
  input: PolicyQueryInput & {
    /** Scan composite score — used to select precedent relevance */
    compositeScore?: number
  }
): Promise<FormattedPolicyContext> {
  const { compositeScore = 50, ...policyInput } = input

  // Determine which domains to query based on what's relevant
  const domains: GovernanceDomain[] = policyInput.domains || ['ip', 'safety', 'provenance', 'disclosure']

  // Run all queries in parallel
  const [policies, precedents, platformRules] = await Promise.all([
    queryPoliciesForScan({ ...policyInput, domains }),
    queryPrecedentsForDomain(domains, 5),
    policyInput.platforms?.length
      ? queryPlatformRequirements(policyInput.platforms, 'ai_generated')
      : Promise.resolve([]),
  ])

  // Format for prompt injection
  const promptText = formatGovernancePrompt(policies, precedents, platformRules, compositeScore)

  return { promptText, policies, precedents, platformRules }
}

/**
 * Format governance data into a structured prompt section.
 */
function formatGovernancePrompt(
  policies: GovernancePolicy[],
  precedents: GovernancePrecedent[],
  platformRules: PlatformRequirement[],
  compositeScore: number
): string {
  const sections: string[] = []

  // ── Regulatory context ──
  if (policies.length > 0) {
    const policyLines = policies.map(p => {
      const authority = p.authority ? ` [${p.authority}]` : ''
      const type = p.rule_type.toUpperCase()
      return `- [${type}]${authority} ${p.rule_text} (domain: ${p.domain}, scope: ${p.scope_value}, weight: ${p.severity_weight})`
    })
    sections.push(`REGULATORY & GOVERNANCE CONTEXT (${policies.length} applicable rules from governance database):\n${policyLines.join('\n')}`)
  }

  // ── Platform requirements ──
  if (platformRules.length > 0) {
    const platformLines = platformRules.map(r => {
      const enforcement = r.enforcement_level === 'strict' ? 'STRICT' : r.enforcement_level === 'recommended' ? 'RECOMMENDED' : 'EMERGING'
      return `- [${enforcement}] ${r.platform} (${r.content_type}): ${r.requirement_text}`
    })
    sections.push(`PLATFORM-SPECIFIC REQUIREMENTS (${platformRules.length} rules):\n${platformLines.join('\n')}`)
  }

  // ── Precedent context ──
  if (precedents.length > 0 && compositeScore >= 25) {
    const precLines = precedents.slice(0, 5).map(p => {
      const exposure = p.financial_exposure_usd
        ? ` ($${(p.financial_exposure_usd / 1_000_000_000).toFixed(1)}B exposure)`
        : ''
      return `- ${p.case_ref} (${p.case_type}, ${p.date})${exposure}: ${p.summary.substring(0, 150)}...`
    })
    sections.push(`RELEVANT PRECEDENTS (real cases — cite where applicable):\n${precLines.join('\n')}`)
  }

  // ── Instructions for using governance data ──
  sections.push(`GOVERNANCE DATA INSTRUCTIONS:
- When populating compliance_matrix, use governance database rules (source: "governance_db") alongside inferred and guideline entries
- Include the "authority" field from governance rules as citations in compliance rationale
- For platform entries: use the specific platform requirement text, not generic assumptions
- Reference specific precedents by case_ref when observations align with known litigation patterns
- Do NOT fabricate regulations or cases — only cite what is provided above`)

  return sections.join('\n\n')
}

// ─── Governance Hub Stats ───────────────────────────────────────────────────

/**
 * Get aggregated governance stats for the governance hub.
 * Used by marketing pages to display live data.
 */
export async function getGovernanceStats(): Promise<GovernanceStats> {
  const supabase = await createServiceRoleClient()

  const [policiesRes, precedentsRes, platformsRes] = await Promise.all([
    supabase.from('governance_policies').select('id, scope, scope_value', { count: 'exact' }).is('tenant_id', null),
    supabase.from('governance_precedents').select('id, financial_exposure_usd, case_type', { count: 'exact' }),
    supabase.from('platform_requirements').select('id, platform', { count: 'exact' }),
  ])

  const totalPolicies = policiesRes.count || 0
  const totalPrecedents = precedentsRes.count || 0

  // Sum financial exposure
  const totalFinancialExposure = (precedentsRes.data || []).reduce(
    (sum, p) => sum + (p.financial_exposure_usd || 0),
    0
  )

  // Count tracked cases (settlement + ruling + enforcement)
  const trackedCaseCount = (precedentsRes.data || []).filter(
    p => p.case_type === 'settlement' || p.case_type === 'ruling' || p.case_type === 'enforcement'
  ).length

  // Unique platforms
  const platformsCovered = new Set((platformsRes.data || []).map(p => p.platform)).size

  // Unique jurisdictions from policies
  const jurisdictionsCovered = new Set(
    (policiesRes.data || [])
      .filter(p => p.scope === 'jurisdiction')
      .map(p => p.scope_value)
  ).size

  return {
    totalPolicies,
    totalPrecedents,
    totalFinancialExposure,
    trackedCaseCount,
    platformsCovered,
    jurisdictionsCovered,
    lastUpdated: new Date().toISOString(),
  }
}

/**
 * Get precedents formatted as RiskWatchItems for the governance hub.
 * Compatible with the existing riskWatchItems interface.
 */
export async function getPrecedentsForHub(limit = 10): Promise<GovernancePrecedent[]> {
  const supabase = await createServiceRoleClient()

  const { data, error } = await supabase
    .from('governance_precedents')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Hub precedents query failed:', error.message)
    return []
  }

  return (data || []) as GovernancePrecedent[]
}

/**
 * Get jurisdiction-level policy signals for the governance hub.
 */
export async function getPolicySignalsForHub(): Promise<GovernancePolicy[]> {
  const supabase = await createServiceRoleClient()

  const { data, error } = await supabase
    .from('governance_policies')
    .select('*')
    .eq('scope', 'jurisdiction')
    .is('tenant_id', null)
    .order('severity_weight', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Hub policy signals query failed:', error.message)
    return []
  }

  return (data || []) as GovernancePolicy[]
}
