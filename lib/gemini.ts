import { GoogleGenerativeAI, type GenerativeModel, type Part } from '@google/generative-ai'
import { SpecialistReportSchema, SPECIALIST_REPORT_GEMINI_SCHEMA, ChiefStrategySchema, CHIEF_STRATEGY_GEMINI_SCHEMA } from './schemas/specialist-schema'
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import fs from 'fs';
import path from 'path';
import os from 'os';
import { verifyContentCredentials } from './c2pa';
import { BrandGuideline } from '@/types/database';

// Import and re-export types from separate types file
import type { SpecialistReport, RiskProfile } from './gemini-types';
import type { C2PAReport } from './c2pa-types';
import { computeCompositeScore, computeProvenanceScore, computeVerdict, type C2PAStatus } from './risk/scoring';
export type { SpecialistReport, RiskProfile };

// Lazy initialization — avoid build-time failures when env vars aren't set
let _genAI: GoogleGenerativeAI | null = null;
let _fileManager: GoogleAIFileManager | null = null;

function getGenAI(): GoogleGenerativeAI {
    if (!_genAI) {
        if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is required');
        _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return _genAI;
}

function getFileManager(): GoogleAIFileManager {
    if (!_fileManager) {
        if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is required');
        _fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
    }
    return _fileManager;
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
        const uploadResponse = await getFileManager().uploadFile(filePath, {
            mimeType,
            displayName: "Forensic Asset Analysis",
        });

        // 3. Poll for Active State (if video)
        let file = await getFileManager().getFile(uploadResponse.file.name);
        while (file.state === FileState.PROCESSING) {
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s
            file = await getFileManager().getFile(uploadResponse.file.name);
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
const IP_SYSTEM_INSTRUCTION = `You are an IP Risk Analyst.

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
4. When in doubt, score HIGHER. Liability is expensive.

CONFIDENCE RATING:
- high: Clear, recognizable match to known IP (e.g., unmistakable character, logo, or celebrity)
- medium: Probable match but some ambiguity (e.g., similar style, partial visibility, fan art)
- low: Unclear or uncertain — could be coincidental similarity`;

async function analyzeIP(part: Part, guidelineRules?: string): Promise<SpecialistReport> {
    const instruction = IP_SYSTEM_INSTRUCTION + (guidelineRules ? `

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
BRAND GUIDELINE OVERRIDE \u2014 THIS SUPERSEDES ALL SCORING ABOVE
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

The client has provided explicit brand guidelines. These guidelines OVERRIDE
the generic scoring tiers above. When a guideline says something is approved,
you MUST score it 0-9 regardless of what the generic tiers say.

${guidelineRules}

CRITICAL: Brand-specific rules ALWAYS take priority over generic industry defaults.
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550` : '');
    const model = getGenAI().getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: instruction,
        generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: SPECIALIST_REPORT_GEMINI_SCHEMA,
        },
    });

    const prompt = guidelineRules
        ? `Analyze this visual asset for IP infringement risk FOR THIS SPECIFIC CLIENT.

IMPORTANT: This client has provided explicit brand guidelines (see system instructions).
You MUST apply those brand guideline overrides to your scoring. Content that the brand
has explicitly approved MUST score 0-9 regardless of generic IP defaults.

Respond with ONLY a JSON object in this exact format:
{
  "score": <number 0-100>,
  "teaser": "<one sentence technical summary, considering client guidelines>",
  "reasoning": "<explain how brand guidelines affected your scoring>",
  "confidence": "<high|medium|low>"
}`
        : `Analyze this visual asset (image or video) for intellectual property infringement risk.

Respond with ONLY a JSON object in this exact format:
{
  "score": <number 0-100>,
  "teaser": "<one sentence technical summary for a legal brief>",
  "reasoning": "<detailed explanation of detected IP elements and infringement vectors>",
  "confidence": "<high|medium|low>"
}`;

    return executePrompt(model, prompt, part);
}

// ============================================================================
// PERSONA 2: SAFETY ANALYST
// ============================================================================
const SAFETY_SYSTEM_INSTRUCTION = `You are a Brand Safety Analyst.

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

40-69 POINTS - MODERATE RISK (defaults — may be overridden by brand guidelines):
- Mild suggestiveness
- Alcohol, gambling references (default score — brand guidelines may override to 0-9)
- Polarizing themes
- Edgy humor that could offend

10-39 POINTS - LOW RISK:
- Neutral professional content
- Family-friendly imagery

0-9 POINTS - NO RISK:
- Corporate-safe, wholesome content
- Children's content (G-rated)

CRITICAL RULES:
1. Cartoon violence is lower risk than realistic violence
2. Consider: "Would a Fortune 500 CMO be comfortable with this in an ad?"
3. Score based on actual content safety (violence, nudity, hate, etc.) — not on character identity or IP ownership

CONFIDENCE RATING:
- high: Clear, unambiguous safety issue (e.g., explicit nudity, graphic violence, hate symbols)
- medium: Probable issue but context-dependent (e.g., suggestive imagery, edgy humor)
- low: Ambiguous — could be interpreted as safe or unsafe depending on audience`;

async function analyzeSafety(part: Part, guidelineRules?: string): Promise<SpecialistReport> {
    const instruction = SAFETY_SYSTEM_INSTRUCTION + (guidelineRules ? `

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
BRAND GUIDELINE OVERRIDE \u2014 THIS SUPERSEDES ALL SCORING ABOVE
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

The client has provided explicit brand guidelines. These guidelines OVERRIDE
the generic scoring tiers above. When a guideline says something is approved,
you MUST score it 0-9 regardless of what the generic tiers say.

${guidelineRules}

CRITICAL: If the generic scoring says "Alcohol = 40-69" but the brand guideline
says "Alcohol is approved", the brand guideline WINS. Score alcohol content 0-9.
Brand-specific rules ALWAYS take priority over generic industry defaults.
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550` : '');
    const model = getGenAI().getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: instruction,
        generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: SPECIALIST_REPORT_GEMINI_SCHEMA,
        },
    });

    const prompt = guidelineRules
        ? `Analyze this visual asset for brand safety risk FOR THIS SPECIFIC CLIENT.

IMPORTANT: This client has provided explicit brand guidelines (see system instructions).
You MUST apply those brand guideline overrides to your scoring. Content that the brand
has explicitly approved MUST score 0-9 regardless of generic industry defaults.
Do NOT score for "the general market" — score for THIS brand's specific policies.

Respond with ONLY a JSON object in this exact format:
{
  "score": <number 0-100>,
  "teaser": "<one sentence on brand alignment risk, considering client guidelines>",
  "reasoning": "<explain how brand guidelines affected your scoring>",
  "confidence": "<high|medium|low>"
}`
        : `Analyze this visual asset (image or video) for brand safety and PR risk.

Respond with ONLY a JSON object in this exact format:
{
  "score": <number 0-100>,
  "teaser": "<one sentence on brand alignment risk>",
  "reasoning": "<detailed breakdown of safety concerns and policy violations>",
  "confidence": "<high|medium|low>"
}`;

    return executePrompt(model, prompt, part);
}

// ============================================================================
// PERSONA 3: PROVENANCE ENGINEER
// ============================================================================
const PROVENANCE_SYSTEM_INSTRUCTION = `You are a Provenance Analyst specializing in visual forensics and content authenticity.

YOUR ROLE:
Identify visual forensic signals that supplement the C2PA cryptographic determination. The system handles C2PA scoring separately — your job is to analyze what you can observe about the image itself.

WHAT TO LOOK FOR:
- AI generation artifacts (physically impossible geometry, texture anomalies, prompt-leaked text)
- Screenshot indicators (UI chrome, notification bars, cursor artifacts, compression banding)
- Editing traces (clone stamp patterns, inconsistent lighting, splicing boundaries)
- Metadata anomalies visible in the image (watermark remnants, cropped attribution)
- Quality signals (professional studio lighting vs phone capture vs AI render)

SCORING PROTOCOL:

0-24 POINTS - VERIFIED / CONSISTENT:
- Visual signals consistent with authentic capture. No forensic red flags.
- If C2PA is verified AND visuals are consistent, score in this range.

25-49 POINTS - PARTIAL SIGNALS:
- Some authentic capture signals (natural noise, lens distortion) but no cryptographic proof.
- Appears original but unverifiable.

50-74 POINTS - UNCLEAR ORIGIN:
- Cannot determine if original, derived, or AI-generated.
- Mixed signals — some authentic, some suspicious.

75-89 POINTS - SUSPICIOUS:
- Professional quality with no provenance signals.
- Indicators of provenance stripping (watermark removal, metadata scrubbing).

90-100 POINTS - FORENSIC RED FLAGS:
- Clear AI generation artifacts.
- Obvious screenshot/screen recording of another source.
- Evidence of provenance washing.

CRITICAL RULES:
1. The system derives the authoritative provenance score from C2PA status. Your score provides supplementary forensic context.
2. Focus on what you OBSERVE in the visual content, not on restating C2PA facts.
3. If you see no forensic red flags, say so clearly — do not inflate the score.

CONFIDENCE RATING:
- high: Clear forensic signals (e.g., obvious AI artifacts, unmistakable screenshot chrome)
- medium: Probable signals but not definitive (e.g., suspicious quality patterns, possible editing)
- low: Ambiguous — visual signals inconclusive`;

async function analyzeProvenance(part: Part, filename: string = '', c2paStatus: string, guidelineRules?: string): Promise<SpecialistReport> {
    const instruction = PROVENANCE_SYSTEM_INSTRUCTION + (guidelineRules ? `\n\nCUSTOM BRAND GUIDELINES:\n${guidelineRules}` : '');
    const model = getGenAI().getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: instruction,
        generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: SPECIALIST_REPORT_GEMINI_SCHEMA,
        },
    });

    const prompt = `Analyze this visual asset for content authenticity using visual forensics.

CONTEXT (for concordance analysis only — do not simply restate these):
- Filename: "${filename}"
- C2PA Status: "${c2paStatus}"

YOUR TASK:
1. Examine the visual content for AI generation artifacts, screenshot indicators, editing traces, and quality signals.
2. Report what you observe about the image itself — focus on forensic evidence, not metadata facts.
3. Note whether your visual observations are concordant or discordant with the C2PA status.

Respond with ONLY a JSON object in this exact format:
{
  "score": <number 0-100>,
  "teaser": "<one sentence on visual forensic observations>",
  "reasoning": "<technical breakdown of visual forensic signals — what you see, not what C2PA says>",
  "confidence": "<high|medium|low>"
}`;

    return executePrompt(model, prompt, part);
}

// ============================================================================
// CHIEF OFFICER (SYNTHESIS)
// ============================================================================
async function generateChiefStrategy(reports: SpecialistReport[]): Promise<import('./gemini-types').ChiefStrategy> {
    const model = getGenAI().getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
            responseSchema: CHIEF_STRATEGY_GEMINI_SCHEMA,
        },
    });

    const prompt = `You are a Content Strategy Advisor summarizing scan findings into clear, actionable guidance for creative teams.

IP ANALYSIS:
- Risk Score: ${reports[0].score}/100 (0=no concerns, 100=critical)
- Finding: ${reports[0].teaser}

SAFETY ANALYSIS:
- Risk Score: ${reports[1].score}/100 (0=no concerns, 100=critical)
- Finding: ${reports[1].teaser}

PROVENANCE ANALYSIS:
- Risk Score: ${reports[2].score}/100 (0=strongest provenance, 100=no provenance)
- Finding: ${reports[2].teaser}

Based on these results, provide 1-5 clear, constructive recommendations. If scores are low, focus on best practices to maintain content quality. If scores are high, explain what was found and suggest practical next steps. Use plain language — no jargon. Rate your overall confidence (high/medium/low).`;

    try {
        const result = await model.generateContent([prompt]);
        const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(text);
        const validated = ChiefStrategySchema.safeParse(parsed);
        if (!validated.success) {
            console.error('Chief strategy validation failed:', validated.error.issues);
            return { points: ['Risk assessment requires manual review.'], overall_confidence: 'low' };
        }
        return validated.data;
    } catch {
        return { points: ['Strategy generation unavailable. Manual review recommended.'], overall_confidence: 'low' };
    }
}

// ============================================================================
// PROMPT EXECUTOR
// ============================================================================
async function executePrompt(
    model: GenerativeModel,
    prompt: string,
    part: Part
): Promise<SpecialistReport> {
    try {
        const result = await model.generateContent([prompt, part]);
        const text = result.response.text()
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
        const parsed = JSON.parse(text);

        // Runtime validation — SDK responseSchema handles structure, Zod enforces ranges
        const validated = SpecialistReportSchema.safeParse(parsed);
        if (!validated.success) {
            console.error('Specialist report validation failed:', validated.error.issues);
            // Fall through to catch block default (score 75)
            throw new Error('Validation failed');
        }

        // Clamp score to 0-100 (defense in depth — Zod also enforces this)
        return {
            ...validated.data,
            score: Math.max(0, Math.min(100, validated.data.score)),
        };
    } catch (e) {
        console.error("Gemini Error", e);
        return {
            score: 75, // Default to risky, not safe
            teaser: "Analysis could not complete verification.",
            reasoning: "Unable to verify content - treating as unverified risk."
        };
    }
}

// Helper to format guideline rules with explicit scoring directives
export function formatGuidelineRules(g: BrandGuideline): string {
    const sections: string[] = []

    // Always include brand identity — strongest contextual signal for Gemini.
    // Without this, if all rule arrays are empty, the function returns "" (falsy)
    // and the entire override system is bypassed.
    sections.push(
        `BRAND: ${g.name}` +
        (g.industry ? `\nINDUSTRY: ${g.industry}` : '') +
        `\nScore all content that is normal and expected for this brand and industry as 0-9 (NO RISK).`
    )

    // Scoring overrides — the key piece that tells Gemini HOW to adjust scores
    if (g.context_modifiers && g.context_modifiers.length > 0) {
        sections.push(
            `SCORING ADJUSTMENTS — These items are APPROVED by the brand and MUST score 0-9 (NO RISK):\n` +
            g.context_modifiers.map(m => `  \u2022 ${m} \u2192 Score 0-9. This is explicitly brand-approved content.`).join('\n')
        )
    }

    if (g.prohibitions && g.prohibitions.length > 0) {
        sections.push(
            `BRAND PROHIBITIONS — These items are BANNED and MUST score 90-100 (CRITICAL RISK):\n` +
            g.prohibitions.map(p => `  \u2022 ${p} \u2192 Score 90-100. Brand explicitly prohibits this.`).join('\n')
        )
    }

    if (g.requirements && g.requirements.length > 0) {
        sections.push(
            `BRAND POLICY STATEMENTS — Interpret and apply these to your scoring:\n` +
            g.requirements.map(r =>
                `  \u2022 "${r}" \u2192 If this states content is acceptable/approved/OK, score that content 0-9. If this is a requirement that should be present, increase score by +20 when absent.`
            ).join('\n')
        )
    }

    if (g.target_markets && g.target_markets.length > 0) {
        sections.push(`TARGET MARKETS: ${g.target_markets.join(', ')}`)
    }
    if (g.target_platforms && g.target_platforms.length > 0) {
        sections.push(`TARGET PLATFORMS: ${g.target_platforms.join(', ')}`)
    }

    return sections.join('\n\n')
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

        // 4. Calculate Provenance Score based on C2PA Outcome (canonical scoring module)
        const c2paDerivedScore = computeProvenanceScore(c2paReport.status as C2PAStatus);

        // 5-8. Composite Score (Firefly Rule + weights + multiplier + critical override)
        // All logic is now in the canonical scoring module
        const composite = computeCompositeScore({
            ipScore: ip.score,
            safetyScore: safety.score,
            c2paStatus: c2paReport.status as C2PAStatus,
        });

        // Apply C2PA Trust Override side-effects on IP reasoning
        if (c2paReport.status === 'valid') {
            ip.score = Math.min(ip.score, 10);
            ip.reasoning = `[C2PA TRUSTED] Content has valid cryptographic credentials. IP Risk suppressed. Original reasoning: ${ip.reasoning}`;
        }

        // 9. Verdict Logic (canonical thresholds)
        const verdict = computeVerdict(composite);

        // 10. Generate Chief Strategy
        const strategy = await generateChiefStrategy([ip, safety, { score: c2paDerivedScore, teaser: '', reasoning: '' }]);

        let c2paTeaser = "Provenance Gap Detected";
        if (c2paReport.status === 'valid') c2paTeaser = "Cryptographically Verified";
        if (c2paReport.status === 'caution') c2paTeaser = "Verified (Non-Standard)";

        return {
            ip_report: ip,
            safety_report: safety,
            provenance_report: {
                score: c2paDerivedScore,
                teaser: c2paTeaser,
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
            chief_officer_strategy: { points: ['Emergency forensic failure. Check server logs.'], overall_confidence: 'low' as const }
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
                if (name) await getFileManager().deleteFile(name);
            } catch (e) {
                console.error("Cleanup Error", e);
            }
        }
    }
}
