'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RSPanel } from '@/components/rs/RSPanel'
import { BillingToggle } from '@/components/pricing/BillingToggle'
import { PricingCard } from '@/components/pricing/PricingCard'
import { PLANS, type PlanId } from '@/lib/plans'


// Order plans for display
const PLAN_ORDER: PlanId[] = ['free', 'pro', 'team', 'agency', 'enterprise']

export default function PricingPage() {
    const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly')
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSelectPlan = async (planId: PlanId, billingInterval: 'monthly' | 'annual') => {
        setError(null)

        try {
            const response = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId,
                    interval: billingInterval,
                    purchaseType: 'subscription'
                })
            })

            const data = await response.json()

            if (data.error) {
                if (response.status === 401) {
                    // Not logged in - redirect to signup
                    router.push(`/signup?plan=${planId}&interval=${billingInterval}`)
                    return
                }
                setError(data.error)
                return
            }

            // Redirect to Stripe checkout
            // Redirect to Stripe checkout
            if (data.url) {
                window.location.href = data.url
            } else {
                setError('Failed to start checkout')
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        }
    }

    return (
        <div className="min-h-screen bg-[var(--rs-bg-base)]">
            {/* Background grid */}
            <div
                className="fixed inset-0 pointer-events-none opacity-30"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0)
                    `,
                    backgroundSize: '24px 24px'
                }}
            />

            <div className="relative max-w-7xl mx-auto px-6 py-16">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-[var(--rs-text-primary)] uppercase tracking-tight mb-4">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-lg text-[var(--rs-text-secondary)] max-w-2xl mx-auto mb-8">
                        Protect your content from AI risk. Start free, upgrade when you need more.
                    </p>

                    {/* Billing toggle */}
                    <BillingToggle interval={interval} onChange={setInterval} />
                </div>

                {/* Error message */}
                {error && (
                    <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Pricing cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {PLAN_ORDER.map((planId) => (
                        <PricingCard
                            key={planId}
                            plan={PLANS[planId]}
                            interval={interval}
                            isPopular={planId === 'team'}
                            onSelect={handleSelectPlan}
                        />
                    ))}
                </div>

                {/* FAQ / Additional info */}
                <RSPanel className="mt-16 max-w-3xl mx-auto" title="Frequently Asked Questions">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-bold text-[var(--rs-text-primary)] mb-2">
                                What happens if I exceed my scan limit?
                            </h4>
                            <p className="text-xs text-[var(--rs-text-secondary)]">
                                Paid plans allow overage usage. You&apos;ll be billed at your plan&apos;s overage rate
                                at the end of each billing cycle. Free users must upgrade to continue scanning.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-[var(--rs-text-primary)] mb-2">
                                Can I change plans anytime?
                            </h4>
                            <p className="text-xs text-[var(--rs-text-secondary)]">
                                Yes! Upgrade or downgrade anytime. When upgrading, you&apos;ll be prorated for the
                                remaining period. When downgrading, changes take effect at your next billing date.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-[var(--rs-text-primary)] mb-2">
                                Do you offer refunds?
                            </h4>
                            <p className="text-xs text-[var(--rs-text-secondary)]">
                                We offer a 14-day money-back guarantee on all paid plans. No questions asked.
                            </p>
                        </div>
                    </div>
                </RSPanel>

                {/* Enterprise CTA */}
                <div className="mt-16 text-center">
                    <p className="text-sm text-[var(--rs-text-tertiary)] mb-2">
                        Need a custom solution for your enterprise?
                    </p>
                    <a
                        href="mailto:sales@airiskshield.com?subject=Enterprise%20Inquiry"
                        className="text-[var(--rs-signal)] font-bold text-sm hover:underline"
                    >
                        Contact our sales team →
                    </a>
                </div>
            </div>
        </div>
    )
}
