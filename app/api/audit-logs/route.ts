import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTenantId, requireAuth } from '@/lib/supabase/auth'
import { hasFeature, type PlanId } from '@/lib/plans'

/**
 * GET /api/audit-logs
 *
 * Paginated audit log viewer for AGENCY+ plans (feature_audit_logs flag).
 * Filters: action, resource_type, from/to date range, page/limit.
 */
export async function GET(req: NextRequest) {
    try {
        await requireAuth()
        const tenantId = await getTenantId()

        if (!tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Feature gate: check tenant plan for audit_logs access
        const supabase = await createClient()
        const { data: tenant } = await supabase
            .from('tenants')
            .select('plan')
            .eq('id', tenantId)
            .single()

        const plan = (tenant?.plan as PlanId) || 'free'
        if (!hasFeature(plan, 'auditLogs')) {
            return NextResponse.json({
                error: 'Audit logs require Agency or Enterprise plan',
                code: 'FEATURE_GATED',
                requiredPlan: 'agency',
            }, { status: 403 })
        }

        // Parse query params
        const { searchParams } = req.nextUrl
        const action = searchParams.get('action')
        const resourceType = searchParams.get('resource_type')
        const from = searchParams.get('from')
        const to = searchParams.get('to')
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10) || 50))
        const offset = (page - 1) * limit

        // Build query
        let query = supabase
            .from('audit_log')
            .select('id, action, resource_type, resource_id, user_id, metadata, created_at, user_agent', { count: 'exact' })
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })

        // Apply filters
        if (action) {
            query = query.eq('action', action)
        }
        if (resourceType) {
            query = query.eq('resource_type', resourceType)
        }
        if (from) {
            query = query.gte('created_at', from)
        }
        if (to) {
            query = query.lte('created_at', to)
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1)

        const { data, error, count } = await query

        if (error) {
            console.error('Audit log query error:', error)
            return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
        }

        return NextResponse.json({
            data: data || [],
            page,
            limit,
            total: count || 0,
            hasMore: (count || 0) > offset + limit,
        })
    } catch (error) {
        console.error('Audit logs API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
