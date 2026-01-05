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
                    purchaseType: 'subscription'
                })
            })

            const { sessionId, error } = await response.json()

            if (error) {
                alert(error)
                setLoading(false)
                return
            }

            const stripe = await stripePromise
            if (stripe) {
                await stripe.redirectToCheckout({ sessionId })
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
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] animate-gradient text-white px-8 py-4 rounded-xl font-black uppercase tracking-[0.15em] hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
        >
            {loading ? 'Processing Transaction...' : 'Upgrade Clearance'}
        </button>
    )
}
