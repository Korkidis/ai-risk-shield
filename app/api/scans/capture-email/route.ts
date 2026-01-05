import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getSessionId } from '@/lib/session'

/**
 * POST /api/scans/capture-email
 *
 * Capture email for anonymous scan
 * Updates scan record and triggers sample report email
 */
export async function POST(request: Request) {
  try {
    const { scanId, email } = await request.json()
    const sessionId = await getSessionId()

    if (!sessionId) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const supabase = await createServiceRoleClient()

    // Update scan with email (using type assertion for extended schema fields)
    const { error } = await (supabase.from('scans') as any).update({
      email,
      email_captured_at: new Date().toISOString(),
    })
      .eq('id', scanId)
      .eq('session_id', sessionId)

    if (error) {
      return NextResponse.json({ error: 'Failed to capture email' }, { status: 500 })
    }

    // Fetch scan details for the email
    const { data: scan } = await supabase
      .from('scans')
      .select(`
        composite_score,
        scan_findings (count)
      `)
      .eq('id', scanId)
      .single()

    const scanData = scan as any
    const score = scanData?.composite_score || 0
    const findingsCount = scanData?.scan_findings?.[0]?.count || 0

    // Send sample report email via Resend
    const { sendSampleReportEmail } = await import('@/lib/email')
    await sendSampleReportEmail(email, scanId, score, findingsCount)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email capture error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
