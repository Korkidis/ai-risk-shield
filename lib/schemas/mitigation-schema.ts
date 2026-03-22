/**
 * Mitigation Report Schemas
 *
 * Zod runtime validation + Gemini SDK responseSchema for MitigationReportContent.
 * Derived from types/database.ts MitigationReportContent interface.
 */

import { z } from 'zod'
import { SchemaType, type Schema } from '@google/generative-ai'

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const ExposureSchema = z.object({
  type: z.string(),
  description: z.string(),
  evidence_ref: z.string(),
  legal_rationale: z.string(),
})

const MitigationDomainAnalysisSchema = z.object({
  severity: z.string(),
  confidence: z.number(),
  exposures: z.array(ExposureSchema),
  remediation_status: z.enum(['required', 'not_required']),
})

const ComplianceEntrySchema = z.object({
  name: z.string(),
  source: z.enum(['inferred', 'guideline']),
  status: z.enum(['pass', 'review', 'fail', 'not_applicable']),
  rationale: z.string(),
})

export const MitigationReportContentSchema = z.object({
  executive_summary: z.object({
    decision: z.enum(['clear', 'watch', 'hold', 'block']),
    confidence: z.number(),
    approver_level: z.string(),
    rationale: z.string(),
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
  mitigation_plan: z.object({
    actions: z.array(z.object({
      priority: z.number(),
      domain: z.string(),
      action: z.string(),
      owner: z.string(),
      effort: z.string(),
      risk_reduction: z.string(),
      verification: z.string(),
    })),
  }),
  residual_risk: z.object({
    remaining_risk: z.string(),
    publish_decision: z.enum(['approved', 'conditional', 'blocked']),
    conditions: z.array(z.string()),
    maintenance_checks: z.array(z.string()),
  }),
})

// ─── Gemini SDK Schema ───────────────────────────────────────────────────────

const EXPOSURE_GEMINI: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    type: { type: SchemaType.STRING },
    description: { type: SchemaType.STRING },
    evidence_ref: { type: SchemaType.STRING },
    legal_rationale: { type: SchemaType.STRING },
  },
  required: ['type', 'description', 'evidence_ref', 'legal_rationale'],
}

const DOMAIN_ANALYSIS_GEMINI: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    severity: { type: SchemaType.STRING },
    confidence: { type: SchemaType.NUMBER },
    exposures: { type: SchemaType.ARRAY, items: EXPOSURE_GEMINI },
    remediation_status: { type: SchemaType.STRING, format: 'enum', enum: ['required', 'not_required'] },
  },
  required: ['severity', 'confidence', 'exposures', 'remediation_status'],
}

const COMPLIANCE_ENTRY_GEMINI: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    name: { type: SchemaType.STRING },
    source: { type: SchemaType.STRING, format: 'enum', enum: ['inferred', 'guideline'] },
    status: { type: SchemaType.STRING, format: 'enum', enum: ['pass', 'review', 'fail', 'not_applicable'] },
    rationale: { type: SchemaType.STRING },
  },
  required: ['name', 'source', 'status', 'rationale'],
}

export const MITIGATION_REPORT_GEMINI_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    executive_summary: {
      type: SchemaType.OBJECT,
      properties: {
        decision: { type: SchemaType.STRING, format: 'enum', enum: ['clear', 'watch', 'hold', 'block'] },
        confidence: { type: SchemaType.NUMBER },
        approver_level: { type: SchemaType.STRING },
        rationale: { type: SchemaType.STRING },
      },
      required: ['decision', 'confidence', 'approver_level', 'rationale'],
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
    mitigation_plan: {
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
              risk_reduction: { type: SchemaType.STRING },
              verification: { type: SchemaType.STRING },
            },
            required: ['priority', 'domain', 'action', 'owner', 'effort', 'risk_reduction', 'verification'],
          },
        },
      },
      required: ['actions'],
    },
    residual_risk: {
      type: SchemaType.OBJECT,
      properties: {
        remaining_risk: { type: SchemaType.STRING },
        publish_decision: { type: SchemaType.STRING, format: 'enum', enum: ['approved', 'conditional', 'blocked'] },
        conditions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        maintenance_checks: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      },
      required: ['remaining_risk', 'publish_decision', 'conditions', 'maintenance_checks'],
    },
  },
  required: [
    'executive_summary', 'asset_context', 'ip_analysis', 'safety_analysis',
    'provenance_analysis', 'bias_analysis', 'guideline_mapping',
    'compliance_matrix', 'mitigation_plan', 'residual_risk',
  ],
}
