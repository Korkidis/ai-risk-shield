'use client'

export function SubscriptionComparison() {
    return (
        <section id="compare-plans" className="py-24 border-t border-slate-800 bg-[#020617]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Enterprise-Grade Protection</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        Choose the level of forensic depth your organization requires.
                    </p>
                </div>

                <div className="grid md:grid-cols-5 gap-4">
                    {/* Feature Legend */}
                    <div className="hidden md:block col-span-1 space-y-4 pt-48 pr-4">
                        <FeatureLabel label="Monthly Scans" />
                        <FeatureLabel label="User Seats" />
                        <FeatureLabel label="Forensic Depth" />
                        <FeatureLabel label="Video Analysis" />
                        <FeatureLabel label="Brand Guidelines" />
                        <FeatureLabel label="API Access" />
                        <FeatureLabel label="Support" />
                    </div>

                    {/* FREE TIER */}
                    <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 relative flex flex-col">
                        <div className="mb-6 text-center h-32">
                            <h3 className="text-lg font-bold text-white mb-2">Free</h3>
                            <div className="text-2xl font-bold text-slate-400">$0</div>
                            <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-widest">Public Anonymity</p>
                        </div>
                        <div className="space-y-4 mb-8 flex-grow">
                            <FeatureCheck value="3 / mo" />
                            <FeatureCheck value="1" />
                            <FeatureCheck value="Teaser Only" />
                            <FeatureCheck value={false} />
                            <FeatureCheck value={false} />
                            <FeatureCheck value={false} />
                            <FeatureCheck value="Community" />
                        </div>
                        <button className="w-full py-3 rounded-xl border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest opacity-50 cursor-not-allowed">
                            Current Plan
                        </button>
                    </div>

                    {/* INDIVIDUAL TIER */}
                    <div className="bg-indigo-900/10 border border-indigo-500/30 rounded-3xl p-6 relative flex flex-col shadow-xl shadow-indigo-900/10">
                        <div className="mb-6 text-center h-32">
                            <h3 className="text-lg font-bold text-white mb-2">Individual</h3>
                            <div className="text-2xl font-bold text-white">$49<span className="text-sm font-normal text-indigo-300">/mo</span></div>
                            <p className="text-indigo-300 text-[10px] mt-2 uppercase tracking-widest">For Creators</p>
                        </div>
                        <div className="space-y-4 mb-8 flex-grow">
                            <FeatureCheck value="50 / mo" highlighted />
                            <FeatureCheck value="1" />
                            <FeatureCheck value="Full Report" highlighted />
                            <FeatureCheck value={false} />
                            <FeatureCheck value={false} />
                            <FeatureCheck value={false} />
                            <FeatureCheck value="Email" />
                        </div>
                        <button className="w-full py-3 rounded-xl bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-500 transition-colors">
                            Start Trial
                        </button>
                    </div>

                    {/* TEAM TIER */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-6 relative flex flex-col">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-slate-900 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest">
                            Popular
                        </div>
                        <div className="mb-6 text-center h-32">
                            <h3 className="text-lg font-bold text-white mb-2">Team</h3>
                            <div className="text-2xl font-bold text-white">$199<span className="text-sm font-normal text-slate-400">/mo</span></div>
                            <p className="text-slate-400 text-[10px] mt-2 uppercase tracking-widest">Small Agencies</p>
                        </div>
                        <div className="space-y-4 mb-8 flex-grow">
                            <FeatureCheck value="200 / mo" />
                            <FeatureCheck value="5" />
                            <FeatureCheck value="Full Report" />
                            <FeatureCheck value="Included" />
                            <FeatureCheck value={true} />
                            <FeatureCheck value={true} />
                            <FeatureCheck value="Priority" />
                        </div>
                        <button className="w-full py-3 rounded-xl border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">
                            Contact Sales
                        </button>
                    </div>

                    {/* AGENCY TIER */}
                    <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 relative flex flex-col">
                        <div className="mb-6 text-center h-32">
                            <h3 className="text-lg font-bold text-slate-400 mb-2">Agency</h3>
                            <div className="text-2xl font-bold text-slate-400">$599<span className="text-sm font-normal text-slate-500">/mo</span></div>
                            <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-widest">Enterprise Vol</p>
                        </div>
                        <div className="space-y-4 mb-8 flex-grow">
                            <FeatureCheck value="1,000 / mo" />
                            <FeatureCheck value="15" />
                            <FeatureCheck value="Full Report" />
                            <FeatureCheck value="Included" />
                            <FeatureCheck value={true} />
                            <FeatureCheck value={true} />
                            <FeatureCheck value="Dedicated" />
                        </div>
                        <button className="w-full py-3 rounded-xl border border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
                            Book Demo
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

function FeatureLabel({ label }: { label: string }) {
    return <div className="h-10 flex items-center text-sm font-medium text-slate-400">{label}</div>
}

function FeatureCheck({ value, highlighted = false }: { value: string | boolean, highlighted?: boolean }) {
    return (
        <div className="h-10 flex items-center justify-center md:justify-center border-b border-white/5 last:border-0 md:border-0">
            <span className="md:hidden text-xs text-slate-500 mr-auto">Feature:</span>
            {typeof value === 'boolean' ? (
                value ? (
                    <svg className={`w-5 h-5 ${highlighted ? 'text-indigo-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <span className="text-slate-700">-</span>
                )
            ) : (
                <span className={`text-sm font-bold ${highlighted ? 'text-white' : 'text-slate-300'}`}>{value}</span>
            )}
        </div>
    )
}
