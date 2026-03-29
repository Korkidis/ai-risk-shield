export type GovernanceGuideSlug =
    | 'assessing-ai-content-risk'
    | 'indemnity-controls'
    | 'content-credentials'
    | 'human-review-workflows'
    | 'brand-policy-controls'
    | 'mitigation-layers'
    | 'ai-contracts-cover-2026'
    | 'edited-ai-outputs-risk'
    | 'ai-design-tool-composition-risk'
    | 'ai-transcreation-rights-review'
    | 'ai-disclosure-provenance-rules'
    | 'how-legal-teams-read-ai-contracts'

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
    titleTag?: string
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
    internalLinks?: GovernanceGuideSlug[]
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
    {
        slug: 'ai-contracts-cover-2026',
        title: 'What AI Contracts Cover In 2026',
        titleTag: 'What AI Contracts Cover in 2026 and What They Do Not | AI Content Risk Score',
        description:
            'AI vendor indemnity is real, but it is limited. See what Google, Microsoft, and AWS commitments usually cover, what they exclude, and what enterprise teams still need to control themselves.',
        audience: 'Legal, procurement, responsible AI, marketing operations',
        intent: 'Contract scope and exclusions',
        publishedAt: '2026-03-25',
        updatedAt: '2026-03-25',
        primaryQuestion:
            'Are hyperscaler AI contracts enough on their own to make generative output safe for commercial use?',
        shortAnswer:
            'No. Provider commitments can meaningfully reduce copyright exposure in covered workflows, but they are conditional, service-specific, and rarely solve trademark, likeness, publicity, input-rights, or deceptive-use issues on their own.',
        keywords: [
            'ai contracts 2026',
            'ai vendor indemnity',
            'google microsoft aws ai coverage',
            'enterprise ai contract review',
        ],
        sourceLinks: [
            {
                label: 'Google Cloud generative AI indemnified services',
                url: 'https://cloud.google.com/terms/generative-ai-indemnified-services?hl=en',
            },
            {
                label: 'Microsoft Customer Copyright Commitment mitigations',
                url: 'https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/openai/customer-copyright-commitment',
            },
            {
                label: 'AWS service terms',
                url: 'https://aws.amazon.com/service-terms/',
            },
            {
                label: 'Amazon Bedrock third-party model terms',
                url: 'https://aws.amazon.com/legal/bedrock/third-party-models/',
            },
        ],
        sections: [
            {
                heading: 'Provider coverage is real, but it is not blanket protection',
                body:
                    'Google, Microsoft, and AWS now offer meaningful commitments in certain generative AI workflows. The catch is that coverage usually depends on the exact covered service, the linked service terms, the customer keeping required safeguards in place, and the team staying inside the documented workflow.',
            },
            {
                heading: 'Inputs, edits, and mixed toolchains can weaken coverage fast',
                body:
                    'Rights to inputs matter as much as rights to outputs. Unlicensed reference images, third-party source files, infringing prompts, or heavily edited cross-tool workflows make the coverage story harder to defend because the final asset is no longer just one provider-native output.',
                bullets: [
                    'Check whether the exact model or service is covered.',
                    'Verify the team had the right to use every input or reference asset.',
                    'Treat off-platform edits and third-party models as separate review events.',
                ],
            },
            {
                heading: 'Contracts do not solve trademark, likeness, publicity, or synthetic media issues',
                body:
                    'This is where many teams overread indemnity. A provider may offer meaningful copyright-related protection in limited contexts while leaving trademark-in-commerce, trade dress, unauthorized likeness use, deceptive synthetic media, or disclosure failures squarely on the customer.',
            },
            {
                heading: 'The practical review standard is contract-aware operations',
                body:
                    'Teams should approve tools only after they can answer which exact services are covered, what customer commitments preserve that coverage, what is excluded, what happens after editing or recombination, whether third-party models carry separate terms, and how provenance or disclosure expectations are handled.',
            },
        ],
        faq: [
            {
                question: 'Are hyperscaler AI contracts enough on their own?',
                answer:
                    'No. They reduce part of the risk, but approvals still depend on input rights, workflow design, guardrails, provenance, and human review.',
            },
            {
                question: 'Do all models on a provider platform get the same coverage?',
                answer:
                    'No. Covered services and third-party model terms vary by provider and product, which is why legal review has to go beyond one headline commitment.',
            },
            {
                question: 'What should teams check before they approve a tool?',
                answer:
                    'At minimum: the exact covered service, customer obligations, exclusions, treatment of third-party models, monitoring rules, and whether provenance or disclosure features are available or required.',
            },
        ],
        internalLinks: [
            'how-legal-teams-read-ai-contracts',
            'edited-ai-outputs-risk',
            'ai-disclosure-provenance-rules',
        ],
    },
    {
        slug: 'edited-ai-outputs-risk',
        title: 'What Happens When AI Outputs Are Heavily Edited',
        titleTag: 'How Edited AI Outputs Change Contract Risk and Review | AI Content Risk Score',
        description:
            'Editing AI output does not automatically remove risk. Learn how heavy edits, recombination, and non-covered tools affect contract protection, provenance, and legal review.',
        audience: 'Creative operations, legal, brand review, production leads',
        intent: 'Edited outputs and mixed toolchains',
        publishedAt: '2026-03-25',
        updatedAt: '2026-03-25',
        primaryQuestion: 'Does heavy editing make AI output legally safer or easier to defend?',
        shortAnswer:
            'Not by itself. Editing can strengthen a review record, but it does not erase bad inputs, preserve provider coverage automatically, or simplify rights questions once teams mix assets, tools, and vendors.',
        keywords: [
            'edited ai output risk',
            'ai output legal review',
            'mixed ai toolchain risk',
            'ai output provenance after editing',
        ],
        sourceLinks: [
            {
                label: 'Google Cloud service terms',
                url: 'https://cloud.google.com/terms/service-terms',
            },
            {
                label: 'Microsoft Customer Copyright Commitment mitigations',
                url: 'https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/openai/customer-copyright-commitment',
            },
            {
                label: 'AWS service terms',
                url: 'https://aws.amazon.com/service-terms/',
            },
            {
                label: 'Amazon Bedrock third-party model terms',
                url: 'https://aws.amazon.com/legal/bedrock/third-party-models/',
            },
        ],
        sections: [
            {
                heading: 'Downstream editing changes the review posture',
                body:
                    'An output may begin inside a covered service and still become harder to defend after multiple edits. The problem is usually evidentiary. Teams need to show what the provider generated, what humans changed, what third-party material entered later, and which terms still apply to the final asset.',
            },
            {
                heading: 'The risk rises when composition becomes layered',
                body:
                    'Substantial inpainting, outpainting, compositing, stock inserts, logo placement, product-packaging edits, and moving the file into other generative tools all push the asset away from a clean single-output story.',
                bullets: [
                    'Treat major edits as a separate review threshold, not as an automatic cleanup step.',
                    'Log every tool in the chain once the asset leaves the original generation environment.',
                    'Route mixed-asset compositions to human review before external use.',
                ],
            },
            {
                heading: 'Off-platform tools create both contract and provenance problems',
                body:
                    'Once an asset moves outside the original covered environment, teams inherit a new set of model terms, exclusions, logging rules, and provenance gaps. The result is a workflow problem, not just a content problem.',
            },
            {
                heading: 'The practical rule is simple: more edits should mean more review',
                body:
                    'Editing can support explainability and defensibility, but it is not a substitute for rights-cleared inputs, preserved safeguards, or clear documentation. Heavily edited outputs need stronger records and a higher review threshold, not optimism.',
            },
        ],
        faq: [
            {
                question: 'Does editing AI output make it legally safe?',
                answer:
                    'No. Editing can improve the review record, but it does not erase upstream input issues, trademark problems, or missing provenance.',
            },
            {
                question: 'Should heavily edited outputs go to human review?',
                answer:
                    'Yes. That is the cleanest way to handle mixed assets, off-platform processing, and uncertain coverage or provenance.',
            },
            {
                question: 'What should teams log after an asset is edited?',
                answer:
                    'The tools used, major edits applied, source assets introduced, who approved the work, and whether provenance or disclosure changed before publication.',
            },
        ],
        internalLinks: [
            'ai-design-tool-composition-risk',
            'ai-transcreation-rights-review',
            'human-review-workflows',
        ],
    },
    {
        slug: 'ai-design-tool-composition-risk',
        title: 'AI In Design Tools And Node-Based Canvases',
        titleTag: 'AI Design Tool Workflows: Composition Risk and Legal Review | AI Content Risk Score',
        description:
            'Multi-model AI workflows in design tools and node-based canvases can speed production, but they also create layered contract and rights questions. Here is how to review them.',
        audience: 'Design systems, creative technology, legal ops, brand governance',
        intent: 'Composition workflow review',
        publishedAt: '2026-03-25',
        updatedAt: '2026-03-25',
        primaryQuestion: 'Are node-based AI canvases automatically high risk for enterprise teams?',
        shortAnswer:
            'No. They are manageable when the workflow is approved, observable, and fed with rights-cleared inputs. The risk rises when teams mix models, tools, and assets without clear records or clear ownership of the final chain.',
        keywords: [
            'node based ai workflow risk',
            'ai design tool legal review',
            'multi model ai composition',
            'ai canvas workflow governance',
        ],
        sourceLinks: [
            {
                label: 'Amazon Bedrock third-party model terms',
                url: 'https://aws.amazon.com/legal/bedrock/third-party-models/',
            },
            {
                label: 'AWS Bedrock Guardrails',
                url: 'https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails-how.html',
            },
            {
                label: 'Google Cloud service terms',
                url: 'https://cloud.google.com/terms/service-terms',
            },
            {
                label: 'Microsoft AI Code of Conduct',
                url: 'https://learn.microsoft.com/en-us/legal/ai-code-of-conduct',
            },
        ],
        sections: [
            {
                heading: 'The workflow is the legal object, not just the final file',
                body:
                    'Modern creative stacks often chain text, image, video, masking, inpainting, compositing, and export steps across multiple models and products. That makes the final asset harder to review because several services, terms, and source assets may all be implicated at once.',
            },
            {
                heading: 'The canvas itself is not the problem',
                body:
                    'The real question is whether the composition stayed inside an approved and observable workflow. A clean pipeline can be defensible. An opaque chain with mixed models, copied assets, and missing provenance usually is not.',
            },
            {
                heading: 'Policy teams should require toolchain-level evidence',
                body:
                    'The cleanest standard is to log each model or tool in the chain, require rights-cleared source assets, preserve safety systems, and escalate mixed-tool compositions before public use.',
                bullets: [
                    'Keep an approved-tool matrix for creative AI workflows.',
                    'Treat third-party model terms as separate review inputs.',
                    'Require provenance retention or fallback documentation when files move across tools.',
                ],
            },
            {
                heading: 'Good composition governance keeps speed without fiction',
                body:
                    'Teams do not need to ban advanced design workflows. They need to make those workflows observable enough that legal, procurement, and brand reviewers can reconstruct what happened if the asset becomes disputed later.',
            },
        ],
        faq: [
            {
                question: 'Are node-based AI canvases automatically high risk?',
                answer:
                    'No. The risk comes from unapproved models, unclear source rights, missing provenance, and weak records, not from the visual workflow format by itself.',
            },
            {
                question: 'What should legal teams ask about these workflows?',
                answer:
                    'Ask which models were used, which services were covered, whether third-party terms applied, whether provenance was preserved, and whether logos, likenesses, or brand-sensitive assets entered during composition.',
            },
            {
                question: 'What is the minimum viable control for mixed AI toolchains?',
                answer:
                    'Approved tools, logged model steps, rights-cleared inputs, preserved safeguards, and a human-review trigger for external-facing work.',
            },
        ],
        internalLinks: [
            'edited-ai-outputs-risk',
            'ai-transcreation-rights-review',
            'brand-policy-controls',
        ],
    },
    {
        slug: 'ai-transcreation-rights-review',
        title: 'AI Transcreation Of Existing Assets',
        titleTag: 'AI Transcreation: Why Existing Assets Still Need Rights Review | AI Content Risk Score',
        description:
            'AI transcreation can speed localization and adaptation, but it does not wipe away rights constraints from the original asset. Here is how to review AI-assisted transcreation.',
        audience: 'Localization teams, brand leads, legal, creative operations',
        intent: 'Adaptation and source rights',
        publishedAt: '2026-03-25',
        updatedAt: '2026-03-25',
        primaryQuestion: 'Is AI transcreation lower risk than generating from scratch?',
        shortAnswer:
            'Sometimes, but only when the source asset was already licensed and approved for adaptation. AI-assisted transcreation inherits the source asset’s constraints instead of magically resetting them.',
        keywords: [
            'ai transcreation rights review',
            'ai localization legal risk',
            'adapt existing assets with ai',
            'source asset rights ai',
        ],
        sourceLinks: [
            {
                label: 'AWS service terms',
                url: 'https://aws.amazon.com/service-terms/',
            },
            {
                label: 'Google Cloud generative AI indemnified services',
                url: 'https://cloud.google.com/terms/generative-ai-indemnified-services?hl=en',
            },
            {
                label: 'Google Cloud service terms',
                url: 'https://cloud.google.com/terms/service-terms',
            },
            {
                label: 'Microsoft Customer Copyright Commitment mitigations',
                url: 'https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/openai/customer-copyright-commitment',
            },
        ],
        sections: [
            {
                heading: 'Transcreation changes format, not underlying rights',
                body:
                    'Teams often assume transcreation is safer because it starts from approved creative. That may be true from a brand perspective, but it does not remove licensing limits, talent restrictions, partner approvals, geography-specific rules, or usage constraints attached to the source material.',
            },
            {
                heading: 'Source rights usually matter more than teams expect',
                body:
                    'If the original asset includes licensed visuals, celebrity likenesses, partner marks, product imagery, or regulated claims, those constraints can carry directly into the adapted output. The output stays only as clean as the source material and the workflow around it.',
            },
            {
                heading: 'A workable review standard starts upstream',
                body:
                    'Transcreation should be approved when the original asset is rights-cleared for adaptation, the workflow stays inside approved tools, the resulting asset is checked for locality and claims issues, and the team records what changed.',
                bullets: [
                    'Verify adaptation rights on the source asset before prompting or editing.',
                    'Log the source asset, workflow, and review decision together.',
                    'Escalate celebrity, logo, partner, and jurisdiction-specific variants.',
                ],
            },
            {
                heading: 'The operational win is clarity, not automatic speed',
                body:
                    'A clean transcreation standard lets teams move faster because they know which source assets are reusable, which need legal confirmation, and which should never be handed to AI tools in the first place.',
            },
        ],
        faq: [
            {
                question: 'Is AI transcreation lower risk than generating from scratch?',
                answer:
                    'Sometimes, but only when the source asset was already licensed and approved for adaptation. If the source is constrained, the adapted output inherits that constraint.',
            },
            {
                question: 'Should transcreation always be logged?',
                answer:
                    'Yes. Teams should record the source asset, the approved rights, the tool or model used, and the final review decision so the adaptation path stays defensible.',
            },
            {
                question: 'What triggers escalation in transcreation workflows?',
                answer:
                    'Licensed talent, partner content, logos, geography-specific claims, and any source asset whose adaptation rights are unclear or limited.',
            },
        ],
        internalLinks: [
            'brand-policy-controls',
            'human-review-workflows',
            'ai-contracts-cover-2026',
        ],
    },
    {
        slug: 'ai-disclosure-provenance-rules',
        title: 'AI Disclosure, Provenance, And Naming Rules',
        titleTag: 'AI Disclosure, Provenance, and Naming Rules for Enterprises | AI Content Risk Score',
        description:
            'AI disclosure rules are tightening. Learn what enterprise teams should do now on provenance, watermarking, naming conventions, and synthetic media review.',
        audience: 'Policy, compliance, brand ops, communications',
        intent: 'Disclosure and provenance policy',
        publishedAt: '2026-03-25',
        updatedAt: '2026-03-25',
        primaryQuestion: 'When should enterprises disclose AI-generated content and preserve provenance?',
        shortAnswer:
            'At minimum, when synthetic media could mislead users, viewers, or counterparties, and whenever policy or jurisdiction requires it. Even where disclosure is not mandatory yet, provenance and naming rules make review faster and later disputes easier to defend.',
        keywords: [
            'ai disclosure policy enterprise',
            'ai provenance rules',
            'content credentials naming conventions',
            'synthetic media enterprise policy',
        ],
        sourceLinks: [
            {
                label: 'EU AI Act official text',
                url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689',
            },
            {
                label: 'EU AI Act Article 50 summary',
                url: 'https://artificialintelligenceact.eu/article/50/',
            },
            {
                label: 'Microsoft AI Code of Conduct',
                url: 'https://learn.microsoft.com/en-us/legal/ai-code-of-conduct',
            },
            {
                label: 'Azure OpenAI Content Credentials',
                url: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/content-credentials',
            },
            {
                label: 'Google Imagen watermark verification',
                url: 'https://cloud.google.com/vertex-ai/generative-ai/docs/image/verify-watermark',
            },
            {
                label: 'Amazon Titan watermark detection',
                url: 'https://aws.amazon.com/about-aws/whats-new/2024/04/watermark-detection-amazon-titan-image-generator-bedrock/',
            },
        ],
        sections: [
            {
                heading: 'Disclosure and provenance have moved to the center of governance',
                body:
                    'The policy direction is clear. Article 50 transparency obligations in the EU AI Act become applicable on August 2, 2026, and U.S. policy discussion is increasingly focused on synthetic media, creator concerns, and digital replicas. This is no longer a niche issue for platform teams.',
            },
            {
                heading: 'Vendors already support watermarking and provenance signals',
                body:
                    'Azure AI-generated images include Content Credentials by default, Google Imagen supports SynthID watermark verification, and Amazon Titan images include invisible watermarking by default. That means provenance preservation is operationally realistic now, not just aspirational.',
            },
            {
                heading: 'Most enterprises need three immediate rules',
                body:
                    'Set a disclosure standard for external synthetic media, preserve provenance in approved workflows, and use naming conventions that make AI-assisted files recognizable during review and handoff.',
                bullets: [
                    'Define where disclosure is mandatory, recommended, or optional.',
                    'Preserve watermarks, Content Credentials, or equivalent provenance where supported.',
                    'Use naming rules that flag AI-generated or AI-assisted assets in the review chain.',
                ],
            },
            {
                heading: 'Missing provenance should change review posture',
                body:
                    'No manifest or watermark is not proof of infringement, but it does weaken confidence. Teams should treat missing provenance as a signal to document more, review more carefully, or escalate before publish rather than waving it through.',
            },
        ],
        faq: [
            {
                question: 'When should a team disclose AI-generated content?',
                answer:
                    'At minimum when synthetic media could mislead viewers or counterparties, and whenever policy, contract, or jurisdiction requires it.',
            },
            {
                question: 'Should companies preserve watermarks and Content Credentials?',
                answer:
                    'Yes, in approved workflows. Preserving provenance supports review, accountability, and later verification.',
            },
            {
                question: 'Does missing provenance prove infringement?',
                answer:
                    'No. It is not proof of wrongdoing, but it should raise the review threshold because it weakens confidence and complicates later defense.',
            },
        ],
        internalLinks: [
            'content-credentials',
            'human-review-workflows',
            'ai-contracts-cover-2026',
        ],
    },
    {
        slug: 'how-legal-teams-read-ai-contracts',
        title: 'How Legal Teams Should Read AI Contracts',
        titleTag: 'How Legal Teams Should Read AI Contracts Without Missing Risk | AI Content Risk Score',
        description:
            'AI legal review fails when teams read one indemnity clause in isolation. Here is a better framework for legal, procurement, platform, and responsible AI teams reviewing vendors.',
        audience: 'Legal, procurement, platform engineering, responsible AI',
        intent: 'Cross-functional vendor review',
        publishedAt: '2026-03-25',
        updatedAt: '2026-03-25',
        primaryQuestion: 'What is the biggest mistake in AI contract review?',
        shortAnswer:
            'Treating the indemnity clause as the whole answer. The real answer usually sits across covered services, linked documentation, customer obligations, third-party model terms, monitoring rules, provenance features, and workflow controls.',
        keywords: [
            'how legal teams review ai contracts',
            'ai vendor review checklist',
            'procurement ai contract workflow',
            'responsible ai vendor diligence',
        ],
        sourceLinks: [
            {
                label: 'Google Cloud generative AI indemnified services',
                url: 'https://cloud.google.com/terms/generative-ai-indemnified-services?hl=en',
            },
            {
                label: 'Google abuse monitoring',
                url: 'https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/abuse-monitoring',
            },
            {
                label: 'Microsoft Customer Copyright Commitment mitigations',
                url: 'https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/openai/customer-copyright-commitment',
            },
            {
                label: 'AWS service terms',
                url: 'https://aws.amazon.com/service-terms/',
            },
        ],
        sections: [
            {
                heading: 'The common failure mode is clause-level reading',
                body:
                    'Many legal teams review AI vendors one clause at a time while platform and policy teams are managing workflows, controls, and evidence. That split produces shallow approvals because the actual risk lives across the full stack, not inside one indemnity paragraph.',
            },
            {
                heading: 'The better model is one cross-functional review stack',
                body:
                    'Legal, procurement, foundation, and responsible AI teams should review contract terms, covered services, safeguards, source-asset policy, logging, provenance, disclosure rules, and human-review triggers together.',
                bullets: [
                    'Map named services and models to approved use cases.',
                    'Check whether third-party model terms apply.',
                    'Confirm what customer actions preserve or lose coverage.',
                ],
            },
            {
                heading: 'Every review should answer the same core questions',
                body:
                    'Which exact services are approved? Are prompts or outputs processed for abuse monitoring or service operation? What provenance features exist? What exclusions matter most for this use case? Which scenarios require human escalation before deployment?',
            },
            {
                heading: 'Good contract review speeds approvals instead of slowing them down',
                body:
                    'A shared framework gives platform and creative teams a repeatable safe path. That lets legal focus on edge cases instead of reopening the same questions every time a team wants to try a new model or workflow.',
            },
        ],
        faq: [
            {
                question: 'What is the biggest mistake in AI contract review?',
                answer:
                    'Reading the indemnity clause in isolation. The practical answer sits across product terms, model scope, customer obligations, and workflow controls.',
            },
            {
                question: 'What helps approvals move faster?',
                answer:
                    'An approved foundation, observable workflows, clear review triggers, and shared language between legal, procurement, platform, and policy teams.',
            },
            {
                question: 'Why should legal teams care about abuse monitoring and logging?',
                answer:
                    'Because monitoring, retention, and service-operation rules can affect confidentiality assumptions, acceptable use, and whether a workflow is appropriate for sensitive source material.',
            },
        ],
        internalLinks: [
            'ai-contracts-cover-2026',
            'indemnity-controls',
            'mitigation-layers',
        ],
    },
]

export function getGovernanceGuide(slug: string) {
    return governanceGuides.find((guide) => guide.slug === slug)
}

export function getRelatedGovernanceGuides(slug: GovernanceGuideSlug, limit = 3) {
    const currentGuide = governanceGuides.find((guide) => guide.slug === slug)

    if (currentGuide?.internalLinks?.length) {
        return currentGuide.internalLinks
            .map((internalSlug) => governanceGuides.find((guide) => guide.slug === internalSlug))
            .filter((guide): guide is GovernanceGuide => Boolean(guide))
            .slice(0, limit)
    }

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

// ─── Scan Doctrine Context (for Gemini prompt injection) ─────────────────────
// These functions build structured doctrine strings from the governance knowledge
// base above. gemini.ts calls these instead of hardcoding legal/regulatory claims.

/**
 * IP-domain doctrine context for the Legal Analyst persona.
 * Sources: riskIndexSnapshot, riskWatchItems (litigation + settlement data).
 */
export function getIPDoctrineContext(): string {
    const snap = riskIndexSnapshot
    const settlement = riskWatchItems.find(r => r.category === 'settlement')
    const caseVolume = riskWatchItems.find(r => r.title.includes('case volume'))
    const runway = riskWatchItems.find(r => r.title.includes('Runway'))

    const lines: string[] = []
    if (caseVolume) lines.push(`- ${caseVolume.summary.split('.')[0]}. The litigation environment for AI-generated content is intensifying.`)
    if (settlement) lines.push(`- The Anthropic authors settlement proposed a $${formatUsdCompact(snap.knownSettlementTotalUsd)} financial anchor for AI copyright exposure, establishing nine-figure precedent for training-data-related claims.`)
    if (runway) lines.push(`- ${runway.summary.split('.')[0]}.`)
    lines.push('- When you detect recognizable IP elements (logos, characters, trade dress, celebrity likeness), consider that enforcement risk is materially higher than it was 12 months ago.')
    lines.push('- False negatives in IP detection carry increasing legal and financial exposure for enterprise users.')

    return `DOCTRINE CONTEXT (as of ${snap.asOf}):\n${lines.join('\n')}`
}

/**
 * Safety-domain doctrine context for the Compliance Auditor persona.
 * Sources: policySignals (EU AI Act, US framework, platform policies).
 */
export function getSafetyDoctrineContext(): string {
    const euSignal = policySignals.find(r => r.title.includes('EU AI Act'))
    const usSignal = policySignals.find(r => r.title.includes('US National'))
    const snap = riskIndexSnapshot

    const lines: string[] = []
    if (euSignal) lines.push(`- The EU AI Act Article 50 transparency obligations are now in enforcement. Synthetic content published in EU markets may require disclosure.`)
    lines.push('- Major platforms are tightening AI content policies. LinkedIn prohibits AI-generated profile images in certain contexts. TikTok requires synthetic content disclosure.')
    if (usSignal) lines.push(`- ${usSignal.summary.split('.')[0]}.`)
    lines.push('- When evaluating brand safety, consider not just visual content but also platform-specific policy exposure — content safe on one platform may violate policy on another.')

    return `PLATFORM & REGULATORY CONTEXT (as of ${snap.asOf}):\n${lines.join('\n')}`
}

/**
 * Provenance-domain doctrine context for the Forensic Analyst persona.
 * Sources: riskWatchItems (C2PA adoption data).
 */
export function getProvenanceDoctrineContext(): string {
    const c2pa = riskWatchItems.find(r => r.title.includes('Content Credentials'))
    const snap = riskIndexSnapshot

    const lines: string[] = []
    if (c2pa) lines.push(`- Content Credentials (C2PA) 2.3 is now live with over ${snap.standardsAdoptionLabel} verified production deployments. Missing credentials are increasingly unusual for professionally produced AI content.`)
    lines.push('- In the current legal environment, missing or weak provenance is a governance weakness, not proof of wrongdoing — but it materially reduces defensibility and auditability.')
    lines.push('- Valid credentials reduce uncertainty and strengthen the user\'s ability to defend publication decisions.')
    lines.push('- Invalid or contradictory provenance should sharply increase the need for human review.')
    lines.push('- Consider provenance as part of the explanation chain for how an asset was made, not as a standalone verdict.')

    return `PROVENANCE DOCTRINE (as of ${snap.asOf}):\n${lines.join('\n')}`
}

/**
 * Chief Strategy synthesis doctrine context.
 * Sources: riskIndexSnapshot aggregate data.
 */
export function getChiefStrategyDoctrineContext(): string {
    const snap = riskIndexSnapshot
    return `GOVERNANCE AWARENESS:
- Your recommendations should reflect the current legal and regulatory environment: ${snap.trackedCaseCountLabel} active AI copyright cases, $${formatUsdCompact(snap.knownSettlementTotalUsd)} settlement precedent, EU AI Act enforcement, platform policy tightening.
- When IP risk is high and provenance is weak, explicitly note the compounding exposure.
- When content credentials are valid, acknowledge the defensibility benefit.
- Frame recommendations as practical guidance for teams publishing AI content in a heightened enforcement environment.
- Be specific about what the user should do — not generic governance language.`
}

// ─── Live Governance Data ────────────────────────────────────────────────────
// Server-only live fetchers (getLiveRiskIndexSnapshot, getLiveRiskWatchItems,
// getLivePolicySignals) are in ai-content-governance.server.ts to avoid
// pulling server dependencies into client bundles.
