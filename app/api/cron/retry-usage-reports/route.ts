import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { reportScanUsage } from '@/lib/stripe-usage'
import { logWebhookEvent, alertWebhookFailure } from '@/lib/webhook-monitor'

/**
 * GET /api/cron/retry-usage-reports
 *
 * Vercel Cron Job: Runs every 15 minutes.
 * Retries failed Stripe usage reports with exponential backoff.
 * After 5 failed attempts (~9 hours), alerts and stops retrying.
 */
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const supabase = await createServiceRoleClient()

        // Fetch pending retries (up to 50 per run)
        const { data: pending, error } = await (supabase
            .from('failed_usage_reports') as any)
            .select('*')
            .is('resolved_at', null)
            .lt('attempts', 5)
            .lte('next_retry_at', new Date().toISOString())
            .order('created_at', { ascending: true })
            .limit(50)

        if (error || !pending) {
            console.error('[Cron] Failed to fetch pending usage reports:', error)
            return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
        }

        if (pending.length === 0) {
            return NextResponse.json({ resolved: 0, retried: 0, total: 0 })
        }

        let resolved = 0
        let retried = 0

        for (const report of pending) {
            const result = await reportScanUsage(report.tenant_id, report.quantity)

            if (result.success) {
                // Mark resolved
                await (supabase.from('failed_usage_reports') as any)
                    .update({ resolved_at: new Date().toISOString() })
                    .eq('id', report.id)
                resolved++
            } else {
                // Exponential backoff: 5m, 15m, 45m, 2h15m, 6h45m
                const newAttempts = report.attempts + 1
                const backoffMinutes = Math.pow(3, report.attempts) * 5
                const nextRetry = new Date(Date.now() + backoffMinutes * 60 * 1000)

                await (supabase.from('failed_usage_reports') as any)
                    .update({
                        attempts: newAttempts,
                        last_error: (result.error || 'Unknown error').substring(0, 500),
                        next_retry_at: nextRetry.toISOString(),
                    })
                    .eq('id', report.id)
                retried++

                // Alert if max attempts exhausted
                if (newAttempts >= 5) {
                    await logWebhookEvent({
                        action: 'usage_report_exhausted',
                        resourceType: 'usage_reporting',
                        tenantId: report.tenant_id,
                        severity: 'critical',
                        metadata: {
                            reportId: report.id,
                            quantity: report.quantity,
                            lastError: result.error,
                        },
                    })
                    await alertWebhookFailure({
                        eventType: 'usage_report_max_retries_exhausted',
                        errorMessage: `Failed after 5 attempts: ${result.error}`,
                        tenantId: report.tenant_id,
                    })
                }
            }
        }

        console.log(`[Cron] Usage retry: ${resolved} resolved, ${retried} retried, ${pending.length} total`)

        return NextResponse.json({ resolved, retried, total: pending.length })
    } catch (err: any) {
        console.error('[Cron] Usage retry error:', err)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
