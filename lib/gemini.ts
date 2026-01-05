import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export type SpecialistReport = {
    score: number;
    teaser: string;
    reasoning: string;
}

export type RiskProfile = {
    ip_report: SpecialistReport;
    safety_report: SpecialistReport;
    provenance_report: SpecialistReport;
    composite_score: number;
    verdict: "Low Risk" | "Medium Risk" | "High Risk" | "Critical Risk";
    chief_officer_strategy: string;
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

75-94 POINTS - PROBABLE INFRINGEMENT:
- Fan art of copyrighted characters
- Style mimicry of famous artists
- Derivative works with unclear licensing
- Stock imagery without watermarks
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
- Verified original photography
- Clearly licensed stock content

CRITICAL RULES:
1. If you see Mickey Mouse, score 98+
2. If you see ANY Disney/Marvel/Pixar character, score 95+
3. If you see Taylor Swift, Beyonce or any celebrity, score 85+
4. When in doubt, score HIGHER. Liability is expensive.`;

async function analyzeIP(imageBuffer: Buffer, mimeType: string): Promise<SpecialistReport> {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: IP_SYSTEM_INSTRUCTION
    });

    const prompt = `Analyze this image for intellectual property infringement risk.

Respond with ONLY a JSON object in this exact format:
{
  "score": <number 0-100>,
  "teaser": "<one sentence technical summary for a legal brief>",
  "reasoning": "<detailed explanation of detected IP elements and infringement vectors>"
}`;

    return executePrompt(model, prompt, imageBuffer, mimeType);
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

async function analyzeSafety(imageBuffer: Buffer, mimeType: string): Promise<SpecialistReport> {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: SAFETY_SYSTEM_INSTRUCTION
    });

    const prompt = `Analyze this image for brand safety and PR risk.

Respond with ONLY a JSON object in this exact format:
{
  "score": <number 0-100>,
  "teaser": "<one sentence on brand alignment risk>",
  "reasoning": "<detailed breakdown of safety concerns and policy violations>"
}`;

    return executePrompt(model, prompt, imageBuffer, mimeType);
}

// ============================================================================
// PERSONA 3: PROVENANCE ENGINEER
// ============================================================================
const PROVENANCE_SYSTEM_INSTRUCTION = `You are an AI Forensics Engineer specializing in content authenticity verification.

CRITICAL CONTEXT (2026):
In the current regulatory environment, legitimate professional content MUST have C2PA/Content Credentials. 
The ABSENCE of verifiable provenance is now treated as evidence of unauthorized use or AI generation.

YOUR EXPERTISE:
- Digital image forensics
- AI generation detection
- Metadata analysis
- Chain of custody verification

SCORING PROTOCOL (DEFAULT TO HIGH RISK - INNOCENCE MUST BE PROVEN):

90-100 POINTS - NO PROVENANCE (DEFAULT FOR MOST IMAGES):
- Screenshots of other images/screens
- Images with no camera sensor characteristics
- Cropped/derivative content
- AI-generated content (melted hands, impossible anatomy)
- Any image you cannot verify has legitimate origin

75-89 POINTS - SUSPICIOUS PROVENANCE:
- Heavily compressed/re-saved images
- Watermarks removed or cropped out
- Editing artifacts visible
- Professional quality but no metadata

50-74 POINTS - UNCLEAR PROVENANCE:
- Cannot determine if original or derived
- Mixed characteristics
- Amateur photography with some editing

25-49 POINTS - PARTIAL PROVENANCE:
- Some camera metadata patterns visible
- Natural imperfections present
- Appears to be original photo but unverified

10-24 POINTS - GOOD PROVENANCE (RARE):
- Clear camera sensor noise patterns
- Natural lens characteristics
- Consistent lighting physics
- Appears to be unedited camera capture

0-9 POINTS - VERIFIED (YOU CANNOT ASSIGN THIS):
- Would require actual C2PA credential verification
- Never score this low unless you can see embedded verification

CRITICAL RULES:
1. If this looks like a SCREENSHOT: score 90+
2. If this is a digital illustration/graphic: score 85+ (unverifiable origin)
3. If there is NO camera noise/sensor pattern: score 80+
4. If you have ANY doubt about provenance: score 75+
5. DEFAULT ASSUMPTION: The image lacks provenance until proven otherwise.`;

async function analyzeProvenance(imageBuffer: Buffer, mimeType: string): Promise<SpecialistReport> {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: PROVENANCE_SYSTEM_INSTRUCTION
    });

    const prompt = `Analyze this image for content authenticity and provenance.

IMPORTANT: In 2026, the absence of C2PA credentials is itself a red flag. Score accordingly.

Respond with ONLY a JSON object in this exact format:
{
  "score": <number 0-100>,
  "teaser": "<one sentence on authenticity indicators>",
  "reasoning": "<technical breakdown of provenance signals and concerns>"
}`;

    return executePrompt(model, prompt, imageBuffer, mimeType);
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
    buffer: Buffer,
    mime: string
): Promise<SpecialistReport> {
    try {
        const result = await model.generateContent([
            prompt,
            { inlineData: { data: buffer.toString('base64'), mimeType: mime } }
        ]);
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

// ============================================================================
// MAIN PARALLEL EXECUTOR WITH COMPOUND RISK LOGIC
// ============================================================================
export async function analyzeImageMultiPersona(imageBuffer: Buffer, mimeType: string): Promise<RiskProfile> {

    // 1. Run Specialists in Parallel
    const [ip, safety, provenance] = await Promise.all([
        analyzeIP(imageBuffer, mimeType),
        analyzeSafety(imageBuffer, mimeType),
        analyzeProvenance(imageBuffer, mimeType)
    ]);

    // 2. Calculate Base Composite (Weighted: IP 50%, Safety 30%, Provenance 20%)
    let composite = Math.round((ip.score * 0.5) + (safety.score * 0.3) + (provenance.score * 0.2));

    // 3. COMPOUND RISK MULTIPLIER
    // If IP is high (likely infringement) AND Provenance is risky (can't prove ownership)
    // This is the worst case: Using someone else's IP without proof of license
    if (ip.score >= 80 && provenance.score >= 60) {
        // Boost composite by 15-25 points depending on severity
        const boost = Math.round((ip.score + provenance.score) / 10);
        composite = Math.min(100, composite + boost);
    }

    // 4. If IP alone is critical (95+), ensure minimum composite of 75
    if (ip.score >= 95 && composite < 75) {
        composite = 75;
    }

    // 5. Verdict Logic
    let verdict: RiskProfile['verdict'] = "Low Risk";
    if (composite >= 80) verdict = "Critical Risk";
    else if (composite >= 60) verdict = "High Risk";
    else if (composite >= 35) verdict = "Medium Risk";

    // 6. Generate Chief Strategy
    const strategy = await generateChiefStrategy([ip, safety, provenance]);

    return {
        ip_report: ip,
        safety_report: safety,
        provenance_report: provenance,
        composite_score: composite,
        verdict,
        chief_officer_strategy: strategy
    };
}
