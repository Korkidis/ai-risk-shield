/**
 * Process Scan API Route
 *
 * POST /api/scans/process
 *
 * Triggers AI analysis for a specific scan or all pending scans
 * Can be called:
 * - Immediately after upload (from client)
 * - From background jobs
 * - Manually from admin panel
 */

import { NextRequest, NextResponse } from 'next/server'
import { processScan, processPendingScans } from '@/lib/ai/scan-processor'
import { createClient } from '@/lib/supabase/server'
import { timingSafeEqual } from 'crypto'

function isValidServiceRole(authHeader: string | null): boolean {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!authHeader || !key) return false
  const expected = `Bearer ${key}`
  if (authHeader.length !== expected.length) return false
  try {
    return timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected))
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Auth Check: User Session OR Service Role Key (timing-safe comparison)
    const { data: { user } } = await supabase.auth.getUser()
    const authHeader = request.headers.get('authorization')
    const isServiceRole = isValidServiceRole(authHeader)

    if (!user && !isServiceRole) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Process specific scan
    if (body.scanId) {
      // 1. Fetch Scan Metadata (Status & Ownership)
      const { data: scanData, error: scanError } = await supabase
        .from('scans')
        .select('id, status, user_id, tenant_id')
        .eq('id', body.scanId)
        .single()

      const scan = scanData as any

      if (scanError || !scan) {
        return NextResponse.json({ success: false, error: 'Scan not found' }, { status: 404 })
      }

      // 2. Idempotency Check
      if (['processing', 'completed', 'valid', 'high', 'critical', 'review', 'safe'].includes(scan.status)) {
        // Statuses might vary based on enum, but 'processing' is the main one to block.
        // 'completed' isn't a standard status in some DBs, usually it's the risk verdict.
        // Let's check if it's NOT 'pending' and NOT 'created' (if that exists).
        // Actually, simpler: if it's already processing, stop. If it's done, maybe allow re-process?
        // Plan said "reject if processing or complete".
        // Let's assume 'pending' is the only state we want to process from, or 'failed'.
        if (scan.status === 'processing') {
          return NextResponse.json({ success: false, error: 'Scan is already processing' }, { status: 409 })
        }
        return NextResponse.json({ success: true, message: 'Scan already completed', scanId: scan.id }, { status: 200 })
      }

      // 3. Ownership Check (if not Service Role)
      if (!isServiceRole && user) {
        // If scan has a user_id, it must match
        if (scan.user_id && scan.user_id !== user.id) {
          return NextResponse.json({ success: false, error: 'Unauthorized: Scan ownership mismatch' }, { status: 403 })
        }
        // If scan has tenant_id, user must belong to it (optional, usually user_id is enough for personal ownership)
      }

      const result = await processScan(body.scanId)

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: `Scan ${result.scanId} processed successfully`,
        })
      } else {
        return NextResponse.json(
          {
            success: false,
            error: result.error || 'Processing failed',
          },
          { status: 500 }
        )
      }
    }

    // Process all pending scans
    if (body.processAll) {
      // STRICT: Service Role Only
      if (!isServiceRole) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Service Role required for bulk processing' },
          { status: 403 }
        )
      }

      const results = await processPendingScans()

      return NextResponse.json({
        success: true,
        message: `Processed ${results.processed} scans`,
        results,
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Missing scanId or processAll parameter',
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('Process scan API error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Processing failed. Please try again.',
      },
      { status: 500 }
    )
  }
}
