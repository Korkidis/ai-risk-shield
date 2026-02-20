import { NextResponse } from 'next/server'
import { getOrCreateSessionId } from '@/lib/session'
import { checkAnonymousQuota } from '@/lib/ratelimit'

/**
 * GET /api/scans/anonymous-quota
 * Returns the remaining free scans for the current anonymous session.
 */
export async function GET() {
    try {
        const sessionId = await getOrCreateSessionId()
        const quota = await checkAnonymousQuota(sessionId)

        return NextResponse.json({
            remaining: quota.remaining,
            allowed: quota.allowed,
            limit: quota.limit
        })
    } catch (error) {
        console.error('Quota check error:', error)
        // Fail closed — don't allow scans when quota service is down
        return NextResponse.json({ remaining: 0, allowed: false, limit: 3 }, { status: 503 })
    }
}
