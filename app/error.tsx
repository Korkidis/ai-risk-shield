'use client'

import { RSBackground } from '@/components/rs/RSBackground'
import { RSEmptyState } from '@/components/rs/RSEmptyState'
import { RSButton } from '@/components/rs/RSButton'
import { AlertOctagon } from 'lucide-react'

export default function Error({
    error: _error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <RSBackground variant="technical" className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full mx-4">
                <RSEmptyState
                    icon={<AlertOctagon className="w-8 h-8 text-[var(--rs-signal)]" />}
                    title="System Error"
                    description="An unexpected error occurred during analysis. Our forensic systems have been notified."
                    action={
                        <RSButton variant="primary" onClick={reset}>
                            RETRY_OPERATION
                        </RSButton>
                    }
                />
            </div>
        </RSBackground>
    )
}
