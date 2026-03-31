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
 * Uses atomic PostgreSQL function `check_rate_limit_atomic()` with FOR UPDATE
 * row locking to prevent concurrent bypass (thundering herd).
 *
 * Fail-open: returns `{ allowed: true }` on DB errors so rate limiting
 * never blocks legitimate users when Supabase is unavailable.
 */
export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
    try {
        const supabase = await createServiceRoleClient()

        const { data, error } = await supabase.rpc('check_rate_limit_atomic', {
            p_key: config.key,
            p_action: config.action,
            p_max_attempts: config.maxAttempts,
            p_window_seconds: config.windowSeconds,
            p_block_seconds: config.blockSeconds ?? undefined,
        }).single()

        if (error) {
            // RPC might not exist yet (migration not applied) — fail open
            console.error('[RateLimit] RPC error, failing open:', error.message)
            return { allowed: true, remaining: 1 }
        }

        return {
            allowed: data.allowed,
            remaining: data.remaining,
            retryAfter: data.retry_after > 0 ? data.retry_after : undefined,
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
    const secret = process.env.IP_HASH_SECRET
    if (!secret && process.env.NODE_ENV === 'production') {
        console.error('[CRITICAL] IP_HASH_SECRET is not set — per-IP rate limiting is ineffective. Generate one: openssl rand -hex 32')
    }
    return crypto.createHmac('sha256', secret || 'dev-secret-do-not-use-in-prod').update(ip).digest('hex')
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
    // Exclude failed scans from quota count (Sprint 10.4):
    // Failed scans are free — only count processing + completed scans.
    const { count: sessionCount, error: sessionError } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .neq('status', 'failed')
        .gte('created_at', windowStart.toISOString())

    if (sessionError) {
        console.error('Quota check error (session):', sessionError)
        return { allowed: false, remaining: 0, reason: 'session_limit', limit: MAX_SCANS }
    }

    const currentSessionCount = sessionCount || 0
    if (currentSessionCount >= MAX_SCANS) {
        return { allowed: false, remaining: 0, reason: 'session_limit', limit: MAX_SCANS }
    }

    // 2. Check IP Limits (Hash based) from scan outcomes.
    // This ensures failed scans are excluded for IP limits too.
    const { count: ipCount, error: ipError } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true })
        .eq('ip_hash', ipHash)
        .neq('status', 'failed')
        .gte('created_at', windowStart.toISOString())

    if (ipError) {
        console.error('Quota check error (ip):', ipError)
        return { allowed: false, remaining: 0, reason: 'ip_limit', limit: MAX_SCANS }
    }

    const currentIpCount = ipCount || 0

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
    // Deprecated in Sprint 10 follow-up.
    // Anonymous quota is now derived directly from `scans` rows (session_id/ip_hash)
    // with failed scans excluded, so no separate IP timestamp ledger is needed.
    await Promise.resolve()
}
