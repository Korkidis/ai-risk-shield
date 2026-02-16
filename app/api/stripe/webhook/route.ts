import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getPlan, type PlanId } from '@/lib/plans'
import { sendMagicLinkEmail } from '@/lib/email'
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

    const { scanId, purchaseType } = meta
    let { userId, tenantId } = meta

    const customerEmail = session.customer_details?.email ?? session.customer_email

    async function ensureProfileAndTenant(resolvedUserId: string, email: string): Promise<string | null> {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, tenant_id')
            .eq('id', resolvedUserId)
            .single()

        if (profile?.tenant_id) return profile.tenant_id

        if (error && error.code !== 'PGRST116') {
            console.error(`[Webhook] Profile lookup failed: ${error.message}`)
        }

        console.log('[Webhook] Profile/Tenant missing. Creating manually...')

        const { data: newTenant, error: tenantError } = await supabase
            .from('tenants')
            .insert({
                name: `${email}'s Tenant`,
                plan: 'free'
            })
            .select('id')
            .single()

        if (tenantError) {
            console.error(`[Webhook] Manual tenant creation failed: ${tenantError.message}`)
            return null
        }

        if (profile?.id) {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ tenant_id: newTenant.id })
                .eq('id', resolvedUserId)

            if (updateError) {
                console.error(`[Webhook] Manual profile update failed: ${updateError.message}`)
            }
        } else {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: resolvedUserId,
                    tenant_id: newTenant.id,
                    email,
                    role: 'owner'
                })

            if (profileError) {
                console.error(`[Webhook] Manual profile creation failed: ${profileError.message}`)
                const { data: existing } = await supabase
                    .from('profiles')
                    .select('tenant_id')
                    .eq('id', resolvedUserId)
                    .single()
                return existing?.tenant_id ?? newTenant.id
            }
        }

        return newTenant.id
    }

    // 1. Handle Anonymous User Creation
    if ((userId === 'anonymous' || !userId) && customerEmail) {
        console.log(`[Webhook] Processing anonymous purchase for ${customerEmail}`)
        try {
            // Try to create user
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: customerEmail,
                email_confirm: true, // Auto-confirm since they paid via Stripe
                user_metadata: { full_name: session.customer_details?.name || 'Customer' }
            })

            if (createError) {
                console.error(`[Webhook] User creation failed: ${createError.message}`)
                // Check if user already exists
                console.log(`[Webhook] User creation failed (likely exists): ${createError.message}. Fetching user...`)

                // Fallback to fetch existing user profile first (usually syncs fast)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id, tenant_id')
                    .eq('email', customerEmail)
                    .single()

                if (profile) {
                    userId = profile.id
                    tenantId = profile.tenant_id
                    console.log(`[Webhook] Found existing profile for ${customerEmail}`)
                } else {
                    console.error('[Webhook] User exists but profile not found. Fallback to listUsers.')
                    const { data: users } = await supabase.auth.admin.listUsers()
                    const found = users.users.find((u: any) => u.email === customerEmail)
                    if (found) {
                        userId = found.id
                        console.log(`[Webhook] Found user via listUsers: ${userId}`)
                    }
                }
            } else if (newUser.user) {
                userId = newUser.user.id
                console.log(`[Webhook] Created new user ${userId}`)

                // Poll for profile creation (trigger)
                let profileLoop = null
                for (let i = 0; i < 3; i++) {
                    const { data: p } = await supabase.from('profiles').select('id, tenant_id').eq('id', userId).single()
                    if (p) { profileLoop = p; break }
                    await new Promise(r => setTimeout(r, 500))
                }

                if (profileLoop?.tenant_id) {
                    tenantId = profileLoop.tenant_id
                    console.log(`[Webhook] Found profile/tenant: ${tenantId}`)
                } else {
                    console.log('[Webhook] Profile/Tenant trigger timeout. Creating manually...')
                    const ensuredTenantId = await ensureProfileAndTenant(userId, customerEmail)
                    if (ensuredTenantId) {
                        tenantId = ensuredTenantId
                        console.log(`[Webhook] Manually created tenant ${tenantId} and profile.`)
                    }
                }
            }

            if (userId && customerEmail && !tenantId) {
                const ensuredTenantId = await ensureProfileAndTenant(userId, customerEmail)
                if (ensuredTenantId) tenantId = ensuredTenantId
            }

            // Send Magic Link
            if (userId && customerEmail) {
                const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
                    type: 'magiclink',
                    email: customerEmail,
                    options: {
                        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/scans-reports?highlight=${scanId}`
                    }
                })

                if (linkData && linkData.properties?.action_link) {
                    await sendMagicLinkEmail(customerEmail, linkData.properties.action_link)
                    console.log(`[Webhook] Sent magic link to ${customerEmail}`)
                } else {
                    console.error(`[Webhook] Failed to generate magic link: ${linkError?.message}`)
                }
            }

        } catch (err: any) {
            console.error('[Webhook] Anonymous user resolution failed:', err)
        }
    }

    // 2. Scan Assignment
    if (scanId && userId && userId !== 'anonymous') {
        const { data: scan } = await supabase.from('scans').select('session_id').eq('id', scanId).single()

        if (scan?.session_id) {
            console.log(`[Webhook] Assigning scans from session ${scan.session_id} to user ${userId}`)

            // Direct DB Updates (Replacing RPC due to type mismatch issues)
            // 1. Update Scans
            const { data: updatedScans, error: scanError } = await supabase
                .from('scans')
                .update({
                    user_id: userId,
                    tenant_id: tenantId,
                    session_id: null // Clear session to prevent reuse
                })
                .eq('session_id', scan.session_id)
                .select('id, asset_id')

            if (scanError) {
                console.error(`[Webhook] Failed to update scans: ${scanError.message}`)
            } else {
                console.log(`[Webhook] Updated ${updatedScans.length} scans.`)

                if (updatedScans.length > 0) {
                    const scanIds = updatedScans.map((s: any) => s.id)
                    const assetIds = updatedScans.map((s: any) => s.asset_id)

                    // 2. Update Assets
                    const { error: assetError } = await supabase
                        .from('assets')
                        .update({ tenant_id: tenantId })
                        .in('id', assetIds)

                    if (assetError) console.error(`[Webhook] Failed to update assets: ${assetError.message}`)
                    else console.log(`[Webhook] Updated associated assets.`)

                    // 3. Update Scan Findings
                    const { error: findingsError } = await supabase
                        .from('scan_findings')
                        .update({ tenant_id: tenantId })
                        .in('scan_id', scanIds)

                    if (findingsError) console.error(`[Webhook] Failed to update findings: ${findingsError.message}`)
                }
            }
        } else {
            console.log(`[Webhook] Scan not found or no session_id: ${scanId}`)
        }
    }

    // 3. Mark Scan Purchased (One-time)
    if (purchaseType === 'one_time' && scanId && userId && userId !== 'anonymous') {
        if (!tenantId) {
            const { data: p } = await supabase.from('profiles').select('tenant_id').eq('id', userId).single()
            tenantId = p?.tenant_id
        }

        console.log(`[Webhook] Fulfilling one-time purchase for scan ${scanId}`)

        const { error } = await supabase
            .from('scans')
            .update({
                purchased: true,
                purchase_type: 'one_time',
                stripe_payment_intent_id: session.payment_intent as string,
                tenant_id: tenantId,
                user_id: userId,
            })
            .eq('id', scanId)

        if (error) {
            console.error('Failed to update scan purchase status:', error)
        }
    }

    // 4. Subscription fulfillment
    if (purchaseType === 'subscription' && tenantId && session.subscription) {
        console.log(`[Webhook] Fulfilling subscription for tenant ${tenantId}`)

        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string,
            { expand: ['items'] }
        )

        let meteredItemId: string | null = null
        let flatPriceId: string | null = null

        for (const item of subscription.items.data) {
            const price = item.price
            if (price.recurring?.usage_type === 'metered') {
                meteredItemId = item.id
            } else {
                flatPriceId = price.id
            }
        }

        const planId = flatPriceId ? (STRIPE_PRICE_TO_PLAN[flatPriceId] || 'pro') : 'pro'

        await applyPlanToTenant(supabase, tenantId, planId, {
            stripe_subscription_id: session.subscription as string,
            stripe_customer_id: session.customer as string,
            stripe_metered_item_id: meteredItemId,
            subscription_status: 'active'
        })

        console.log(`[Webhook] Stored metered item ID ${meteredItemId} for tenant ${tenantId}`)
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
