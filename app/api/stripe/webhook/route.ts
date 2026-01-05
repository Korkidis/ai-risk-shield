import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createServiceRoleClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

// Must enable raw body for webhook signature verification
// Next.js 13+ App Router: We just read text() from request

export async function POST(request: Request) {
    const body = await request.text()
    const signature = (await headers()).get('stripe-signature') as string
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
        console.error('Missing STRIPE_WEBHOOK_SECRET')
        return NextResponse.json({ error: 'Server config error' }, { status: 500 })
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
        console.error('Webhook signature verification failed.', err.message)
        return NextResponse.json({ error: 'Webhook signature verification failed.' }, { status: 400 })
    }

    const supabase = await createServiceRoleClient()

    // Handle specific events
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as Stripe.Checkout.Session
            await handleCheckoutCompleted(session, supabase)
            break

        // Add subscription lifecycle events later (invoice.paid, etc.)
        default:
        // console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
    const meta = session.metadata
    if (!meta) return

    const { scanId, tenantId, purchaseType } = meta

    // 1. One-time purchase fulfillment
    if (purchaseType === 'one_time' && scanId) {
        console.log(`[Webhook] Fulfilling one-time purchase for scan ${scanId}`)

        // Update scan to purchased
        const { error } = await supabase
            .from('scans')
            .update({
                purchased: true,
                purchase_type: 'one_time',
                stripe_payment_intent_id: session.payment_intent as string,
                // If we want to strictly link ownership to the purchaser if they were anonymous before?
                // But assumed they are logged in now. Use user_id from meta?
                // The scan should already belong to the tenant if they uploaded it while logged in.
                // If they uploaded anonymously and then signed up:
                // We might need to transfer ownership here if not done during signup/upload link?
                // For Phase B/C we assumed logical flow: Anonymous -> Signup -> Purchase.
                // If the scan was created anonymously, it has NO tenant_id.
                // We should fix that now.
                tenant_id: tenantId,
            })
            .eq('id', scanId)

        if (error) {
            console.error('Failed to update scan purchase status:', error)
        }
    }

    // 2. Subscription fulfillment
    if (purchaseType === 'subscription' && tenantId) {
        console.log(`[Webhook] Fulfilling subscription for tenant ${tenantId}`)

        // Update tenant plan
        // We should also store the subscription ID in a subscriptions table
        // For MVP, just updating tenant plan
        const { error } = await supabase
            .from('tenants')
            .update({
                plan: 'team', // Hardcoded 'team' or 'pro' based on price ID map logic needed
                stripe_subscription_id: session.subscription as string,
                stripe_customer_id: session.customer as string,
                subscription_status: 'active'
            })
            .eq('id', tenantId)

        if (error) {
            console.error('Failed to update tenant subscription:', error)
        }
    }
}
