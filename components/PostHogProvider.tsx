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
