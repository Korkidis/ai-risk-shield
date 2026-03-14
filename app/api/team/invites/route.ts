import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getTenantId, requireAuth } from '@/lib/supabase/auth'

/**
 * GET /api/team/invites
 * List pending (non-expired, non-accepted) invites for the current tenant.
 */
export async function GET() {
    try {
        await requireAuth()
        const tenantId = await getTenantId()

        if (!tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const { data: invites, error } = await supabase
            .from('tenant_invites')
            .select('id, email, role, invited_by, created_at, expires_at')
            .eq('tenant_id', tenantId)
            .is('accepted_at', null)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Invites query error:', error)
            return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 })
        }

        return NextResponse.json({ invites: invites || [] })
    } catch (error) {
        console.error('Team invites API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * DELETE /api/team/invites
 * Revoke a pending invite. Owner/admin only.
 */
export async function DELETE(req: NextRequest) {
    try {
        const user = await requireAuth()
        const tenantId = await getTenantId()

        if (!tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const adminClient = await createServiceRoleClient()

        // Verify caller is owner or admin
        const { data: callerProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .eq('tenant_id', tenantId)
            .single()

        if (!callerProfile || !['owner', 'admin'].includes(callerProfile.role)) {
            return NextResponse.json({ error: 'Only owners and admins can revoke invites' }, { status: 403 })
        }

        const body = await req.json()
        const { inviteId } = body

        if (!inviteId) {
            return NextResponse.json({ error: 'inviteId is required' }, { status: 400 })
        }

        // Delete invite (must belong to this tenant)
        const { error: deleteError, count } = await adminClient
            .from('tenant_invites')
            .delete()
            .eq('id', inviteId)
            .eq('tenant_id', tenantId)
            .is('accepted_at', null)

        if (deleteError) {
            console.error('Invite revocation error:', deleteError)
            return NextResponse.json({ error: 'Failed to revoke invite' }, { status: 500 })
        }

        if (!count || count === 0) {
            return NextResponse.json({ error: 'Invite not found or already accepted' }, { status: 404 })
        }

        // Audit log
        await adminClient.from('audit_log').insert({
            tenant_id: tenantId,
            user_id: user.id,
            action: 'team_invite_revoked',
            resource_type: 'tenant_invite',
            resource_id: inviteId,
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Team invites DELETE error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
