import { PlanId } from '@/lib/plans'

export type Persona = 'agency' | 'enterprise' | 'default'

export interface PlanContent {
    name: string
    tagline: string
    audience: string
    idealFor: string[]
    softBenefits: string[]
    ctaPrimary: string
    ctaSecondary?: string
}

export const PLAN_CONTENT: Record<PlanId, PlanContent> = {
    free: {
        name: 'Free',
        tagline: '3 Scans to Test',
        audience: 'Independent Researchers',
        idealFor: [
            'Evaluating validation depth',
            'Testing single assets',
            'Understanding risk profiles',
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
        audience: 'Freelancers & Solo Consultants',
        idealFor: [
            'Consistent validation needs',
            'Applying custom brand guidelines',
            'Maintaining forensic history',
        ],
        softBenefits: [
            'Full PDF report generation',
            'Custom brand rules applied to checks',
            'Prioritized scanning speed',
        ],
        ctaPrimary: 'Subscribe Pro',
    },
    team: {
        name: 'Team',
        tagline: 'Multi-Seat + Bulk Upload',
        audience: 'Small to Medium Teams',
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
        audience: 'Agencies & Content Studios',
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
        idealFor: [
            'Custom integrations & SLA requirements',
            'Procurement and legal compliance',
            'Unlimited operational scale',
        ],
        softBenefits: [
            'Dedicated Customer Success Manager',
            'SSO / SAML integration',
            'Negotiated rates and customized terms',
        ],
        ctaPrimary: 'Contact Sales',
        ctaSecondary: 'Request Demo'
    }
}

export const FAQs = [
    {
        question: 'What happens if I exceed my scan limit?',
        answer: 'Paid plans allow overage usage. You\'ll be billed at your plan\'s overage rate at the end of each billing cycle. Free users must upgrade to continue scanning.'
    },
    {
        question: 'Can I change plans anytime?',
        answer: 'Yes! Upgrade or downgrade anytime. When upgrading, you\'ll be prorated for the remaining period. When downgrading, changes take effect at your next billing date.'
    },
    {
        question: 'Do you offer refunds?',
        answer: 'We offer a 14-day money-back guarantee on all paid plans. No questions asked.'
    },
    {
        question: 'What is a Mitigation Report?',
        answer: 'A Mitigation Report provides a deep forensic analysis, bias audit, compliance checks (e.g., GDPR, EU AI Act), and actionable remediation steps. They are available as a one-time purchase or included in higher-tier plans.'
    }
]

export const PERSONA_CONTENT: Record<'agency' | 'enterprise', { title: string; description: string; benefits: string[] }> = {
    agency: {
        title: 'For Agencies',
        description: 'Accelerate client delivery with white-labeled validation, multi-brand management, and frictionless workflows.',
        benefits: [
            'White-Label Client Reports',
            'Manage up to 20 Brand Profiles',
            'High-Volume Bulk Verification',
            'Priority Queue Processing'
        ]
    },
    enterprise: {
        title: 'For Enterprises',
        description: 'Governance-grade compliance with SSO, dedicated support, and custom SLAs tailored to your operational theater.',
        benefits: [
            'SSO / SAML Security',
            'Unlimited Operational Scale',
            'Dedicated Success Manager',
            'Advanced Audit Logging'
        ]
    }
}
