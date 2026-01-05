import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

// Prices - In a real app, these might come from config or DB
// Using Environment variables for Price IDs is best practice for Sandbox/Prod switch
const PRICE_IDS = {
    one_time: process.env.STRIPE_PRICE_ONE_TIME || 'price_one_time_placeholder',
    pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly_placeholder',
}

export async function POST(request: Request) {
    try {
        const { scanId, purchaseType } = await request.json()
        const supabase = await createClient()

        // 1. Authenticate User
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            // If not logged in, we should have upgraded them via signup flow first.
            // But double check.
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Get Tenant ID
        const { data: profileData } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single()

        const profile = profileData as any
        if (!profile?.tenant_id) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 400 })
        }

        // 3. Determine Price
        let priceId = ''
        let mode: 'payment' | 'subscription' = 'payment'

        if (purchaseType === 'one_time') {
            priceId = PRICE_IDS.one_time
            mode = 'payment'
        } else if (purchaseType === 'subscription') {
            priceId = PRICE_IDS.pro_monthly
            mode = 'subscription'
        } else {
            return NextResponse.json({ error: 'Invalid purchase type' }, { status: 400 })
        }

        // 4. Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer_email: user.email,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: mode,
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/scans/${scanId}?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/scans/${scanId}?canceled=true`,
            metadata: {
                userId: user.id,
                tenantId: profile.tenant_id,
                scanId: scanId, // Important for fulfillment
                purchaseType: purchaseType,
            },
            // If subscription, maybe add trial?
            subscription_data: mode === 'subscription' ? {
                metadata: {
                    tenantId: profile.tenant_id
                }
            } : undefined
        })

        return NextResponse.json({ sessionId: session.id, url: session.url })

    } catch (error: any) {
        console.error('Stripe Checkout Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
