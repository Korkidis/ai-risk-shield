import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase/auth'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const EXTRACTION_SYSTEM_INSTRUCTION = `
You are a Brand Policy Analyst. Your job is to read brand guideline documents (PDFs or images) and extract structured rules for AI safety and compliance scanning.

Output ONLY a JSON object with the following structure:
{
  "name": "Extracted Brand Name or Campaign",
  "industry": "e.g. Fashion, Beverage, Tech",
  "prohibitions": ["List of strict 'No' rules"],
  "requirements": ["List of mandatory 'Must' rules"],
  "context_modifiers": ["Contextual exceptions, e.g. 'Swimwear is safe due to brand nature'"],
  "target_markets": ["e.g. US, EU"],
  "target_platforms": ["e.g. Instagram, LinkedIn"]
}

Guidelines for extraction:
1. Prohibitions: Focus on specific content bans (e.g., no competitors, no alcohol, no political symbols).
2. Requirements: Focus on brand assets (e.g., logo must be visible, diverse representation required).
3. Context: Look for brand-specific exceptions (e.g., if it's a beer brand, alcohol is allowed).
4. Keep rules concise and actionable for another AI to follow.
`

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const formData = await req.formData()
        const file = formData.get('file') as File
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const base64 = Buffer.from(bytes).toString('base64')

        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: EXTRACTION_SYSTEM_INSTRUCTION
        })

        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64,
                    mimeType: file.type
                }
            },
            "Analyze these brand guidelines and extract the rules into the specified JSON format."
        ])

        const response = await result.response
        const text = response.text()

        // Clean JSON from backticks if present
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim()

        let extractedData
        try {
            extractedData = JSON.parse(cleanedText)
        } catch {
            console.error('Gemini returned invalid JSON for guideline extraction')
            return NextResponse.json({ error: 'Failed to parse extracted guidelines. Please try again.' }, { status: 422 })
        }

        return NextResponse.json(extractedData)
    } catch (error) {
        console.error('Extraction failed:', error)
        return NextResponse.json({ error: 'Failed to extract guidelines' }, { status: 500 })
    }
}
