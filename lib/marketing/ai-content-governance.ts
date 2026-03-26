export type GovernanceGuideSlug =
    | 'assessing-ai-content-risk'
    | 'indemnity-controls'
    | 'content-credentials'
    | 'human-review-workflows'
    | 'brand-policy-controls'
    | 'mitigation-layers'

export interface RiskWatchItem {
    title: string
    date: string
    category: 'settlement' | 'litigation' | 'standard' | 'market'
    status: string
    summary: string
    sourceLabel: string
    sourceUrl: string
}

export interface GovernanceGuideSection {
    heading: string
    body: string
    bullets?: string[]
}

export interface GovernanceFAQ {
    question: string
    answer: string
}

export interface GovernanceSource {
    label: string
    url: string
}

export interface GovernanceGuide {
    slug: GovernanceGuideSlug
    title: string
    description: string
    audience: string
    intent: string
    updatedAt: string
    publishedAt: string
    primaryQuestion: string
    shortAnswer: string
    keywords: string[]
    sourceLinks: GovernanceSource[]
    sections: GovernanceGuideSection[]
    faq: GovernanceFAQ[]
}

export const riskIndexSnapshot = {
    asOf: '2026-03-21',
    knownSettlementTotalUsd: 1_500_000_000,
    trackedCaseCountLabel: '80+',
    trackedCaseCountContext:
        'AI and copyright cases filed, based on Copyright Alliance reporting published on March 4, 2026.',
    recentFilingsLabel: '3',
    recentFilingsContext:
        'Runway-related suits filed on February 18, February 23, and February 27, 2026.',
    standardsAdoptionLabel: '6,000+',
    standardsAdoptionContext:
        'Verified production deployments of Content Credentials actively securing the enterprise supply chain.',
    sourceCount: 6,
    methodology:
        'We track verified financial exposure, active federal litigation, and structural ecosystem shifts. No fear-mongering. Just the hard data your GC needs to justify locking down the content pipeline.',
}

export const riskWatchItems: RiskWatchItem[] = [
    {
        title: 'Anthropic authors settlement',
        date: '2025-09-05',
        category: 'settlement',
        status: 'proposed',
        summary:
            'A brutal wake-up call for the market. Anthropic’s proposed $1.5B settlement with authors establishes a staggering nine-figure financial anchor for AI copyright exposure. The risk is no longer hypothetical.',
        sourceLabel: 'Reuters via Investing.com',
        sourceUrl:
            'https://www.investing.com/news/stock-market-news/anthropic-agrees-to-pay-15-billion-to-settle-author-class-action-4227408',
    },
    {
        title: 'Runway synthetic media filing burst',
        date: '2026-02-27',
        category: 'litigation',
        status: 'active',
        summary:
            'Synthetic media litigation is compounding rapidly. The Copyright Alliance’s tracking of new Runway-related complaints proves that visual AI generation is a highly volatile, actively targeted legal vector.',
        sourceLabel: 'Copyright Alliance',
        sourceUrl:
            'https://copyrightalliance.org/copyright-stories-february-2026/',
    },
    {
        title: 'AI copyright case volume crossed 80+',
        date: '2026-03-04',
        category: 'market',
        status: 'tracked',
        summary:
            'The sheer volume of active litigation is now a definitive governance signal. With over 80 major cases filed, enterprise leadership can no longer afford a "wait and see" approach to AI asset provenance.',
        sourceLabel: 'Copyright Alliance',
        sourceUrl:
            'https://copyrightalliance.org/copyright-stories-february-2026/',
    },
    {
        title: 'Content Credentials 2.3 launched',
        date: '2026-02-09',
        category: 'standard',
        status: 'released',
        summary:
            'The gold standard for asset provenance is officially live. The massive ecosystem adoption of C2PA 2.3 renders "we didn’t know how to track it" an indefensible excuse in court.',
        sourceLabel: 'C2PA',
        sourceUrl:
            'https://c2pa.org/the-c2pa-launches-content-credentials-2-3-and-celebrates-5-years-of-impact-across-the-digital-ecosystem/',
    },
]

export const policySignals: RiskWatchItem[] = [
    {
        title: 'US National AI Policy Framework',
        date: '2026-03-19',
        category: 'standard',
        status: 'enacted',
        summary:
            'The US administration published a national framework for AI model training and deployment. This is a foundational policy moment that establishes guardrails for how AI systems are built and used. Enterprise teams should expect downstream compliance requirements to crystallize around this framework.',
        sourceLabel: 'White House',
        sourceUrl:
            'https://www.whitehouse.gov/ostp/ai-bill-of-rights/',
    },
    {
        title: 'EU AI Act: 50 enforcement rules go live',
        date: '2026-03-15',
        category: 'standard',
        status: 'active',
        summary:
            'The European Union\'s AI Act enforcement framework is now operational, with 50 rules governing how AI systems must be documented, tested, and deployed in regulated markets. For any enterprise publishing AI-generated content into EU markets, compliance is no longer optional.',
        sourceLabel: 'European Commission',
        sourceUrl:
            'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai',
    },
]

export const governanceOperatingModel = [
    {
        label: 'Rules first',
        detail: 'Brand, claims, IP, and usage rules still decide what may ship.',
    },
    {
        label: 'Human checkpoints',
        detail: 'Review thresholds route only ambiguous assets to legal or brand leads.',
    },
    {
        label: 'Provenance evidence',
        detail: 'Content Credentials shorten approvals and disputes by preserving origin signals.',
    },
    {
        label: 'Indemnity last',
        detail: 'Contract coverage matters, but it starts after something already went wrong.',
    },
]

export const governanceGuides: GovernanceGuide[] = [
    {
        slug: 'assessing-ai-content-risk',
        title: 'Assessing AI Content Risk',
        description:
            'Start with the fundamentals. See why existing brand, IP, and review controls still apply to AI content, and why structured assessment matters when synthetic media scales.',
        audience: 'Legal, compliance, brand leaders, marketing ops',
        intent: 'Risk assessment foundations',
        publishedAt: '2026-03-15',
        updatedAt: '2026-03-21',
        primaryQuestion: 'Do existing content governance frameworks still apply to AI-generated assets?',
        shortAnswer:
            'Yes. The fundamentals of brand compliance, IP clearance, and claims review have not changed. What has changed is the volume and speed at which AI-generated content enters the pipeline. That scale demands a structured, repeatable methodology.',
        keywords: [
            'ai content risk assessment',
            'enterprise content governance',
            'synthetic media risk',
            'ai content compliance',
        ],
        sourceLinks: [
            {
                label: 'Copyright Alliance AI court case coverage',
                url: 'https://copyrightalliance.org/copyright-stories-february-2026/',
            },
            {
                label: 'C2PA 2.3 ecosystem update',
                url: 'https://c2pa.org/the-c2pa-launches-content-credentials-2-3-and-celebrates-5-years-of-impact-across-the-digital-ecosystem/',
            },
        ],
        sections: [
            {
                heading: 'Content governance is not new',
                body:
                    'Every enterprise already has some version of content governance. Brand guidelines define what can and cannot be said. Legal reviews check claims. Rights clearance verifies licensing. These controls exist because publishing the wrong thing has always carried risk. AI does not change that.',
            },
            {
                heading: 'What changes with synthetic media',
                body:
                    'The difference is scale and speed. AI tools let teams create hundreds of assets in the time it used to take to produce one. Manual review cannot keep pace. Without a structured methodology, teams either bottleneck production or publish unchecked work.',
            },
            {
                heading: 'Why you need a structured methodology',
                body:
                    'A methodology gives every asset a consistent, repeatable evaluation before it ships. It removes guesswork, creates audit trails, and lets your team move fast without skipping the controls that keep you out of trouble. The methodology itself should be grounded in the same governance frameworks your organization already trusts.',
                bullets: [
                    'Apply the same rigor to AI-generated assets that you apply to everything else.',
                    'Build audit trails that hold up under scrutiny from legal, clients, and regulators.',
                    'Scale your review process without scaling your headcount.',
                ],
            },
            {
                heading: 'What a structured assessment gives you',
                body:
                    'A clear signal on every asset before publication. Your legal team can focus on judgment calls instead of screening. Your marketing team can move faster because the guardrails are built into the process. And when a client, regulator, or opposing counsel asks how you verified an asset, you have the documentation ready.',
            },
        ],
        faq: [
            {
                question: 'Does this mean AI content is inherently risky?',
                answer:
                    'No. It means AI content enters the pipeline at a volume and speed that existing manual processes cannot handle. The risk is not the content itself. The risk is publishing without adequate review.',
            },
            {
                question: 'What governance frameworks apply to AI content?',
                answer:
                    'The same ones that apply to all content: brand guidelines, claims policies, IP and licensing rules, provenance verification, and human review thresholds. AI changes the tooling, not the principles.',
            },
            {
                question: 'Where does a scoring methodology fit in?',
                answer:
                    'It sits at the front of your review pipeline. A structured scoring methodology evaluates every asset against your policies before it reaches human reviewers, so your team spends time on decisions, not screening.',
            },
        ],
    },
    {
        slug: 'indemnity-controls',
        title: 'AI Indemnity And Enterprise Controls',
        description:
            'Stop relying solely on vendor "promises." Learn where generic indemnity stops and why your internal controls are the only thing standing between your brand and a lawsuit.',
        audience: 'Legal, procurement, vendor management, marketing leadership',
        intent: 'Contract review and control design',
        publishedAt: '2026-03-15',
        updatedAt: '2026-03-15',
        primaryQuestion: 'Is AI indemnity enough to make generated content safe for enterprise use?',
        shortAnswer:
            'No. Indemnity is the backstop after an issue reaches claims, litigation, or settlement. Governance happens upstream in tool terms, provenance, brand rules, human review, and documented due diligence.',
        keywords: [
            'ai indemnity enterprise',
            'is ai indemnity enough',
            'ai contract guardrails',
            'enterprise ai governance controls',
        ],
        sourceLinks: [
            {
                label: 'Microsoft Copilot copyright commitment',
                url: 'https://blogs.microsoft.com/on-the-issues/2023/09/07/copilot-copyright-commitment-ai-legal-concerns/',
            },
            {
                label: 'Adobe Firefly for enterprise',
                url: 'https://www.adobe.com/products/firefly/enterprise.html',
            },
            {
                label: 'Copyright Alliance litigation update',
                url: 'https://copyrightalliance.org/copyright-stories-february-2026/',
            },
        ],
        sections: [
            {
                heading: 'Indemnity is downstream protection',
                body:
                    'Insurance and contractual indemnity matter because they shift cost after a dispute begins. That makes them financially important, but operationally late.',
            },
            {
                heading: 'The real control stack lives upstream',
                body:
                    'Teams reduce exposure before publish with model terms compliance, content review thresholds, provenance checks, and rules that keep risky assets from entering campaigns in the first place.',
                bullets: [
                    'Use only approved tools and approved license terms.',
                    'Record provenance or explain why it is missing.',
                    'Escalate high-risk assets before publication.',
                ],
            },
            {
                heading: 'Vendor promises already assume customer controls',
                body:
                    'Large vendors market copyright commitments, but those protections are usually conditioned on using required guardrails, filters, or approved workflows. That reinforces the same point: controls are not optional.',
            },
            {
                heading: 'How enterprise teams should read contracts',
                body:
                    'Treat indemnity language as one multiplier in a larger decision. Strong contract language helps, but it cannot rescue weak policies, bad prompts, missing provenance, or absent sign-off records.',
            },
        ],
        faq: [
            {
                question: 'Should procurement treat indemnity as the primary buying criterion?',
                answer:
                    'No. It is an important criterion, but it should sit beside workflow controls, provenance support, acceptable-use terms, and the evidence you can preserve before publish.',
            },
            {
                question: 'What is the minimum viable control stack?',
                answer:
                    'Approved tools, written usage policy, brand and IP rules, review thresholds, and an evidence trail for how the asset was created and approved.',
            },
            {
                question: 'Why does this matter to marketing leaders?',
                answer:
                    'Because the actual delay and reputation damage usually happen before indemnity pays anything. Good controls preserve campaign speed and defensibility.',
            },
        ],
    },
    {
        slug: 'content-credentials',
        title: 'Content Credentials For Enterprise Teams',
        description:
            'The definitive playbook for integrating C2PA Content Credentials. Build an unbreakable chain of evidence that silences audits, satisfies clients, and kills disputes before they start.',
        audience: 'Brand ops, legal ops, creative operations, compliance',
        intent: 'Provenance and evidence',
        publishedAt: '2026-03-15',
        updatedAt: '2026-03-15',
        primaryQuestion: 'What do Content Credentials actually do for enterprise marketing teams?',
        shortAnswer:
            'They preserve origin and edit signals in a machine-readable format. That does not eliminate IP risk, but it gives reviewers stronger evidence for approval, audit, vendor oversight, and dispute response.',
        keywords: [
            'c2pa enterprise',
            'content credentials workflow',
            'provenance for marketing teams',
            'enterprise content credentials',
        ],
        sourceLinks: [
            {
                label: 'C2PA 2.3 ecosystem announcement',
                url: 'https://c2pa.org/the-c2pa-launches-content-credentials-2-3-and-celebrates-5-years-of-impact-across-the-digital-ecosystem/',
            },
            {
                label: 'Adobe Firefly for enterprise',
                url: 'https://www.adobe.com/products/firefly/enterprise.html',
            },
        ],
        sections: [
            {
                heading: 'What provenance solves',
                body:
                    'Most content teams are not trying to prove cryptography for its own sake. They are trying to answer practical questions from legal, clients, and procurement about where an asset came from and what changed.',
            },
            {
                heading: 'What provenance does not solve',
                body:
                    'A valid provenance trail does not make an asset automatically safe. Teams still need policy checks, brand review, IP screening, and human approval for ambiguous work.',
            },
            {
                heading: 'Where Content Credentials pay off fastest',
                body:
                    'The first wins usually show up in faster legal review, cleaner agency handoffs, and shorter dispute response cycles because evidence already exists when someone asks for it.',
                bullets: [
                    'Client approval and agency review',
                    'Vendor deliverable verification',
                    'Regulatory and audit documentation',
                ],
            },
            {
                heading: 'How to operationalize it',
                body:
                    'Treat provenance as one input in the approval stack. If credentials are present, validate them. If they are missing, route the asset according to policy instead of pretending the absence means safety.',
            },
        ],
        faq: [
            {
                question: 'Does every asset need Content Credentials?',
                answer:
                    'Not always, but every enterprise team should decide when they are required, preferred, or optional instead of leaving the answer undefined.',
            },
            {
                question: 'What if an asset has no credentials?',
                answer:
                    'That should trigger policy logic, not panic. Some teams escalate, some add documentation, and some block publish until a stronger origin record exists.',
            },
            {
                question: 'Why is this relevant in 2026?',
                answer:
                    'Because C2PA has moved beyond theory into active ecosystem deployment, which makes provenance-based workflows realistic for mainstream enterprise review.',
            },
        ],
    },
    {
        slug: 'human-review-workflows',
        title: 'Human Review Workflows For AI Content',
        description:
            'Halt the bottleneck without sacrificing security. Design ruthless, automated review thresholds that instantly escalate toxic assets while letting safe content flow at scale.',
        audience: 'Marketing ops, creative ops, legal ops, compliance',
        intent: 'Approval workflow design',
        publishedAt: '2026-03-15',
        updatedAt: '2026-03-15',
        primaryQuestion: 'What does human-in-the-loop AI content governance look like when teams need speed?',
        shortAnswer:
            'It looks like routing, not blanket slowdown. Low-risk work moves quickly, ambiguous work escalates, and high-risk work stops. The human layer exists to decide edge cases and preserve accountability.',
        keywords: [
            'human in the loop ai marketing',
            'ai approval workflow',
            'legal review workflow ai content',
            'creative review thresholds',
        ],
        sourceLinks: [
            {
                label: 'Copyright Alliance litigation update',
                url: 'https://copyrightalliance.org/copyright-stories-february-2026/',
            },
            {
                label: 'Microsoft Copilot copyright commitment',
                url: 'https://blogs.microsoft.com/on-the-issues/2023/09/07/copilot-copyright-commitment-ai-legal-concerns/',
            },
        ],
        sections: [
            {
                heading: 'Why blanket review fails',
                body:
                    'If every asset goes to legal, AI programs stall. If nothing goes to legal, governance becomes fiction. Threshold routing is the operational middle ground that keeps both speed and control.',
            },
            {
                heading: 'Design review lanes by risk',
                body:
                    'Use explicit thresholds so teams know what auto-clears, what needs brand review, and what must escalate to legal or compliance.',
                bullets: [
                    'Low-risk assets can self-clear with evidence attached.',
                    'Medium-risk assets go to brand or marketing ops.',
                    'High-risk assets trigger legal review or publish block.',
                ],
            },
            {
                heading: 'Preserve the decision trail',
                body:
                    'The value of human review is not only the decision. It is the fact that the decision, rationale, and supporting evidence can be shown later if a client, regulator, or opposing counsel asks.',
            },
            {
                heading: 'Keep the workflow teachable',
                body:
                    'The best review systems are boringly clear. People should know who decides, what evidence is required, and what happens when provenance or policy inputs are missing.',
            },
        ],
        faq: [
            {
                question: 'Does human review mean every asset gets a lawyer?',
                answer:
                    'No. Most teams only need legal review for assets that cross a defined risk threshold or fail a control requirement.',
            },
            {
                question: 'Who should own the workflow?',
                answer:
                    'Usually marketing ops or brand ops owns the process, with legal defining escalation criteria and approving the high-risk lane.',
            },
            {
                question: 'Why is this good for creatives?',
                answer:
                    'Because a clear workflow removes arbitrary blocks. Creatives know what will pass, what needs edits, and what needs escalation before launch week.',
            },
        ],
    },
    {
        slug: 'brand-policy-controls',
        title: 'Brand Policy Controls For AI Content',
        description:
            'Turn your static brand guidelines into an automated legal shield. Transform abstract policies into enforceable, day-to-day deployment controls that protect your IP.',
        audience: 'Brand leads, legal, marketing operations, compliance',
        intent: 'Policy and rule enforcement',
        publishedAt: '2026-03-15',
        updatedAt: '2026-03-15',
        primaryQuestion: 'What is the most practical place to start AI content governance?',
        shortAnswer:
            'Start with the rules content teams already understand. Brand guidelines, claims policies, licensed-asset restrictions, and review thresholds are the foundation. AI changes the volume and speed, not the need for rules.',
        keywords: [
            'brand guidelines ai policy',
            'ai content governance rules',
            'ai marketing policy controls',
            'enterprise brand policy ai',
        ],
        sourceLinks: [
            {
                label: 'Adobe Firefly for enterprise',
                url: 'https://www.adobe.com/products/firefly/enterprise.html',
            },
            {
                label: 'Microsoft Copilot copyright commitment',
                url: 'https://blogs.microsoft.com/on-the-issues/2023/09/07/copilot-copyright-commitment-ai-legal-concerns/',
            },
        ],
        sections: [
            {
                heading: 'Governance starts with familiar controls',
                body:
                    'Content teams already manage approval, brand fit, usage rights, and claims risk. AI governance becomes easier when it is framed as an extension of those existing controls instead of a totally new legal regime.',
            },
            {
                heading: 'Translate policy into decisions',
                body:
                    'The critical move is turning broad guidance into enforceable thresholds and routing logic. Teams need to know what is blocked, what is allowed, and when extra documentation is required.',
                bullets: [
                    'Define prohibited references, brands, and claims.',
                    'Define provenance expectations by campaign type.',
                    'Define when legal sign-off is mandatory.',
                ],
            },
            {
                heading: 'Make policy usable by non-lawyers',
                body:
                    'Most failures happen because rules are too abstract. Policy controls work best when they are written in operational language that marketers, designers, and reviewers can apply quickly.',
            },
            {
                heading: 'Tie policy to evidence',
                body:
                    'A strong policy program says not only what the rule is, but what evidence satisfies it. That is where provenance, scan results, and review records become part of the same system.',
            },
        ],
        faq: [
            {
                question: 'Is AI governance mostly a legal problem?',
                answer:
                    'It is partly legal, but the day-to-day enforcement burden usually sits with marketing ops, brand, and review workflows.',
            },
            {
                question: 'Why not start with a long policy memo?',
                answer:
                    'Because teams need operational rules more than abstract principles. The first version should help people decide what to publish, escalate, or reject.',
            },
            {
                question: 'How does this relate to human review?',
                answer:
                    'Policy defines the thresholds, and human review applies them when automated or self-serve decisions are not enough.',
            },
        ],
    },
    {
        slug: 'mitigation-layers',
        title: 'AI Mitigation Layers',
        description:
            'Architect an impenetrable defense. Discover the exact sequence of technical, human, and legal layers necessary to completely derisk your AI content pipeline from generation to deployment.',
        audience: 'Marketing ops, legal, procurement, risk and compliance',
        intent: 'Mitigation strategy and control stack',
        publishedAt: '2026-03-15',
        updatedAt: '2026-03-15',
        primaryQuestion: 'What mitigation layers should sit behind enterprise AI content use?',
        shortAnswer:
            'Treat mitigation as a stack, not a single promise. The strongest programs combine approved vendors, policy rules, provenance checks, review thresholds, documentation, and only then contractual backstops like indemnity or insurance.',
        keywords: [
            'ai risk mitigation',
            'enterprise ai control stack',
            'ai content mitigation layers',
            'ai governance framework',
        ],
        sourceLinks: [
            {
                label: 'Microsoft Copilot copyright commitment',
                url: 'https://blogs.microsoft.com/on-the-issues/2023/09/07/copilot-copyright-commitment-ai-legal-concerns/',
            },
            {
                label: 'Adobe Firefly for enterprise',
                url: 'https://www.adobe.com/products/firefly/enterprise.html',
            },
            {
                label: 'C2PA 2.3 ecosystem announcement',
                url: 'https://c2pa.org/the-c2pa-launches-content-credentials-2-3-and-celebrates-5-years-of-impact-across-the-digital-ecosystem/',
            },
        ],
        sections: [
            {
                heading: 'Start with approved creation paths',
                body:
                    'The first mitigation layer is deciding which models, vendors, and license terms your team is allowed to use. If tool choice is undefined, every downstream control becomes harder to enforce.',
            },
            {
                heading: 'Use policy to block predictable mistakes',
                body:
                    'Brand rules, claims restrictions, and IP guardrails should eliminate the obvious no-go cases before they ever become review tickets.',
                bullets: [
                    'Define prohibited brands, references, and risky prompt patterns.',
                    'Define which campaign types require provenance or supporting documentation.',
                    'Define what must be escalated before launch.',
                ],
            },
            {
                heading: 'Capture provenance and evidence where possible',
                body:
                    'Content Credentials and review logs do not solve every legal question, but they make it easier to prove how an asset was created, edited, and approved.',
            },
            {
                heading: 'Keep contractual layers in their proper place',
                body:
                    'Indemnity and insurance can matter a lot, but they belong at the end of the stack. They are not substitutes for upstream controls that prevent risky work from shipping.',
            },
        ],
        faq: [
            {
                question: 'What is the most important mitigation layer?',
                answer:
                    'Usually the answer is policy plus workflow. Approved tools matter, but teams still need rules and review thresholds that stop risky content before publish.',
            },
            {
                question: 'Should provenance be mandatory for every asset?',
                answer:
                    'Not always. The stronger approach is to define when provenance is required, when it is preferred, and what fallback documentation is acceptable if it is missing.',
            },
            {
                question: 'Where do indemnity and insurance fit?',
                answer:
                    'At the end. They are still important, but they are downstream financial protection, not the operating model itself.',
            },
        ],
    },
]

export function getGovernanceGuide(slug: string) {
    return governanceGuides.find((guide) => guide.slug === slug)
}

export function getRelatedGovernanceGuides(slug: GovernanceGuideSlug, limit = 3) {
    return governanceGuides.filter((guide) => guide.slug !== slug).slice(0, limit)
}

export function formatUsdCompact(value: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value)
}

export function formatUsdFull(value: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(value)
}

export function formatLongDate(date: string) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(`${date}T00:00:00Z`))
}

// ─── Live Governance Data (DB-backed with hardcoded fallback) ───────────────

/**
 * Get live risk index snapshot from governance DB.
 * Falls back to hardcoded riskIndexSnapshot if DB unavailable.
 * Call from Server Components only.
 */
export async function getLiveRiskIndexSnapshot(): Promise<typeof riskIndexSnapshot> {
    try {
        const { getGovernanceStats } = await import('@/lib/governance/query')
        const stats = await getGovernanceStats()

        return {
            asOf: new Date().toISOString().split('T')[0],
            knownSettlementTotalUsd: stats.totalFinancialExposure || riskIndexSnapshot.knownSettlementTotalUsd,
            trackedCaseCountLabel: stats.trackedCaseCount > 0 ? `${stats.trackedCaseCount}+` : riskIndexSnapshot.trackedCaseCountLabel,
            trackedCaseCountContext: `AI and copyright cases tracked in governance database, including settlements, rulings, and enforcement actions.`,
            recentFilingsLabel: riskIndexSnapshot.recentFilingsLabel, // Keep hardcoded for specific context
            recentFilingsContext: riskIndexSnapshot.recentFilingsContext,
            standardsAdoptionLabel: riskIndexSnapshot.standardsAdoptionLabel,
            standardsAdoptionContext: riskIndexSnapshot.standardsAdoptionContext,
            sourceCount: stats.totalPolicies + stats.totalPrecedents,
            methodology: riskIndexSnapshot.methodology,
        }
    } catch {
        return riskIndexSnapshot
    }
}

// ─── DB → RiskWatchItem normalization ────────────────────────────────────────

function normalizePrecedentCategory(caseType: string): RiskWatchItem['category'] {
    switch (caseType) {
        case 'settlement': return 'settlement'
        case 'litigation':
        case 'ruling': return 'litigation'
        case 'enforcement': return 'market'
        case 'advisory':
        default: return 'standard'
    }
}

function normalizePrecedentStatus(caseType: string): string {
    switch (caseType) {
        case 'settlement': return 'proposed'
        case 'litigation': return 'active'
        case 'ruling': return 'decided'
        case 'enforcement': return 'active'
        case 'advisory': return 'released'
        default: return 'tracked'
    }
}

/**
 * Get live risk watch items from governance DB precedents.
 * Merges DB precedents with hardcoded items, deduplicating by case_ref/title.
 * Call from Server Components only.
 */
export async function getLiveRiskWatchItems(): Promise<RiskWatchItem[]> {
    try {
        const { getPrecedentsForHub } = await import('@/lib/governance/query')
        const dbPrecedents = await getPrecedentsForHub(15)

        if (dbPrecedents.length === 0) return riskWatchItems

        // Convert DB precedents to RiskWatchItem format with explicit normalization
        const dbItems: RiskWatchItem[] = dbPrecedents.map(p => ({
            title: p.case_ref,
            date: p.date,
            category: normalizePrecedentCategory(p.case_type),
            status: normalizePrecedentStatus(p.case_type),
            summary: p.summary,
            sourceLabel: 'Governance Database',
            sourceUrl: p.source_url || '',
        }))

        // Merge: DB items first (fresher), then hardcoded items not already in DB
        const dbTitles = new Set(dbItems.map(i => i.title.toLowerCase()))
        const uniqueHardcoded = riskWatchItems.filter(
            item => !dbTitles.has(item.title.toLowerCase())
        )

        return [...dbItems, ...uniqueHardcoded].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
    } catch {
        return riskWatchItems
    }
}

/**
 * Get live policy signals from governance DB.
 * Falls back to hardcoded policySignals if DB unavailable.
 * Call from Server Components only.
 */
export async function getLivePolicySignals(): Promise<RiskWatchItem[]> {
    try {
        const { getPolicySignalsForHub } = await import('@/lib/governance/query')
        const dbPolicies = await getPolicySignalsForHub()

        if (dbPolicies.length === 0) return policySignals

        // Convert jurisdiction-level policies to RiskWatchItem format
        const dbSignals: RiskWatchItem[] = dbPolicies
            .filter(p => p.authority && p.authority.length > 0)
            .slice(0, 10)
            .map(p => ({
                title: p.authority,
                date: p.effective_date || p.created_at.split('T')[0],
                category: 'standard' as const,
                status: p.expiry_date ? 'active' : 'enacted',
                summary: p.rule_text,
                sourceLabel: p.scope_value,
                sourceUrl: p.authority_url || '',
            }))

        // Merge with hardcoded, deduplicate by title
        const dbTitles = new Set(dbSignals.map(s => s.title.toLowerCase()))
        const uniqueHardcoded = policySignals.filter(
            s => !dbTitles.has(s.title.toLowerCase())
        )

        return [...dbSignals, ...uniqueHardcoded].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
    } catch {
        return policySignals
    }
}
