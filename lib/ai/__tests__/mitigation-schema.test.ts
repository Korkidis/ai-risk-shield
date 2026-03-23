import { describe, it, expect } from 'vitest'
import { MitigationReportContentSchema } from '@/lib/schemas/mitigation-schema'

const VALID_FIXTURE = {
  explainability: {
    summary: 'We analyzed this asset across three dimensions: intellectual property, brand safety, and provenance.',
    ip_methodology: 'Visual comparison against known protected works, trademark patterns, and celebrity recognition.',
    safety_methodology: 'Evaluation against platform policies, content appropriateness, and brand alignment standards.',
    provenance_methodology: 'C2PA credential verification and visual forensic analysis for authenticity signals.',
    score_explanation: 'Your composite score of 42/100 reflects moderate IP similarity and missing provenance credentials.',
  },
  executive_summary: {
    recommendation: 'monitor' as const,
    confidence: 72,
    rationale: 'Moderate IP similarity detected. Brand safety clear. Missing provenance credentials.',
    disclaimer: 'This system provides risk signals and operational decision support. It does not provide legal advice.',
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
    signal_strength: 'moderate',
    confidence: 68,
    observations: [
      {
        type: 'trademark_similarity',
        description: 'Logo bears resemblance to registered trademark',
        evidence_ref: 'FINDING-1',
        context: 'Visual similarity detected but licensing status cannot be determined by automated analysis.',
      },
    ],
    action_suggested: true,
  },
  safety_analysis: {
    signal_strength: 'none',
    confidence: 95,
    observations: [],
    action_suggested: false,
  },
  provenance_analysis: {
    signal_strength: 'significant',
    confidence: 90,
    observations: [
      {
        type: 'missing_c2pa',
        description: 'No C2PA content credentials found',
        evidence_ref: 'FINDING-2',
        context: 'Without C2PA credentials, the creation chain cannot be independently verified.',
      },
    ],
    action_suggested: true,
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
        rationale: 'Visual similarity may warrant trademark clearance under US law',
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
  recommendations: {
    actions: [
      {
        priority: 1,
        domain: 'ip',
        action: 'Consider conducting a trademark clearance search for the identified logo similarity',
        owner: 'Legal counsel',
        effort: '2-3 business days',
        impact: 'Confirms whether the visual similarity poses a trademark concern',
        verification: 'Written clearance opinion from IP attorney',
      },
      {
        priority: 2,
        domain: 'provenance',
        action: 'Add C2PA content credentials before publication to establish chain of custody',
        owner: 'Creative team',
        effort: '1 hour',
        impact: 'Establishes verifiable origin chain for content defensibility',
        verification: 'C2PA validation returns verified status',
      },
    ],
  },
  outlook: {
    summary: 'Low residual risk after trademark clearance and C2PA credential attachment',
    readiness: 'conditional' as const,
    conditions: ['Trademark clearance obtained', 'C2PA credentials attached'],
    next_steps: ['Re-scan after modifications', 'Annual trademark monitoring'],
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

  it('rejects report missing explainability', () => {
    const { explainability: _, ...incomplete } = VALID_FIXTURE
    const result = MitigationReportContentSchema.safeParse(incomplete)
    expect(result.success).toBe(false)
  })

  it('rejects invalid recommendation enum value', () => {
    const invalid = {
      ...VALID_FIXTURE,
      executive_summary: { ...VALID_FIXTURE.executive_summary, recommendation: 'maybe' },
    }
    const result = MitigationReportContentSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejects non-boolean action_suggested', () => {
    const invalid = {
      ...VALID_FIXTURE,
      ip_analysis: { ...VALID_FIXTURE.ip_analysis, action_suggested: 'pending' },
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

  it('rejects invalid readiness value', () => {
    const invalid = {
      ...VALID_FIXTURE,
      outlook: { ...VALID_FIXTURE.outlook, readiness: 'pending' },
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
      recommendations: { actions: [] },
      bias_analysis: { ...VALID_FIXTURE.bias_analysis, findings: [] },
      compliance_matrix: { jurisdictions: [], platforms: [] },
      guideline_mapping: { guideline_name: null, mappings: [] },
      outlook: { ...VALID_FIXTURE.outlook, conditions: [], next_steps: [] },
    }
    const result = MitigationReportContentSchema.safeParse(minimal)
    expect(result.success).toBe(true)
  })
})
