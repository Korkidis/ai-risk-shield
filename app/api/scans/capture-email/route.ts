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

    // Generate magic link token
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Store magic link
    const { error: linkError } = await (supabase
      .from('magic_links') as any)
      .insert({
        email,
        token,
        scan_id: scanId,
        expires_at: expiresAt.toISOString(),
      })

    if (linkError) {
      console.error('Failed to create magic link:', linkError)
      console.error('Error details:', JSON.stringify(linkError, null, 2))
      return NextResponse.json({
        error: 'Failed to create magic link',
        details: linkError.message || 'Database error'
      }, { status: 500 })
    }

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

    // Fetch scan score
    const { data: scan } = await supabase
      .from('scans')
      .select('composite_score')
      .eq('id', scanId)
      .single()

    // Fetch findings count explicitly to avoid nested count issues
    const { count: findingsCount } = await supabase
      .from('scan_findings')
      .select('*', { count: 'exact', head: true })
      .eq('scan_id', scanId)

    const score = scan?.composite_score || 0
    const count = findingsCount || 0

    // Set immediate session cookie for instant unlock
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    cookieStore.set('magic_auth_email', email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // Send magic link email (as backup)
    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`
    const { sendSampleReportEmail } = await import('@/lib/email')

    // We don't await the email to keep UI snappy, but we catch errors
    sendSampleReportEmail(email, scanId, score, count, magicLink).catch(err =>
      console.error('Background email send failed:', err)
    )

    console.log('✅ Instant auth granted & email queued for:', email)
    return NextResponse.json({ success: true, verified: true })
  } catch (error) {
    console.error('Email capture error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
