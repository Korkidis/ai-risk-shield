/**
 * Brand Safety Schemas
 *
 * Zod runtime validation + Gemini SDK responseSchema for brand safety analysis.
 * Used by lib/ai/brand-safety.ts (video frame analysis path).
 */

import { z } from 'zod'
import { SchemaType, type Schema } from '@google/generative-ai'

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

export const BrandSafetyViolationSchema = z.object({
  category: z.enum(['adult_content', 'violence', 'hate_symbols', 'drugs_alcohol', 'profanity', 'controversial']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  confidence: z.number().min(0).max(100),
  description: z.string(),
})

/** Raw Gemini response shape — before calculateOverallRisk */
export const BrandSafetyGeminiResponseSchema = z.object({
  violations: z.array(BrandSafetyViolationSchema).default([]),
  summary: z.string().default('No violations detected'),
})

// ─── Gemini SDK Schema ───────────────────────────────────────────────────────

export const BRAND_SAFETY_GEMINI_RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    violations: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          category: {
            type: SchemaType.STRING,
            format: 'enum',
            enum: ['adult_content', 'violence', 'hate_symbols', 'drugs_alcohol', 'profanity', 'controversial'],
          },
          severity: { type: SchemaType.STRING, format: 'enum', enum: ['low', 'medium', 'high', 'critical'] },
          confidence: { type: SchemaType.NUMBER },
          description: { type: SchemaType.STRING },
        },
        required: ['category', 'severity', 'confidence', 'description'],
      },
    },
    summary: { type: SchemaType.STRING },
  },
  required: ['violations', 'summary'],
}
