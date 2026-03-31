# Legal Draft Pack

Drafted: March 29, 2026
Status: First draft for founder review, then attorney review

This folder contains a product-specific first draft of the legal documents and disclosures the service should have before broader launch. The drafts are written for the current AI Content Risk Score product shape:

- anonymous image scans
- email-gated report unlocks
- account workspaces and team invites
- Stripe subscriptions, one-time mitigation purchases, and metered overages
- upload and storage of customer assets
- AI processing through Gemini and provenance checks through C2PA tooling
- analytics through PostHog

Recommended launch set:

1. `privacy-policy-draft.md`
2. `terms-of-service-draft.md`
3. `cookie-notice-draft.md`
4. `ai-disclosures-draft.md`
5. `dmca-copyright-policy-draft.md`
6. `data-processing-addendum-draft.md`
7. `IMPLEMENTATION_GAPS.md`

Recommended implementation work before publishing:

1. Replace placeholder legal details.
   - Confirm legal entity name.
   - Confirm mailing address.
   - Confirm privacy/legal contact inboxes.
   - Choose governing law and venue.
   - Decide whether to use arbitration.

2. Fix consent and disclosure gaps in product UX.
   - Add an actual privacy/terms consent moment before `capture-email` writes `privacy_policy_accepted: true`.
   - Add links to Privacy Policy, Terms, and Cookie Notice at email capture, signup, and checkout.
   - Add a cookie consent banner or preference center before PostHog analytics initializes where consent is required.

3. Align marketing and legal copy with actual retention.
   - Current marketing copy says "zero retention."
   - Current product behavior sets retention windows and stores uploads/results operationally.
   - Publish only one truthful position across the site, docs, pricing, and FAQs.

4. Align operational contacts and sender domains.
   - `support@aicontentriskscore.com` appears in-app.
   - Some email code references `reports@contentriskscore.com`.
   - Team invite email uses `noreply@aicontentrisk.com`.
   - Unify this before launch.

5. Make retention promises supportable.
   - Assets receive `delete_after` timestamps, but automatic deletion should be verified and scheduled.
   - The cleanup utility currently exists as a script, not as a clearly active production retention workflow.

6. Decide enterprise privacy posture.
   - Publish a subprocessor list or keep one attached to the DPA.
   - Confirm transfer mechanisms for EEA/UK data.
   - Decide whether to appoint an EU/UK representative if actively offering services into those markets and required by law.

7. If relying on DMCA safe-harbor workflow, register a designated agent.
   - The DMCA draft includes a placeholder agent section.

Research inputs used for this draft:

- FTC disclosure and privacy guidance
- California CCPA/CPRA notice and privacy policy requirements
- GDPR/ICO transparency requirements
- EU AI Act transparency direction for synthetic media
- competitor/legal-structure review from adjacent SaaS and AI providers

Important note:

These drafts are a strong founder-ready starting point, not final legal advice. They should be reviewed by counsel before publication, especially the sections covering liability, indemnity, governing law, privacy rights, international transfers, and auto-renewal terms.
