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
            allowed: quota.allowed
        })
    } catch (error) {
        console.error('Quota check error:', error)
        // Fail open or closed? For UI, maybe just return default
        return NextResponse.json({ remaining: 3, allowed: true })
    }
}
