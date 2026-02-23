/**
 * Analytics wrapper — thin layer over PostHog.
 * Handles undefined PostHog gracefully (dev environments, SSR, no key configured).
 */
import posthog from 'posthog-js'

export function trackEvent(event: string, properties?: Record<string, unknown>) {
    if (typeof window === 'undefined') return
    try {
        posthog.capture(event, properties)
    } catch {
        // Silent — analytics should never break the app
    }
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
    if (typeof window === 'undefined') return
    try {
        posthog.identify(userId, traits)
    } catch {
        // Silent
    }
}
