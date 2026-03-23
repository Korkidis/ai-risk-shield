import { PlanId } from '@/lib/plans'

export type Persona = 'agency' | 'enterprise' | 'default'

export interface PlanContent {
    name: string
    tagline: string
    audience: string
    baseCommitment?: string
    effectiveRate?: string
    overageRate?: string
    idealFor: string[]
    softBenefits: string[]
    ctaPrimary: string
    ctaSecondary?: string
}

export const PLAN_CONTENT: Record<PlanId, PlanContent> = {
    free: {
        name: 'Free',
        tagline: 'Test the engine with 3 free scans',
        audience: 'See what a structured risk report looks like.',
        idealFor: [
            'Evaluating validation depth',
            'Testing single assets',
            'Proving model functionality',
        ],
        softBenefits: [
            'Instant verification',
            'No credit card required',
            'Core analysis access',
        ],
        ctaPrimary: 'Start Free Trial',
    },
    pro: {
        name: 'Pro',
        tagline: 'Brand Profile + Pro Reports',
        audience: 'Individual creators and small teams clearing weekly campaigns.',
        baseCommitment: '$49 Base Commitment',
        effectiveRate: '$0.98 / scan (50 included)',
        overageRate: '$2.50 / additional scan',
        idealFor: [
            'Consistent validation needs',
            'Applying custom brand guidelines',
            'Maintaining forensic history',
        ],
        softBenefits: [
            'Forensic mitigation reports with step-by-step remediation',
            'Your brand rules and policies define every score',
            'Consistent methodology: AI-powered analysis with deterministic composite scoring',
        ],
        ctaPrimary: 'Subscribe Pro',
    },
    team: {
        name: 'Team',
        tagline: 'Multi-Seat + Bulk Upload',
        audience: 'Dedicated marketing arms publishing high-volume daily content.',
        baseCommitment: '$199 Base Commitment',
        effectiveRate: '$0.66 / scan (300 included)',
        overageRate: '$1.00 / additional scan',
        idealFor: [
            'Collaborative review workflows',
            'High-volume content production',
            'Shared mitigation credits',
        ],
        softBenefits: [
            'Unified team dashboard',
            'Bulk upload capabilities',
            'Co-branded reports',
        ],
        ctaPrimary: 'Subscribe Team',
    },
    agency: {
        name: 'Agency',
        tagline: 'White-Label + Priority Queue',
        audience: 'Agencies managing multiple brands and client campaigns at scale.',
        baseCommitment: '$499 Base Commitment',
        effectiveRate: '$0.49 / scan (1,000 included)',
        overageRate: '$0.60 / additional scan',
        idealFor: [
            'Managing multiple brand profiles',
            'Client-facing white-labeled reports',
            'High-throughput validation',
        ],
        softBenefits: [
            'Unlimited white-labeling',
            'Dedicated Slack support',
            'Agency-wide audit logging',
        ],
        ctaPrimary: 'Start Agency Plan',
    },
    enterprise: {
        name: 'Enterprise',
        tagline: 'SSO + Dedicated CSM',
        audience: 'Large Enterprise Operations',
        baseCommitment: 'Custom Commitment',
        effectiveRate: 'Custom / volume scale',
        overageRate: 'Custom terms',
        idealFor: [
            'Custom integrations & SLA requirements',
            'Procurement and legal compliance',
            'Enterprise-grade operational scale',
        ],
        softBenefits: [
            'Dedicated Customer Success Manager',
            'SSO / SAML integration',
            'Negotiated rates and customized terms',
        ],
        ctaPrimary: 'Explore Plan',
    }
}

export const FAQs = [
    {
        question: 'What types of content can I scan?',
        answer: 'Images, video, and audio files. You upload the asset, and the engine checks for IP infringement signals, brand safety violations, and provenance gaps, then returns a structured risk report.'
    },
    {
        question: 'Can I set my own brand rules and policies?',
        answer: 'Yes. On Pro and higher tiers, you upload your brand guidelines, restricted vocabulary, and policy documents. The engine adopts your standards and flags any content that drifts from your brand voice.'
    },
    {
        question: 'Is my content used to train your models?',
        answer: 'Never. Your data is your IP. We process scans in secure, ephemeral environments with zero retention. We hold no claim to your content and do absolutely no model training on your data.'
    },
    {
        question: 'What methodology powers the risk score?',
        answer: 'The engine combines AI-powered visual analysis with deterministic scoring rules and C2PA cryptographic verification. Composite scores use fixed weights and thresholds grounded in established IP and governance frameworks. The system adapts to your organization\'s brand guidelines and policies.'
    },
    {
        question: 'Does this replace our legal review process?',
        answer: 'No. It accelerates it. The engine catches obvious IP risks and policy violations up front, so your legal team can focus on high-level strategy instead of basic risk screening.'
    },
    {
        question: 'What is a deep mitigation report?',
        answer: 'A detailed remediation document that goes beyond the risk score. It outlines specific findings, recommended next steps, and strategic options for resolving flagged issues before publication.'
    }
]

export const PERSONA_CONTENT: Record<'agency' | 'enterprise', { title: string; description: string; benefits: string[] }> = {
    agency: {
        title: 'Enterprise & Agency Capabilities',
        description: 'Governance-grade compliance integrated directly into your workflows.',
        benefits: [
            'Operational Scale for High-Volume Teams',
            'Dedicated SLA Processing',
            'Full White-Labeled Deliverables',
            'Multi-Brand Profile Management',
            'Priority Processing Queue',
            'Custom Risk Threshold Policies',
            'Secure Data Retention',
            'Configurable API Rate Limits',
            'SSO / SAML Available (Enterprise Only)'
        ]
    },
    enterprise: {
        title: 'For Enterprises',
        description: 'Governance-grade compliance with SSO, dedicated support, and custom SLAs tailored to your operational theater.',
        benefits: [
            'SSO / SAML Security',
            'Enterprise-Grade Operational Scale',
            'Dedicated Success Manager',
            'Advanced Audit Logging'
        ]
    }
}
