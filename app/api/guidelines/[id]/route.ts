import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getTenantId } from '@/lib/supabase/auth'
import { NextRequest, NextResponse } from 'next/server'

/**
 * PATCH /api/guidelines/[id]
 * Update a guideline profile
 */
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const params = await context.params
        const tenantId = await getTenantId()
        const supabase = await createClient()
        const body = await req.json()

        // If setting as default, unset others first
        if (body.is_default) {
            await (supabase
                .from('brand_guidelines') as any)
                .update({ is_default: false })
                .eq('tenant_id', tenantId)
        }

        const { data, error } = await (supabase
            .from('brand_guidelines') as any)
            .update(body)
            .eq('id', params.id)
            .eq('tenant_id', tenantId) // Safety
            .select()
            .single()

        if (error) {
            console.error('Update failed:', error)
            return NextResponse.json({ error: 'Failed to update guideline' }, { status: 500 })
        }

        return NextResponse.json({ guideline: data })
    } catch (error) {
        console.error('Update guideline failed:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * DELETE /api/guidelines/[id]
 * Delete a guideline profile
 */
export async function DELETE(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const params = await context.params
        const tenantId = await getTenantId()
        const supabase = await createClient()

        // Check if any scans depend on it
        const { count, error: countError } = await supabase
            .from('scans')
            .select('*', { count: 'exact', head: true })
            .eq('guideline_id', params.id)

        if (countError) throw countError
        if (count && count > 0) {
            return NextResponse.json({
                error: 'Cannot delete guideline that is linked to existing scans'
            }, { status: 400 })
        }

        const { error: deleteError } = await supabase
            .from('brand_guidelines')
            .delete()
            .eq('id', params.id)
            .eq('tenant_id', tenantId)

        if (deleteError) throw deleteError

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete guideline failed:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
