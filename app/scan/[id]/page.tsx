'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function ScanRedirect() {
    const params = useParams()
    const router = useRouter()
    const id = params.id

    useEffect(() => {
        if (id) {
            router.replace(`/dashboard/scans-reports?highlight=${id}`)
        } else {
            router.replace('/dashboard/scans-reports')
        }
    }, [id, router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-[#a1a1aa] font-mono text-sm">
            <p className="animate-pulse">Redirecting to secure dashboard...</p>
        </div>
    )
}
