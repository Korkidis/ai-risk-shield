import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSessionId } from '@/lib/session'

/**
 * POST /api/scans/assign-to-user
 * 
 * Migrates sessions scans to the authenticated user
 * Called by client after successful login from Magic Link
 */
export async function POST(request: Request) {
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

        // Call the Security Definer function
        const { data, error } = await supabase.rpc('assign_scans_to_user', {
            p_session_id: sessionId,
            p_user_id: user.id
        })

        if (error) {
            console.error('Migration RPC failed:', error)
            return NextResponse.json({ error: 'Migration failed' }, { status: 500 })
        }

        console.log(`[Migration] Assigned ${data} scans from session ${sessionId} to user ${user.id}`)

        return NextResponse.json({ success: true, migrated_count: data })

    } catch (error) {
        console.error('Assign error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
