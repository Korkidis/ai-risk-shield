/**
 * IP Analysis Schemas
 *
 * Zod runtime validation + Gemini SDK responseSchema for IP detection.
 * Used by lib/ai/ip-detection.ts (video frame analysis path).
 */

import { z } from 'zod'
import { SchemaType, type Schema } from '@google/generative-ai'

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

export const IPDetectionSchema = z.object({
  type: z.enum(['character', 'logo', 'celebrity', 'design']),
  name: z.string(),
  confidence: z.number().min(0).max(100),
  description: z.string(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
})

/** Raw Gemini response shape — before calculateOverallRisk */
export const IPGeminiResponseSchema = z.object({
  detections: z.array(IPDetectionSchema).default([]),
  summary: z.string().default('No IP detected'),
})

// ─── Gemini SDK Schema ───────────────────────────────────────────────────────

export const IP_GEMINI_RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    detections: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          type: { type: SchemaType.STRING, format: 'enum', enum: ['character', 'logo', 'celebrity', 'design'] },
          name: { type: SchemaType.STRING },
          confidence: { type: SchemaType.NUMBER },
          description: { type: SchemaType.STRING },
          riskLevel: { type: SchemaType.STRING, format: 'enum', enum: ['low', 'medium', 'high', 'critical'] },
        },
        required: ['type', 'name', 'confidence', 'description', 'riskLevel'],
      },
    },
    summary: { type: SchemaType.STRING },
  },
  required: ['detections', 'summary'],
}
