# Project Lessons

## Strategic
*   **"Why are we building this?"** — Ask this before every task. If the answer isn't "it makes the core loop work" or "it's what the user pays for", it's infrastructure theater. Infrastructure is seductive because it's concrete and completable. The product-defining work is ambiguous and creative. Don't hide in the former.
*   **The PDF is the product.** Everything else — the scanner, the telemetry, the Rams aesthetic — is the demo. The thing the buyer prints out and walks into legal's office with is the only thing that matters.
*   **Demo ≠ Product.** The first scan can impress for 60 seconds. The measure of a product is whether the 2nd, 3rd, and 10th interaction is as good as the 1st. Empty pages, lost data, and hardcoded counters make it a demo.
*   **Completeness over features.** The gap to monetization is not "we need more features." It's "the existing features need to work end-to-end without dead ends."

## Technical Patterns
*   **Startup Protocol**: Always check `walkthrough.md` before assuming project state. The codebase is the source of truth, the walkthrough is the honest index to it.
*   **Documentation First**: When context is missing (like Roadmap), stop and create the documentation before coding.
*   **Verification**: Never trust a "Must Have" list blindly—verify against actual code implementation (Schema/Migrations).
*   **Two pipelines = bug factory**: Authenticated (`/api/analyze`) and anonymous (`scan-processor.ts`) paths diverge in data richness, feature coverage (C2PA skipped for anon images), and storage format. Unifying them is prerequisite to everything.
*   **Don't reconstruct what's already stored**: `GET /api/scans/[id]` rebuilds a thin profile from column values instead of reading the stored `risk_profile` blob. This destroys the rich Gemini analysis.

## Supabase
*   **Auth Schema Access**: Migrations cannot modify the `auth` schema (security restriction). Functions accessing auth data must live in `public` and use `security definer` cautiously.

## Anti-Patterns to Avoid
*   **Scripted animations masquerading as real progress** — If the telemetry log says "Verifying C2PA cryptographic signature..." but the actual C2PA check didn't run, that's a lie. Users and legal teams will notice.
*   **Hardcoding dynamic values** — "3/3 REMAINING" is hardcoded. Quota counters must reflect reality.
*   **Fixing edge cases before the core loop works** — Don't spend a session on the C2PA `caution` badge color when the sample PDF can't access the real analysis data.
