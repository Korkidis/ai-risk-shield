import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getTenantId } from '@/lib/supabase/auth'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/guidelines
 * List all guidelines for the tenant
 */
export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        let tenantId: string
        try {
            tenantId = await getTenantId()
        } catch (authError) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('brand_guidelines')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ guidelines: data })
    } catch (error) {
        console.error('List guidelines failed:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * POST /api/guidelines
 * Create a new guideline profile
 */
export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        let tenantId: string
        try {
            tenantId = await getTenantId()
        } catch (authError) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const supabase = await createClient()
        const body = await req.json()

        // If is_default is true, unset other defaults for this tenant
        if (body.is_default) {
            await (supabase
                .from('brand_guidelines') as any)
                .update({ is_default: false })
                .eq('tenant_id', tenantId)
        }

        const { data, error } = await supabase
            .from('brand_guidelines')
            // @ts-ignore
            .insert({
                name: body.name,
                industry: body.industry,
                prohibitions: body.prohibitions || [],
                requirements: body.requirements || [],
                context_modifiers: body.context_modifiers || [],
                target_markets: body.target_markets || [],
                target_platforms: body.target_platforms || [],
                is_default: body.is_default || false,
                tenant_id: tenantId
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ guideline: data })
    } catch (error) {
        console.error('Create guideline failed:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
