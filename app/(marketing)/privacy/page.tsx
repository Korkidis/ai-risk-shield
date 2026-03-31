import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — AI Content Risk Score',
  description: 'How AI Content Risk Score collects, uses, and protects your personal data.',
}

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 font-sans text-[var(--rs-text-primary)]">
      <div className="mb-8">
        <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--rs-text-tertiary)] hover:text-[var(--rs-signal)] transition-colors">
          ← Back to Home
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-[var(--rs-text-secondary)] mb-1">Last Updated: March 30, 2026</p>
      <p className="text-xs text-[var(--rs-signal)] font-medium mb-10 border border-[var(--rs-signal)]/20 bg-[var(--rs-signal)]/5 px-3 py-2 rounded">
        Preview version — this policy will be reviewed by counsel before general availability.
      </p>

      <div className="prose prose-sm max-w-none space-y-8 [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-[var(--rs-text-secondary)] [&_li]:text-sm [&_li]:text-[var(--rs-text-secondary)] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">

        <p>
          This Privacy Policy describes how AI Content Risk Score (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, discloses, and otherwise processes personal data in connection with our websites, applications, dashboards, scan workflows, reports, and related services (the &quot;Services&quot;).
        </p>

        <h2>1. Scope</h2>
        <p>This Privacy Policy applies when you:</p>
        <ul>
          <li>visit our website or pricing pages;</li>
          <li>create an account or join a workspace;</li>
          <li>upload content for analysis;</li>
          <li>request a sample report or magic-link access;</li>
          <li>purchase a subscription, mitigation report, or other paid service;</li>
          <li>receive emails from us; or</li>
          <li>interact with scan results, shared links, governance guidance, or team features.</li>
        </ul>

        <h2>2. Product Context</h2>
        <p>
          AI Content Risk Score analyzes visual assets for intellectual-property risk, brand-safety signals, and provenance/content-credential information. The service helps teams review AI-generated or AI-assisted media before publication. It does not provide legal advice and does not replace human legal, compliance, or editorial review.
        </p>

        <h2>3. Personal Data We Collect</h2>

        <h3>A. Information you provide</h3>
        <ul>
          <li>Contact information: email address, company name, support correspondence.</li>
          <li>Account information: login credentials, workspace membership, team role.</li>
          <li>Billing information: subscription selections, order history. Payment card data is processed by Stripe and is not stored by us.</li>
          <li>Customer Content: images, video, brand guidelines, and other materials you upload.</li>
        </ul>

        <h3>B. Information collected automatically</h3>
        <ul>
          <li>Device and browser information: browser type, operating system, referral source.</li>
          <li>Network information: IP address (hashed for rate limiting), page visits, session identifiers, timestamps.</li>
          <li>Cookies: authentication session cookies, anonymous scan session IDs, theme preferences.</li>
        </ul>

        <h3>C. Information we generate</h3>
        <ul>
          <li>Scan results: risk scores, findings, provenance status, mitigation recommendations.</li>
          <li>Upload metadata: file type, size, checksums, retention scheduling.</li>
          <li>Workspace data: plan tier, usage counts, seat limits.</li>
        </ul>

        <h3>D. Information from third parties</h3>
        <ul>
          <li>Authentication from Supabase.</li>
          <li>Billing status from Stripe.</li>
          <li>Email delivery from Resend.</li>
          <li>AI analysis from Google Gemini API services.</li>
          <li>Hosting and infrastructure from Vercel.</li>
        </ul>

        <h2>4. How We Use Personal Data</h2>
        <ul>
          <li>To provide, operate, maintain, and improve the Services;</li>
          <li>To create and administer accounts, workspaces, and permissions;</li>
          <li>To analyze Customer Content and generate scan results and reports;</li>
          <li>To process purchases, subscriptions, and billing;</li>
          <li>To send authentication emails, reports, and service communications;</li>
          <li>To monitor abuse, prevent fraud, and enforce rate limits;</li>
          <li>To respond to support requests and comply with law.</li>
        </ul>

        <h2>5. AI Processing and Customer Content</h2>
        <ul>
          <li>We use Customer Content to provide the Services you request.</li>
          <li>We do not claim ownership of your Customer Content.</li>
          <li>We do not use your Customer Content to train our own machine-learning models.</li>
          <li>We use third-party AI providers (Google Gemini) to process Customer Content. Those providers may retain limited logs for security and abuse monitoring, subject to their own terms.</li>
          <li>AI outputs may be incomplete or inaccurate and should not replace professional judgment.</li>
        </ul>

        <h2>6. Cookies and Similar Technologies</h2>
        <p>We use cookies and similar technologies for:</p>
        <ul>
          <li>Essential authentication and session management;</li>
          <li>Anonymous scan session tracking;</li>
          <li>Theme preference storage.</li>
        </ul>
        <p>
          Non-essential analytics cookies are disabled during the preview period. When re-enabled, we will request consent where required by law.
        </p>

        <h2>7. Data Retention</h2>
        <p>
          We retain personal data for as long as reasonably necessary to provide the Services and comply with law. Uploaded assets and scan data follow plan-based retention windows (e.g., 7 days for free users, up to 730 days for enterprise plans). Billing records, audit logs, and security logs may be retained longer.
        </p>

        <h2>8. Data Sharing</h2>
        <p>We may share personal data with:</p>
        <ul>
          <li>Service providers that help us host, authenticate, analyze, bill, and support the Services;</li>
          <li>Your workspace administrators, where applicable;</li>
          <li>Payment processors and professional advisors where needed; and</li>
          <li>Regulators or law enforcement where required by law.</li>
        </ul>
        <p>We do not sell personal information. We do not share personal information for cross-context behavioral advertising.</p>

        <h2>9. International Transfers</h2>
        <p>
          We are based in the United States and may process data in the US and other countries. Where required, we use appropriate transfer mechanisms such as standard contractual clauses.
        </p>

        <h2>10. Your Rights</h2>
        <p>Depending on your location, you may have the right to access, correct, delete, restrict, or port your personal data. Contact us at <a href="mailto:support@contentriskscore.com" className="text-[var(--rs-signal)] hover:underline">support@contentriskscore.com</a> to exercise these rights.</p>

        <h2>11. Children</h2>
        <p>The Services are not directed to anyone under 18. We do not knowingly collect data from children.</p>

        <h2>12. Security</h2>
        <p>We use administrative, technical, and physical safeguards including access controls, tenant-scoped authorization, encryption in transit, and security logging. No system is completely secure.</p>

        <h2>13. Changes</h2>
        <p>We may update this Privacy Policy. Material changes will be posted here with an updated date.</p>

        <h2>14. Contact</h2>
        <p>
          AI Content Risk Score<br />
          Email: <a href="mailto:support@contentriskscore.com" className="text-[var(--rs-signal)] hover:underline">support@contentriskscore.com</a>
        </p>
      </div>

      <div className="mt-16 pt-8 border-t border-[var(--rs-border-primary)]/10 flex gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--rs-text-tertiary)]">
        <Link href="/terms" className="hover:text-[var(--rs-signal)] transition-colors">Terms of Service</Link>
        <Link href="/pricing" className="hover:text-[var(--rs-signal)] transition-colors">Pricing</Link>
      </div>
    </main>
  )
}
