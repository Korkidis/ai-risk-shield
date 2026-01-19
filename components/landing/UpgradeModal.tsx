'use client'

/**
 * UpgradeModal
 * Refactored to use RSModal and RS Design Tokens
 */

import { RSModal } from '../rs/RSModal'
import { RSButton } from '../rs/RSButton'
import { CheckCircle2, TrendingUp, Shield } from 'lucide-react'

type Props = {
  scanId: string
  onClose: () => void
}

export function UpgradeModal({ scanId, onClose }: Props) {

  const handlePurchase = (type: 'Single' | 'Subscription') => {
    // In production, this would direct to Stripe
    const next = type === 'Single'
      ? `/dashboard?action=purchase&scanId=${scanId}`
      : `/dashboard?action=subscribe`
    window.location.href = `/signup?next=${encodeURIComponent(next)}`
  }

  return (
    <RSModal isOpen={true} onClose={onClose} size="lg" title="Complete Your Audit">
      <div className="text-center mb-12">
        <div className="inline-block px-3 py-1 bg-[var(--rs-signal)]/10 border border-[var(--rs-signal)]/20 rounded-full text-[10px] font-black text-[var(--rs-signal)] uppercase tracking-widest mb-4">Report Ready</div>
        <h2 className="text-3xl font-bold tracking-tighter mb-4 text-[var(--rs-text-primary)] uppercase">Complete Your Audit</h2>
        <p className="text-[var(--rs-text-secondary)] text-sm max-w-md mx-auto leading-relaxed">The sample report provides the 'Why'. The Full Report provides the 'How to Fix' and legal mitigation details.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Option 1: One Time */}
        <div className="bg-[var(--rs-bg-secondary)] p-8 rounded-[2.5rem] border border-[var(--rs-border-primary)] flex flex-col group hover:border-[var(--rs-border-focus)] transition-all relative overflow-hidden">
          <h3 className="font-bold text-xl mb-3 text-[var(--rs-text-primary)] uppercase tracking-wide">Full Audit Report</h3>
          <ul className="text-xs text-[var(--rs-text-secondary)] space-y-3 mb-8 flex-grow">
            <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-[var(--rs-text-primary)]" />Full Reasoning & Logic</li>
            <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-[var(--rs-text-primary)]" />Legal Mitigation Suggestions</li>
            <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-[var(--rs-text-primary)]" />Certified Signature Log</li>
          </ul>
          <div className="text-4xl font-black mb-8 text-[var(--rs-text-primary)] font-mono">$29<span className="text-sm text-[var(--rs-text-tertiary)] font-normal">.00</span></div>
          <RSButton onClick={() => handlePurchase('Single')} variant="secondary" fullWidth>Purchase Report</RSButton>
        </div>

        {/* Option 2: Subscription */}
        <div className="bg-[var(--rs-bg-surface)] p-8 rounded-[2.5rem] border-2 border-[var(--rs-border-focus)] flex flex-col relative overflow-hidden shadow-[var(--rs-shadow-l2)] scale-105 z-10">
          <div className="absolute top-6 right-[-30px] bg-[var(--rs-signal)] text-white text-[8px] font-black px-10 py-1 rotate-45 uppercase tracking-widest shadow-lg">Save 50%</div>
          <h3 className="font-bold text-xl mb-3 text-[var(--rs-text-primary)] uppercase tracking-wide">Pro Membership</h3>
          <ul className="text-xs text-[var(--rs-text-secondary)] space-y-3 mb-8 flex-grow">
            <li className="flex items-center"><TrendingUp className="w-4 h-4 mr-2 text-[var(--rs-text-primary)]" />Unlimited Full Reports</li>
            <li className="flex items-center"><Shield className="w-4 h-4 mr-2 text-[var(--rs-text-primary)]" />C2PA Content Credentials</li>
            <li className="flex items-center"><TrendingUp className="w-4 h-4 mr-2 text-[var(--rs-text-primary)]" />Priority API Endpoints</li>
          </ul>
          <div className="mb-8">
            <p className="text-[10px] text-[var(--rs-text-tertiary)] uppercase tracking-widest font-bold">Starting At</p>
            <div className="inline-flex items-baseline">
              <span className="text-[var(--rs-text-primary)] text-4xl font-black font-mono">$49.99</span>
              <span className="text-[var(--rs-text-secondary)] text-sm font-medium ml-1">/mo</span>
            </div>
          </div>

          <RSButton onClick={() => handlePurchase('Subscription')} variant="primary" fullWidth className="mb-4">
            Start Launch Special
          </RSButton>

          <button
            onClick={() => {
              onClose();
              document.getElementById('compare-plans')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-[10px] font-bold text-[var(--rs-text-tertiary)] hover:text-[var(--rs-text-primary)] uppercase tracking-widest text-center transition-colors"
          >
            Compare Plans & Features &rarr;
          </button>
        </div>
      </div>
    </RSModal>
  )
}
