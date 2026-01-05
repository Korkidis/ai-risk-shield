import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getTenantId } from '@/lib/supabase/auth'
import { NextResponse } from 'next/server'

/**
 * GET /api/scans/list
 *
 * Fetch recent scans for the current user's tenant
 */
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = await getTenantId()
    const supabase = await createClient()

    // Fetch recent scans with assets and findings
    const { data: scans, error } = await supabase
      .from('scans')
      .select(`
        *,
        assets(filename, file_type),
        scan_findings(*)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Failed to fetch scans:', error)
      return NextResponse.json({ error: 'Failed to fetch scans' }, { status: 500 })
    }

    return NextResponse.json({ scans })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
