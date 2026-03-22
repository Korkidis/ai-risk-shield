/**
 * Brand Safety Analysis Service
 *
 * Uses Gemini AI to detect brand safety violations:
 * - Adult content (nudity, sexual content)
 * - Violence (graphic violence, weapons, blood)
 * - Hate symbols (swastikas, hate group symbols)
 * - Drugs/alcohol (illegal drugs, excessive alcohol)
 * - Profanity (visible text with profanity)
 * - Controversial content (political, religious extremism)
 *
 * Returns structured violation results aligned with major platform policies
 */

import { getGeminiClient, fileToGenerativePart } from './gemini'
import { BrandSafetyGeminiResponseSchema, BRAND_SAFETY_GEMINI_RESPONSE_SCHEMA } from '@/lib/schemas/brand-safety-schema'

export type BrandSafetyCategory =
  | 'adult_content'
  | 'violence'
  | 'hate_symbols'
  | 'drugs_alcohol'
  | 'profanity'
  | 'controversial'

export type BrandSafetyViolation = {
  category: BrandSafetyCategory
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number // 0-100
  description: string
}

export type BrandSafetyResult = {
  violations: BrandSafetyViolation[]
  overallRisk: 'safe' | 'caution' | 'review' | 'high' | 'critical'
  riskScore: number // 0-100
  summary: string
  platformCompliance: {
    facebook: boolean
    instagram: boolean
    youtube: boolean
    tiktok: boolean
  }
}

/**
 * Analyze image/video for brand safety violations
 */
export async function analyzeBrandSafety(
  fileBuffer: Buffer,
  mimeType: string,
  guidelineRules?: string
): Promise<BrandSafetyResult> {
  try {
    const model = getGeminiClient().getGenerativeModel({
      model: 'gemini-2.5-flash',
      ...(guidelineRules ? {
        systemInstruction: `You are a brand safety analyst.\n\n════════════════════════════════════════════════════════════════════\nBRAND GUIDELINE OVERRIDE — THIS SUPERSEDES GENERIC SCORING\n════════════════════════════════════════════════════════════════════\n\nThe client has provided explicit brand guidelines. When a guideline says something is approved, you MUST NOT flag it as a violation.\n\n${guidelineRules}\n\nCRITICAL: Brand-specific rules ALWAYS take priority over generic industry defaults.\n════════════════════════════════════════════════════════════════════`,
      } : {}),
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: BRAND_SAFETY_GEMINI_RESPONSE_SCHEMA,
      },
    })

    // Convert file to Gemini format
    const imagePart = await fileToGenerativePart(fileBuffer, mimeType)

    // Craft detailed prompt for brand safety
    const basePrompt = `Analyze this image for brand safety violations that would violate major social media platform policies (Facebook, Instagram, YouTube, TikTok).

Check for:
1. **Adult Content**: Nudity, sexual content, suggestive poses
2. **Violence**: Graphic violence, weapons, blood, gore, disturbing imagery
3. **Hate Symbols**: Swastikas, hate group symbols, discriminatory imagery
4. **Drugs/Alcohol**: Illegal drugs, drug paraphernalia, excessive alcohol use
5. **Profanity**: Visible text with profanity or offensive language
6. **Controversial**: Political extremism, religious extremism, conspiracy theories

For each violation found, provide:
- Category: adult_content, violence, hate_symbols, drugs_alcohol, profanity, or controversial
- Severity: low, medium, high, or critical
- Confidence: How confident are you? (0-100)
- Description: What specifically did you see?

If the image is brand-safe, return empty violations array with a summary.`

    const prompt = guidelineRules
      ? `${basePrompt}\n\nIMPORTANT: Apply the brand guidelines from system instructions. Content the brand explicitly approved MUST NOT be flagged as a violation.`
      : basePrompt

    const result = await model.generateContent([prompt, imagePart])
    const response = result.response.text()

    // Parse and validate JSON response
    const jsonStr = response.replace(/\`\`\`json\n?/g, '').replace(/\`\`\`\n?/g, '').trim()
    const raw = JSON.parse(jsonStr)
    const validated = BrandSafetyGeminiResponseSchema.safeParse(raw)

    if (!validated.success) {
      console.error('Brand safety validation failed:', validated.error.issues)
      return {
        violations: [], overallRisk: 'review', riskScore: 75,
        summary: 'Analysis could not complete verification.',
        platformCompliance: { facebook: false, instagram: false, youtube: false, tiktok: false },
      }
    }

    const parsed = validated.data

    // Calculate overall risk
    const { overallRisk, riskScore } = calculateOverallRisk(parsed.violations)

    // Determine platform compliance
    const platformCompliance = determinePlatformCompliance(parsed.violations)

    return {
      violations: parsed.violations,
      overallRisk,
      riskScore: Math.max(0, Math.min(100, riskScore)),
      summary: parsed.summary,
      platformCompliance,
    }
  } catch (error) {
    console.error('Brand safety analysis error:', error)
    throw new Error('Failed to analyze brand safety: ' + (error as Error).message)
  }
}

/**
 * Calculate overall risk level based on violations
 */
function calculateOverallRisk(violations: BrandSafetyViolation[]): {
  overallRisk: 'safe' | 'caution' | 'review' | 'high' | 'critical'
  riskScore: number
} {
  if (violations.length === 0) {
    return { overallRisk: 'safe', riskScore: 0 }
  }

  // Calculate weighted risk score
  let totalRisk = 0

  violations.forEach((violation) => {
    const weight = violation.confidence / 100

    switch (violation.severity) {
      case 'critical':
        totalRisk += 100 * weight
        break
      case 'high':
        totalRisk += 75 * weight
        break
      case 'medium':
        totalRisk += 50 * weight
        break
      case 'low':
        totalRisk += 25 * weight
        break
    }
  })

  const riskScore = Math.min(100, Math.round(totalRisk / violations.length))

  // Determine overall risk level
  let overallRisk: 'safe' | 'caution' | 'review' | 'high' | 'critical'

  const hasCritical = violations.some((v) => v.severity === 'critical')
  const hasHigh = violations.some((v) => v.severity === 'high')

  if (hasCritical) {
    overallRisk = 'critical'
  } else if (hasHigh || riskScore >= 75) {
    overallRisk = 'high'
  } else if (riskScore >= 50) {
    overallRisk = 'review'
  } else if (riskScore >= 25) {
    overallRisk = 'caution'
  } else {
    overallRisk = 'safe'
  }

  return { overallRisk, riskScore }
}

/**
 * Determine platform compliance based on violations
 */
function determinePlatformCompliance(violations: BrandSafetyViolation[]): {
  facebook: boolean
  instagram: boolean
  youtube: boolean
  tiktok: boolean
} {
  // If no violations, compliant with all platforms
  if (violations.length === 0) {
    return {
      facebook: true,
      instagram: true,
      youtube: true,
      tiktok: true,
    }
  }

  // Check for high-severity violations in specific categories
  const hasCriticalViolation = violations.some((v) => v.severity === 'critical')
  const hasAdultContent = violations.some((v) => v.category === 'adult_content')
  const hasViolence = violations.some((v) => v.category === 'violence' && v.severity !== 'low')
  const hasHateSymbols = violations.some((v) => v.category === 'hate_symbols')

  // Platform-specific rules (simplified)
  return {
    facebook: !hasCriticalViolation && !hasHateSymbols,
    instagram: !hasCriticalViolation && !hasAdultContent && !hasHateSymbols,
    youtube: !hasCriticalViolation && !hasHateSymbols,
    tiktok: !hasCriticalViolation && !hasAdultContent && !hasViolence,
  }
}
