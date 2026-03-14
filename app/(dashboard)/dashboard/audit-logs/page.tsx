import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/auth'
import { hasFeature, type PlanId } from '@/lib/plans'
import { AuditLogClient } from './AuditLogClient'

export const metadata = {
    title: 'Audit Logs | AI Content Risk Score',
}

export default async function AuditLogsPage() {
    const tenantId = await getTenantId().catch(() => null)

    if (!tenantId) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <p className="text-[10px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest">
                    UNAUTHORIZED
                </p>
            </div>
        )
    }

    // Feature gate check server-side
    const supabase = await createClient()
    const { data: tenant } = await supabase
        .from('tenants')
        .select('plan')
        .eq('id', tenantId)
        .single()

    const plan = (tenant?.plan as PlanId) || 'free'

    if (!hasFeature(plan, 'auditLogs')) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="text-center space-y-2">
                    <h2 className="text-sm font-bold text-[var(--rs-text-primary)] uppercase tracking-tight">
                        Audit Logs
                    </h2>
                    <p className="text-[10px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest">
                        AVAILABLE ON AGENCY AND ENTERPRISE PLANS
                    </p>
                    <p className="text-xs text-[var(--rs-text-secondary)] max-w-sm mt-4">
                        Track every action across your workspace. View scan activity, team changes,
                        authentication events, and data access in a searchable timeline.
                    </p>
                </div>
            </div>
        )
    }

    return <AuditLogClient />
}
