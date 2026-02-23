import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { logWebhookEvent } from '@/lib/webhook-monitor'

/**
 * GET /api/cron/reset-quotas
 *
 * Vercel Cron Job: Runs on 1st of each month at 00:05 UTC.
 * Resets scans_used_this_month for FREE tenants only.
 * Paid tenants are reset by the Stripe invoice.paid webhook.
 */
export async function GET(request: Request) {
    // Verify cron secret (Vercel sets this automatically for cron jobs)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const supabase = await createServiceRoleClient()

        // Reset only free tenants — paid tenants reset via invoice.paid
        const { data, error } = await (supabase
            .from('tenants') as any)
            .update({
                scans_used_this_month: 0,
                billing_period_start: new Date().toISOString(),
            })
            .eq('plan', 'free')
            .select('id')

        if (error) {
            console.error('[Cron] Quota reset failed:', error)
            await logWebhookEvent({
                action: 'cron_quota_reset_failed',
                resourceType: 'cron',
                severity: 'critical',
                metadata: { error: error.message },
            })
            return NextResponse.json({ error: 'Reset failed' }, { status: 500 })
        }

        const count = data?.length || 0
        console.log(`[Cron] Reset quotas for ${count} free tenants`)

        // Audit log the reset
        await logWebhookEvent({
            action: 'cron_quota_reset',
            resourceType: 'cron',
            severity: 'info',
            metadata: { plan: 'free', tenantsReset: count },
        })

        return NextResponse.json({ success: true, tenantsReset: count })
    } catch (err: any) {
        console.error('[Cron] Unexpected error:', err)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
