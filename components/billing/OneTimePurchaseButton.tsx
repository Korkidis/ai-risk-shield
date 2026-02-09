'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function OneTimePurchaseButton({ scanId }: { scanId: string }) {
    const [loading, setLoading] = useState(false)

    const handlePurchase = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scanId,
                    purchaseType: 'one_time'
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
            onClick={handlePurchase}
            disabled={loading}
            type="button"
            className="w-full bg-[var(--rs-bg-surface)] border border-[var(--rs-border-strong)] text-[var(--rs-text-primary)] px-8 py-4 rounded-xl font-bold uppercase tracking-[0.1em] hover:bg-[var(--rs-bg-element)] transition-all disabled:opacity-50"
        >
            {loading ? 'Processing...' : 'Buy One-Time Report ($29)'}
        </button>
    )
}
