# Legal and Policy Implementation Gaps

Drafted: March 29, 2026

This memo lists the product, copy, and operational gaps that should be resolved before publishing the legal drafts in `docs/legal/`.

## 1. Privacy acceptance is currently recorded without an actual acceptance step

Current state:

- `app/api/scans/capture-email/route.ts` records `privacy_policy_accepted: true` and `privacy_policy_accepted_at` in user metadata.
- The email gate UI does not currently present linked Terms/Privacy acceptance copy or an affirmative checkbox/button state tied to that acceptance.

Recommended fix:

- Add explicit guest-consent copy at the email gate.
- Link Privacy Policy and Terms directly from the gate.
- Record exactly what the user accepted and when.

## 2. PostHog analytics initializes before a consent flow exists

Current state:

- `components/PostHogProvider.tsx` initializes PostHog client-side and uses `localStorage+cookie`.
- There is no visible cookie banner or consent manager in the product.

Recommended fix:

- Gate PostHog initialization behind consent where required.
- Add a Cookie Notice link in the footer and banner.
- Add a preference-management path for analytics.

## 3. Marketing copy currently conflicts with actual retention behavior

Current state:

- `lib/marketing/plans-content.ts` says customer content is processed with "zero retention."
- The app actually stores uploads, scan results, and operational records and sets plan-based retention windows.

Recommended fix:

- Remove or revise the "zero retention" claim.
- Replace it with accurate language such as "plan-based retention" or "retention windows vary by plan and operational needs."
- Align pricing, FAQs, help docs, and legal docs to one truthful statement.

## 4. Retention workflow needs explicit production verification

Current state:

- Upload routes set `delete_after`.
- A cleanup utility exists in `scripts/cleanup-old-data.ts`.
- It is not obvious from the codebase that production deletion runs automatically on the same schedule promised to customers.

Recommended fix:

- Confirm the production deletion job exists and is active.
- If not, implement and monitor it before publishing firm retention promises.
- Consider publishing "target retention windows" until deletion is verified end to end.

## 5. Contact and sender domains are inconsistent

Current state:

- App surfaces `support@aicontentriskscore.com`.
- Some emails use `reports@contentriskscore.com`.
- Team invite email uses `noreply@aicontentrisk.com`.
- Footer references `UZUMAKI CORE INSTRUMENTS`, but legal entity formatting is not otherwise defined.

Recommended fix:

- Choose one canonical brand/legal/contact set.
- Update all transactional email senders and visible support/legal emails.
- Decide whether the public entity name will be "AI Content Risk Score" only or "[Legal Entity] d/b/a AI Content Risk Score."

## 6. Checkout and signup need legal links and auto-renew disclosures

Current state:

- The codebase has Stripe checkout flows and subscription purchases.
- No clearly surfaced short-form legal disclosure copy is evident in the current checkout entry points.

Recommended fix:

- Add linked Terms and Privacy copy near signup and upgrade CTAs.
- Add auto-renew, billing, tax, and cancellation disclosure text for subscriptions.
- Add one-time digital purchase disclosure text for mitigation purchases.

## 7. DMCA workflow is not operational yet

Current state:

- The product hosts uploaded content and generates share links.
- No designated agent or public IP-complaint process is present in the codebase.

Recommended fix:

- Decide whether to run a formal DMCA workflow.
- If yes, register the designated agent and publish the DMCA policy.
- Add an internal escalation path for non-copyright IP claims.

## 8. Enterprise privacy posture needs explicit operational support

Current state:

- A DPA draft is appropriate for the product.
- The repo does not show a public subprocessor page, audit process, or explicit SCC workflow.

Recommended fix:

- Decide whether enterprise customers will receive a signed DPA by request.
- Maintain a current subprocessor list.
- Confirm transfer mechanism language with counsel.

## 9. AI-vendor data-use claims should stay carefully qualified

Current state:

- The product uses Gemini API services for analysis.
- Some marketing language is absolute.

Recommended fix:

- Keep public claims to what is supportable, e.g. "we do not use your content to train our own models."
- Avoid broader claims like "no one ever retains anything" unless vendor terms and logs are fully verified and contractually covered.

## 10. Governing law, venue, and arbitration are open business decisions

Current state:

- No governing-law or dispute-resolution choice appears to be locked.

Recommended fix:

- Decide between court venue and arbitration before publishing Terms.
- Make sure the decision matches checkout and consumer disclosure requirements.
