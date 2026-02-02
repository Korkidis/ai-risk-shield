import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getCurrentUser, getTenantId } from '@/lib/supabase/auth'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/scans/list
 *
 * Fetch recent scans for the current user's tenant
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const riskLevel = searchParams.get('risk_level')
    const fileType = searchParams.get('file_type')
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'

    const tenantId = await getTenantId()
    const supabase = await createClient()

    // Build the query
    let query = supabase
      .from('scans')
      .select(`
        *,
        assets(filename, file_type, storage_path, mime_type, file_size),
        scan_findings(*),
        provenance_details(*)
      `)
      .eq('tenant_id', tenantId)

    // Applied Filters
    if (riskLevel && riskLevel !== 'all') {
      query = query.eq('risk_level', riskLevel)
    }
    if (fileType && fileType !== 'all') {
      // asset_id.file_type but we need to join or use filter
      // For now, simpler filtering on scans table if possible, or join
      // Actually, assets is joined, so we can use:
      query = query.filter('assets.file_type', 'eq', fileType)
    }

    // Sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    const { data: scans, error } = await query.limit(50)

    if (error) {
      console.error('Failed to fetch scans:', error)
      return NextResponse.json({ error: 'Failed to fetch scans' }, { status: 500 })
    }

    // Use service role client for signed URLs (bypasses storage RLS)
    const adminClient = await createServiceRoleClient()

    const enrichedScans = await Promise.all(scans.map(async (scan: any) => {
      let assetUrl = null
      if (scan.assets?.storage_path) {
        // Generate signed URL for the original asset (1 hour expiry)
        const { data, error: signError } = await adminClient.storage
          .from('uploads')
          .createSignedUrl(scan.assets.storage_path, 3600)

        if (signError) {
          console.error(`[Scans/List] Signed URL error for ${scan.assets.storage_path}:`, signError.message)
        } else {
          assetUrl = data?.signedUrl
        }
      }
      return {
        ...scan,
        asset_url: assetUrl
      }
    }))

    return NextResponse.json({ scans: enrichedScans })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
