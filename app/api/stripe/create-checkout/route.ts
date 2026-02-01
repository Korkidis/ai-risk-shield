import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { type PlanId } from '@/lib/plans'

// Price IDs from Stripe Dashboard - map plan + interval to Stripe Price ID
const PRICE_IDS: Record<string, string | undefined> = {
    // One-time purchases
    one_time: process.env.STRIPE_PRICE_ONE_TIME,

    // Subscriptions - monthly
    pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
    team_monthly: process.env.STRIPE_PRICE_TEAM_MONTHLY,
    agency_monthly: process.env.STRIPE_PRICE_AGENCY_MONTHLY,

    // Subscriptions - annual
    pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL,
    team_annual: process.env.STRIPE_PRICE_TEAM_ANNUAL,
    agency_annual: process.env.STRIPE_PRICE_AGENCY_ANNUAL,

    // Metered usage prices (for overage billing)
    pro_metered: process.env.STRIPE_PRICE_PRO_METERED,
    team_metered: process.env.STRIPE_PRICE_TEAM_METERED,
    agency_metered: process.env.STRIPE_PRICE_AGENCY_METERED,
}

function getPriceId(planId: PlanId, interval: 'monthly' | 'annual'): string | null {
    const key = `${planId}_${interval}`
    return PRICE_IDS[key] || null
}

function getMeteredPriceId(planId: PlanId): string | null {
    const key = `${planId}_metered`
    return PRICE_IDS[key] || null
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { scanId, purchaseType, planId, interval = 'monthly' } = body

        const supabase = await createClient()

        // 1. Authenticate User
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Please sign in to continue' }, { status: 401 })
        }

        // 2. Get Tenant ID
        const { data: profileData } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single()

        const profile = profileData as any
        if (!profile?.tenant_id) {
            return NextResponse.json({ error: 'Account setup incomplete' }, { status: 400 })
        }

        // 3. Determine Price
        let priceId: string | null = null
        let mode: 'payment' | 'subscription' = 'subscription'
        let successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=success`
        let cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`

        if (purchaseType === 'one_time' && scanId) {
            // One-time report purchase
            priceId = PRICE_IDS.one_time || null
            mode = 'payment'
            successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/scans/${scanId}?success=true`
            cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/scans/${scanId}?canceled=true`
        } else if (purchaseType === 'subscription' && planId) {
            // Subscription purchase
            if (planId === 'free' || planId === 'enterprise') {
                return NextResponse.json({ error: 'Invalid plan for checkout' }, { status: 400 })
            }
            priceId = getPriceId(planId as PlanId, interval)
            mode = 'subscription'
        } else {
            return NextResponse.json({ error: 'Invalid purchase parameters' }, { status: 400 })
        }

        if (!priceId) {
            return NextResponse.json({
                error: 'Price not configured. Please contact support.',
                details: `Missing: ${planId}_${interval}`
            }, { status: 500 })
        }

        // 4. Create Checkout Session
        // Build line items - for subscriptions, include metered price for overage billing
        const lineItems: { price: string; quantity?: number }[] = [{ price: priceId, quantity: 1 }]

        // Add metered usage price for paid subscriptions (for overage billing)
        if (mode === 'subscription' && planId) {
            const meteredPriceId = getMeteredPriceId(planId as PlanId)
            if (meteredPriceId) {
                lineItems.push({ price: meteredPriceId }) // No quantity for metered prices
            }
        }

        const sessionConfig: any = {
            customer_email: user.email,
            line_items: lineItems,
            mode: mode,
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                userId: user.id,
                tenantId: profile.tenant_id,
                purchaseType,
                planId: planId || 'one_time',
                interval,
            },
            allow_promotion_codes: true,
        }

        // Add subscription-specific config
        if (mode === 'subscription') {
            sessionConfig.subscription_data = {
                metadata: {
                    tenantId: profile.tenant_id,
                    planId,
                }
            }
        }

        const session = await stripe.checkout.sessions.create(sessionConfig)

        return NextResponse.json({
            sessionId: session.id,
            url: session.url
        })

    } catch (error: any) {
        console.error('Stripe Checkout Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
