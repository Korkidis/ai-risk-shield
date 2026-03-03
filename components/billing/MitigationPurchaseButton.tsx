'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { trackEvent } from '@/lib/analytics'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface MitigationPurchaseButtonProps {
    scanId: string
    className?: string
}

/**
 * Checkout button for purchasing a $29 mitigation report for a specific scan.
 * Creates a Stripe checkout session with purchaseType: 'mitigation'.
 * On successful payment, webhook creates a mitigation_reports row and triggers generation.
 */
export function MitigationPurchaseButton({ scanId, className }: MitigationPurchaseButtonProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handlePurchase = async () => {
        setError(null)
        trackEvent('mitigation_checkout_initiated', { scanId })
        setLoading(true)
        try {
            const response = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scanId,
                    purchaseType: 'mitigation'
                })
            })

            const { sessionId, error: apiError } = await response.json()

            if (apiError || !sessionId) {
                setError('Checkout unavailable. Please try again.')
                setLoading(false)
                return
            }

            const stripe = await stripePromise
            if (stripe && sessionId) {
                const { error: stripeError } = await (stripe as any).redirectToCheckout({ sessionId })
                if (stripeError) {
                    console.error('Stripe redirect error:', stripeError)
                    setError('Unable to open checkout. Please try again.')
                    setLoading(false)
                }
            }
        } catch (err) {
            console.error('Mitigation checkout failed', err)
            setError('Checkout unavailable. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className="w-full">
            <button
                onClick={handlePurchase}
                disabled={loading}
                type="button"
                className={className || "w-full bg-[var(--rs-bg-surface)] border border-[var(--rs-border-strong)] text-[var(--rs-text-primary)] px-8 py-4 rounded-xl font-bold uppercase tracking-[0.1em] hover:bg-[var(--rs-bg-element)] transition-all disabled:opacity-50"}
            >
                {loading ? 'Processing...' : 'Get Mitigation Report ($29)'}
            </button>
            {error && (
                <p className="mt-2 text-[10px] text-[var(--rs-destruct)] text-center font-mono uppercase tracking-wide">
                    {error}
                </p>
            )}
        </div>
    )
}
