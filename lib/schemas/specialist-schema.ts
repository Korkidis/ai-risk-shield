/**
 * Specialist Report Schema
 *
 * Zod runtime validation + Gemini SDK responseSchema for SpecialistReport.
 * Used by all 3 analysis personas (IP, Safety, Provenance) in lib/gemini.ts.
 */

import { z } from 'zod'
import { SchemaType, type Schema } from '@google/generative-ai'

// ─── Zod Schema ──────────────────────────────────────────────────────────────

export const SpecialistReportSchema = z.object({
  score: z.number().min(0).max(100),
  teaser: z.string().min(1),
  reasoning: z.string().min(1),
  confidence: z.enum(['high', 'medium', 'low']).optional(),
})

// ─── Chief Strategy Schema ──────────────────────────────────────────────────

export const ChiefStrategySchema = z.object({
  points: z.array(z.string()).min(1).max(5),
  overall_confidence: z.enum(['high', 'medium', 'low']),
})

export type ChiefStrategy = z.infer<typeof ChiefStrategySchema>

// ─── Gemini SDK Schemas ─────────────────────────────────────────────────────

export const SPECIALIST_REPORT_GEMINI_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    score: { type: SchemaType.NUMBER, description: 'Risk score from 0 (no risk) to 100 (critical risk)' },
    teaser: { type: SchemaType.STRING, description: 'One-sentence summary of the finding' },
    reasoning: { type: SchemaType.STRING, description: 'Detailed explanation of the assessment' },
    confidence: { type: SchemaType.STRING, format: 'enum', enum: ['high', 'medium', 'low'], description: 'Confidence in the assessment: high (clear match), medium (probable), low (ambiguous/unclear)' },
  },
  required: ['score', 'teaser', 'reasoning', 'confidence'],
}

export const CHIEF_STRATEGY_GEMINI_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    points: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Strategic mitigation points (1-5 actionable recommendations)',
    },
    overall_confidence: {
      type: SchemaType.STRING,
      format: 'enum',
      enum: ['high', 'medium', 'low'],
      description: 'Overall confidence in the risk assessment',
    },
  },
  required: ['points', 'overall_confidence'],
}
