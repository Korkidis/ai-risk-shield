/**
 * IP Detection Service
 *
 * Uses Gemini AI to detect intellectual property in images/videos:
 * - Copyrighted characters (Mickey Mouse, Mario, etc.)
 * - Trademarked logos (Nike swoosh, Apple logo, etc.)
 * - Celebrity likenesses
 * - Protected designs
 *
 * Returns structured detection results with confidence scores
 */

import { getGeminiClient, fileToGenerativePart } from './gemini'
import { IPGeminiResponseSchema, IP_GEMINI_RESPONSE_SCHEMA } from '@/lib/schemas/ip-analysis-schema'

export type IPDetection = {
  type: 'character' | 'logo' | 'celebrity' | 'design'
  name: string
  confidence: number // 0-100
  description: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

export type IPAnalysisResult = {
  detections: IPDetection[]
  overallRisk: 'safe' | 'caution' | 'review' | 'high' | 'critical'
  riskScore: number // 0-100
  summary: string
}

/**
 * Analyze image/video for IP violations
 */
export async function analyzeIP(
  fileBuffer: Buffer,
  mimeType: string,
  guidelineRules?: string
): Promise<IPAnalysisResult> {
  try {
    const model = getGeminiClient().getGenerativeModel({
      model: 'gemini-2.5-flash',
      ...(guidelineRules ? {
        systemInstruction: `You are an IP detection specialist.\n\n════════════════════════════════════════════════════════════════════\nBRAND GUIDELINE OVERRIDE — THIS SUPERSEDES GENERIC SCORING\n════════════════════════════════════════════════════════════════════\n\n${guidelineRules}\n\nCRITICAL: Brand-specific rules ALWAYS take priority over generic industry defaults.\n════════════════════════════════════════════════════════════════════`,
      } : {}),
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: IP_GEMINI_RESPONSE_SCHEMA,
      },
    })

    // Convert file to Gemini format
    const imagePart = await fileToGenerativePart(fileBuffer, mimeType)

    // Craft detailed prompt for IP detection
    const basePrompt = `Analyze this image for intellectual property (IP) that could pose copyright or trademark risks.

Identify:
1. **Copyrighted Characters**: Fictional characters from movies, TV shows, games, comics (e.g., Mickey Mouse, Batman, Mario, Pikachu)
2. **Trademarked Logos**: Company logos, brand symbols (e.g., Nike swoosh, Apple logo, McDonald's golden arches)
3. **Celebrity Likenesses**: Recognizable faces of real people, actors, musicians, public figures
4. **Protected Designs**: Distinctive designs, patterns, or visual styles that are trademarked

For each detection, provide:
- Type: character, logo, celebrity, or design
- Name: What is it? (e.g., "Mickey Mouse", "Nike Swoosh", "Taylor Swift")
- Confidence: How confident are you? (0-100)
- Description: Brief description of what you see
- Risk Level: low, medium, high, or critical

If no IP is detected, return empty detections array with a summary.`

    const prompt = guidelineRules
      ? `${basePrompt}\n\nIMPORTANT: Apply the brand guidelines from system instructions. Content the brand explicitly approved MUST use riskLevel "low".`
      : basePrompt

    const result = await model.generateContent([prompt, imagePart])
    const response = result.response.text()

    // Parse and validate JSON response
    const jsonStr = response.replace(/\`\`\`json\n?/g, '').replace(/\`\`\`\n?/g, '').trim()
    const raw = JSON.parse(jsonStr)
    const validated = IPGeminiResponseSchema.safeParse(raw)

    if (!validated.success) {
      console.error('IP detection validation failed:', validated.error.issues)
      return { detections: [], overallRisk: 'review', riskScore: 75, summary: 'Analysis could not complete verification.' }
    }

    const parsed = validated.data

    // Calculate overall risk
    const { overallRisk, riskScore } = calculateOverallRisk(parsed.detections)

    return {
      detections: parsed.detections,
      overallRisk,
      riskScore: Math.max(0, Math.min(100, riskScore)),
      summary: parsed.summary,
    }
  } catch (error) {
    console.error('IP detection error:', error)
    throw new Error('Failed to analyze IP: ' + (error as Error).message)
  }
}

/**
 * Calculate overall risk level based on detections
 */
function calculateOverallRisk(detections: IPDetection[]): {
  overallRisk: 'safe' | 'caution' | 'review' | 'high' | 'critical'
  riskScore: number
} {
  if (detections.length === 0) {
    return { overallRisk: 'safe', riskScore: 0 }
  }

  // Calculate weighted risk score
  let totalRisk = 0
  let criticalCount = 0
  let highCount = 0

  detections.forEach((detection) => {
    const weight = detection.confidence / 100

    switch (detection.riskLevel) {
      case 'critical':
        totalRisk += 100 * weight
        criticalCount++
        break
      case 'high':
        totalRisk += 75 * weight
        highCount++
        break
      case 'medium':
        totalRisk += 50 * weight
        break
      case 'low':
        totalRisk += 25 * weight
        break
    }
  })

  const riskScore = Math.min(100, Math.round(totalRisk / detections.length))

  // Determine overall risk level
  let overallRisk: 'safe' | 'caution' | 'review' | 'high' | 'critical'

  if (criticalCount > 0) {
    overallRisk = 'critical'
  } else if (highCount > 0 || riskScore >= 75) {
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
