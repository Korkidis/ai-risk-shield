'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { RSSelect } from '@/components/rs/RSSelect';
import { getAccessibleTenants, switchTenant, getActiveTenantId, Tenant } from '@/app/actions/tenant';
import { Loader2 } from 'lucide-react';

export function TenantSwitcher() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [activeTenantId, setActiveTenantId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    // We can use a simple toast if available, otherwise just console or basic alert for MVP
    // Assuming useToast hook exists or we can mock it
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        async function init() {
            try {
                const [accessList, currentId] = await Promise.all([
                    getAccessibleTenants(),
                    getActiveTenantId()
                ]);

                setTenants(accessList);
                setActiveTenantId(currentId);
            } catch (err) {
                console.error('Failed to load tenants', err);
            } finally {
                setLoading(false);
            }
        }
        init();
    }, []);

    const handleSwitch = (tenantId: string) => {
        if (tenantId === activeTenantId) return;

        startTransition(async () => {
            try {
                await switchTenant(tenantId);

                // Refresh the session to get the new JWT with updated claims
                const supabase = createClient();
                await supabase.auth.refreshSession();

                setActiveTenantId(tenantId);
                router.refresh();
                setToastMessage(`Switched to tenant view`);
                setTimeout(() => setToastMessage(null), 3000);
            } catch (err) {
                console.error('Switch failed', err);
                setToastMessage('Failed to switch tenant');
                setTimeout(() => setToastMessage(null), 3000);
            }
        });
    };

    if (loading) {
        return <div className="h-10 w-48 bg-rs-gray-200 animate-pulse rounded-[4px]" />;
    }

    if (tenants.length <= 1) {
        // If only one tenant (home), no need to show switcher usually, 
        // OR we show it as a static label
        const current = tenants.find(t => t.id === activeTenantId) || tenants[0];
        if (!current) return null;

        return (
            <div className="flex items-center gap-2 px-3 h-10 border border-transparent text-sm text-rs-gray-600 font-medium">
                <span className="truncate max-w-[150px]">{current.name}</span>
            </div>
        );
    }

    return (
        <div className="relative">
            <RSSelect
                value={activeTenantId || ''}
                onChange={handleSwitch}
                options={tenants.map(t => ({
                    value: t.id,
                    label: `${t.name}${t.parent_tenant_id ? ' (Client)' : ''}`
                }))}
                className="w-48"
                placeholder={isPending ? "Switching..." : "Select Workspace"}
            />
            {isPending && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-rs-gray-400" />
                </div>
            )}

            {/* Simple Toast for feedback */}
            {toastMessage && (
                <div className="fixed bottom-4 right-4 bg-rs-black text-rs-white px-4 py-2 rounded shadow-lg text-sm z-50 animate-in fade-in slide-in-from-bottom-2">
                    {toastMessage}
                </div>
            )}
        </div>
    );
}
