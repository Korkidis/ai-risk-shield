'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function UpgradeButton({ scanId }: { scanId: string }) {
    const [loading, setLoading] = useState(false)

    const handleUpgrade = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scanId,
                    purchaseType: 'subscription',
                    planId: 'pro'
                })
            })

            const { sessionId, error } = await response.json()

            if (error) {
                alert(error)
                setLoading(false)
                return
            }

            const stripe = await stripePromise
            if (stripe && sessionId) {
                // Modern Stripe API: redirect to checkout URL
                // Type assertion needed as redirectToCheckout exists but may not be in latest types
                const { error: stripeError } = await (stripe as any).redirectToCheckout({ sessionId })
                if (stripeError) {
                    console.error('Stripe redirect error:', stripeError)
                    alert('Failed to redirect to checkout')
                    setLoading(false)
                }
            }
        } catch (err) {
            console.error('Checkout failed', err)
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleUpgrade}
            disabled={loading}
            type="button"
            className="w-full bg-[var(--rs-signal)] text-[var(--rs-text-inverse)] px-8 py-4 rounded-xl font-black uppercase tracking-[0.15em] hover:scale-[1.02] hover:shadow-[var(--rs-shadow-l2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed rs-bevel overflow-hidden"
        >
            {loading ? 'Processing Transaction...' : 'Upgrade Clearance'}
        </button>
    )
}
