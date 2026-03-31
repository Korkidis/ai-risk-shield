# AI and Product Disclosures Draft

Last Updated: March 29, 2026

This document contains recommended disclaimer and disclosure copy for key product surfaces. It is not meant to replace the Privacy Policy or Terms. It is the practical copy layer that keeps the product honest and reduces legal drift between UX and policy documents.

## 1. Recommended Footer Disclaimer

Recommended replacement for the current footer text:

> AI Content Risk Score provides software-based risk signals and operational decision support for visual-content review. It does not provide legal advice or legal representation. Scan scores, provenance checks, and mitigation outputs may be incomplete or inaccurate, and final publishing, licensing, compliance, and disclosure decisions remain your responsibility.

## 2. Upload Surface Disclosure

Recommended short-form copy near the upload CTA:

> By uploading, you confirm you have the rights and permissions needed to submit this content for analysis. We use your upload to provide scan results, reports, and related services under our [Privacy Policy] and [Terms].

Optional extended version:

> Do not upload content you are not authorized to use. Results are informational only and do not replace legal or compliance review.

## 3. Email Capture / Guest Unlock Consent

Recommended copy for the email gate:

> By continuing, you agree that we may create a guest account, send you access and report emails, and process your information as described in our [Privacy Policy]. By proceeding, you also agree to our [Terms].

Important implementation note:

- The current backend auto-records privacy acceptance.
- The product should add an actual affirmative consent moment before saving that acceptance flag.

## 4. Signup / Registration Consent

Recommended signup checkbox copy:

> I agree to the [Terms] and acknowledge the [Privacy Policy].

Optional second checkbox for non-essential marketing:

> I would like to receive product updates and marketing emails. I can unsubscribe at any time.

## 5. Scan Results Disclaimer

Recommended copy in the scan drawer/report UI:

> These results are automated risk indicators, not a legal opinion. A low score does not guarantee safety, and a high score does not establish infringement or policy violation. Review the underlying asset, provenance evidence, rights chain, and intended use before publishing.

## 6. Mitigation Report Disclaimer

Recommended copy in the mitigation flow:

> Mitigation guidance is generated to help teams plan next steps. It is not legal advice, not a substitute for counsel, and not a guarantee that editing or disclosure will eliminate risk.

## 7. Share Link Notice

Recommended copy around link generation:

> Anyone with this link can view the shared scan until the link expires or is revoked. Share carefully and only with authorized recipients.

## 8. Checkout Disclosures

### Subscription checkout

Recommended short-form renewal disclosure:

> By completing this purchase, you authorize recurring charges for your selected monthly or annual plan until canceled. Your subscription renews automatically at the then-current rate unless you cancel before renewal. Usage-based overages or add-ons may be charged as described on the pricing page or your order form.

### One-time mitigation purchase

Recommended short-form disclosure:

> This is a one-time charge for the selected mitigation report or credit. Unless stated otherwise, digital purchases are non-refundable except as required by law.

## 9. Cookie/Analytics Disclosure

Recommended banner copy:

> We use essential cookies to run the site and, with your permission where required, analytics technologies to understand usage and improve the product. See our [Cookie Notice].

## 10. Marketing Claim Guardrails

Claims we should avoid unless operationally and contractually verified:

- "zero retention"
- "forensic accuracy guaranteed"
- "fully compliant"
- "copyright-safe"
- "court-defensible by itself"
- "no third party ever retains logs"

Safer alternatives:

- "plan-based retention"
- "designed for governance and review workflows"
- "risk signals and evidence support"
- "not used to train our own models"
- "intended to accelerate, not replace, legal review"
