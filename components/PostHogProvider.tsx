'use client'

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'

function PostHogPageview() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return
        posthog.capture('$pageview', { $current_url: window.location.href })
    }, [pathname, searchParams])

    return null
}

// BETA NOTE: Do not set NEXT_PUBLIC_POSTHOG_KEY in preview/beta environments.
// PostHog uses localStorage+cookie and initializes before any consent flow exists.
// Re-enable only after a proper consent gate is implemented.
export function PostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
        if (!key) return
        posthog.init(key, {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
            capture_pageview: false,  // Manual pageview tracking via PostHogPageview
            persistence: 'localStorage+cookie',
        })
    }, [])

    return (
        <>
            <Suspense fallback={null}>
                <PostHogPageview />
            </Suspense>
            {children}
        </>
    )
}
