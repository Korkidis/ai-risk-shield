'use client';

import { useEffect, useState } from 'react';
import { getTenantBillingStatus, BillingStatus } from '@/app/actions/billing';
import { PLANS } from '@/lib/plans';

export function TenantPlanBadge() {
    const [status, setStatus] = useState<BillingStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTenantBillingStatus()
            .then(data => setStatus(data))
            .catch(err => console.error('Failed to load billing status', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="h-16 w-full bg-rs-gray-200/50 animate-pulse rounded-[4px]" />;
    }

    if (!status) return null;

    const planConfig = PLANS[status.planId as keyof typeof PLANS] || PLANS.free;
    const planName = planConfig.name.toUpperCase();

    return (
        <div className="bg-rs-gray-200/50 rounded p-3 text-xs text-rs-gray-500">
            <p className="font-bold text-rs-black mb-1">{planName} PLAN</p>
            {/* Ideally verify license key logic later */}
            <p className="mb-px opacity-70">License: ACTIVE</p>
            <div className="flex justify-between items-center mt-1">
                <span>Seats Used:</span>
                <span className="font-mono font-medium text-rs-black">{status.seatsUsed}/{status.seatLimit}</span>
            </div>
        </div>
    );
}
