import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import fs from 'fs';
import path from 'path';
import os from 'os';
import { verifyContentCredentials, C2PAReport } from './c2pa';
import { BrandGuideline } from '@/types/database';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);

export type SpecialistReport = {
    score: number;
    teaser: string;
    reasoning: string;
}

export type RiskProfile = {
    ip_report: SpecialistReport;
    safety_report: SpecialistReport;
    provenance_report: SpecialistReport;
    c2pa_report: C2PAReport; // NEW
    composite_score: number;
    verdict: "Low Risk" | "Medium Risk" | "High Risk" | "Critical Risk";
    chief_officer_strategy: string;
}

// ============================================================================
// FILE MANAGER HELPERS
// ============================================================================
// Helper to write buffer to temp file
function writeTempFile(buffer: Buffer, mimeType: string): string {
    const tempDir = os.tmpdir();
    // Sanitize extension
    const ext = mimeType.split('/')[1] || 'bin';
    const tempFilePath = path.join(tempDir, `upload-${Date.now()}.${ext}`);
    fs.writeFileSync(tempFilePath, buffer);
    return tempFilePath;
}

// Upload local file to Gemini
async function uploadToGemini(filePath: string, mimeType: string): Promise<string> {
    try {
        // 2. Upload to Gemini
        const uploadResponse = await fileManager.uploadFile(filePath, {
            mimeType,
            displayName: "Forensic Asset Analysis",
        });

        // 3. Poll for Active State (if video)
        let file = await fileManager.getFile(uploadResponse.file.name);
        while (file.state === FileState.PROCESSING) {
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s
            file = await fileManager.getFile(uploadResponse.file.name);
        }

        if (file.state === FileState.FAILED) {
            throw new Error("Video processing failed.");
        }

        return file.uri;

    } catch (e) {
        throw e;
    }
}

// ============================================================================
// PERSONA 1: IP SPECIALIST
// ============================================================================
const IP_SYSTEM_INSTRUCTION = `You are an Elite IP Forensics Specialist at a top-tier intellectual property law firm.

YOUR EXPERTISE:
- Copyright infringement detection
- Trademark violation analysis  
- Celebrity/likeness rights assessment
- Derivative work identification

SCORING PROTOCOL (BE AGGRESSIVE - FALSE NEGATIVES ARE WORSE THAN FALSE POSITIVES):

95-100 POINTS - DEFINITE INFRINGEMENT:
- Any Disney character (Mickey Mouse, Frozen, Marvel heroes, Pixar)
- Nintendo IP (Mario, Pokemon, Zelda)
- Major celebrity faces that are clearly recognizable
- Fortune 500 logos (Apple, Nike, McDonald's, etc.)
- Copyrighted artwork reproductions
- Famous movie scenes or clips

75-94 POINTS - PROBABLE INFRINGEMENT:
- Fan art of copyrighted characters
- Style mimicry of famous artists
- Derivative works with unclear licensing
- Stock imagery/footage without watermarks
- Brand-adjacent designs

50-74 POINTS - MODERATE RISK:
- Generic characters that could be confused with IP
- Unclear origin/ownership
- Amateur recreations of protected styles

25-49 POINTS - LOW RISK:
- Original-looking content
- Generic designs with no recognizable IP

0-24 POINTS - MINIMAL RISK:
- Abstract art, patterns
- Verified original photography/videography
- Clearly licensed stock content

CRITICAL RULES:
1. If you see Mickey Mouse, score 98+
2. If you see ANY Disney/Marvel/Pixar character, score 95+
3. If you see Taylor Swift, Beyonce, or ANY major celebrity: score 99+ (CRITICAL LIABILITY)
4. When in doubt, score HIGHER. Liability is expensive.`;

async function analyzeIP(part: any, guidelineRules?: string): Promise<SpecialistReport> {
    const instruction = IP_SYSTEM_INSTRUCTION + (guidelineRules ? `\n\nCUSTOM BRAND GUIDELINES (OVERRIDE GENERIC POLICIES):\n${guidelineRules}` : '');
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: instruction
    });

    const prompt = `Analyze this visual asset (image or video) for intellectual property infringement risk.

Respond with ONLY a JSON object in this exact format:
{
  "score": <number 0-100>,
  "teaser": "<one sentence technical summary for a legal brief>",
  "reasoning": "<detailed explanation of detected IP elements and infringement vectors>"
}`;

    return executePrompt(model, prompt, part);
}

// ============================================================================
// PERSONA 2: SAFETY ANALYST
// ============================================================================
const SAFETY_SYSTEM_INSTRUCTION = `You are a Senior Brand Safety Analyst for a global advertising agency.

YOUR EXPERTISE:
- Content moderation for Fortune 500 clients
- PR risk assessment
- Platform policy compliance (Meta, Google, TikTok)

SCORING PROTOCOL:

90-100 POINTS - IMMEDIATE PR DISASTER:
- Explicit nudity or sexual content
- Graphic violence or gore
- Hate symbols, extremist imagery
- Illegal content

70-89 POINTS - HIGH RISK:
- Suggestive/provocative imagery
- Weapons prominently featured
- Drug paraphernalia
- Controversial political content

40-69 POINTS - MODERATE RISK:
- Mild suggestiveness
- Alcohol, gambling references
- Polarizing themes
- Edgy humor that could offend

10-39 POINTS - LOW RISK:
- Neutral professional content
- Family-friendly imagery

0-9 POINTS - NO RISK:
- Corporate-safe, wholesome content
- Children's content (G-rated)

CRITICAL RULES:
1. Mickey Mouse and Disney characters are family-safe (low safety risk)
2. Cartoon violence is lower risk than realistic violence
3. Consider: "Would a Fortune 500 CMO be comfortable with this in an ad?"`;

async function analyzeSafety(part: any, guidelineRules?: string): Promise<SpecialistReport> {
    const instruction = SAFETY_SYSTEM_INSTRUCTION + (guidelineRules ? `\n\nCUSTOM BRAND GUIDELINES (OVERRIDE GENERIC POLICIES):\n${guidelineRules}` : '');
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: instruction
    });

    const prompt = `Analyze this visual asset (image or video) for brand safety and PR risk.

Respond with ONLY a JSON object in this exact format:
{
  "score": <number 0-100>,
  "teaser": "<one sentence on brand alignment risk>",
  "reasoning": "<detailed breakdown of safety concerns and policy violations>"
}`;

    return executePrompt(model, prompt, part);
}

// ============================================================================
// PERSONA 3: PROVENANCE ENGINEER
// ============================================================================
const PROVENANCE_SYSTEM_INSTRUCTION = `You are an AI Forensics Engineer specializing in content authenticity and provenance verification.

CORE PHILOSOPHY:
Provenance is the 'chain of custody' for an asset. 
1. C2PA (Content Credentials) is the cryptographic 'Gold Standard'. If verified, provenance is established.
2. Visual Forensics (your job) is the 'Detective Work'. You look for artifacts, AI noise, and metadata anomalies that suggest the provenance has been stripped, faked, or "washed" (e.g. screenshot of a licensed image).

SCORING PROTOCOL (INNOCENCE MUST BE PROVEN BY PROVENANCE):

0-24 POINTS - VERIFIED PROVENANCE (TARGET STATE):
- ONLY possible if C2PA status is 'verified'.
- If C2PA is verified, your score SHOULD be in this range unless you see blatant visual tampering/screenshot artifacts.

25-49 POINTS - PARTIAL PROVENANCE:
- Some camera/device metadata patterns visible.
- Appears to be original capture but lacks cryptographic verification.

50-74 POINTS - UNCLEAR PROVENANCE:
- Cannot determine if original or derived.
- Amateur capture with some editing.

75-89 POINTS - SUSPICIOUS PROVENANCE:
- Professional quality but NO C2PA/metadata (Red flag in 2026).
- Watermarks removed or cropped out.

90-100 POINTS - NO PROVENANCE / PROVENANCE WASHING:
- Screen recordings or screenshots (obvious provenance stripping).
- AI-generated content (physically impossible motion, artifacts).

CRITICAL RULES:
1. C2PA IS PROVENANCE. If C2PA Status is "verified", the risk is LOW (0-20).
2. If C2PA is "missing", the asset is "Unverified" and usually High Risk (75+).
3. If this is a digital illustration/graphic with no C2PA, score 85+ (unverifiable origin).`;

async function analyzeProvenance(part: any, filename: string = '', c2paStatus: string, guidelineRules?: string): Promise<SpecialistReport> {
    const instruction = PROVENANCE_SYSTEM_INSTRUCTION + (guidelineRules ? `\n\nCUSTOM BRAND GUIDELINES:\n${guidelineRules}` : '');
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: instruction
    });

    const prompt = `Analyze this visual asset (image or video) for content authenticity and provenance.
    
METADATA CONTEXT:
Filename: "${filename}"
C2PA/Content Credentials Status: "${c2paStatus}"

IMPORTANT RULES:
1. If C2PA Status is "verified", this is a strong positive signal. Lower the risk score significantly (0-20 range) unless the visual content is obviously tampered.
2. If the filename contains "screen", "rec", "capture", or "shot" (e.g. "Screen Recording 2024..."), AUTOMATICALLY SCORE THIS 95+ as it is likely a scrape without license.
3. In 2026, the absence of C2PA credentials is a red flag. Score accordingly.

Respond with ONLY a JSON object in this exact format:
{
  "score": <number 0-100>,
  "teaser": "<one sentence on authenticity indicators>",
  "reasoning": "<technical breakdown of provenance signals and concerns>"
}`;

    return executePrompt(model, prompt, part);
}

// ============================================================================
// CHIEF OFFICER (SYNTHESIS)
// ============================================================================
async function generateChiefStrategy(reports: SpecialistReport[]): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a Chief Forensic Risk Officer. Based on these findings, provide a 3-point strategic mitigation plan:

IP SPECIALIST REPORT:
- Score: ${reports[0].score}/100
- Finding: ${reports[0].teaser}

SAFETY ANALYST REPORT:
- Score: ${reports[1].score}/100
- Finding: ${reports[1].teaser}

PROVENANCE ENGINEER REPORT:
- Score: ${reports[2].score}/100
- Finding: ${reports[2].teaser}

Provide exactly 3 bullet points of actionable strategic recommendations to mitigate these risks.`;

    try {
        const result = await model.generateContent([prompt]);
        return result.response.text();
    } catch {
        return "Strategy generation unavailable.";
    }
}

// ============================================================================
// PROMPT EXECUTOR
// ============================================================================
async function executePrompt(
    model: ReturnType<typeof genAI.getGenerativeModel>,
    prompt: string,
    part: any
): Promise<SpecialistReport> {
    try {
        const result = await model.generateContent([prompt, part]);
        const text = result.response.text()
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
        return JSON.parse(text) as SpecialistReport;
    } catch (e) {
        console.error("Gemini Error", e);
        return {
            score: 75, // Default to risky, not safe
            teaser: "Analysis could not complete verification.",
            reasoning: "Unable to verify content - treating as unverified risk."
        };
    }
}

// Helper to format guideline rules
function formatGuidelineRules(g: BrandGuideline): string {
    return [
        g.prohibitions.length > 0 ? `PROHIBITIONS (STRICT NO):\n- ${g.prohibitions.join('\n- ')}` : '',
        g.requirements.length > 0 ? `REQUIREMENTS (MUST HAVE):\n- ${g.requirements.join('\n- ')}` : '',
        g.context_modifiers.length > 0 ? `CONTEXTUAL EXCEPTIONS (IMPORTANT):\n- ${g.context_modifiers.join('\n- ')}` : '',
        `TARGET MARKETS: ${g.target_markets.join(', ')}`,
        `TARGET PLATFORMS: ${g.target_platforms.join(', ')}`
    ].filter(Boolean).join('\n\n');
}

// ============================================================================
// MAIN PARALLEL EXECUTOR WITH COMPOUND RISK LOGIC
// ============================================================================
export async function analyzeImageMultiPersona(
    assetBuffer: Buffer,
    mimeType: string,
    filename: string = "unknown",
    guideline?: BrandGuideline
): Promise<RiskProfile> {

    let part;
    let geminiFileUri: string | null = null;
    let tempFilePath: string | null = null;
    let c2paReport: C2PAReport = { status: 'missing' };

    try {
        // 1. Write ALL assets to temp file for C2PA analysis
        tempFilePath = writeTempFile(assetBuffer, mimeType);

        // 2. Run C2PA Analysis concurrently with Gemini Upload
        const c2paPromise = verifyContentCredentials(tempFilePath);

        let geminiPartPromise;
        if (mimeType.startsWith('video/')) {
            // For Video: Upload via File API
            geminiPartPromise = uploadToGemini(tempFilePath, mimeType).then(uri => {
                geminiFileUri = uri;
                return {
                    fileData: {
                        mimeType: mimeType,
                        fileUri: geminiFileUri
                    }
                };
            });
        } else {
            // For Image: Use Inline Data (but we needed the temp file for C2PA anyway)
            geminiPartPromise = Promise.resolve({
                inlineData: {
                    data: assetBuffer.toString('base64'),
                    mimeType: mimeType
                }
            });
        }

        // Wait for pre-processing (C2PA + Gemini Upload)
        try {
            const [report, p] = await Promise.all([c2paPromise, geminiPartPromise]);
            c2paReport = report;
            part = p;
        } catch (e) {
            console.error("Preliminary Analysis Error (C2PA or Upload):", e);
            // If C2PA fails, we still have c2paReport = { status: 'missing' }
            // If Gemini Upload fails, we might not have 'part'
        }

        // 3. Run Forensic Specialists in Parallel
        let ip: SpecialistReport = { score: 75, teaser: "Engine Offline", reasoning: "Could not connect to forensic engine." };
        let safety: SpecialistReport = { score: 75, teaser: "Engine Offline", reasoning: "Could not connect to forensic engine." };
        let provenance: SpecialistReport = { score: 75, teaser: "Engine Offline", reasoning: "Could not connect to forensic engine." };

        if (part) {
            try {
                const guidelineRules = guideline ? formatGuidelineRules(guideline) : undefined;
                const results = await Promise.all([
                    analyzeIP(part, guidelineRules),
                    analyzeSafety(part, guidelineRules),
                    analyzeProvenance(part, filename, c2paReport.status, guidelineRules)
                ]);
                ip = results[0];
                safety = results[1];
                provenance = results[2];
            } catch (e) {
                console.error("Specialist Analysis Error:", e);
                // Keep default 75 scores
            }
        }

        // 4. Calculate Provenance Score based on C2PA Outcome (Legal Defensibility Weighting)
        const c2paScores = { valid: 0, missing: 80, invalid: 100, error: 50 };
        const c2paDerivedScore = c2paScores[c2paReport.status] || 80;

        // 5. Calculate Composite (IP 40%, Safety 40%, Provenance 20%)
        // This ensures C2PA validity has a direct 20% impact on the final 'ClearCheck' score
        let composite = Math.round((ip.score * 0.4) + (safety.score * 0.4) + (c2paDerivedScore * 0.2));

        // 6. COMPOUND RISK MULTIPLIER
        // If IP is high (likely infringement) AND Provenance is risky (can't prove ownership)
        if (ip.score >= 80 && c2paDerivedScore >= 60) {
            const boost = Math.round((ip.score + c2paDerivedScore) / 10);
            composite = Math.min(100, composite + boost);
        }

        // 7. CRITICAL OVERRIDE
        if (ip.score >= 90) {
            composite = Math.max(composite, 95);
        } else if (ip.score >= 80) {
            composite = Math.max(composite, 85);
        }

        // 8. Verdict Logic
        let verdict: RiskProfile['verdict'] = "Low Risk";
        if (composite >= 80) verdict = "Critical Risk";
        else if (composite >= 60) verdict = "High Risk";
        else if (composite >= 35) verdict = "Medium Risk";

        // 9. Generate Chief Strategy
        const strategy = await generateChiefStrategy([ip, safety, { score: c2paDerivedScore, teaser: '', reasoning: '' }]);

        return {
            ip_report: ip,
            safety_report: safety,
            provenance_report: {
                score: c2paDerivedScore,
                teaser: c2paReport.status === 'valid' ? "Cryptographically Verified" : "Provenance Gap Detected",
                reasoning: provenance.reasoning
            },
            c2pa_report: c2paReport,
            composite_score: composite,
            verdict,
            chief_officer_strategy: strategy
        };

    } catch (criticalError) {
        console.error("Critical Failure in Analysis Pipeline:", criticalError);
        // Absolute fallback
        return {
            ip_report: { score: 99, teaser: "PIPELINE CRITICAL FAILURE", reasoning: criticalError instanceof Error ? criticalError.message : String(criticalError) },
            safety_report: { score: 0, teaser: "N/A", reasoning: "" },
            provenance_report: { score: 0, teaser: "N/A", reasoning: "" },
            c2pa_report: c2paReport,
            composite_score: 99,
            verdict: "Critical Risk",
            chief_officer_strategy: "Emergency forensic failure. Check server logs."
        };
    } finally {
        // Cleanup Temp File
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }

        // Cleanup Gemini Cloud File
        if (geminiFileUri) {
            try {
                // fileUri is "https://generativeai.googleapis.com/v1beta/files/NAME"
                // fileManager expects just the name
                const name = (geminiFileUri as string).split('/').pop();
                if (name) await fileManager.deleteFile(name);
            } catch (e) {
                console.error("Cleanup Error", e);
            }
        }
    }
}
