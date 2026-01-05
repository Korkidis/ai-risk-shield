/**
 * Gemini AI Client
 *
 * Configured client for Google's Gemini AI
 * Used for image/video analysis:
 * - IP/copyright detection
 * - Brand safety analysis
 * - Content understanding
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

// Lazy initialization - only check at runtime, not build time
let genAI: GoogleGenerativeAI | null = null

function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required')
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return genAI
}

/**
 * Get Gemini model for vision tasks
 *
 * Using gemini-2.5-flash for fast, cost-effective image analysis
 * Supports images, videos, and multimodal prompts
 */
export function getVisionModel() {
  const client = getGeminiClient()
  return client.getGenerativeModel({
    model: 'gemini-2.5-flash',
  })
}

/**
 * Convert file to Gemini-compatible format
 */
export async function fileToGenerativePart(
  fileBuffer: Buffer,
  mimeType: string
): Promise<{ inlineData: { data: string; mimeType: string } }> {
  return {
    inlineData: {
      data: fileBuffer.toString('base64'),
      mimeType,
    },
  }
}

/**
 * Supported MIME types for Gemini vision
 */
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

export const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/mpeg',
  'video/mov',
  'video/avi',
  'video/x-flv',
  'video/mpg',
  'video/webm',
  'video/wmv',
  'video/3gpp',
]
