'use client'

import { RSEmptyState } from '@/components/rs/RSEmptyState'
import { RSButton } from '@/components/rs/RSButton'
import { AlertOctagon } from 'lucide-react'
import Link from 'next/link'

export default function DashboardError({
    error: _error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-md w-full">
                <RSEmptyState
                    icon={<AlertOctagon className="w-8 h-8 text-[var(--rs-signal)]" />}
                    title="Dashboard Error"
                    description="Something went wrong loading this page. Try again or return to the dashboard home."
                    action={
                        <div className="flex gap-3">
                            <RSButton variant="secondary" onClick={reset}>
                                RETRY
                            </RSButton>
                            <Link href="/dashboard">
                                <RSButton variant="primary">
                                    DASHBOARD_HOME
                                </RSButton>
                            </Link>
                        </div>
                    }
                />
            </div>
        </div>
    )
}
