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
})

// ─── Gemini SDK Schema ───────────────────────────────────────────────────────

export const SPECIALIST_REPORT_GEMINI_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    score: { type: SchemaType.NUMBER, description: 'Risk score from 0 (no risk) to 100 (critical risk)' },
    teaser: { type: SchemaType.STRING, description: 'One-sentence summary of the finding' },
    reasoning: { type: SchemaType.STRING, description: 'Detailed explanation of the assessment' },
  },
  required: ['score', 'teaser', 'reasoning'],
}
