# AI Content Governance MVP

## User Story
- A marketing manager, brand lead, or in-house legal reviewer lands on the homepage after seeing new AI lawsuit headlines and wants two things fast: a defensible public signal that the risk landscape is real, and a clear path to learn how enterprise teams govern AI content before publishing.
- They do not want a generic blog. They want an authoritative, structured knowledge surface that explains why provenance, brand rules, human review, and indemnity all matter together.

## Acceptance Criteria
- The homepage section currently rendered by `components/landing/MarketExposure.tsx` is replaced by a data-backed `AI Content Governance Index` experience.
- The primary homepage metric is sourced from real public data and clearly labeled with update date, source count, and methodology framing.
- The section includes a credible path into a crawlable governance destination rather than dead marketing copy.
- A new `AI Content Governance` hub route exists and links to non-redundant guide pages with distinct user intent.
- Each guide page has page-specific metadata, canonical URL support, and machine-readable schema aligned with the page type.
- The implementation uses typed content/data in-repo rather than hardcoded JSX strings scattered across multiple files.
- The design remains consistent with the existing forensic / Rams-inspired system and works on mobile and desktop.

## Edge Cases
- If JavaScript is disabled, the homepage metric still renders a correct static value.
- If reduced-motion is enabled, any metric animation is skipped.
- If a metric is not directly quantifiable from public sources, it must render as a labeled count or range, not a fake precise number.
- If future pages are not yet implemented, the hub must not contain dead links.
- If `NEXT_PUBLIC_SITE_URL` is missing, metadata and sitemap must fall back safely to `http://localhost:3000`.

## UI Rules
- Preserve the current landing flow hierarchy: hero scanner first, governance index second, protocol/pricing/trust after.
- The governance section must feel more like an instrument panel than a marketing card deck.
- Lead with one large number, then support it with smaller operational signals.
- Keep the copy chunked for skim reading: short labels, short body copy, compact evidence notes, strong section headers.
- Use existing tokens and `RSPanel`; no new visual language.
- Mobile layout must stack cleanly without clipping micro-labels or metadata.

## Tracking
- Rely on existing PostHog pageviews for new governance routes.
- Add a focused homepage CTA event for clicks from the governance index into the governance hub.
- Defer deeper content analytics until the hub proves demand.

## Information Architecture

### Section Name
- `AI Content Governance`

### Hub Route
- `/ai-content-governance`
- Purpose: collection page for enterprise-safe AI content operations, risk index summary, and clear pathway into deeper guides.

### Guide Pages
- `/ai-content-governance/risk-index`
  - Search intent: `ai copyright lawsuit tracker`, `ai risk exposure`, `ai copyright cases 2026`
  - Job: prove the market is moving and explain the index methodology.
- `/ai-content-governance/indemnity-controls`
  - Search intent: `ai indemnity enterprise`, `is ai indemnity enough`, `ai contract guardrails`
  - Job: explain why indemnity is the last layer, not the governance model.
- `/ai-content-governance/content-credentials`
  - Search intent: `c2pa enterprise`, `content credentials workflow`, `provenance for marketing teams`
  - Job: connect provenance to approval, audit, and dispute response.
- `/ai-content-governance/human-review-workflows`
  - Search intent: `human in the loop ai marketing`, `ai approval workflow`, `legal review workflow ai content`
  - Job: show how AI content review becomes scalable without blocking creative teams.
- `/ai-content-governance/brand-policy-controls`
  - Search intent: `brand guidelines ai policy`, `ai content governance rules`, `ai marketing policy controls`
  - Job: show how existing content-team controls map cleanly into AI-era workflows.

## Content Chunking Strategy
- Use direct-answer intros near the top of each page.
- Follow with 3-5 operational sections, each centered on one decision or control layer.
- End with short FAQs on the page surface for answer engines and skimmers, but do not depend on FAQ rich results.
- Keep each guide distinct by decision type:
  - `risk-index` = market proof
  - `indemnity-controls` = contractual backstop vs operating model
  - `content-credentials` = provenance and evidence
  - `human-review-workflows` = process and sign-off
  - `brand-policy-controls` = rules and governance thresholds

## Metadata Strategy
- Root metadata should define `metadataBase`, title template, canonical behavior, and Open Graph defaults.
- The hub should use `CollectionPage` / `ItemList` style schema.
- The `risk-index` page should expose `Dataset` schema plus breadcrumb schema because the page is built around a public tracked index.
- Guide pages should use `Article` schema plus breadcrumb schema.
- Use `last updated` dates in-page and in schema.
- Keep internal linking tight: homepage -> hub -> guide pages -> scanner CTA.
- Add `robots.ts` and `sitemap.ts` so new routes are discoverable without a CMS.

## Data Model
- `riskIndexSnapshot`
  - `asOf`
  - `knownSettlementTotalUsd`
  - `trackedCaseCountLabel`
  - `recentFilings`
  - `sourceCount`
  - `methodology`
- `riskWatchItems`
  - `title`
  - `date`
  - `category`
  - `status`
  - `summary`
  - `sourceUrl`
- `governanceGuides`
  - `slug`
  - `title`
  - `description`
  - `audience`
  - `intent`
  - `updatedAt`
  - `sections`
  - `faq`

## Build Notes
- Keep the first version fully static and typed in-repo.
- Do not scrape or imply live legal completeness.
- Phrase the homepage number as `known public settlement dollars tracked` or similar, not `all AI lawsuit dollars`.
- Reuse the same data source for homepage, hub, guide pages, and sitemap generation.
