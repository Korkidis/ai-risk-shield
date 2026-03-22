import { describe, it, expect } from 'vitest'
import { MitigationReportContentSchema } from '@/lib/schemas/mitigation-schema'

const VALID_FIXTURE = {
  executive_summary: {
    decision: 'watch' as const,
    confidence: 72,
    approver_level: 'manager',
    rationale: 'Moderate IP risk detected. Brand safety clear. Missing provenance credentials.',
  },
  asset_context: {
    filename: 'hero-banner.png',
    type: 'image',
    size: 245760,
    declared_origin: null,
    c2pa_chain_status: 'missing',
    creator_metadata: null,
  },
  ip_analysis: {
    severity: 'medium',
    confidence: 68,
    exposures: [
      {
        type: 'trademark_similarity',
        description: 'Logo bears resemblance to registered trademark',
        evidence_ref: 'scan_finding',
        legal_rationale: 'Potential confusion under Lanham Act Section 43(a)',
      },
    ],
    remediation_status: 'required' as const,
  },
  safety_analysis: {
    severity: 'none',
    confidence: 95,
    exposures: [],
    remediation_status: 'not_required' as const,
  },
  provenance_analysis: {
    severity: 'high',
    confidence: 90,
    exposures: [
      {
        type: 'missing_c2pa',
        description: 'No C2PA content credentials found',
        evidence_ref: 'provenance_check',
        legal_rationale: 'Cannot verify origin chain per CAI standards',
      },
    ],
    remediation_status: 'required' as const,
  },
  bias_analysis: {
    applicable: false,
    severity: null,
    confidence: null,
    findings: [],
    not_applicable_reason: 'Non-representational commercial asset',
  },
  guideline_mapping: {
    guideline_name: null,
    mappings: [],
  },
  compliance_matrix: {
    jurisdictions: [
      {
        name: 'United States',
        source: 'inferred' as const,
        status: 'review' as const,
        rationale: 'Trademark similarity requires legal review under US law',
      },
    ],
    platforms: [
      {
        name: 'Instagram',
        source: 'inferred' as const,
        status: 'pass' as const,
        rationale: 'Content meets platform community guidelines',
      },
    ],
  },
  mitigation_plan: {
    actions: [
      {
        priority: 1,
        domain: 'ip',
        action: 'Conduct trademark clearance search for identified logo similarity',
        owner: 'Legal counsel',
        effort: '2-3 business days',
        risk_reduction: 'Eliminates trademark infringement risk',
        verification: 'Written clearance opinion from IP attorney',
      },
      {
        priority: 2,
        domain: 'provenance',
        action: 'Add C2PA content credentials before publication',
        owner: 'Creative team',
        effort: '1 hour',
        risk_reduction: 'Establishes verifiable origin chain',
        verification: 'C2PA validation returns verified status',
      },
    ],
  },
  residual_risk: {
    remaining_risk: 'Low residual risk after trademark clearance and C2PA attachment',
    publish_decision: 'conditional' as const,
    conditions: ['Trademark clearance obtained', 'C2PA credentials attached'],
    maintenance_checks: ['Re-scan after modifications', 'Annual trademark monitoring'],
  },
}

describe('MitigationReportContentSchema', () => {
  it('validates a well-formed mitigation report', () => {
    const result = MitigationReportContentSchema.safeParse(VALID_FIXTURE)
    expect(result.success).toBe(true)
  })

  it('rejects report missing executive_summary', () => {
    const { executive_summary: _, ...incomplete } = VALID_FIXTURE
    const result = MitigationReportContentSchema.safeParse(incomplete)
    expect(result.success).toBe(false)
  })

  it('rejects invalid decision enum value', () => {
    const invalid = {
      ...VALID_FIXTURE,
      executive_summary: { ...VALID_FIXTURE.executive_summary, decision: 'maybe' },
    }
    const result = MitigationReportContentSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejects invalid remediation_status', () => {
    const invalid = {
      ...VALID_FIXTURE,
      ip_analysis: { ...VALID_FIXTURE.ip_analysis, remediation_status: 'pending' },
    }
    const result = MitigationReportContentSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejects invalid compliance source', () => {
    const invalid = {
      ...VALID_FIXTURE,
      compliance_matrix: {
        jurisdictions: [{ name: 'US', source: 'manual', status: 'pass', rationale: 'test' }],
        platforms: [],
      },
    }
    const result = MitigationReportContentSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejects invalid publish_decision', () => {
    const invalid = {
      ...VALID_FIXTURE,
      residual_risk: { ...VALID_FIXTURE.residual_risk, publish_decision: 'pending' },
    }
    const result = MitigationReportContentSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('accepts nullable fields as null', () => {
    const withNulls = {
      ...VALID_FIXTURE,
      asset_context: { ...VALID_FIXTURE.asset_context, declared_origin: null, creator_metadata: null },
      bias_analysis: { ...VALID_FIXTURE.bias_analysis, severity: null, confidence: null, not_applicable_reason: null },
      guideline_mapping: { guideline_name: null, mappings: [] },
    }
    const result = MitigationReportContentSchema.safeParse(withNulls)
    expect(result.success).toBe(true)
  })

  it('accepts empty arrays for actions and findings', () => {
    const minimal = {
      ...VALID_FIXTURE,
      mitigation_plan: { actions: [] },
      bias_analysis: { ...VALID_FIXTURE.bias_analysis, findings: [] },
      compliance_matrix: { jurisdictions: [], platforms: [] },
      guideline_mapping: { guideline_name: null, mappings: [] },
      residual_risk: { ...VALID_FIXTURE.residual_risk, conditions: [], maintenance_checks: [] },
    }
    const result = MitigationReportContentSchema.safeParse(minimal)
    expect(result.success).toBe(true)
  })
})
