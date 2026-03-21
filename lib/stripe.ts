import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripeInstance(): Stripe {
    if (!_stripe) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is missing. Please add it to your .env.local file.')
        }
        _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-12-15.clover', // Match TypeScript definitions
            typescript: true,
        })
    }
    return _stripe
}

// Lazy getter — throws at request time, not at build time
export const stripe = new Proxy({} as Stripe, {
    get(_target, prop) {
        return (getStripeInstance() as unknown as Record<string | symbol, unknown>)[prop]
    }
})
