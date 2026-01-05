import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Run Forensic Analysis
        const { analyzeImageMultiPersona } = await import('@/lib/gemini');
        const riskProfile = await analyzeImageMultiPersona(buffer, file.type);

        return NextResponse.json(riskProfile);

    } catch (error) {
        console.error('Analysis Error:', error)
        return NextResponse.json({ error: 'Deep Analysis Failed' }, { status: 500 })
    }
}
