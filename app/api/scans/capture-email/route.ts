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

    // 1. Check if user exists
    const { data: { users }, error: _listError } = await supabase.auth.admin.listUsers()
    const existingUser = users?.find(u => u.email?.toLowerCase() === email.toLowerCase())

    let userId = existingUser?.id

    // 2. If new, create "Shadow User" (Unconfirmed)
    if (!existingUser) {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: false, // User must verify via link
        user_metadata: {
          source: 'scan_unlock',
          privacy_policy_accepted: true,
          privacy_policy_accepted_at: new Date().toISOString()
        }
      })

      if (createError) {
        console.error('Failed to create shadow user:', createError)
        return NextResponse.json({ error: 'Account creation failed' }, { status: 500 })
      }
      userId = newUser.user.id
    }

    // 3. Generate Magic Link (Auth Token)
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/scan/${scanId}&verified=true`
      }
    })

    if (linkError || !linkData.properties?.action_link) {
      console.error('Failed to generate magic link:', linkError)
      return NextResponse.json({ error: 'Auth generation failed' }, { status: 500 })
    }

    // Update scan with email (using type assertion for extended schema fields)
    const { error } = await (supabase.from('scans') as any).update({
      email,
      email_captured_at: new Date().toISOString(),
      // We do NOT assign user_id yet. That happens on verify -> assign-to-user
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

    console.log(`[Email Capture Debug] ScanId: ${scanId}, Score: ${score}, Count: ${count}`)

    // Set immediate session cookie for instant unlock (UX only, real auth comes from link)
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    cookieStore.set('magic_auth_email', email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // Send magic link email
    // linkData.properties.action_link contains the valid auth token
    const magicLink = linkData.properties.action_link
    const { sendSampleReportEmail } = await import('@/lib/email')

    // We don't await the email to keep UI snappy, but we catch errors
    sendSampleReportEmail(email, scanId, score, count, magicLink).catch(err =>
      console.error('Background email send failed:', err)
    )

    if (process.env.NODE_ENV === 'development') {
      console.log('🔗 [DEV] Magic Link:', magicLink)
    }

    console.log('✅ Shadow User Created & Auth Link Sent to:', email)
    return NextResponse.json({ success: true, verified: true })
  } catch (error) {
    console.error('Email capture error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
