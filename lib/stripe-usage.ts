import Stripe from 'stripe'
import { createServiceRoleClient } from './supabase/server'

// Initialize Stripe with secret key for usage reporting
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

/**
 * Report scan usage to Stripe for metered billing
 * 
 * This should be called after each successful scan for paid tenants.
 * Stripe will automatically bill overages at the end of the billing cycle.
 */
export async function reportScanUsage(tenantId: string, quantity: number = 1, options?: { skipRetryRecord?: boolean }): Promise<{
    success: boolean
    error?: string
}> {
    try {
        const supabase = await createServiceRoleClient()

        // Get the metered subscription item ID for this tenant
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .select('stripe_metered_item_id, plan')
            .eq('id', tenantId)
            .single() as { data: { stripe_metered_item_id: string | null, plan: string } | null, error: any }

        if (tenantError || !tenant) {
            console.error('Tenant not found for usage reporting:', tenantId)
            return { success: false, error: 'Tenant not found' }
        }

        // Only report usage for paid plans with active metered subscriptions
        if (!tenant.stripe_metered_item_id) {
            // Free users or users without metered billing set up
            // This is not an error - just skip reporting
            return { success: true }
        }

        if (tenant.plan === 'free') {
            // Free users shouldn't have metered billing
            return { success: true }
        }

        // Report usage to Stripe using usage records API
        // @ts-ignore - Stripe types may not include createUsageRecord
        const usageRecord = await stripe.subscriptionItems.createUsageRecord(
            tenant.stripe_metered_item_id,
            {
                quantity,
                action: 'increment',
                timestamp: 'now'
            }
        )

        console.log(`Reported ${quantity} scan(s) for tenant ${tenantId}:`, usageRecord.id)

        return { success: true }
    } catch (error: any) {
        console.error('Failed to report usage to Stripe:', error)

        // Record failure for retry via cron job (skip if called FROM the retry worker)
        if (!options?.skipRetryRecord) {
            try {
                const retrySupabase = await createServiceRoleClient()
                await retrySupabase.from('failed_usage_reports').insert({
                    tenant_id: tenantId,
                    quantity,
                    last_error: (error.message || 'Unknown error').substring(0, 500),
                    next_retry_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min
                })
            } catch (recordErr) {
                console.error('Failed to record usage report failure:', recordErr)
            }
        }

        // Don't fail the scan if usage reporting fails
        return {
            success: false,
            error: error.message
        }
    }
}

/**
 * Get current usage for a tenant's billing period
 */
export async function getCurrentUsage(subscriptionItemId: string): Promise<number> {
    try {
        // @ts-ignore - Stripe types may not include listUsageRecordSummaries
        const summaries = await stripe.subscriptionItems.listUsageRecordSummaries(
            subscriptionItemId,
            { limit: 1 }
        )

        if (summaries.data.length > 0) {
            return summaries.data[0].total_usage
        }

        return 0
    } catch (error) {
        console.error('Failed to get usage summary:', error)
        return 0
    }
}
