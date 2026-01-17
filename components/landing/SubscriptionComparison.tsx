'use client'

import { RSButton } from "../rs/RSButton"

export function SubscriptionComparison() {
    return (
        <section id="pricing" className="py-24 border-t border-rs-gray-200 bg-rs-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-rs-black mb-6 tracking-tighter">Enterprise-Grade Protection</h2>
                    <p className="text-rs-gray-600 max-w-2xl mx-auto text-lg font-medium">
                        Choose the level of forensic depth your organization requires.
                    </p>
                </div>

                <div className="grid md:grid-cols-5 gap-4 mb-24">
                    {/* Feature Legend */}
                    <div className="hidden md:block col-span-1 space-y-4 pt-48 pr-4">
                        <FeatureLabel label="Monthly Scans" />
                        <FeatureLabel label="User Seats" />
                        <FeatureLabel label="Forensic Depth" />
                        <FeatureLabel label="Video Analysis" />
                        <FeatureLabel label="Guidelines/Policies" />
                        <FeatureLabel label="API Access" />
                        <FeatureLabel label="Support" />
                    </div>

                    {/* FREE TIER */}
                    <PricingCard
                        title="Free"
                        price="$0"
                        priceSub=""
                        description="Public Anonymity"
                        action={<RSButton variant="secondary" fullWidth onClick={() => window.location.reload()}>Start Free</RSButton>}
                    >
                        <FeatureCheck value="3 / mo" />
                        <FeatureCheck value="1" />
                        <FeatureCheck value="Teaser Only" />
                        <FeatureCheck value={false} />
                        <FeatureCheck value={false} />
                        <FeatureCheck value={false} />
                        <FeatureCheck value="Community" />
                    </PricingCard>

                    {/* INDIVIDUAL TIER */}
                    <PricingCard
                        title="Individual"
                        price="$49"
                        priceSub="/mo"
                        description="Creators & Freelancers"
                        isSafe
                        action={<RSButton variant="primary" fullWidth>Choose Individual</RSButton>}
                    >
                        <FeatureCheck value="50 / mo" highlighted />
                        <FeatureCheck value="1" />
                        <FeatureCheck value="Full Report" highlighted />
                        <FeatureCheck value={false} />
                        <FeatureCheck value={false} />
                        <FeatureCheck value={false} />
                        <FeatureCheck value="Email" />
                    </PricingCard>

                    {/* TEAM TIER */}
                    <PricingCard
                        title="Team"
                        price="$199"
                        priceSub="/mo"
                        description="Brand + Legal Review"
                        popular
                        action={<RSButton variant="secondary" fullWidth>Choose Team</RSButton>}
                    >
                        <FeatureCheck value="200 / mo" highlighted />
                        <FeatureCheck value="5" />
                        <FeatureCheck value="Full Report" highlighted />
                        <FeatureCheck value="Included" />
                        <FeatureCheck value={true} />
                        <FeatureCheck value={true} />
                        <FeatureCheck value="Priority" />
                    </PricingCard>

                    {/* AGENCY TIER */}
                    <PricingCard
                        title="Agency"
                        price="$599"
                        priceSub="/mo"
                        description="High-Volume Workflows"
                        action={<RSButton variant="secondary" fullWidth>Contact Sales</RSButton>}
                    >
                        <FeatureCheck value="1,000 / mo" />
                        <FeatureCheck value="15" />
                        <FeatureCheck value="Full Report" />
                        <FeatureCheck value="Included" />
                        <FeatureCheck value={true} />
                        <FeatureCheck value={true} />
                        <FeatureCheck value="Dedicated" />
                    </PricingCard>
                </div>

                {/* ENTERPRISE ROW */}
                <div className="max-w-4xl mx-auto rounded-[4px] bg-rs-gray-900 text-rs-white border border-rs-black p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[var(--rs-shadow-md)]">
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-bold mb-2 tracking-tight">Need Enterprise Scale?</h3>
                        <p className="text-rs-gray-400 max-w-lg">
                            Custom implementations for large organizations. On-premise deployment, unlimited seats, custom API rate limits, and dedicated forensic analyst support.
                        </p>
                    </div>

                    <RSButton variant="primary" className="whitespace-nowrap bg-white text-rs-black hover:bg-rs-gray-200">
                        Contact for Rates
                    </RSButton>
                </div>
            </div>
        </section>
    )
}

function PricingCard({ title, price, priceSub, description, children, action, popular, isSafe }: any) {
    return (
        <div className={`
            border rounded-[4px] p-6 relative flex flex-col transition-all duration-300
            ${popular ? 'bg-rs-gray-100 border-rs-black shadow-[var(--rs-shadow-md)] scale-105 z-10' : 'bg-rs-white border-rs-gray-200 hover:border-rs-gray-300'}
            ${isSafe ? 'border-rs-safe/30 bg-green-50/30' : ''}
        `}>
            {popular && (
                <div className="absolute top-0 right-0 bg-rs-black text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                    Popular
                </div>
            )}
            <div className="mb-6 text-center h-32 flex flex-col justify-end pb-4 border-b border-rs-gray-200/50">
                <h3 className="text-lg font-bold text-rs-black mb-1">{title}</h3>
                <div className="text-3xl font-bold text-rs-black tracking-tight">{price}<span className="text-sm font-normal text-rs-gray-500">{priceSub}</span></div>
                <p className="text-rs-gray-500 text-[10px] mt-2 uppercase tracking-widest">{description}</p>
            </div>
            <div className="space-y-4 mb-8 flex-grow">
                {children}
            </div>
            {action}
        </div>
    )
}

function FeatureLabel({ label }: { label: string }) {
    return <div className="h-10 flex items-center text-sm font-bold text-rs-gray-500 uppercase tracking-wide text-[10px]">{label}</div>
}

function FeatureCheck({ value, highlighted = false }: { value: string | boolean, highlighted?: boolean }) {
    return (
        <div className="h-10 flex items-center justify-center md:justify-center border-b border-rs-gray-100 last:border-0 md:border-0">
            <span className="md:hidden text-xs text-rs-gray-400 mr-auto">Feature:</span>
            {typeof value === 'boolean' ? (
                value ? (
                    <svg className={`w-5 h-5 ${highlighted ? 'text-rs-black' : 'text-rs-safe'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <span className="text-rs-gray-300">-</span>
                )
            ) : (
                <span className={`text-sm font-bold ${highlighted ? 'text-rs-black' : 'text-rs-gray-600'}`}>{value}</span>
            )}
        </div>
    )
}
