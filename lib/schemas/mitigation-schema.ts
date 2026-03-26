/**
 * Mitigation Report Schemas (v3.0)
 *
 * Zod runtime validation + Gemini SDK responseSchema for MitigationReportContent.
 * Advisory vocabulary — no "block", "required", "legal_rationale", or "exposures".
 *
 * Schema vocabulary directly influences LLM tone. Every field name here
 * becomes part of the language Gemini writes with.
 */

import { z } from 'zod'
import { SchemaType, type Schema } from '@google/generative-ai'

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const ObservationSchema = z.object({
  type: z.string(),
  description: z.string(),
  evidence_ref: z.string(),
  context: z.string(),
})

const MitigationDomainAnalysisSchema = z.object({
  signal_strength: z.string(),
  confidence: z.number(),
  observations: z.array(ObservationSchema),
  action_suggested: z.boolean(),
})

const ComplianceEntrySchema = z.object({
  name: z.string(),
  source: z.enum(['inferred', 'guideline', 'governance_db']),
  status: z.enum(['pass', 'review', 'fail', 'not_applicable']),
  rationale: z.string(),
})

export const MitigationReportContentSchema = z.object({
  explainability: z.object({
    summary: z.string(),
    ip_methodology: z.string(),
    safety_methodology: z.string(),
    provenance_methodology: z.string(),
    score_explanation: z.string(),
  }),
  executive_summary: z.object({
    recommendation: z.enum(['proceed', 'monitor', 'review', 'escalate']),
    confidence: z.number(),
    rationale: z.string(),
    disclaimer: z.string(),
  }),
  asset_context: z.object({
    filename: z.string(),
    type: z.string(),
    size: z.number(),
    declared_origin: z.string().nullable(),
    c2pa_chain_status: z.string(),
    creator_metadata: z.record(z.string(), z.unknown()).nullable(),
  }),
  ip_analysis: MitigationDomainAnalysisSchema,
  safety_analysis: MitigationDomainAnalysisSchema,
  provenance_analysis: MitigationDomainAnalysisSchema,
  bias_analysis: z.object({
    applicable: z.boolean(),
    severity: z.string().nullable(),
    confidence: z.number().nullable(),
    findings: z.array(z.object({
      type: z.string(),
      description: z.string(),
      evidence_ref: z.string(),
    })),
    not_applicable_reason: z.string().nullable(),
  }),
  guideline_mapping: z.object({
    guideline_name: z.string().nullable(),
    mappings: z.array(z.object({
      finding_ref: z.string(),
      guideline_item: z.string(),
      status: z.string(),
    })),
  }),
  compliance_matrix: z.object({
    jurisdictions: z.array(ComplianceEntrySchema),
    platforms: z.array(ComplianceEntrySchema),
  }),
  recommendations: z.object({
    actions: z.array(z.object({
      priority: z.number(),
      domain: z.string(),
      action: z.string(),
      owner: z.string(),
      effort: z.string(),
      impact: z.string(),
      verification: z.string(),
      alternatives: z.array(z.string()).optional(),
    })),
  }),
  outlook: z.object({
    summary: z.string(),
    readiness: z.enum(['ready', 'conditional', 'needs_attention']),
    conditions: z.array(z.string()),
    next_steps: z.array(z.string()),
  }),
})

// ─── Gemini SDK Schema ───────────────────────────────────────────────────────

const OBSERVATION_GEMINI: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    type: { type: SchemaType.STRING },
    description: { type: SchemaType.STRING },
    evidence_ref: { type: SchemaType.STRING },
    context: { type: SchemaType.STRING },
  },
  required: ['type', 'description', 'evidence_ref', 'context'],
}

const DOMAIN_ANALYSIS_GEMINI: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    signal_strength: { type: SchemaType.STRING },
    confidence: { type: SchemaType.NUMBER },
    observations: { type: SchemaType.ARRAY, items: OBSERVATION_GEMINI },
    action_suggested: { type: SchemaType.BOOLEAN },
  },
  required: ['signal_strength', 'confidence', 'observations', 'action_suggested'],
}

const COMPLIANCE_ENTRY_GEMINI: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    name: { type: SchemaType.STRING },
    source: { type: SchemaType.STRING, format: 'enum', enum: ['inferred', 'guideline', 'governance_db'] },
    status: { type: SchemaType.STRING, format: 'enum', enum: ['pass', 'review', 'fail', 'not_applicable'] },
    rationale: { type: SchemaType.STRING },
  },
  required: ['name', 'source', 'status', 'rationale'],
}

export const MITIGATION_REPORT_GEMINI_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    explainability: {
      type: SchemaType.OBJECT,
      properties: {
        summary: { type: SchemaType.STRING },
        ip_methodology: { type: SchemaType.STRING },
        safety_methodology: { type: SchemaType.STRING },
        provenance_methodology: { type: SchemaType.STRING },
        score_explanation: { type: SchemaType.STRING },
      },
      required: ['summary', 'ip_methodology', 'safety_methodology', 'provenance_methodology', 'score_explanation'],
    },
    executive_summary: {
      type: SchemaType.OBJECT,
      properties: {
        recommendation: { type: SchemaType.STRING, format: 'enum', enum: ['proceed', 'monitor', 'review', 'escalate'] },
        confidence: { type: SchemaType.NUMBER },
        rationale: { type: SchemaType.STRING },
        disclaimer: { type: SchemaType.STRING },
      },
      required: ['recommendation', 'confidence', 'rationale', 'disclaimer'],
    },
    asset_context: {
      type: SchemaType.OBJECT,
      properties: {
        filename: { type: SchemaType.STRING },
        type: { type: SchemaType.STRING },
        size: { type: SchemaType.NUMBER },
        declared_origin: { type: SchemaType.STRING, nullable: true },
        c2pa_chain_status: { type: SchemaType.STRING },
        creator_metadata: { type: SchemaType.OBJECT, properties: {}, nullable: true },
      },
      required: ['filename', 'type', 'size', 'c2pa_chain_status'],
    },
    ip_analysis: DOMAIN_ANALYSIS_GEMINI,
    safety_analysis: DOMAIN_ANALYSIS_GEMINI,
    provenance_analysis: DOMAIN_ANALYSIS_GEMINI,
    bias_analysis: {
      type: SchemaType.OBJECT,
      properties: {
        applicable: { type: SchemaType.BOOLEAN },
        severity: { type: SchemaType.STRING, nullable: true },
        confidence: { type: SchemaType.NUMBER, nullable: true },
        findings: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              type: { type: SchemaType.STRING },
              description: { type: SchemaType.STRING },
              evidence_ref: { type: SchemaType.STRING },
            },
            required: ['type', 'description', 'evidence_ref'],
          },
        },
        not_applicable_reason: { type: SchemaType.STRING, nullable: true },
      },
      required: ['applicable', 'findings'],
    },
    guideline_mapping: {
      type: SchemaType.OBJECT,
      properties: {
        guideline_name: { type: SchemaType.STRING, nullable: true },
        mappings: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              finding_ref: { type: SchemaType.STRING },
              guideline_item: { type: SchemaType.STRING },
              status: { type: SchemaType.STRING },
            },
            required: ['finding_ref', 'guideline_item', 'status'],
          },
        },
      },
      required: ['mappings'],
    },
    compliance_matrix: {
      type: SchemaType.OBJECT,
      properties: {
        jurisdictions: { type: SchemaType.ARRAY, items: COMPLIANCE_ENTRY_GEMINI },
        platforms: { type: SchemaType.ARRAY, items: COMPLIANCE_ENTRY_GEMINI },
      },
      required: ['jurisdictions', 'platforms'],
    },
    recommendations: {
      type: SchemaType.OBJECT,
      properties: {
        actions: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              priority: { type: SchemaType.NUMBER },
              domain: { type: SchemaType.STRING },
              action: { type: SchemaType.STRING },
              owner: { type: SchemaType.STRING },
              effort: { type: SchemaType.STRING },
              impact: { type: SchemaType.STRING },
              verification: { type: SchemaType.STRING },
              alternatives: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            },
            required: ['priority', 'domain', 'action', 'owner', 'effort', 'impact', 'verification'],
          },
        },
      },
      required: ['actions'],
    },
    outlook: {
      type: SchemaType.OBJECT,
      properties: {
        summary: { type: SchemaType.STRING },
        readiness: { type: SchemaType.STRING, format: 'enum', enum: ['ready', 'conditional', 'needs_attention'] },
        conditions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        next_steps: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      },
      required: ['summary', 'readiness', 'conditions', 'next_steps'],
    },
  },
  required: [
    'explainability', 'executive_summary', 'asset_context', 'ip_analysis', 'safety_analysis',
    'provenance_analysis', 'bias_analysis', 'guideline_mapping',
    'compliance_matrix', 'recommendations', 'outlook',
  ],
}
