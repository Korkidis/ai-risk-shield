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
        const riskProfile = await analyzeImageMultiPersona(buffer, file.type, file.name);

        return NextResponse.json(riskProfile);

    } catch (error: any) {
        console.error('Analysis Error:', error);

        // Handle Gemini 429/Quota limits explicitly if possible, or just pass message
        const message = error.message || 'Deep Analysis Failed';

        return NextResponse.json(
            { error: message, details: error.toString() },
            { status: 500 }
        );
    }
}
