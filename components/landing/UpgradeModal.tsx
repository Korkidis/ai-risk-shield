'use client'

/**
 * UpgradeModal
 * PORTED DIRECTLY FROM HTML REFERENCE (#modal-upgrade)
 */

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl" onClick={onClose}></div>
      <div className="relative glass max-w-3xl w-full rounded-[3rem] p-8 md:p-12 shadow-2xl border-white/5 bg-[#020617]">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Report Ready</div>
          <h2 className="text-4xl font-bold tracking-tighter mb-4 text-white">Complete Your Audit</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">The sample report provides the 'Why'. The Full Report provides the 'How to Fix' and legal mitigation details.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Option 1: One Time */}
          <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800 flex flex-col group hover:border-slate-700 transition-all">
            <h3 className="font-bold text-xl mb-3 text-white">Full Audit Report</h3>
            <ul className="text-xs text-slate-500 space-y-3 mb-8 flex-grow">
              <li className="flex items-center"><svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" /></svg>Full Reasoning & Logic</li>
              <li className="flex items-center"><svg class="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" /></svg>Legal Mitigation Suggestions</li>
              <li className="flex items-center"><svg class="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" /></svg>Certified Signature Log</li>
            </ul>
            <div className="text-4xl font-black mb-8 text-white">$29<span className="text-sm text-slate-500 font-normal">.00</span></div>
            <button onClick={() => handlePurchase('Single')} className="w-full bg-white text-slate-900 font-bold py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all">Purchase Report</button>
          </div>

          {/* Option 2: Subscription */}
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] border border-indigo-400 flex flex-col relative overflow-hidden shadow-2xl shadow-indigo-500/20">
            <div className="absolute top-6 right-[-30px] bg-white text-indigo-600 text-[8px] font-black px-10 py-1 rotate-45 uppercase tracking-widest shadow-lg">Save 50%</div>
            <h3 className="font-bold text-xl mb-3 text-white">Pro Membership</h3>
            <ul className="text-xs text-indigo-100/70 space-y-3 mb-8 flex-grow">
              <li className="flex items-center"><svg className="w-4 h-4 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" /></svg>Unlimited Full Reports</li>
              <li className="flex items-center"><svg className="w-4 h-4 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" /></svg>C2PA Content Credentials</li>
              <li className="flex items-center"><svg className="w-4 h-4 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" /></svg>Priority API Endpoints</li>
            </ul>
            <div className="mb-8">
              <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-bold">Starting At</p>
              <div className="inline-flex items-baseline">
                <span className="text-white text-4xl font-black">$49.99</span>
                <span className="text-indigo-200 text-sm font-medium ml-1">/mo</span>
              </div>
            </div>

            <button onClick={() => handlePurchase('Subscription')} className="w-full bg-slate-950 text-white font-bold py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-black transition-all mb-4">
              Start Launch Special
            </button>

            <button
              onClick={() => {
                onClose();
                document.getElementById('compare-plans')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-[10px] font-bold text-white/70 hover:text-white uppercase tracking-widest text-center"
            >
              Compare Plans & Features &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
