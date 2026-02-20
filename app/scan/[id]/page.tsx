import type { Metadata } from 'next'
import SharedScanView from '@/components/scan/SharedScanView'
import ScanRedirectClient from '@/components/scan/ScanRedirectClient'

// Prevent share token leakage via Referer header
export const metadata: Metadata = {
    referrer: 'no-referrer',
}

interface Props {
    params: Promise<{ id: string }>
    searchParams: Promise<{ token?: string }>
}

export default async function ScanPage({ params, searchParams }: Props) {
    const { id } = await params
    const { token } = await searchParams

    if (token) {
        return <SharedScanView scanId={id} token={token} />
    }

    return <ScanRedirectClient id={id} />
}
