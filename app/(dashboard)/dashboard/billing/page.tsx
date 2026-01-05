import { getCurrentUser, getTenant } from '@/lib/supabase/auth'
import { getMonthlyUsage } from '../actions'
import { redirect } from 'next/navigation'
import { UpgradeButton as ClientUpgradeButton } from '@/components/billing/UpgradeButton'

export default async function BillingPage() {
    const user = await getCurrentUser()
    const tenant = await getTenant()
    const usage = await getMonthlyUsage()

    if (!tenant) redirect('/')

    // @ts-ignore
    const planName = tenant.plan
    const isFree = planName === 'free'

    return (
        <div className="min-h-screen bg-deep-space py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-12">

                {/* Header */}
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 shadow-lg shadow-indigo-500/10">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Billing & Clearance</h1>
                        <p className="mt-1 text-slate-400 font-medium">Manage agency subscription and funding channels.</p>
                    </div>
                </div>

                {/* Current Plan Card */}
                <div className="glass-panel p-10 rounded-3xl relative overflow-hidden group border border-slate-700 hover:border-indigo-500/30 transition-all">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-600/20 transition-all duration-500"></div>

                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xs font-black text-indigo-300 uppercase tracking-[0.25em] mb-2">Current Clearance</h2>
                                <div className="flex items-center gap-4">
                                    <span className="text-5xl font-black text-white capitalize drop-shadow-lg">{planName}</span>
                                    {isFree ? (
                                        <span className="px-4 py-1.5 rounded-full bg-slate-700/50 border border-slate-600 text-[10px] font-black uppercase text-slate-300 tracking-wider">Restricted</span>
                                    ) : (
                                        <span className="px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-[10px] font-black uppercase text-indigo-300 tracking-wider shadow-[0_0_10px_rgba(99,102,241,0.3)]">Active</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    <span>Operation Cycle Usage</span>
                                    <span className="text-white">{Math.round((usage.used / (usage.limit === -1 ? 1 : usage.limit)) * 100)}%</span>
                                </div>
                                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000"
                                        style={{ width: `${Math.min(100, (usage.used / (usage.limit === -1 ? 1 : usage.limit)) * 100)}%` }}
                                    ></div>
                                </div>
                                <p className="mt-3 text-sm text-slate-500 font-medium">
                                    <strong className="text-white">{usage.used}</strong> / {usage.limit === -1 ? 'Unlimited' : usage.limit} scans executed.
                                </p>
                            </div>
                        </div>

                        <div className="h-full flex items-center justify-end">
                            {isFree ? (
                                <div className="w-full bg-slate-900/50 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-md">
                                    <h3 className="font-bold text-2xl text-white mb-2">Upgrade to Pro</h3>
                                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                        Unlock deep forensic analysis, videoframe decoding, and increased API throughput.
                                    </p>
                                    <ClientUpgradeButton scanId="dashboard_upgrade" />
                                </div>
                            ) : (
                                <div className="text-right space-y-4">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Next Billing Cycle</p>
                                        <p className="text-xl font-bold text-white mt-1">Feb 4, 2026</p>
                                    </div>
                                    <button disabled className="px-6 py-3 border border-slate-700 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white hover:border-slate-500 transition-all cursor-not-allowed">
                                        Manage via Stripe Portal
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
