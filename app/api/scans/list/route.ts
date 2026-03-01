import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getCurrentUser, getTenantId } from '@/lib/supabase/auth'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/scans/list
 *
 * Fetch recent scans for the current user's tenant
 * Supports server-side search, sort, filter, and pagination.
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
    // Whitelist sort parameters to prevent injection
    const ALLOWED_SORT_FIELDS = ['created_at', 'composite_score', 'risk_level', 'status']
    const rawSortBy = searchParams.get('sort_by') || 'created_at'
    const sortBy = ALLOWED_SORT_FIELDS.includes(rawSortBy) ? rawSortBy : 'created_at'
    const rawSortOrder = searchParams.get('sort_order') || 'desc'
    const sortOrder = rawSortOrder === 'asc' ? 'asc' : 'desc'

    const tenantId = await getTenantId()
    const supabase = await createClient()

    // Build the query
    const search = searchParams.get('search')
    // Keep list query intentionally lightweight.
    // Heavy relations (findings/provenance/mitigation) are fetched on demand
    // from /api/scans/[id] when the user opens the drawer.
    const baseSelect = `
      *,
      assets(filename, file_type, storage_path, mime_type, file_size)
    `

    // Pagination (NaN-safe: parseInt('') returns NaN, || provides fallback)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '50', 10) || 50))
    const offset = (page - 1) * limit

    const runQuery = async (selectClause: string) => {
      let query = supabase
        .from('scans')
        .select(selectClause)
        .eq('tenant_id', tenantId)

      // Server-side search (safe subset)
      // NOTE: scans.id is UUID, so partial ILIKE on id throws.
      if (search && search.trim()) {
        const needle = search.trim()
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(needle)
        if (isUuid) {
          query = query.eq('id', needle)
        }
      }

      // Applied Filters
      if (riskLevel && riskLevel !== 'all') {
        query = query.eq('risk_level', riskLevel as 'critical' | 'high' | 'review' | 'caution' | 'safe')
      }
      if (fileType && fileType !== 'all') {
        query = query.filter('assets.file_type', 'eq', fileType)
      }

      // Sorting + paging
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
      return query.range(offset, offset + limit - 1)
    }

    const primary = await runQuery(baseSelect)
    if (primary.error) {
      console.error('[Scans/List] Query failed:', primary.error)
      return NextResponse.json({
        error: `Failed to fetch scans: ${primary.error.message || 'unknown error'}`
      }, { status: 500 })
    }
    const scans = (primary.data as unknown as Array<Record<string, unknown>>) || []

    // Use service role client for signed URLs (bypasses storage RLS)
    const adminClient = await createServiceRoleClient()

    let enrichedScans: Array<Record<string, unknown> & { asset_url: string | null }> = await Promise.all((scans || []).map(async (scan) => {
      let assetUrl = null
      const scanAssets = (scan.assets as { storage_path?: string } | null)
      if (scanAssets?.storage_path) {
        // Generate signed URL for the original asset (1 hour expiry)
        const { data, error: signError } = await adminClient.storage
          .from('uploads')
          .createSignedUrl(scanAssets.storage_path, 3600)

        if (signError) {
          console.error(`[Scans/List] Signed URL error for ${scanAssets.storage_path}:`, signError.message)
        } else {
          assetUrl = data?.signedUrl
        }
      }
      return {
        ...scan,
        asset_url: assetUrl
      } as Record<string, unknown> & { asset_url: string | null }
    }))

    // Filename search fallback (post-query) for non-UUID searches
    if (search && search.trim()) {
      const needle = search.trim().toLowerCase()
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(needle)
      if (!isUuid) {
        enrichedScans = enrichedScans.filter((scan) => {
          const filename = (scan['assets'] as { filename?: string } | undefined)?.filename || ''
          return String(filename).toLowerCase().includes(needle)
        })
      }
    }

    return NextResponse.json({
      scans: enrichedScans,
      page,
      limit,
      hasMore: enrichedScans.length === limit
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
