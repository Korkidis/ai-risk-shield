import SharedScanView from '@/components/scan/SharedScanView'
import ScanRedirectClient from '@/components/scan/ScanRedirectClient'

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
