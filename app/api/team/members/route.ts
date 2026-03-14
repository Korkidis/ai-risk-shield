import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getTenantId, requireAuth } from '@/lib/supabase/auth'

/**
 * GET /api/team/members
 * List all team members for the current tenant.
 */
export async function GET() {
    try {
        await requireAuth()
        const tenantId = await getTenantId()

        if (!tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const { data: members, error } = await supabase
            .from('profiles')
            .select('id, email, full_name, role, created_at')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Members query error:', error)
            return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
        }

        return NextResponse.json({ members: members || [] })
    } catch (error) {
        console.error('Team members API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * PATCH /api/team/members
 * Change a member's role. Owner-only. Cannot change self.
 */
export async function PATCH(req: NextRequest) {
    try {
        const user = await requireAuth()
        const tenantId = await getTenantId()

        if (!tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const adminClient = await createServiceRoleClient()

        // Verify caller is owner
        const { data: callerProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .eq('tenant_id', tenantId)
            .single()

        if (!callerProfile || callerProfile.role !== 'owner') {
            return NextResponse.json({ error: 'Only workspace owners can change roles' }, { status: 403 })
        }

        const body = await req.json()
        const { userId, role } = body

        if (!userId || !role) {
            return NextResponse.json({ error: 'userId and role are required' }, { status: 400 })
        }

        if (!['owner', 'admin', 'member'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
        }

        // Cannot change own role
        if (userId === user.id) {
            return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 })
        }

        // Verify target is in same tenant
        const { data: targetProfile } = await adminClient
            .from('profiles')
            .select('id, role')
            .eq('id', userId)
            .eq('tenant_id', tenantId)
            .single()

        if (!targetProfile) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 })
        }

        // Update role
        const { error: updateError } = await adminClient
            .from('profiles')
            .update({ role })
            .eq('id', userId)
            .eq('tenant_id', tenantId)

        if (updateError) {
            console.error('Role update error:', updateError)
            return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
        }

        // Audit log
        await adminClient.from('audit_log').insert({
            tenant_id: tenantId,
            user_id: user.id,
            action: 'member_role_changed',
            resource_type: 'profile',
            resource_id: userId,
            metadata: { old_role: targetProfile.role, new_role: role },
        })

        return NextResponse.json({ success: true, userId, role })
    } catch (error) {
        console.error('Team members PATCH error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * DELETE /api/team/members
 * Remove a member from the workspace. Owner/admin only. Cannot remove self or last owner.
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
            return NextResponse.json({ error: 'Only owners and admins can remove members' }, { status: 403 })
        }

        const body = await req.json()
        const { userId } = body

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        // Cannot remove self
        if (userId === user.id) {
            return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 })
        }

        // Verify target is in same tenant
        const { data: targetProfile } = await adminClient
            .from('profiles')
            .select('id, role, email')
            .eq('id', userId)
            .eq('tenant_id', tenantId)
            .single()

        if (!targetProfile) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 })
        }

        // Cannot remove the last owner
        if (targetProfile.role === 'owner') {
            const { count: ownerCount } = await adminClient
                .from('profiles')
                .select('id', { count: 'exact', head: true })
                .eq('tenant_id', tenantId)
                .eq('role', 'owner')

            if ((ownerCount || 0) <= 1) {
                return NextResponse.json({ error: 'Cannot remove the last workspace owner' }, { status: 400 })
            }
        }

        // Remove the member (delete profile, they keep their auth.user account)
        const { error: deleteError } = await adminClient
            .from('profiles')
            .delete()
            .eq('id', userId)
            .eq('tenant_id', tenantId)

        if (deleteError) {
            console.error('Member removal error:', deleteError)
            return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
        }

        // Audit log
        await adminClient.from('audit_log').insert({
            tenant_id: tenantId,
            user_id: user.id,
            action: 'member_removed',
            resource_type: 'profile',
            resource_id: userId,
            metadata: { removed_email: targetProfile.email, removed_role: targetProfile.role },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Team members DELETE error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
