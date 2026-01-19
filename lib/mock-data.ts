import { ScanWithRelations } from '@/types/database'
import { RiskProfile } from '@/lib/gemini'

export const MOCK_SCANS: ScanWithRelations[] = [
    {
        id: 'SCAN-8492-ALPHA',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        asset_id: 'asset-001',
        filename: 'campaign_v1_hero.jpg',
        file_type: 'image',
        status: 'completed',
        risk_profile: {
            verdict: 'safe',
            summary: 'Content appears safe for general distribution. No significant copyright matches found.',
            ip_report: { score: 12, teaser: "No IP detected.", reasoning: "Standard commercial imagery." },
            safety_report: { score: 5, teaser: "Brand safe.", reasoning: "No objectionable content." },
            provenance_report: { score: 10, teaser: "Verified Origin.", reasoning: "C2PA signature valid." },
            c2pa_report: { status: 'verified', issuer: 'Adobe', timestamp: '2023-10-25T10:00:00Z' },
            composite_score: 12,
            chief_officer_strategy: "Clear for global distribution."
        } as RiskProfile,
        image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3',
        tenant_id: 'tenant-1'
    },
    {
        id: 'SCAN-3921-BRAVO',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString(),
        asset_id: 'asset-002',
        filename: 'competitor_analysis_chart.png',
        file_type: 'image',
        status: 'completed',
        risk_profile: {
            verdict: 'high',
            summary: 'High potential for trademark infringement detected. Competitor logos identified.',
            ip_report: { score: 85, teaser: "Trademark Violation.", reasoning: "Competitor logo detected." },
            safety_report: { score: 10, teaser: "Safe content.", reasoning: "No safety issues." },
            provenance_report: { score: 50, teaser: "Unclear origin.", reasoning: "No metadata found." },
            c2pa_report: { status: 'missing' },
            composite_score: 82,
            chief_officer_strategy: "Do not publish without legal review."
        } as RiskProfile,
        image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426&ixlib=rb-4.0.3',
        tenant_id: 'tenant-1'
    },
    {
        id: 'SCAN-7723-CHARLI',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date().toISOString(),
        asset_id: 'asset-003',
        filename: 'intern_meme_draft.jpg',
        file_type: 'image',
        status: 'completed',
        risk_profile: {
            verdict: 'critical',
            summary: 'Critical safety violation: NSFW content detected in background.',
            ip_report: { score: 45, teaser: "Possible unauthorized usage.", reasoning: "Internet meme format." },
            safety_report: { score: 98, teaser: "NSFW Content.", reasoning: "Adult themes detected." },
            provenance_report: { score: 95, teaser: "Screenshotted.", reasoning: "Screen capture artifacts." },
            c2pa_report: { status: 'invalid' },
            composite_score: 96,
            chief_officer_strategy: "Immediate takedown recommended."
        } as RiskProfile,
        image_url: 'https://images.unsplash.com/photo-1531297461136-82lw9z1283?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3',
        tenant_id: 'tenant-1'
    },
    {
        id: 'SCAN-1102-DELTA',
        created_at: new Date(Date.now() - 250000000).toISOString(),
        updated_at: new Date().toISOString(),
        asset_id: 'asset-004',
        filename: 'q4_financials_leaked.pdf',
        file_type: 'image',
        status: 'processing',
        risk_profile: null,
        image_url: null,
        tenant_id: 'tenant-1'
    }
]
