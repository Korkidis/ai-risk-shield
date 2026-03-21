import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getPlan, type PlanId } from '@/lib/plans'
import { sendMagicLinkEmail, sendPurchaseReceiptEmail } from '@/lib/email'
import { logWebhookEvent, alertWebhookFailure } from '@/lib/webhook-monitor'
import Stripe from 'stripe'
import type { SupabaseClient } from '@supabase/supabase-js'

// Must enable raw body for webhook signature verification
// Next.js 13+ App Router: We just read text() from request

// Idempotency: Check audit_log for already-processed Stripe event IDs.
// DB-backed to survive restarts and work across multiple instances.

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
    } catch (err: unknown) {
        console.error('Webhook signature verification failed.', err instanceof Error ? err.message : err)
        logWebhookEvent({
            action: 'signature_verification_failed',
            resourceType: 'stripe_webhook',
            severity: 'error',
            metadata: { error: err instanceof Error ? err.message : String(err) },
        }).catch(() => {}) // Fire-and-forget for signature failures
        return NextResponse.json({ error: 'Webhook signature verification failed.' }, { status: 400 })
    }

    const supabase = await createServiceRoleClient()

    // Idempotency check: skip if we've already processed this event (DB-backed).
    // Uses metadata->>stripe_event_id (not resource_id) because Stripe event IDs
    // are strings like "evt_..." which aren't valid UUIDs for the resource_id column.
    const { data: existingEvent } = await supabase
        .from('audit_log')
        .select('id')
        .eq('action', 'stripe_webhook_processed')
        .filter('metadata->>stripe_event_id', 'eq', event.id)
        .limit(1)
        .maybeSingle()

    if (existingEvent) {
        console.log(`[Webhook] Duplicate event ${event.id}, skipping`)
        return NextResponse.json({ received: true })
    }

    // Handle specific events FIRST, then record success.
    // If handling fails, Stripe will retry and the event won't be marked as processed.
    try {
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

            case 'invoice.paid':
                const paidInvoice = event.data.object as Stripe.Invoice
                await handleInvoicePaid(paidInvoice, supabase)
                break

            default:
            // Unhandled event type — still mark as processed to avoid retries
        }
    } catch (handlerError: unknown) {
        // Don't mark as processed — let Stripe retry
        console.error(`[Webhook] Handler failed for ${event.type}:`, handlerError instanceof Error ? handlerError.message : handlerError)
        return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
    }

    // Mark event as processed AFTER successful handling.
    // resource_id is null because Stripe event IDs aren't UUIDs.
    const { error: auditError } = await supabase.from('audit_log').insert({
        tenant_id: null,
        user_id: null,
        action: 'stripe_webhook_processed',
        resource_type: 'stripe_webhook',
        resource_id: null,
        metadata: {
            stripe_event_id: event.id,
            event_type: event.type,
            timestamp: new Date().toISOString(),
        },
    })

    if (auditError) {
        // Non-fatal: event was processed successfully, audit insert failed.
        // Worst case: Stripe retries and we process idempotently.
        console.error(`[Webhook] Failed to record idempotency marker:`, auditError.message)
    }

    return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: SupabaseClient) {
    const meta = session.metadata
    if (!meta) return

    const { scanId, purchaseType } = meta
    let { userId, tenantId } = meta

    // Validate metadata inputs
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const VALID_PURCHASE_TYPES = ['one_time', 'subscription', 'mitigation']
    if (purchaseType && !VALID_PURCHASE_TYPES.includes(purchaseType)) {
        console.error(`[Webhook] Invalid purchaseType in metadata: ${purchaseType}`)
        return
    }
    if (scanId && !UUID_REGEX.test(scanId)) {
        console.error('[Webhook] Invalid scanId format in metadata')
        return
    }

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
        console.log('[Webhook] Processing anonymous purchase')
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
                    console.log(`[Webhook] Found existing profile for user ${profile.id}`)
                } else {
                    // Profile not found — likely trigger lag. Retry after delay.
                    console.warn('[Webhook] User exists but profile not found. Retrying after delay...')
                    await new Promise(r => setTimeout(r, 1000))
                    const { data: retryProfile } = await supabase
                        .from('profiles')
                        .select('id, tenant_id')
                        .eq('email', customerEmail)
                        .single()
                    if (retryProfile) {
                        userId = retryProfile.id
                        tenantId = retryProfile.tenant_id
                        console.log(`[Webhook] Found profile on retry for user ${retryProfile.id}`)
                    } else {
                        // Last resort: paginated listUsers (bounded, not full table scan)
                        console.error('[Webhook] Profile still not found. Using paginated listUsers.')
                        const { data: users } = await supabase.auth.admin.listUsers({ perPage: 50 })
                        const found = users.users.find((u: { email?: string }) => u.email === customerEmail)
                        if (found) {
                            userId = found.id
                            console.log(`[Webhook] Found user via listUsers: ${userId}`)
                        }
                    }
                }
            } else if (newUser.user) {
                userId = newUser.user.id
                console.log(`[Webhook] Created new user ${userId}`)

                // Poll for profile creation (trigger)
                let profileLoop = null
                for (let i = 0; i < 5; i++) {
                    const { data: p } = await supabase.from('profiles').select('id, tenant_id').eq('id', userId).single()
                    if (p) { profileLoop = p; break }
                    await new Promise(r => setTimeout(r, 1000))
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
                        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?scan=${scanId}`
                    }
                })

                if (linkData && linkData.properties?.action_link) {
                    await sendMagicLinkEmail(customerEmail, linkData.properties.action_link)
                    console.log(`[Webhook] Sent magic link to user ${userId}`)
                } else {
                    console.error(`[Webhook] Failed to generate magic link: ${linkError?.message}`)
                }
            }

        } catch (err: unknown) {
            console.error('[Webhook] Anonymous user resolution failed:', err)
            const errMsg = err instanceof Error ? err.message : 'Unknown error'
            await logWebhookEvent({
                action: 'anonymous_user_resolution_failed',
                resourceType: 'stripe_webhook',
                severity: 'critical',
                metadata: { error: errMsg, scanId },
            })
            await alertWebhookFailure({
                eventType: 'anonymous_user_resolution',
                errorMessage: errMsg,
            })
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
                    const scanIds = updatedScans.map((s: { id: string; asset_id?: string }) => s.id)
                    const assetIds = updatedScans.map((s: { id: string; asset_id?: string }) => s.asset_id)

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
                purchased_by: userId,
            })
            .eq('id', scanId)

        if (error) {
            console.error('Failed to update scan purchase status:', error)
            await logWebhookEvent({
                action: 'scan_purchase_update_failed',
                resourceType: 'stripe_webhook',
                tenantId: tenantId || null,
                severity: 'critical',
                metadata: { scanId, error: error.message },
            })
            await alertWebhookFailure({
                eventType: 'scan_purchase_update',
                errorMessage: error.message,
                tenantId,
            })
        }

        // Send purchase receipt email (fire-and-forget)
        if (!error && customerEmail && scanId) {
            const { data: scanMeta } = await supabase
                .from('scans')
                .select('filename, composite_score')
                .eq('id', scanId)
                .single()

            if (scanMeta) {
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://contentriskscore.com'
                const dashboardUrl = `${appUrl}/dashboard?scan=${scanId}`
                sendPurchaseReceiptEmail(
                    customerEmail,
                    scanId,
                    scanMeta.composite_score || 0,
                    scanMeta.filename || 'uploaded-asset',
                    dashboardUrl,
                    session.payment_intent as string
                ).catch(err => console.error('[Webhook] Receipt email send failed:', err))
            }
        }

        // Also persist Stripe customer ID for one-time purchasers
        if (tenantId && tenantId !== 'anonymous' && session.customer) {
            await supabase
                .from('tenants')
                .update({ stripe_customer_id: session.customer as string })
                .eq('id', tenantId)
        }
    }

    // 3b. Mitigation Report Purchase ($29)
    if (purchaseType === 'mitigation' && scanId && userId && userId !== 'anonymous') {
        if (!tenantId) {
            const { data: p } = await supabase.from('profiles').select('tenant_id').eq('id', userId).single()
            tenantId = p?.tenant_id
        }

        console.log(`[Webhook] Fulfilling mitigation purchase for scan ${scanId}`)

        // Create mitigation_reports row with status='pending' to trigger async generation
        const { error: mitigationError } = await supabase
            .from('mitigation_reports')
            .insert({
                scan_id: scanId,
                tenant_id: tenantId,
                status: 'pending',
                advice_content: '', // Required by schema; populated during generation
                created_by: userId,
                idempotency_key: `purchase_${session.payment_intent}`,
                report_version: 1,
                generator_version: '1.0.0',
            })

        if (mitigationError) {
            // Check if idempotency key collision (duplicate webhook delivery)
            if (mitigationError.code === '23505') {
                console.log(`[Webhook] Mitigation report already created for payment ${session.payment_intent}`)
            } else {
                console.error('Failed to create mitigation report:', mitigationError)
                await logWebhookEvent({
                    action: 'mitigation_purchase_failed',
                    resourceType: 'stripe_webhook',
                    tenantId: tenantId || null,
                    severity: 'critical',
                    metadata: { scanId, error: mitigationError.message },
                })
            }
        }

        // Persist Stripe customer ID
        if (tenantId && tenantId !== 'anonymous' && session.customer) {
            await supabase
                .from('tenants')
                .update({ stripe_customer_id: session.customer as string })
                .eq('id', tenantId)
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

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: SupabaseClient) {
    const tenantId = subscription.metadata?.tenantId
    if (!tenantId) return

    const priceId = subscription.items.data[0]?.price?.id || ''
    const planId = STRIPE_PRICE_TO_PLAN[priceId] || 'pro'

    await applyPlanToTenant(supabase, tenantId, planId, {
        subscription_status: subscription.status,
        stripe_customer_id: subscription.customer as string,
        stripe_subscription_id: subscription.id,
    })
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription, supabase: SupabaseClient) {
    const tenantId = subscription.metadata?.tenantId
    if (!tenantId) return

    // Downgrade to free — preserve customer ID for re-subscription
    await applyPlanToTenant(supabase, tenantId, 'free', {
        subscription_status: 'canceled',
        stripe_subscription_id: null,
        stripe_customer_id: subscription.customer as string,
    })
}

/**
 * Reset monthly quota when Stripe invoice is paid.
 * Only applies to subscription invoices — one-time payments are skipped.
 * This ensures paid users' quota resets on their billing cycle, not a calendar month.
 */
async function handleInvoicePaid(invoice: Stripe.Invoice, supabase: SupabaseClient) {
    // Only reset on subscription invoices (not one-time payments)
    const subscriptionRef = invoice.parent?.subscription_details?.subscription
    if (!subscriptionRef) return

    try {
        const subscriptionId = typeof subscriptionRef === 'string'
            ? subscriptionRef
            : subscriptionRef.id
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const tenantId = subscription.metadata?.tenantId
        if (!tenantId) {
            console.warn('[Webhook] invoice.paid: No tenantId in subscription metadata')
            return
        }

        // Reset the monthly quota counters (scans + mitigations)
        const { error } = await supabase
            .from('tenants')
            .update({
                scans_used_this_month: 0,
                mitigations_used_this_month: 0,
                billing_period_start: new Date().toISOString(),
            })
            .eq('id', tenantId)

        if (error) {
            console.error(`[Webhook] Failed to reset quota for tenant ${tenantId}:`, error)
            await logWebhookEvent({
                action: 'quota_reset_failed',
                resourceType: 'stripe_webhook',
                resourceId: tenantId,
                tenantId,
                severity: 'critical',
                metadata: { invoiceId: invoice.id, error: error.message },
            })
            await alertWebhookFailure({
                eventType: 'invoice_paid_quota_reset',
                errorMessage: error.message,
                tenantId,
            })
        } else {
            console.log(`[Webhook] Reset quota for tenant ${tenantId} (invoice: ${invoice.id})`)
            await logWebhookEvent({
                action: 'quota_reset_success',
                resourceType: 'stripe_webhook',
                resourceId: tenantId,
                tenantId,
                severity: 'info',
                metadata: { invoiceId: invoice.id },
            })
        }
    } catch (err: unknown) {
        console.error('[Webhook] handleInvoicePaid error:', err)
        await logWebhookEvent({
            action: 'invoice_paid_handler_error',
            resourceType: 'stripe_webhook',
            severity: 'critical',
            metadata: { invoiceId: invoice.id, error: err instanceof Error ? err.message : 'Unknown error' },
        })
    }
}

/**
 * Apply plan configuration to tenant
 * Source of truth: lib/plans.ts
 */
async function applyPlanToTenant(
    supabase: SupabaseClient,
    tenantId: string,
    planId: PlanId,
    extraFields: Record<string, string | number | boolean | null> = {}
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
            // Mitigation limits
            monthly_mitigation_limit: plan.monthlyMitigations,
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
        await logWebhookEvent({
            action: 'apply_plan_failed',
            resourceType: 'stripe_webhook',
            resourceId: tenantId,
            tenantId,
            severity: 'critical',
            metadata: { planId, error: error.message },
        })
        await alertWebhookFailure({
            eventType: 'apply_plan_to_tenant',
            errorMessage: error.message,
            tenantId,
        })
    }
}
