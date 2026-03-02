import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getSessionId } from '@/lib/session'
import { getTenantId } from '@/lib/supabase/auth'

/**
 * POST /api/scans/assign-to-user
 *
 * Migrates sessions scans to the authenticated user
 * Called by client after successful login from Magic Link
 */
export async function POST(_request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const sessionId = await getSessionId()
        if (!sessionId) {
            return NextResponse.json({ error: 'No session to migrate' }, { status: 400 })
        }

        // Sprint 10.3: Count completed anonymous scans BEFORE migration
        // (they'll lose session_id after RPC clears it)
        const adminClient = await createServiceRoleClient()
        const { count: completedAnonymousScans } = await adminClient
            .from('scans')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', sessionId)
            .eq('status', 'complete')

        // Call the Security Definer function
        const { data, error } = await supabase.rpc('assign_scans_to_user', {
            p_session_id: sessionId,
            p_user_id: user.id
        })

        if (error) {
            console.error('Migration RPC failed:', error)
            return NextResponse.json({ error: 'Migration failed' }, { status: 500 })
        }

        // Sprint 10.3: Transfer anonymous quota to tenant
        // Prevents abuse: scan 3 times anonymously → create account → quota resets to 0
        const anonymousCount = completedAnonymousScans || 0
        if (anonymousCount > 0) {
            const tenantId = await getTenantId()
            if (tenantId) {
                const { data: newTotal, error: incrementError } = await adminClient.rpc('increment_tenant_scan_usage', {
                    p_tenant_id: tenantId,
                    p_amount: anonymousCount,
                })

                if (incrementError) {
                    console.error(`[Migration] Failed to transfer ${anonymousCount} anonymous scan credits to tenant ${tenantId}:`, incrementError)
                } else {
                    console.log(`[Migration] Transferred ${anonymousCount} anonymous scan credits to tenant ${tenantId} (new total: ${newTotal})`)
                }
            }
        }

        console.log(`[Migration] Assigned ${data} scans from session ${sessionId} to user ${user.id}`)

        return NextResponse.json({ success: true, migrated_count: data })

    } catch (error) {
        console.error('Assign error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
