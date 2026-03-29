import { NextResponse } from 'next/server'

/**
 * GET /api/cron/recover-stale-scans
 *
 * Vercel Cron Job: Runs hourly (at :30).
 * Finds scans stuck in 'processing' for >10 minutes and reprocesses them.
 * Also picks up any 'pending' scans that were never started.
 * This handles the case where a Vercel function was killed mid-processing
 * (OOM, timeout) and the scan was never marked as failed.
 */
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization')
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { processPendingScans } = await import('@/lib/ai/scan-processor')
        const result = await processPendingScans()

        console.log(`[Cron] Stale scan recovery: processed=${result.processed}, succeeded=${result.succeeded}, failed=${result.failed}`)

        return NextResponse.json(result)
    } catch (err) {
        console.error('[Cron] Unexpected error in stale scan recovery:', err)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
