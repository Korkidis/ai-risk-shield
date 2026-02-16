import { createServiceRoleClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import crypto from 'crypto'

export const MAX_SCANS = 3
const WINDOW_DAYS = 30

export async function hashIp(ip: string): Promise<string> {
    const secret = process.env.IP_HASH_SECRET || 'dev-secret-do-not-use-in-prod'
    return crypto.createHmac('sha256', secret).update(ip).digest('hex')
}

export async function getClientIp() {
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')

    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim()
    }
    if (realIp) {
        return realIp.trim()
    }
    return '127.0.0.1'
}

type QuotaResult = {
    allowed: boolean
    reason?: 'ip_limit' | 'session_limit'
    remaining: number
    limit: number
}

export async function checkAnonymousQuota(sessionId: string): Promise<QuotaResult> {
    const supabase = await createServiceRoleClient()
    const ip = await getClientIp()
    const ipHash = await hashIp(ip)

    const windowStart = new Date()
    windowStart.setDate(windowStart.getDate() - WINDOW_DAYS)

    // 1. Check Session Limits (Cookie based)
    const { count: sessionCount, error: sessionError } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .gte('created_at', windowStart.toISOString())

    if (sessionError) {
        console.error('Quota check error (session):', sessionError)
        // Fail open if DB error, or closed? Closed is safer for abuse.
        return { allowed: false, remaining: 0, reason: 'session_limit', limit: MAX_SCANS }
    }

    const currentSessionCount = sessionCount || 0
    if (currentSessionCount >= MAX_SCANS) {
        return { allowed: false, remaining: 0, reason: 'session_limit', limit: MAX_SCANS }
    }

    // 2. Check IP Limits (Hash based)
    const { data: ipData } = await supabase
        .from('ips' as any)
        .select('scan_timestamps')
        .eq('ip_hash', ipHash)
        .single()

    // If no record, they are new
    let currentIpCount = 0
    const timestamps = (ipData as any)?.scan_timestamps
    if (timestamps) {
        // Filter timestamps within window
        const validTimestamps = timestamps.filter((ts: string) =>
            new Date(ts) > windowStart
        )
        currentIpCount = validTimestamps.length
    }

    if (currentIpCount >= MAX_SCANS) {
        return { allowed: false, remaining: 0, reason: 'ip_limit', limit: MAX_SCANS }
    }

    // Calculate remaining based on the tighter constraint
    const sessionRemaining = MAX_SCANS - currentSessionCount
    const ipRemaining = MAX_SCANS - currentIpCount

    return {
        allowed: true,
        remaining: Math.min(sessionRemaining, ipRemaining),
        limit: MAX_SCANS
    }
}

export async function recordAnonymousScan() {
    const supabase = await createServiceRoleClient()
    const ip = await getClientIp()
    const ipHash = await hashIp(ip)

    // 1. Session count is handled by the INSERT into 'scans' naturally
    // We just need to ensure the caller does that Insert.

    // 2. Update IP count
    const now = new Date().toISOString()

    // We use upsert directly as it's cleaner than maintaining an RPC that might get out of sync
    const { data: existing } = await supabase
        .from('ips' as any)
        .select('scan_timestamps')
        .eq('ip_hash', ipHash)
        .single()

    const windowStart = new Date()
    windowStart.setDate(windowStart.getDate() - WINDOW_DAYS)

    let newTimestamps = [now]
    const existingTimestamps = (existing as any)?.scan_timestamps
    if (existingTimestamps) {
        // Filter out old timestamps and add new one
        const validOldTimestamps = existingTimestamps.filter((ts: string) =>
            new Date(ts) > windowStart
        )
        newTimestamps = [...validOldTimestamps, now]
    }

    const { error: upsertError } = await (supabase
        .from('ips') as any) // Cast to any because ips table types aren't generated
        .upsert({
            ip_hash: ipHash,
            scan_timestamps: newTimestamps,
            last_scan_at: now
        }, { onConflict: 'ip_hash' })

    if (upsertError) {
        console.error('Failed to record IP scan:', upsertError)
    }
}
