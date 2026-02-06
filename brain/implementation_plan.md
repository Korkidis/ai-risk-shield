# Implementation Plan - Magic Link Reliability

## SPECIFICATION (The Mini Spec)

### User Story
As an unauthenticated user, I want to receive a secure login link via email immediately after requesting it, so that I can access my dashboard without remembering a password.

### Acceptance Criteria
1.  **Form Submission**: User enters email -> UI shows "Sending..." spinner -> Replaces form with "Check your email" success message.
2.  **Email Delivery**: Email arrives in inbox within 60 seconds.
3.  **Email Content**:
    *   **Subject**: "Log in to AI Risk Shield" (or similar clear subject).
    *   **Sender**: "AI Risk Shield <[configured-email]>" (Must not be a generic "Acme" or default address).
    *   **Body**: Contains a clear, clickable Magic Link.
4.  **Authentication**: Clicking the link redirects to `/dashboard` and establishes a valid Supabase session.
5.  **Error Handling**: Rate limits or API failures display user-friendly error messages (not default alerts).

### Edge Cases
*   **Spam Filtering**: Email lands in Spam (Requires configuring DKIM/SPF - verified via Resend dashboard).
*   **Invalid Email**: Client-side validation blocks submission.
*   **Expired Link**: User clicks old link -> Redirects to login with "Link expired" message.
*   **Cross-Device**: User requests on Desktop, opens link on Mobile -> Should still work (Magic Link standard behavior).

### UI Rules
*   **Typography**: Use `.rs-type-label` for inputs, `.rs-header-bold-italic` for the success message.
*   **Spacing**: Maintain "Forensic" grid alignment (24px/120px).
*   **Feedback**: Use `--rs-safe` (Green) for success state, `--rs-signal` (Orange/Red) for errors.
*   **Input Style**: "Recessed Bay" (Inset shadow) per `DESIGN_CONTEXT.md`.

### Tracking
*   Log `SIGN_IN_ATTEMPT` event (if analytics exist).
*   Supabase automatically logs auth events.

---

## User Review Required
> [!IMPORTANT]
> This plan focuses on **Configuration and Verification** rather than heavy code changes, unless the `login-form` is finding to be broken. The primary work is ensuring the `Resend` + `Supabase` integration is correct.

## Proposed Changes

### Configuration
*   **Verify Environment Variables**: Check `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and Resend API keys in Vercel/Supabase dashboard (via User or `test-login.ts`).

### Codebase
#### [MODIFY] [login-page](file:///Users/lastknowngood/Documents/Projects/ai-risk-sheild/app/(auth)/login/page.tsx)
*   Review form submission logic.
*   Ensure error handling is visible and styled correctly (`.rs-signal` for errors).
*   Verify `redirectTo` parameter points to `/auth/callback`.

#### [NEW] [test-email-delivery](file:///Users/lastknowngood/Documents/Projects/ai-risk-sheild/check-email-config.ts)
*   Create a script to explicitly test the Resend integration in isolation if `test-login.ts` is insufficient.

## Verification Plan

### Automated Tests
*   **Run `test-login.ts`**: `npx ts-node test-login.ts` (if applicable) to verify Supabase connection and basic auth flow.

### Manual Verification
1.  **Browser Flow**:
    *   Navigate to `/login`.
    *   Enter `test-[timestamp]@example.com` (or a real email accessable to user).
    *   Click "Send Magic Link".
    *   **Expect**: UI shows success message.
2.  **Email Receipt**:
    *   Check inbox for the email.
    *   **Expect**: Correct "From" name and Subject.
3.  **Login**:
    *   Click the link.
    *   **Expect**: Redirect to `/dashboard`.
