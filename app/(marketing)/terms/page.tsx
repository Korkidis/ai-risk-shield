import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — AI Content Risk Score',
  description: 'Terms governing your use of AI Content Risk Score.',
}

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 font-sans text-[var(--rs-text-primary)]">
      <div className="mb-8">
        <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--rs-text-tertiary)] hover:text-[var(--rs-signal)] transition-colors">
          ← Back to Home
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-[var(--rs-text-secondary)] mb-1">Last Updated: March 30, 2026</p>
      <p className="text-xs text-[var(--rs-signal)] font-medium mb-10 border border-[var(--rs-signal)]/20 bg-[var(--rs-signal)]/5 px-3 py-2 rounded">
        Preview version — these terms will be reviewed by counsel before general availability.
      </p>

      <div className="prose prose-sm max-w-none space-y-8 [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-[var(--rs-text-secondary)] [&_li]:text-sm [&_li]:text-[var(--rs-text-secondary)] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">

        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of AI Content Risk Score&apos;s websites, applications, dashboards, scan workflows, reports, and related services (the &quot;Services&quot;). By using the Services, you agree to these Terms.
        </p>

        <h2>1. Eligibility</h2>
        <p>You may use the Services only if you are at least 18 years old, legally able to enter a binding agreement, and in compliance with these Terms and applicable law.</p>

        <h2>2. The Services</h2>
        <p>
          AI Content Risk Score provides tools to analyze images, video, and related materials for intellectual-property risk, brand-safety concerns, provenance signals, and governance considerations. We may change, improve, suspend, or discontinue any part of the Services at any time.
        </p>

        <h2>3. Accounts</h2>
        <p>You are responsible for:</p>
        <ul>
          <li>Safeguarding your login credentials and magic-link access;</li>
          <li>All activity under your account;</li>
          <li>Maintaining the confidentiality of share links you generate; and</li>
          <li>Promptly notifying us of unauthorized access.</li>
        </ul>
        <p>
          If your account belongs to a workspace, workspace administrators may control access, users, content visibility, and billing.
        </p>

        <h2>4. Customer Content</h2>
        <p>
          &quot;Customer Content&quot; means any material you upload or submit through the Services, including images, videos, brand guidelines, and related files.
        </p>
        <ul>
          <li>You retain ownership of your Customer Content.</li>
          <li>You grant us a limited license to host, process, and analyze Customer Content solely to provide the Services.</li>
          <li>We will not use your Customer Content to train our own machine-learning models without your express permission.</li>
          <li>You represent that you have the rights needed to submit your Customer Content and that it does not infringe third-party rights.</li>
        </ul>

        <h2>5. Acceptable Use</h2>
        <p>You may not use the Services to:</p>
        <ul>
          <li>Break the law or facilitate unlawful conduct;</li>
          <li>Upload content you do not have the right to use;</li>
          <li>Submit malware, exploit code, or harmful files;</li>
          <li>Interfere with the integrity or performance of the Services;</li>
          <li>Reverse engineer or scrape the Services;</li>
          <li>Generate content intended to defraud, harass, or harm others; or</li>
          <li>Exceed purchased seats, quotas, or plan limits.</li>
        </ul>

        <h2>6. AI Outputs and No Legal Advice</h2>
        <p>The Services use AI-assisted analysis to generate scores, findings, and mitigation outputs. You acknowledge that:</p>
        <ul>
          <li>Outputs may be incomplete, probabilistic, inaccurate, or inconsistent;</li>
          <li>The Services provide informational decision-support only;</li>
          <li>The Services do not provide legal advice or compliance certification;</li>
          <li>No attorney-client or professional-advisor relationship is created; and</li>
          <li>Final publication and legal decisions remain your responsibility.</li>
        </ul>

        <h2>7. Shared Links</h2>
        <p>
          Share links provide time-limited access to scan reports. Anyone with a valid link may access the shared material until it expires. You are responsible for deciding whether and with whom to share.
        </p>

        <h2>8. Fees and Billing</h2>
        <ul>
          <li>Payments are processed by Stripe. Your use of payment features is also subject to Stripe&apos;s terms.</li>
          <li>Subscriptions renew automatically until canceled. You authorize recurring charges to your payment method on file.</li>
          <li>Paid plans may include usage-based overage billing at the rates disclosed at checkout.</li>
          <li>Fees are non-refundable except as required by law or expressly stated otherwise.</li>
          <li>Fees do not include applicable taxes unless expressly stated.</li>
        </ul>

        <h2>9. Beta and Free Features</h2>
        <p>
          Free, preview, and beta features may change or be removed at any time. They are provided &quot;as is&quot; without warranties.
        </p>

        <h2>10. Intellectual Property</h2>
        <p>
          The Services, including software, design, branding, and documentation, are owned by us or our licensors. No rights are granted except the limited rights in these Terms.
        </p>

        <h2>11. Termination</h2>
        <p>
          We may suspend or terminate access if you violate these Terms, we suspect fraud, your payment fails, or we are required by law. You may stop using the Services at any time. Cancellation takes effect at the end of the current billing period.
        </p>

        <h2>12. Disclaimer of Warranties</h2>
        <p className="uppercase text-xs font-mono">
          To the maximum extent permitted by law, the Services are provided &quot;as is&quot; and &quot;as available.&quot; We disclaim all warranties, whether express, implied, or statutory, including warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that outputs will be accurate, complete, or legally sufficient.
        </p>

        <h2>13. Limitation of Liability</h2>
        <p className="uppercase text-xs font-mono">
          To the maximum extent permitted by law, we will not be liable for indirect, incidental, special, consequential, or punitive damages. Our total liability will not exceed the greater of (a) the amount you paid us in the twelve months before the claim, or (b) USD $100. Nothing limits liability that cannot be limited under applicable law.
        </p>

        <h2>14. Indemnification</h2>
        <p>
          You will defend and hold us harmless from claims arising from your Customer Content, your use of the Services, or your violation of these Terms or applicable law.
        </p>

        <h2>15. Changes</h2>
        <p>
          We may update these Terms. Material changes will be posted here with an updated date. Continued use after changes means you accept the updated Terms.
        </p>

        <h2>16. Contact</h2>
        <p>
          AI Content Risk Score<br />
          Email: <a href="mailto:support@contentriskscore.com" className="text-[var(--rs-signal)] hover:underline">support@contentriskscore.com</a>
        </p>
      </div>

      <div className="mt-16 pt-8 border-t border-[var(--rs-border-primary)]/10 flex gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--rs-text-tertiary)]">
        <Link href="/privacy" className="hover:text-[var(--rs-signal)] transition-colors">Privacy Policy</Link>
        <Link href="/pricing" className="hover:text-[var(--rs-signal)] transition-colors">Pricing</Link>
      </div>
    </main>
  )
}
