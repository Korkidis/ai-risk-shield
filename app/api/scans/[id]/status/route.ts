import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getSessionId } from '@/lib/session'
import type { ScanWithRelations } from '@/types/database'

/**
 * GET /api/scans/[id]/status
 *
 * Get scan status for anonymous users
 * Returns: status, risk_level, composite_score, findings (limited to top 3 before email)
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionId = await getSessionId()

    if (!sessionId) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    const supabase = await createServiceRoleClient()

    // Get scan with findings
    const { data: scan, error } = await supabase
      .from('scans')
      .select(`
        *,
        assets(filename, file_type),
        scan_findings(*)
      `)
      .eq('id', id)
      .eq('session_id', sessionId)
      .single()

    if (error || !scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
    }

    // Cast to typed scan with relations
    const typedScan = scan as unknown as ScanWithRelations
    const findings = typedScan.scan_findings || []
    const hasEmail = !!typedScan.email

    return NextResponse.json({
      status: typedScan.status,
      risk_level: typedScan.risk_level,
      composite_score: typedScan.composite_score,
      ip_risk_score: typedScan.ip_risk_score,
      safety_risk_score: typedScan.safety_risk_score,
      provenance_risk_score: typedScan.provenance_risk_score || 0,
      email_captured: hasEmail,
      // Only show top 3 findings if email not captured
      findings: hasEmail ? findings : findings.slice(0, 3),
      total_findings: findings.length,
      filename: typedScan.assets?.filename,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
