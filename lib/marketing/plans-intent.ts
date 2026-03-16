import { PlanId } from '@/lib/plans'
import { Persona } from './plans-content'

export interface UpgradeIntent {
    source: string
    plan?: PlanId
    interval?: 'monthly' | 'annual'
    persona?: Persona
    scanId?: string
}

/**
 * Maps an incoming generic upgrade intent to a specific suggested plan and interval.
 * Allows deep linking into the Plans page with contextual recommendations.
 */
export function getSuggestedPlan(intent: UpgradeIntent): { plan: PlanId, interval: 'monthly' | 'annual', persona: Persona } {
    const { source, plan, interval, persona } = intent

    let suggestedPlan: PlanId = plan || 'pro'
    const suggestedInterval: 'monthly' | 'annual' = interval || 'monthly'
    let activePersona: Persona = persona || 'default'

    // Map source/persona heuristics if plan isn't explicitly defined
    if (!plan) {
        if (persona === 'agency') {
            suggestedPlan = 'agency'
            activePersona = 'agency'
        } else if (persona === 'enterprise') {
            suggestedPlan = 'enterprise'
            activePersona = 'enterprise'
        } else if (source === 'scan_drawer_unlock' || source === 'upgrade_button') {
            suggestedPlan = 'pro'
        } else if (source === 'dashboard_banner') {
            suggestedPlan = 'team'
        }
    }

    return { plan: suggestedPlan, interval: suggestedInterval, persona: activePersona }
}
