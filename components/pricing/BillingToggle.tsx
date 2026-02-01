'use client'

import { cn } from '@/lib/utils'

interface BillingToggleProps {
    interval: 'monthly' | 'annual'
    onChange: (interval: 'monthly' | 'annual') => void
}

export function BillingToggle({ interval, onChange }: BillingToggleProps) {
    return (
        <div className="flex items-center justify-center gap-4">
            <button
                onClick={() => onChange('monthly')}
                className={cn(
                    "text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-[var(--rs-radius-element)] transition-all",
                    interval === 'monthly'
                        ? "bg-[var(--rs-bg-inverse)] text-white"
                        : "text-[var(--rs-text-tertiary)] hover:text-[var(--rs-text-primary)]"
                )}
            >
                Monthly
            </button>

            <div className="relative">
                <button
                    onClick={() => onChange('annual')}
                    className={cn(
                        "text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-[var(--rs-radius-element)] transition-all",
                        interval === 'annual'
                            ? "bg-[var(--rs-bg-inverse)] text-white"
                            : "text-[var(--rs-text-tertiary)] hover:text-[var(--rs-text-primary)]"
                    )}
                >
                    Annual
                </button>
                {/* Savings badge */}
                <span className="absolute -top-2 -right-8 bg-[var(--rs-safe)] text-white text-[8px] font-bold uppercase px-2 py-0.5 rounded-full">
                    Save 20%
                </span>
            </div>
        </div>
    )
}
