import { describe, it, expect } from 'vitest'
import { PLANS, getPlan, type PlanId } from '../plans'

describe('Video plan configuration', () => {
    const allPlans: PlanId[] = ['free', 'pro', 'team', 'agency', 'enterprise']

    it('every plan has videoMaxDurationSeconds defined', () => {
        for (const planId of allPlans) {
            const plan = getPlan(planId)
            expect(plan.videoMaxDurationSeconds).toBeDefined()
            expect(typeof plan.videoMaxDurationSeconds).toBe('number')
            expect(plan.videoMaxDurationSeconds).toBeGreaterThanOrEqual(0)
        }
    })

    it('every plan has videoFrameLimit defined', () => {
        for (const planId of allPlans) {
            const plan = getPlan(planId)
            expect(plan.videoFrameLimit).toBeDefined()
            expect(typeof plan.videoFrameLimit).toBe('number')
            expect(plan.videoFrameLimit).toBeGreaterThanOrEqual(0)
        }
    })

    it('free tier blocks video (0 duration, 0 frames)', () => {
        const free = getPlan('free')
        expect(free.videoMaxDurationSeconds).toBe(0)
        expect(free.videoFrameLimit).toBe(0)
    })

    it('pro tier allows 2min / 5 frames', () => {
        const pro = getPlan('pro')
        expect(pro.videoMaxDurationSeconds).toBe(120)
        expect(pro.videoFrameLimit).toBe(5)
    })

    it('team tier allows 5min / 10 frames', () => {
        const team = getPlan('team')
        expect(team.videoMaxDurationSeconds).toBe(300)
        expect(team.videoFrameLimit).toBe(10)
    })

    it('agency tier allows 10min / 15 frames', () => {
        const agency = getPlan('agency')
        expect(agency.videoMaxDurationSeconds).toBe(600)
        expect(agency.videoFrameLimit).toBe(15)
    })

    it('enterprise tier capped same as agency (no worker/queue)', () => {
        const enterprise = getPlan('enterprise')
        const agency = getPlan('agency')
        expect(enterprise.videoMaxDurationSeconds).toBe(agency.videoMaxDurationSeconds)
        expect(enterprise.videoFrameLimit).toBe(agency.videoFrameLimit)
    })

    it('video duration increases monotonically across paid tiers', () => {
        const paidTiers: PlanId[] = ['pro', 'team', 'agency', 'enterprise']
        let prev = 0
        for (const planId of paidTiers) {
            const plan = getPlan(planId)
            expect(plan.videoMaxDurationSeconds).toBeGreaterThanOrEqual(prev)
            prev = plan.videoMaxDurationSeconds
        }
    })

    it('frame limit increases monotonically across paid tiers', () => {
        const paidTiers: PlanId[] = ['pro', 'team', 'agency', 'enterprise']
        let prev = 0
        for (const planId of paidTiers) {
            const plan = getPlan(planId)
            expect(plan.videoFrameLimit).toBeGreaterThanOrEqual(prev)
            prev = plan.videoFrameLimit
        }
    })

    it('no paid tier exceeds 10min duration cap', () => {
        // Without a worker/queue, 10min is the safe ceiling on Vercel
        for (const planId of allPlans) {
            const plan = getPlan(planId)
            expect(plan.videoMaxDurationSeconds).toBeLessThanOrEqual(600)
        }
    })

    it('frame limit is 0 iff duration is 0', () => {
        for (const planId of allPlans) {
            const plan = getPlan(planId)
            if (plan.videoMaxDurationSeconds === 0) {
                expect(plan.videoFrameLimit).toBe(0)
            } else {
                expect(plan.videoFrameLimit).toBeGreaterThan(0)
            }
        }
    })

    it('getPlan falls back to free for unknown plan IDs', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const unknown = getPlan('nonexistent' as any)
        expect(unknown.id).toBe('free')
    })

    it('PLANS object has exactly 5 tiers', () => {
        expect(Object.keys(PLANS)).toHaveLength(5)
        expect(Object.keys(PLANS).sort()).toEqual(['agency', 'enterprise', 'free', 'pro', 'team'])
    })
})
