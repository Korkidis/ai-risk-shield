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

import { getVisionModel, fileToGenerativePart } from './gemini'

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
  mimeType: string
): Promise<IPAnalysisResult> {
  try {
    const model = getVisionModel()

    // Convert file to Gemini format
    const imagePart = await fileToGenerativePart(fileBuffer, mimeType)

    // Craft detailed prompt for IP detection
    const prompt = `Analyze this image for intellectual property (IP) that could pose copyright or trademark risks.

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

Respond in JSON format:
{
  "detections": [
    {
      "type": "character",
      "name": "Example Character",
      "confidence": 95,
      "description": "Clear depiction of...",
      "riskLevel": "high"
    }
  ],
  "summary": "Brief overall assessment of IP risks found"
}

If no IP is detected, return empty detections array.`

    const result = await model.generateContent([prompt, imagePart])
    const response = result.response.text()

    // Parse JSON response
    const parsed = parseJSONResponse(response)

    // Calculate overall risk
    const { overallRisk, riskScore } = calculateOverallRisk(parsed.detections || [])

    return {
      detections: parsed.detections || [],
      overallRisk,
      riskScore,
      summary: parsed.summary || 'No IP detected',
    }
  } catch (error) {
    console.error('IP detection error:', error)
    throw new Error('Failed to analyze IP: ' + (error as Error).message)
  }
}

/**
 * Parse JSON from Gemini response (handles markdown code blocks)
 */
function parseJSONResponse(text: string): any {
  try {
    // Try direct parse first
    return JSON.parse(text)
  } catch {
    // Try extracting from markdown code block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1])
    }

    // Try extracting any JSON object
    const objectMatch = text.match(/\{[\s\S]*\}/)
    if (objectMatch) {
      return JSON.parse(objectMatch[0])
    }

    throw new Error('Could not parse JSON from response')
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
