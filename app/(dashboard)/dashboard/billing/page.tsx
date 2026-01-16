'use client'

import { useState } from 'react'
import { CreditCard, Zap, TrendingUp, HardDrive, Calendar, ExternalLink } from 'lucide-react'

export default function BillingPage() {
    const [showManageModal, setShowManageModal] = useState(false)

    // Mock data - replace with real data from your backend
    const scansUsed = 15
    const scansLimit = 50
    const scansPercentage = (scansUsed / scansLimit) * 100
    const storageUsed = 2.3
    const storageLimit = 10
    const storagePercentage = (storageUsed / storageLimit) * 100
    const costSaved = scansUsed * 29 - 49
    const daysUntilReset = 18

    return (
        <div className="p-8 max-w-4xl">
            <h1 className="text-3xl font-black text-white mb-2">Usage & Billing</h1>
            <p className="text-slate-400 mb-8">Manage your subscription and track your usage</p>

            {/* Plan Section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-white mb-1">Your Individual Plan</h2>
                        <p className="text-sm text-slate-400">$49/month • 50 scans • 10 GB storage</p>
                    </div>
                    <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all">
                        <Zap className="w-4 h-4" />
                        Upgrade to Team
                    </button>
                </div>
            </div>

            {/* Activity Section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-6">
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Activity</h2>

                {/* Scans Usage */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-300">You've validated {scansUsed} assets</p>
                        <span className="text-xs font-bold text-slate-400">{scansUsed}/{scansLimit} scans</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500"
                            style={{ width: `${scansPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Cost Savings */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <div className="text-2xl">💰</div>
                        <div>
                            <p className="text-sm font-bold text-emerald-400 mb-1">
                                You've saved ~${costSaved} vs per-scan pricing
                            </p>
                            <p className="text-xs text-slate-400">
                                ({scansUsed} scans × $29 = ${scansUsed * 29} vs your $49 plan)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Storage Usage */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-300">Storage: {storageUsed} GB used of {storageLimit} GB</p>
                        <span className="text-xs font-bold text-slate-400">{Math.round(storagePercentage)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all duration-500"
                            style={{ width: `${storagePercentage}%` }}
                        />
                    </div>
                </div>

                {/* Reset Timer */}
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Resets in {daysUntilReset} days</span>
                </div>
            </div>

            {/* Payment Method Section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-6">
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Payment Method</h2>

                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">Visa ****1234</p>
                        <p className="text-xs text-slate-400">Expires 12/27</p>
                    </div>
                </div>

                <p className="text-sm text-slate-400 mb-4">
                    Next charge: <span className="text-white font-medium">Jan 15, 2026</span> - <span className="text-white font-bold">$49.00</span>
                </p>

                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors">
                        Update Payment Method
                    </button>
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                        View Invoices
                        <ExternalLink className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Manage Subscription */}
            <div className="text-center py-4">
                <p className="text-sm text-slate-400">
                    Need to make changes?{' '}
                    <button
                        onClick={() => setShowManageModal(true)}
                        className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors underline"
                    >
                        Manage subscription
                    </button>
                </p>
            </div>

            {/* Manage Subscription Modal */}
            {showManageModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-black text-white mb-2">Manage Your Subscription</h2>
                        <p className="text-sm text-slate-400 mb-6">What would you like to do?</p>

                        <div className="space-y-3 mb-6">
                            <button className="w-full flex items-start gap-3 p-4 bg-indigo-600/10 border border-indigo-500/30 hover:bg-indigo-600/20 rounded-xl transition-colors text-left">
                                <Zap className="w-5 h-5 text-indigo-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-white">Upgrade to Team Plan</p>
                                    <p className="text-xs text-slate-400">Get 200 scans/month + 5 team members</p>
                                </div>
                            </button>

                            <button className="w-full flex items-start gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors text-left">
                                <TrendingUp className="w-5 h-5 text-slate-400 mt-0.5 rotate-180" />
                                <div>
                                    <p className="text-sm font-bold text-white">Downgrade to Free</p>
                                    <p className="text-xs text-slate-400">Keep 3 scans/month, lose full reports</p>
                                </div>
                            </button>

                            <button className="w-full flex items-start gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors text-left">
                                <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-white">Pause for 1 month</p>
                                    <p className="text-xs text-slate-400">Take a break, resume anytime</p>
                                </div>
                            </button>

                            <button className="w-full flex items-start gap-3 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors text-left">
                                <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                                    <div className="w-4 h-4 border-2 border-slate-400 rounded-full" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Cancel subscription</p>
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={() => setShowManageModal(false)}
                            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors"
                        >
                            Nevermind
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
