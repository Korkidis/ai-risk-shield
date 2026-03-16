'use client'

import { useRouter } from 'next/navigation'
import { trackEvent } from '@/lib/analytics'

export function UpgradeButton({ scanId }: { scanId?: string }) {
    const router = useRouter()

    const handleUpgrade = () => {
        trackEvent('upgrade_button_clicked', { source_scan_id: scanId })
        const url = scanId ? `/pricing?source=upgrade_button&plan=pro&scanId=${scanId}` : `/pricing?source=upgrade_button&plan=pro`
        router.push(url)
    }

    return (
        <button
            onClick={handleUpgrade}
            type="button"
            className="w-full bg-[var(--rs-signal)] text-[var(--rs-text-inverse)] px-8 py-4 rounded-xl font-black uppercase tracking-[0.15em] hover:scale-[1.02] hover:shadow-[var(--rs-shadow-l2)] transition-all rs-bevel overflow-hidden"
        >
            View Upgrade Plans
        </button>
    )
}
