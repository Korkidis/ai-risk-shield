import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { type PlanId } from '@/lib/plans'
import { getSessionId } from '@/lib/session'

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

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { scanId, purchaseType, planId: rawPlanId, interval: rawInterval = 'monthly' } = body

        // Validate planId and interval upfront
        const VALID_PLAN_IDS = ['pro', 'team', 'agency']
        const VALID_INTERVALS = ['monthly', 'annual']
        const planId = VALID_PLAN_IDS.includes(rawPlanId) ? rawPlanId : rawPlanId // preserve for one_time path
        const interval = VALID_INTERVALS.includes(rawInterval) ? rawInterval : 'monthly'

        const cookieStore = await cookies()
        const sessionId = await getSessionId()
        const magicEmail = cookieStore.get('magic_auth_email')?.value

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // 1. Prepare Customer Info
        let customerEmail = user?.email
        let tenantId = 'anonymous'
        let userId = user?.id || 'anonymous'

        if (user) {
            const { data: profileData } = await supabase
                .from('profiles')
                .select('tenant_id')
                .eq('id', user.id)
                .single()

            const profile = profileData as any

            if (profile?.tenant_id) {
                tenantId = profile.tenant_id
            } else {
                return NextResponse.json({ error: 'Account setup incomplete' }, { status: 400 })
            }
        } else {
            // Anonymous: try to get email from capture-email cookie to pre-fill Stripe
            customerEmail = magicEmail
        }

        // 2. Validate Scan Ownership (CRITICAL)
        // Ensure the user (or anonymous session) actually owns the scan they're trying to buy
        if (scanId) {
            const { data: scanData, error } = await supabase
                .from('scans')
                .select('id, user_id, session_id, tenant_id')
                .eq('id', scanId)
                .single()

            const scan = scanData as any

            if (error || !scanData) {
                return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
            }



            if (user) {
                const ownsByUser = scan.user_id === user.id
                const ownsByTenant = scan.tenant_id === tenantId
                const ownsBySession = sessionId && scan.session_id === sessionId
                if (!ownsByUser && !ownsByTenant && !ownsBySession) {
                    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
                }
            } else {
                // If anonymous, scan must belong to the anonymous session
                if (!sessionId || scan.session_id !== sessionId) {
                    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
                }
            }
        }

        // 3. Determine Price & URLs
        let priceId: string | null = null
        let mode: 'payment' | 'subscription' = 'subscription'
        let successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=success`
        let cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`

        if (purchaseType === 'one_time' && scanId) {
            // One-time report purchase
            priceId = PRICE_IDS.one_time || null
            mode = 'payment'

            if (user) {
                successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/scans-reports?highlight=${scanId}&purchased=true`
            } else {
                // Anonymous Success: Send to Login with magic link flag
                // Webhook will create user and send magic link email
                successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login?magic_link_sent=true`
            }

            cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/scans-reports?highlight=${scanId}&canceled=true`

        } else if (purchaseType === 'subscription' && planId) {
            // Subscription purchase — only allow purchasable plans
            if (!VALID_PLAN_IDS.includes(planId)) {
                return NextResponse.json({ error: 'Invalid plan for checkout' }, { status: 400 })
            }
            priceId = getPriceId(planId as PlanId, interval)
            mode = 'subscription'

            if (!user) {
                // Anonymous subscription? Force login on success
                successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login?magic_link_sent=true`
            }
        } else {
            return NextResponse.json({ error: 'Invalid purchase parameters' }, { status: 400 })
        }

        if (!priceId) {
            console.error(`[Checkout] Price not configured for ${planId}_${interval}`)
            return NextResponse.json({
                error: 'Price not configured. Please contact support.'
            }, { status: 500 })
        }

        // 4. Create Checkout Session
        const lineItems: { price: string; quantity?: number }[] = [{ price: priceId, quantity: 1 }]

        if (mode === 'subscription' && planId) {
            const meteredPriceId = getMeteredPriceId(planId as PlanId)
            if (meteredPriceId) {
                lineItems.push({ price: meteredPriceId })
            }
        }

        const sessionConfig: any = {
            customer_email: customerEmail, // Optional, Stripe handles if missing
            line_items: lineItems,
            mode: mode,
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                userId,     // 'anonymous' if not logged in
                tenantId,   // 'anonymous' if not logged in
                purchaseType,
                planId: planId || 'one_time',
                interval,
                scanId: scanId || '',
                isAnonymous: !user ? 'true' : 'false'
            },
            allow_promotion_codes: true,
        }

        if (mode === 'subscription') {
            sessionConfig.subscription_data = {
                metadata: {
                    tenantId,
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
        return NextResponse.json({ error: 'Checkout failed. Please try again.' }, { status: 500 })
    }
}
