import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * GET /api/cron/cleanup-rate-limits
 *
 * Vercel Cron Job: Runs daily at 3:00 AM UTC.
 * Deletes stale rate_limits entries not updated in 24 hours.
 */
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization')
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const supabase = await createServiceRoleClient()

        const { data, error } = await supabase.rpc('cleanup_stale_rate_limits')

        if (error) {
            console.error('[Cron] cleanup_stale_rate_limits RPC error:', error.message)
            return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
        }

        const deletedCount = data ?? 0
        console.log(`[Cron] Cleaned up ${deletedCount} stale rate limit entries`)

        return NextResponse.json({ deleted: deletedCount })
    } catch (err) {
        console.error('[Cron] Unexpected error in rate limit cleanup:', err)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
