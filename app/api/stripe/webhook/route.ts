import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getPlan, type PlanId } from '@/lib/plans'
import Stripe from 'stripe'

// Must enable raw body for webhook signature verification
// Next.js 13+ App Router: We just read text() from request

/**
 * Map Stripe Price IDs to Plan IDs
 * TODO: Move to environment variables or database
 */
const STRIPE_PRICE_TO_PLAN: Record<string, PlanId> = {
    // Monthly prices
    [process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly']: 'pro',
    [process.env.STRIPE_PRICE_TEAM_MONTHLY || 'price_team_monthly']: 'team',
    [process.env.STRIPE_PRICE_AGENCY_MONTHLY || 'price_agency_monthly']: 'agency',
    // Annual prices
    [process.env.STRIPE_PRICE_PRO_ANNUAL || 'price_pro_annual']: 'pro',
    [process.env.STRIPE_PRICE_TEAM_ANNUAL || 'price_team_annual']: 'team',
    [process.env.STRIPE_PRICE_AGENCY_ANNUAL || 'price_agency_annual']: 'agency',
}

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

        case 'customer.subscription.updated':
            const subscription = event.data.object as Stripe.Subscription
            await handleSubscriptionUpdated(subscription, supabase)
            break

        case 'customer.subscription.deleted':
            const canceledSub = event.data.object as Stripe.Subscription
            await handleSubscriptionCanceled(canceledSub, supabase)
            break

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

        const { error } = await supabase
            .from('scans')
            .update({
                purchased: true,
                purchase_type: 'one_time',
                stripe_payment_intent_id: session.payment_intent as string,
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

        // Determine plan from price ID
        const priceId = session.line_items?.data[0]?.price?.id || ''
        const planId = STRIPE_PRICE_TO_PLAN[priceId] || 'pro'

        await applyPlanToTenant(supabase, tenantId, planId, {
            stripe_subscription_id: session.subscription as string,
            stripe_customer_id: session.customer as string,
            subscription_status: 'active'
        })
    }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
    const tenantId = subscription.metadata?.tenantId
    if (!tenantId) return

    const priceId = subscription.items.data[0]?.price?.id || ''
    const planId = STRIPE_PRICE_TO_PLAN[priceId] || 'pro'

    await applyPlanToTenant(supabase, tenantId, planId, {
        subscription_status: subscription.status
    })
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription, supabase: any) {
    const tenantId = subscription.metadata?.tenantId
    if (!tenantId) return

    // Downgrade to free
    await applyPlanToTenant(supabase, tenantId, 'free', {
        subscription_status: 'canceled',
        stripe_subscription_id: null
    })
}

/**
 * Apply plan configuration to tenant
 * Source of truth: lib/plans.ts
 */
async function applyPlanToTenant(
    supabase: any,
    tenantId: string,
    planId: PlanId,
    extraFields: Record<string, any> = {}
) {
    const plan = getPlan(planId)

    console.log(`[Webhook] Applying plan "${planId}" to tenant ${tenantId}`)

    const { error } = await supabase
        .from('tenants')
        .update({
            plan: planId,
            // Core limits
            monthly_scan_limit: plan.monthlyScans,
            monthly_report_limit: plan.monthlyReports,
            seat_limit: plan.seats,
            brand_profile_limit: plan.brandProfiles,
            retention_days: plan.retentionDays,
            // Overage costs (in cents)
            scan_overage_cost_cents: plan.scanOverageCents,
            report_overage_cost_cents: plan.reportOverageCents,
            // Feature flags
            feature_bulk_upload: plan.features.bulkUpload,
            feature_co_branding: plan.features.coBranding,
            feature_white_label: plan.features.whiteLabel,
            feature_team_dashboard: plan.features.teamDashboard,
            feature_audit_logs: plan.features.auditLogs,
            feature_priority_queue: plan.features.priorityQueue,
            feature_sso: plan.features.sso,
            // Extra fields (Stripe IDs, status, etc.)
            ...extraFields
        })
        .eq('id', tenantId)

    if (error) {
        console.error(`Failed to apply plan to tenant ${tenantId}:`, error)
    }
}
