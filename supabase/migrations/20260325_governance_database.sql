-- ============================================================================
-- Governance Database
-- ============================================================================
-- Structured, composable, citable policy knowledge base.
-- Powers mitigation reports (real citations) and governance hub (live data).
--
-- tenant_id NULL = internal IP (shared across all tenants)
-- tenant_id set  = enterprise/agency custom policies (future CRUD)
-- ============================================================================

-- ─── governance_policies ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.governance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    domain TEXT NOT NULL CHECK (domain IN ('ip', 'safety', 'provenance', 'bias', 'disclosure')),
    scope TEXT NOT NULL CHECK (scope IN ('jurisdiction', 'platform', 'content_type', 'industry', 'general')),
    scope_value TEXT NOT NULL,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('requirement', 'prohibition', 'recommendation', 'disclosure')),
    rule_text TEXT NOT NULL,
    authority TEXT NOT NULL DEFAULT '',
    authority_url TEXT,
    effective_date DATE,
    expiry_date DATE,
    severity_weight INTEGER NOT NULL DEFAULT 50 CHECK (severity_weight >= 0 AND severity_weight <= 100),
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_governance_policies_domain_scope
    ON public.governance_policies(domain, scope, scope_value);
CREATE INDEX IF NOT EXISTS idx_governance_policies_tenant
    ON public.governance_policies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_governance_policies_tags
    ON public.governance_policies USING gin(tags);

ALTER TABLE public.governance_policies ENABLE ROW LEVEL SECURITY;

-- Service role: full access
CREATE POLICY governance_policies_service_all
    ON public.governance_policies
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Authenticated: read internal policies + own tenant policies
CREATE POLICY governance_policies_authenticated_select
    ON public.governance_policies
    FOR SELECT
    TO authenticated
    USING (tenant_id IS NULL OR tenant_id = public.user_tenant_id());

-- ─── governance_precedents ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.governance_precedents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID REFERENCES public.governance_policies(id) ON DELETE SET NULL,
    case_type TEXT NOT NULL CHECK (case_type IN ('settlement', 'ruling', 'enforcement', 'advisory', 'litigation')),
    case_ref TEXT NOT NULL,
    financial_exposure_usd BIGINT,
    relevance_score INTEGER NOT NULL DEFAULT 50 CHECK (relevance_score >= 0 AND relevance_score <= 100),
    summary TEXT NOT NULL,
    date DATE NOT NULL,
    source_url TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_governance_precedents_case_type_date
    ON public.governance_precedents(case_type, date DESC);
CREATE INDEX IF NOT EXISTS idx_governance_precedents_tags
    ON public.governance_precedents USING gin(tags);

ALTER TABLE public.governance_precedents ENABLE ROW LEVEL SECURITY;

CREATE POLICY governance_precedents_service_all
    ON public.governance_precedents
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY governance_precedents_authenticated_select
    ON public.governance_precedents
    FOR SELECT
    TO authenticated
    USING (true);

-- ─── platform_requirements ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.platform_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('ai_generated', 'synthetic_media', 'stock', 'user_generated', 'all')),
    requirement_type TEXT NOT NULL CHECK (requirement_type IN ('disclosure', 'label', 'review', 'prohibition', 'recommendation')),
    requirement_text TEXT NOT NULL,
    enforcement_level TEXT NOT NULL CHECK (enforcement_level IN ('strict', 'recommended', 'emerging')) DEFAULT 'recommended',
    last_verified_date DATE NOT NULL DEFAULT CURRENT_DATE,
    source_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_requirements_platform_content
    ON public.platform_requirements(platform, content_type);

ALTER TABLE public.platform_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY platform_requirements_service_all
    ON public.platform_requirements
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY platform_requirements_authenticated_select
    ON public.platform_requirements
    FOR SELECT
    TO authenticated
    USING (true);

-- ============================================================================
-- SEED DATA: Governance Policies
-- ============================================================================

-- ─── EU AI Act ──────────────────────────────────────────────────────────────

INSERT INTO public.governance_policies (domain, scope, scope_value, rule_type, rule_text, authority, authority_url, effective_date, severity_weight, tags) VALUES
-- Art. 50: Transparency obligations for AI-generated content
('disclosure', 'jurisdiction', 'EU', 'requirement',
 'AI-generated or manipulated image, audio, or video content (deep fakes) must be disclosed as artificially generated or manipulated when made available to the public.',
 'EU AI Act, Article 50(4)', 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
 '2026-08-02', 90, ARRAY['eu-ai-act', 'disclosure', 'deepfake', 'synthetic-media']),

('disclosure', 'jurisdiction', 'EU', 'requirement',
 'Providers of AI systems that generate synthetic audio, image, video, or text content must ensure the outputs are marked in a machine-readable format and detectable as artificially generated.',
 'EU AI Act, Article 50(2)', 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
 '2026-08-02', 85, ARRAY['eu-ai-act', 'watermarking', 'machine-readable', 'provenance']),

('ip', 'jurisdiction', 'EU', 'requirement',
 'Providers of general-purpose AI models must put in place a policy to comply with Union copyright law, including identification and compliance with text and data mining opt-outs.',
 'EU AI Act, Article 53(1)(c)', 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
 '2026-08-02', 80, ARRAY['eu-ai-act', 'copyright', 'training-data', 'opt-out']),

('safety', 'jurisdiction', 'EU', 'requirement',
 'High-risk AI systems must be designed to allow human oversight, including the ability to correctly interpret system output and to decide not to use it or override it.',
 'EU AI Act, Article 14(1-2)', 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
 '2026-08-02', 75, ARRAY['eu-ai-act', 'human-oversight', 'high-risk']),

('disclosure', 'jurisdiction', 'EU', 'requirement',
 'Deployers of AI systems that generate or manipulate text published to inform the public on matters of public interest must disclose that the content has been artificially generated or manipulated.',
 'EU AI Act, Article 50(4)', 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
 '2026-08-02', 85, ARRAY['eu-ai-act', 'disclosure', 'public-interest', 'text']),

('provenance', 'jurisdiction', 'EU', 'recommendation',
 'Content Credentials (C2PA) are recognized as a technical measure satisfying the machine-readable marking requirement under the EU AI Act transparency obligations.',
 'EU AI Act, Recital 133', 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
 '2026-08-02', 70, ARRAY['eu-ai-act', 'c2pa', 'content-credentials', 'provenance']),

-- ─── US Framework ───────────────────────────────────────────────────────────

('disclosure', 'jurisdiction', 'US', 'recommendation',
 'Federal agencies and contractors are encouraged to label AI-generated content and maintain provenance records for synthetic media used in public communications.',
 'US National AI Policy Framework, Section 4', 'https://www.whitehouse.gov/ostp/ai-bill-of-rights/',
 '2026-03-19', 60, ARRAY['us-framework', 'disclosure', 'federal', 'provenance']),

('ip', 'jurisdiction', 'US', 'recommendation',
 'Organizations deploying generative AI should implement reasonable measures to identify and mitigate copyright infringement risks in AI-generated outputs.',
 'US Copyright Office, AI and Copyright Registration Guidance', 'https://www.copyright.gov/ai/',
 '2023-03-16', 70, ARRAY['us-copyright', 'registration', 'infringement', 'generative-ai']),

('ip', 'jurisdiction', 'US', 'recommendation',
 'AI-generated works without sufficient human authorship are not eligible for copyright registration. Teams should document the extent of human creative control in AI-assisted workflows.',
 'US Copyright Office, Registration Guidance for AI-Generated Works', 'https://www.copyright.gov/ai/',
 '2023-03-16', 65, ARRAY['us-copyright', 'authorship', 'registration', 'human-control']),

('safety', 'jurisdiction', 'US', 'recommendation',
 'Organizations should implement content moderation controls for AI-generated outputs to prevent generation of harmful, deceptive, or misleading content.',
 'NIST AI Risk Management Framework 1.0, GOVERN 1.2', 'https://www.nist.gov/artificial-intelligence/executive-order-safe-secure-and-trustworthy-artificial-intelligence',
 '2024-01-30', 65, ARRAY['nist-rmf', 'content-moderation', 'safety', 'risk-management']),

-- ─── General Enterprise Governance ──────────────────────────────────────────

('provenance', 'general', 'enterprise', 'recommendation',
 'Enterprise content teams should verify Content Credentials (C2PA) on AI-generated assets before publication. Valid credentials establish chain of custody from creation tool to deployment.',
 'C2PA Specification 2.3', 'https://c2pa.org/specifications/specifications/2.3/specs/C2PA_Specification.html',
 '2026-02-09', 70, ARRAY['c2pa', 'enterprise', 'provenance', 'best-practice']),

('ip', 'general', 'enterprise', 'recommendation',
 'Before publishing AI-generated visual content, verify it does not contain recognizable protected characters, trademarks, celebrity likenesses, or derivative elements of copyrighted works.',
 'Enterprise Content Governance Best Practice', NULL,
 NULL, 75, ARRAY['enterprise', 'ip-clearance', 'visual-content', 'best-practice']),

('safety', 'general', 'enterprise', 'recommendation',
 'All AI-generated content intended for commercial use should be evaluated against target platform policies and brand safety standards before distribution.',
 'Enterprise Content Governance Best Practice', NULL,
 NULL, 60, ARRAY['enterprise', 'brand-safety', 'platform-policy', 'best-practice']),

('disclosure', 'general', 'enterprise', 'recommendation',
 'Maintain an audit trail documenting the creation, review, and approval of AI-generated assets. Include the generation tool, prompt context, reviewer identity, and approval timestamp.',
 'Enterprise Content Governance Best Practice', NULL,
 NULL, 55, ARRAY['enterprise', 'audit-trail', 'documentation', 'best-practice']),

('bias', 'general', 'enterprise', 'recommendation',
 'AI-generated visual content should be reviewed for representation bias, cultural sensitivity, and stereotyping before use in public-facing campaigns, particularly across diverse markets.',
 'Enterprise Content Governance Best Practice', NULL,
 NULL, 50, ARRAY['enterprise', 'bias', 'representation', 'dei']),

-- ─── Industry-Specific ──────────────────────────────────────────────────────

('safety', 'industry', 'pharmaceutical', 'requirement',
 'AI-generated imagery used in pharmaceutical marketing must comply with FDA promotional labeling requirements and may not depict unapproved indications or misleading treatment outcomes.',
 'FDA 21 CFR Part 202', 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-C/part-202',
 NULL, 85, ARRAY['pharma', 'fda', 'promotional', 'regulated']),

('safety', 'industry', 'financial_services', 'requirement',
 'AI-generated content used in financial services marketing must not contain misleading claims about returns, risks, or guarantees. All performance representations must be substantiated.',
 'SEC Marketing Rule 206(4)-1', 'https://www.sec.gov/rules/final/2020/ia-5653.pdf',
 NULL, 80, ARRAY['financial', 'sec', 'marketing-rule', 'regulated']),

('disclosure', 'industry', 'food_beverage', 'recommendation',
 'AI-generated food imagery should accurately represent the product. Synthetic enhancements that materially misrepresent product appearance may violate FTC deceptive advertising guidelines.',
 'FTC Act Section 5, Deceptive Advertising', 'https://www.ftc.gov/legal-library/browse/statutes/federal-trade-commission-act',
 NULL, 60, ARRAY['food-beverage', 'ftc', 'advertising', 'product-imagery']);

-- ============================================================================
-- SEED DATA: Governance Precedents
-- ============================================================================

INSERT INTO public.governance_precedents (case_type, case_ref, financial_exposure_usd, relevance_score, summary, date, source_url, tags) VALUES

('settlement', 'Anthropic Authors Class Action Settlement',
 1500000000, 95,
 'Anthropic proposed a $1.5 billion settlement with authors over AI training data copyright claims. Establishes a nine-figure financial anchor for AI copyright exposure and signals that large-scale training on copyrighted works carries material financial risk.',
 '2025-09-05',
 'https://www.investing.com/news/stock-market-news/anthropic-agrees-to-pay-15-billion-to-settle-author-class-action-4227408',
 ARRAY['copyright', 'training-data', 'settlement', 'landmark']),

('ruling', 'Getty Images v. Stability AI',
 NULL, 90,
 'Getty Images sued Stability AI for training Stable Diffusion on millions of copyrighted images without license. A landmark case testing whether AI model training constitutes copyright infringement under both US and UK law.',
 '2023-01-17',
 'https://copyrightalliance.org/copyright-stories-february-2026/',
 ARRAY['copyright', 'image-generation', 'training-data', 'landmark']),

('ruling', 'New York Times v. OpenAI & Microsoft',
 NULL, 90,
 'The New York Times sued OpenAI and Microsoft alleging ChatGPT reproduces copyrighted articles verbatim. Tests whether generative AI outputs that closely match training data constitute infringement.',
 '2023-12-27',
 'https://copyrightalliance.org/copyright-stories-february-2026/',
 ARRAY['copyright', 'text-generation', 'reproduction', 'landmark']),

('litigation', 'Runway Synthetic Media Filing Burst (3 cases)',
 NULL, 80,
 'Three new Runway-related copyright complaints filed in February 2026 alone, targeting synthetic video generation. Demonstrates that visual AI generation is a highly volatile, actively targeted legal vector with compounding litigation volume.',
 '2026-02-27',
 'https://copyrightalliance.org/copyright-stories-february-2026/',
 ARRAY['copyright', 'video-generation', 'synthetic-media', 'runway']),

('ruling', 'Andersen v. Stability AI, Midjourney & DeviantArt',
 NULL, 85,
 'Class action by visual artists alleging AI image generators trained on copyrighted artwork without permission. Tests the boundaries of fair use for AI training on visual art at scale.',
 '2023-01-13',
 'https://copyrightalliance.org/copyright-stories-february-2026/',
 ARRAY['copyright', 'visual-art', 'training-data', 'class-action']),

('advisory', 'US Copyright Office AI Registration Guidance',
 NULL, 75,
 'The US Copyright Office issued guidance that AI-generated works without sufficient human authorship are not registrable. Established that purely AI-generated outputs lack the human creativity required for copyright protection.',
 '2023-03-16',
 'https://www.copyright.gov/ai/',
 ARRAY['copyright', 'registration', 'authorship', 'guidance']),

('enforcement', 'EU AI Act Enforcement Rules Go Live',
 NULL, 85,
 'The European Union activated 50 AI Act enforcement rules governing documentation, testing, and deployment of AI systems in regulated markets. Compliance is now mandatory for enterprise teams publishing AI content into EU markets.',
 '2026-03-15',
 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai',
 ARRAY['eu-ai-act', 'enforcement', 'compliance', 'regulation']),

('advisory', 'C2PA Content Credentials 2.3 Released',
 NULL, 70,
 'C2PA released version 2.3 of the Content Credentials specification with massive ecosystem adoption (6,000+ verified deployments). Establishes provenance-based workflows as realistic for mainstream enterprise content review.',
 '2026-02-09',
 'https://c2pa.org/the-c2pa-launches-content-credentials-2-3-and-celebrates-5-years-of-impact-across-the-digital-ecosystem/',
 ARRAY['c2pa', 'provenance', 'standard', 'ecosystem']),

('settlement', 'Concord Music v. Anthropic (Lyrics)',
 NULL, 80,
 'Music publishers sued Anthropic for Claude reproducing copyrighted song lyrics. Highlights that generative AI reproduction risks extend beyond images to any creative domain.',
 '2023-10-18',
 'https://copyrightalliance.org/copyright-stories-february-2026/',
 ARRAY['copyright', 'music', 'lyrics', 'reproduction']),

('ruling', 'Thomson Reuters v. ROSS Intelligence',
 NULL, 70,
 'Thomson Reuters prevailed against ROSS Intelligence for using Westlaw data to train a legal AI. Established that scraping copyrighted databases for AI training can constitute infringement even in specialized professional domains.',
 '2023-09-25',
 'https://copyrightalliance.org/copyright-stories-february-2026/',
 ARRAY['copyright', 'training-data', 'legal-ai', 'database']);

-- ============================================================================
-- SEED DATA: Platform Requirements
-- ============================================================================

INSERT INTO public.platform_requirements (platform, content_type, requirement_type, requirement_text, enforcement_level, last_verified_date, source_url) VALUES

-- Meta (Facebook/Instagram)
('Meta', 'ai_generated', 'label', 'AI-generated or AI-modified photorealistic images, videos, and audio must carry an "AI info" label. Meta may add labels automatically via C2PA/IPTC detection or require advertiser self-disclosure.', 'strict', '2026-03-01', 'https://about.meta.com/technologies/ai-labels/'),
('Meta', 'ai_generated', 'disclosure', 'Advertisers must disclose AI-generated or digitally altered content in political or social issue ads. Failure to disclose may result in ad rejection or account restriction.', 'strict', '2026-03-01', 'https://www.facebook.com/policies/ads/'),
('Meta', 'synthetic_media', 'prohibition', 'Synthetic media depicting real people saying or doing things they did not say or do is prohibited when used to deceive. Applies to deepfakes in both organic and paid content.', 'strict', '2026-03-01', 'https://transparency.meta.com/policies/community-standards/manipulated-media/'),

-- TikTok
('TikTok', 'ai_generated', 'label', 'Creators must label realistic AI-generated content (AIGC) using TikTok''s built-in AI label tool. Unlabeled AIGC that could mislead viewers about real events or people may be removed.', 'strict', '2026-03-01', 'https://www.tiktok.com/community-guidelines/en/integrity-authenticity/'),
('TikTok', 'ai_generated', 'disclosure', 'AI-generated content featuring the likeness of a real public figure must be clearly disclosed as AI-generated. Content that realistically depicts public figures endorsing products without disclosure is prohibited.', 'strict', '2026-03-01', 'https://www.tiktok.com/community-guidelines/en/integrity-authenticity/'),
('TikTok', 'synthetic_media', 'prohibition', 'Synthetic or manipulated media that depicts realistic scenes of violence, natural disasters, or public crises is prohibited if it could cause harm through deception.', 'strict', '2026-03-01', 'https://www.tiktok.com/community-guidelines/en/integrity-authenticity/'),

-- YouTube
('YouTube', 'ai_generated', 'disclosure', 'Creators must disclose when realistic-looking content was generated or significantly altered by AI, particularly content about real people, real events, or that looks realistic. Disclosure is required via Creator Studio.', 'strict', '2026-03-01', 'https://support.google.com/youtube/answer/14328491'),
('YouTube', 'ai_generated', 'label', 'YouTube may add an "Altered or synthetic content" label to videos where AI-generated content could be mistaken for real footage, especially for sensitive topics.', 'recommended', '2026-03-01', 'https://support.google.com/youtube/answer/14328491'),
('YouTube', 'synthetic_media', 'review', 'AI-generated content that simulates a real person''s face or voice may be subject to removal under YouTube''s privacy guidelines if the depicted person requests removal.', 'strict', '2026-03-01', 'https://support.google.com/youtube/answer/14328491'),

-- Google Ads
('Google Ads', 'ai_generated', 'disclosure', 'Political advertisements containing synthetic or manipulated content that depicts realistic people or events must include a prominent disclosure. Google may reject ads that fail to disclose AI alteration.', 'strict', '2026-03-01', 'https://support.google.com/adspolicy/answer/6008942'),
('Google Ads', 'ai_generated', 'recommendation', 'For non-political ads, Google recommends self-disclosure of AI-generated imagery, particularly when the content could be mistaken for photographic documentation of real events or products.', 'recommended', '2026-03-01', 'https://support.google.com/adspolicy/answer/6008942'),

-- X (Twitter)
('X', 'ai_generated', 'label', 'X applies "AI-generated" labels to synthetic media detected via C2PA metadata. Users are encouraged to self-label AI-generated content that could be perceived as authentic.', 'recommended', '2026-03-01', 'https://help.x.com/en/rules-and-policies/synthetic-and-manipulated-media-policy'),
('X', 'synthetic_media', 'prohibition', 'Synthetic or manipulated media shared with intent to deceive about real events, cause harm, or interfere with elections may be labeled, reduced in distribution, or removed.', 'strict', '2026-03-01', 'https://help.x.com/en/rules-and-policies/synthetic-and-manipulated-media-policy'),

-- LinkedIn
('LinkedIn', 'ai_generated', 'recommendation', 'LinkedIn encourages members to disclose AI-assisted content creation. While not currently required for all content, AI-generated profile photos and misleading synthetic content may be flagged or removed.', 'emerging', '2026-03-01', 'https://www.linkedin.com/legal/professional-community-policies'),
('LinkedIn', 'synthetic_media', 'prohibition', 'Synthetic media that impersonates real professionals, fabricates endorsements, or creates misleading professional credentials is prohibited under LinkedIn''s Professional Community Policies.', 'strict', '2026-03-01', 'https://www.linkedin.com/legal/professional-community-policies');

-- ============================================================================
-- Updated_at trigger for governance_policies
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_governance_policies_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER governance_policies_updated_at
    BEFORE UPDATE ON public.governance_policies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_governance_policies_updated_at();

-- Updated_at trigger for platform_requirements
CREATE OR REPLACE FUNCTION public.update_platform_requirements_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER platform_requirements_updated_at
    BEFORE UPDATE ON public.platform_requirements
    FOR EACH ROW
    EXECUTE FUNCTION public.update_platform_requirements_updated_at();
