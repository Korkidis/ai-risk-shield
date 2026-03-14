import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/auth'
import { hasFeature, type PlanId } from '@/lib/plans'
import { TeamClient } from './TeamClient'

export const metadata = {
    title: 'Team | AI Content Risk Score',
}

export default async function TeamPage() {
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
        .select('plan, seat_limit')
        .eq('id', tenantId)
        .single()

    const plan = (tenant?.plan as PlanId) || 'free'

    if (!hasFeature(plan, 'teamDashboard')) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="text-center space-y-2">
                    <h2 className="text-sm font-bold text-[var(--rs-text-primary)] uppercase tracking-tight">
                        Team Management
                    </h2>
                    <p className="text-[10px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest">
                        AVAILABLE ON TEAM, AGENCY, AND ENTERPRISE PLANS
                    </p>
                    <p className="text-xs text-[var(--rs-text-secondary)] max-w-sm mt-4">
                        Invite team members, manage roles, and collaborate on content risk analysis
                        across your organization.
                    </p>
                </div>
            </div>
        )
    }

    const seatLimit = tenant?.seat_limit || 5

    return <TeamClient seatLimit={seatLimit} />
}
