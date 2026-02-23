import { stripe } from '@/lib/stripe'

let validated = false
let validationErrors: string[] = []

/**
 * Validates all configured Stripe price IDs once.
 * Called lazily on first checkout request, not at module load.
 * Caches result so subsequent requests are instant.
 *
 * Logs errors but does NOT block checkout — the per-request
 * check in create-checkout/route.ts handles missing prices
 * for the specific plan requested.
 */
export async function validateStripePrices(): Promise<{
    valid: boolean
    errors: string[]
}> {
    if (validated) {
        return { valid: validationErrors.length === 0, errors: validationErrors }
    }

    const priceEnvVars: Record<string, string | undefined> = {
        STRIPE_PRICE_ONE_TIME: process.env.STRIPE_PRICE_ONE_TIME,
        STRIPE_PRICE_PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY,
        STRIPE_PRICE_TEAM_MONTHLY: process.env.STRIPE_PRICE_TEAM_MONTHLY,
        STRIPE_PRICE_AGENCY_MONTHLY: process.env.STRIPE_PRICE_AGENCY_MONTHLY,
        STRIPE_PRICE_PRO_ANNUAL: process.env.STRIPE_PRICE_PRO_ANNUAL,
        STRIPE_PRICE_TEAM_ANNUAL: process.env.STRIPE_PRICE_TEAM_ANNUAL,
        STRIPE_PRICE_AGENCY_ANNUAL: process.env.STRIPE_PRICE_AGENCY_ANNUAL,
        // Metered prices — missing these causes silent overage billing failure
        STRIPE_PRICE_PRO_METERED: process.env.STRIPE_PRICE_PRO_METERED,
        STRIPE_PRICE_TEAM_METERED: process.env.STRIPE_PRICE_TEAM_METERED,
        STRIPE_PRICE_AGENCY_METERED: process.env.STRIPE_PRICE_AGENCY_METERED,
    }

    const errors: string[] = []

    // Check that the one-time price (core flow) is configured
    if (!priceEnvVars.STRIPE_PRICE_ONE_TIME) {
        errors.push('STRIPE_PRICE_ONE_TIME is not configured')
    }

    // Validate each configured price against Stripe API
    const configuredPrices = Object.entries(priceEnvVars).filter(
        ([, value]) => value && value.startsWith('price_')
    )

    for (const [envName, priceId] of configuredPrices) {
        try {
            await stripe.prices.retrieve(priceId!)
        } catch (err: any) {
            errors.push(`${envName}=${priceId} is invalid: ${err.message}`)
        }
    }

    validationErrors = errors
    validated = true

    if (errors.length > 0) {
        console.error('[Stripe] Price validation errors:', errors)
    } else {
        console.log('[Stripe] All configured prices validated successfully')
    }

    return { valid: errors.length === 0, errors }
}
