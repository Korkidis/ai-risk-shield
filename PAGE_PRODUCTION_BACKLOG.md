# Page Production Backlog

Last updated: 2026-03-25
Owner: product + design + engineering
Purpose: canonical queue and review standard for getting every customer-facing page production-ready

## Status Legend

- `[ ]` not reviewed
- `[~]` in progress
- `[x]` production-ready
- `[!]` known blocker or known truth gap

## Definition Of Production-Ready

A page is only ready when all of the following are true:

- its claims match current product reality
- it speaks to the user's exact moment and next decision
- primary and fallback CTAs are clear
- loading, empty, error, gated, expired, and recovery states are handled where relevant
- the page works inside its shared shell
- laptop and mobile layouts both hold together
- critical review has been completed
- verification was run or the gap was documented

## Review Workflow

Run `.agent/workflows/page_audit_pipeline.md` for every item below.

## Shared Surfaces

| Status | Surface | Scope | Review Focus |
| --- | --- | --- | --- |
| [!] | Root layout | `app/layout.tsx` | Metadata and structured data still describe outdated offer language; review global truth and public SEO framing |
| [!] | Marketing header | `components/layout/Header.tsx` | Simplify theater, confirm nav labels, confirm CTA behavior from non-home routes |
| [!] | Auth shell | `app/(auth)/layout.tsx` | Broken `/help` link, recovery/navigation language, shell calmness |
| [ ] | Dashboard shell | `app/(dashboard)/layout.tsx` | Authenticated vs anonymous chrome, overflow, entry/exit continuity |
| [!] | Recovery surfaces | `app/error.tsx`, `app/not-found.tsx`, `app/(dashboard)/dashboard/error.tsx` | Replace gimmickry with calm, useful recovery paths |

## Queue Order: Lesser Pages To Home Page

| Order | Status | Route | Why This Comes Now | Review Focus |
| --- | --- | --- | --- | --- |
| 1 | [!] | `/forgot-password` | Lowest-complexity support page with a functional gap | Wire the action, remove dead-end form behavior, make recovery copy plain and trustworthy |
| 2 | [!] | `/dashboard/help` | High-trust support page with known methodology drift | Sync scoring, pricing, entitlement, model, and reporting language to reality |
| 3 | [ ] | `/login` | Core auth entry point | Tone for anxious return users, error clarity, redirect continuity, trust cues |
| 4 | [ ] | `/register` | Core auth conversion page | Explain value and account creation clearly without theater, confirm CTA and redirect continuity |
| 5 | [ ] | `/dashboard/brand-guidelines` | Secondary product surface used by serious accounts | Empty states, CRUD clarity, policy framing, scan handoff clarity |
| 6 | [ ] | `/dashboard/team` | Secondary admin surface | Feature gate explanation, empty states, invite flow clarity, seat framing |
| 7 | [ ] | `/dashboard/audit-logs` | Secondary admin surface with trust implications | Gate explanation, table states, filter states, enterprise confidence |
| 8 | [ ] | `/dashboard/scans/[id]/report` | Deep-link report surface | Print/export expectations, entitlement clarity, report framing |
| 9 | [ ] | `/ai-content-governance` | Authority hub supports trust and SEO | Hub positioning, internal consistency, next-step CTAs |
| 10 | [ ] | `/ai-content-governance/assessing-ai-content-risk` | Guide page batch starts here | Truth, flow, CTA, evidence framing |
| 11 | [ ] | `/ai-content-governance/indemnity-controls` | Guide page | Truth, flow, CTA, evidence framing |
| 12 | [ ] | `/ai-content-governance/content-credentials` | Guide page | Truth, flow, CTA, evidence framing |
| 13 | [ ] | `/ai-content-governance/human-review-workflows` | Guide page | Truth, flow, CTA, evidence framing |
| 14 | [ ] | `/ai-content-governance/brand-policy-controls` | Guide page | Truth, flow, CTA, evidence framing |
| 15 | [ ] | `/ai-content-governance/mitigation-layers` | Guide page | Truth, flow, CTA, evidence framing |
| 16 | [ ] | `/pricing` | Conversion page, but downstream pages should be stable first | Plan clarity, mitigation vs scan-report language, intent routing, CTA confidence |
| 17 | [ ] | `/scan/[id]` | Transitional public/share surface | Expired/not-found/share states, CTA back into product, public trust |
| 18 | [ ] | `/dashboard` | Transitional workspace still used in the funnel | Upload-to-processing-to-results flow, email gate, onboarding continuity |
| 19 | [ ] | `/dashboard/scans-reports` | Canonical product page | End-to-end product review, bulk states, drawer flow, purchase/gating clarity |
| 20 | [ ] | `/` | Home page comes last so downstream promises are stable first | Hero promise, upload flow, proof stack, CTA sequencing, final holistic pass |

## Post-Launch Growth Work (SEO + AEO)

These items come after the core production pass above. They are growth work, not launch blockers.

### Shared SEO + AEO Tasks

- [ ] Add route-level metadata for the homepage, pricing, and all new commercial intent pages with query-aligned titles and meta descriptions
- [ ] Expand global schema beyond `SoftwareApplication` to include `Organization` and `WebSite` where the visible content supports it
- [ ] Add contextual internal links between homepage, pricing, governance guides, and the new commercial landing pages
- [ ] Update `app/sitemap.ts` to include the new commercial routes
- [ ] Validate indexing, titles, and structured data after deploy in Google Search Console and Rich Results testing

### Commercial Intent Page Pack

| Order | Status | Route | Search Intent | Review Focus |
| --- | --- | --- | --- | --- |
| 1 | [ ] | `/ai-content-risk-scanner` | broad product-intent query: "ai content risk scanner" | direct-answer intro, scanner positioning, what is checked, proof of workflow, CTA into scan |
| 2 | [ ] | `/ai-copyright-risk-checker` | IP/legal query: "ai copyright risk checker" | copyright risk framing, escalation limits, legal-team trust, linkage into governance contract/IP guides |
| 3 | [ ] | `/c2pa-verification-tool` | provenance query: "c2pa verification tool" | content credentials explanation, provenance limits, verification workflow, relationship to broader risk scan |
| 4 | [ ] | `/brand-safety-scan-ai-images` | marketing/ad review query: "brand safety scan for ai images" | suitability review framing, human escalation triggers, paid/social/ecommerce use cases |

### Page Pack Requirements For Each Commercial Page

- [ ] Exact slug, title tag, H1, and meta description implemented as planned
- [ ] AEO-friendly structure present: direct answer, what it checks, how it works, what it does not guarantee, who uses it, FAQ, CTA
- [ ] Schema included: `WebPage`, `SoftwareApplication`, `BreadcrumbList`, `FAQPage`
- [ ] Internal links out to `/pricing`, `/ai-content-governance`, and the most relevant governance guides
- [ ] Internal links in from homepage sections, pricing, and governance content

## Not In This Queue

- `/dashboard/history` and `/dashboard/reports`
  - redirect-only routes
- `/dashboard/design-lab/*`
  - internal surfaces, not customer-facing production pages

## Known Cross-Cutting Risks To Reconcile While Working

- documentation and methodology drift versus shipped behavior
- outdated pricing/report language in support and metadata surfaces
- shell-level system theater that does not match the user's moment
- incomplete error and recovery handling on public and auth routes
- any shared issue should be fixed once in the shell and noted against all affected pages
