import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { reportScanUsage } from '@/lib/stripe-usage'
import { logWebhookEvent, alertWebhookFailure } from '@/lib/webhook-monitor'

/**
 * GET /api/cron/retry-usage-reports
 *
 * Vercel Cron Job: Runs every 15 minutes.
 * Retries failed Stripe usage reports with exponential backoff.
 * After max_attempts failures, alerts and stops retrying.
 */
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization')
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const supabase = await createServiceRoleClient()

        // Atomically claim rows for processing to prevent concurrent cron runs
        // from double-processing the same reports.
        // The RPC uses UPDATE...RETURNING to advance next_retry_at as a claim
        // marker, so rows won't be picked up by another worker even after the
        // transaction commits.
        const { data: pending, error } = await (supabase as any)
            .rpc('claim_failed_usage_reports', { batch_limit: 50 })

        // Fallback: only if the RPC function doesn't exist yet (code 42883).
        // This allows deployment before the migration runs.
        // Any other RPC error is a real failure and should surface.
        let rows = pending
        if (error) {
            const isFunctionMissing = error.code === '42883' || error.code === 'PGRST202'
            if (!isFunctionMissing) {
                console.error('[Cron] RPC claim_failed_usage_reports failed:', error)
                return NextResponse.json({ error: 'Claim failed' }, { status: 500 })
            }

            console.warn('[Cron] claim_failed_usage_reports RPC not deployed yet, using fallback query')
            const { data: fallbackRows, error: fallbackError } = await (supabase
                .from('failed_usage_reports') as any)
                .select('*')
                .is('resolved_at', null)
                .lt('attempts', 5)  // Hardcoded ceiling for pre-migration fallback
                .lte('next_retry_at', new Date().toISOString())
                .order('created_at', { ascending: true })
                .limit(50)

            if (fallbackError || !fallbackRows) {
                console.error('[Cron] Failed to fetch pending usage reports:', fallbackError)
                return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
            }
            rows = fallbackRows
        }

        if (!rows || rows.length === 0) {
            return NextResponse.json({ resolved: 0, retried: 0, total: 0 })
        }

        let resolved = 0
        let retried = 0

        for (const report of rows) {
            // skipRetryRecord: true — prevents creating duplicate retry rows on failure
            const result = await reportScanUsage(report.tenant_id, report.quantity, { skipRetryRecord: true })

            if (result.success) {
                // Mark resolved
                await (supabase.from('failed_usage_reports') as any)
                    .update({ resolved_at: new Date().toISOString() })
                    .eq('id', report.id)
                resolved++
            } else {
                const maxAttempts = report.max_attempts || 5
                const newAttempts = report.attempts + 1
                // Exponential backoff: 5m, 15m, 45m, 2h15m, 6h45m
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
                if (newAttempts >= maxAttempts) {
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
                        errorMessage: `Failed after ${maxAttempts} attempts: ${result.error}`,
                        tenantId: report.tenant_id,
                    })
                }
            }
        }

        console.log(`[Cron] Usage retry: ${resolved} resolved, ${retried} retried, ${rows.length} total`)

        return NextResponse.json({ resolved, retried, total: rows.length })
    } catch (err: any) {
        console.error('[Cron] Usage retry error:', err)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
