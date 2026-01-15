import { createClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/auth'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const tenantId = await getTenantId()
        const supabase = await createClient()
        const body = await req.json()
        const { notes, tags, action } = body

        // 1. Check if scan exists and belongs to tenant
        const { data: scan, error: fetchError } = await supabase
            .from('scans')
            .select('id')
            .eq('id', params.id)
            .eq('tenant_id', tenantId)
            .single()

        if (fetchError || !scan) {
            return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
        }

        const updateData: Record<string, any> = {}

        if (action === 'share') {
            // Generate share token valid for 7 days
            updateData.share_token = uuidv4()
            updateData.share_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        } else {
            // General update
            if (notes !== undefined) updateData.notes = notes
            if (tags !== undefined) updateData.tags = tags
        }

        const { data: updatedScan, error: updateError } = await (supabase
            .from('scans') as any)
            .update(updateData)
            .eq('id', params.id)
            .select()
            .single()

        if (updateError) {
            console.error('Update failed:', updateError)
            return NextResponse.json({ error: 'Failed to update scan' }, { status: 500 })
        }

        return NextResponse.json({ scan: updatedScan })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const tenantId = await getTenantId()
        const supabase = await createClient()

        const { error } = await supabase
            .from('scans')
            .delete()
            .eq('id', params.id)
            .eq('tenant_id', tenantId)

        if (error) {
            console.error('Delete failed:', error)
            return NextResponse.json({ error: 'Failed to delete scan' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
