import { redirect } from 'next/navigation'

/**
 * Sprint 10.1: Legacy /dashboard route deprecated.
 *
 * All traffic now routes to the canonical Scans Workspace at /dashboard/scans-reports.
 * Query params are preserved (e.g., ?highlight=xxx&verified=true) for backward compat
 * with existing magic links and bookmarks.
 */
export default function DashboardPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    // Build redirect URL preserving any query params
    const params = new URLSearchParams()

    // Map legacy ?scan= to canonical ?highlight=
    const scanId = searchParams.scan
    if (typeof scanId === 'string') {
        params.set('highlight', scanId)
    }

    // Forward other params as-is
    for (const [key, value] of Object.entries(searchParams)) {
        if (key === 'scan') continue // Already mapped to highlight
        if (typeof value === 'string') {
            params.set(key, value)
        }
    }

    const queryString = params.toString()
    const target = `/dashboard/scans-reports${queryString ? `?${queryString}` : ''}`

    redirect(target)
}
