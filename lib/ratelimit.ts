import { createServiceRoleClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import crypto from 'crypto'

export const MAX_SCANS = 3
const WINDOW_DAYS = 30

// ============================================================================
// Generic Rate Limiter (Phase R)
// ============================================================================

export type RateLimitConfig = {
    action: string          // "login", "signup", "password_reset", "magic_link", "upload", "checkout"
    key: string             // hashed IP, email, or user/tenant ID
    maxAttempts: number     // e.g. 5
    windowSeconds: number   // e.g. 900 (15 min)
    blockSeconds?: number   // optional progressive block duration (e.g. 3600 = 1 hour)
}

export type RateLimitResult = {
    allowed: boolean
    remaining: number
    retryAfter?: number     // seconds until next allowed attempt
}

/**
 * Generic sliding-window rate limiter backed by Supabase `rate_limits` table.
 *
 * Fail-open: returns `{ allowed: true }` on DB errors so rate limiting
 * never blocks legitimate users when Supabase is unavailable.
 */
export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
    try {
        const supabase = await createServiceRoleClient()
        const now = new Date()

        // 1. Fetch existing record
        const { data: existing } = await supabase
            .from('rate_limits')
            .select('timestamps, blocked_until')
            .eq('key', config.key)
            .eq('action', config.action)
            .single()

        // 2. Check if currently blocked
        if (existing?.blocked_until) {
            const blockedUntil = new Date(existing.blocked_until)
            if (blockedUntil > now) {
                const retryAfter = Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000)
                return { allowed: false, remaining: 0, retryAfter }
            }
        }

        // 3. Filter timestamps within the sliding window
        const windowStart = new Date(now.getTime() - config.windowSeconds * 1000)
        const validTimestamps = (existing?.timestamps || [])
            .filter((ts: string) => new Date(ts) > windowStart)

        // 4. Check if at limit
        if (validTimestamps.length >= config.maxAttempts) {
            // Optionally set a progressive block
            let blockedUntil: string | null = null
            if (config.blockSeconds) {
                blockedUntil = new Date(now.getTime() + config.blockSeconds * 1000).toISOString()
            }

            // Update the record with the block
            await supabase
                .from('rate_limits')
                .upsert({
                    key: config.key,
                    action: config.action,
                    timestamps: validTimestamps,
                    blocked_until: blockedUntil,
                    updated_at: now.toISOString(),
                }, { onConflict: 'key,action' })

            // Estimate when the oldest timestamp in the window expires
            const oldestInWindow = new Date(validTimestamps[0])
            const retryAfter = config.blockSeconds
                ? config.blockSeconds
                : Math.ceil((oldestInWindow.getTime() + config.windowSeconds * 1000 - now.getTime()) / 1000)

            return { allowed: false, remaining: 0, retryAfter: Math.max(1, retryAfter) }
        }

        // 5. Allowed — append current timestamp and upsert
        const updatedTimestamps = [...validTimestamps, now.toISOString()]

        await supabase
            .from('rate_limits')
            .upsert({
                key: config.key,
                action: config.action,
                timestamps: updatedTimestamps,
                blocked_until: null,  // Clear any expired block
                updated_at: now.toISOString(),
            }, { onConflict: 'key,action' })

        return {
            allowed: true,
            remaining: config.maxAttempts - updatedTimestamps.length,
        }
    } catch (error) {
        // Fail-open: rate limiting should never block legitimate users if DB is down
        console.error('[RateLimit] DB error, failing open:', error)
        return { allowed: true, remaining: 1 }
    }
}

/**
 * Convenience: get IP hash for rate limiting key.
 * Combines getClientIp + hashIp in one call.
 */
export async function getRateLimitKey(): Promise<string> {
    const ip = await getClientIp()
    return hashIp(ip)
}

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
        return { allowed: false, remaining: 0, reason: 'session_limit', limit: MAX_SCANS }
    }

    const currentSessionCount = sessionCount || 0
    if (currentSessionCount >= MAX_SCANS) {
        return { allowed: false, remaining: 0, reason: 'session_limit', limit: MAX_SCANS }
    }

    // 2. Check IP Limits (Hash based)
    const { data: ipData } = await supabase
        .from('ips')
        .select('scan_timestamps')
        .eq('ip_hash', ipHash)
        .single()

    // If no record, they are new
    let currentIpCount = 0
    const timestamps = ipData?.scan_timestamps
    if (timestamps) {
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

    const { data: existing } = await supabase
        .from('ips')
        .select('scan_timestamps')
        .eq('ip_hash', ipHash)
        .single()

    const windowStart = new Date()
    windowStart.setDate(windowStart.getDate() - WINDOW_DAYS)

    let newTimestamps = [now]
    const existingTimestamps = existing?.scan_timestamps
    if (existingTimestamps) {
        const validOldTimestamps = existingTimestamps.filter((ts: string) =>
            new Date(ts) > windowStart
        )
        newTimestamps = [...validOldTimestamps, now]
    }

    const { error: upsertError } = await supabase
        .from('ips')
        .upsert({
            ip_hash: ipHash,
            scan_timestamps: newTimestamps,
        }, { onConflict: 'ip_hash' })

    if (upsertError) {
        console.error('Failed to record IP scan:', upsertError)
    }
}
