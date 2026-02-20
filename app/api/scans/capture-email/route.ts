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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const supabase = await createServiceRoleClient()

    // 1. Optimistic User Creation (Scalability Fix: Don't list all users)
    // We try to create. If it fails because "already registered", we proceed.
    // This avoids fetching 10k+ users just to check one.

    const { error: createError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: false, // User must verify via link
      user_metadata: {
        source: 'scan_unlock',
        privacy_policy_accepted: true,
        privacy_policy_accepted_at: new Date().toISOString()
      }
    })

    if (createError) {
      // Check if error is "User already registered"
      // Supabase/GoTrue typically returns status 422 or specific message
      // formatting varies, but usually contains "already registered" or "unique constraint"
      const isDuplicate = createError.message?.toLowerCase().includes('already registered') ||
        createError.status === 422;

      if (!isDuplicate) {
        console.error('Failed to create shadow user:', createError)
        return NextResponse.json({ error: 'Account creation failed' }, { status: 500 })
      }
      // If duplicate, we just proceed to generate link for the existing email
    }

    // Fetch scan score
    const { data: scanData } = await supabase
      .from('scans')
      .select('composite_score')
      .eq('id', scanId)
      .single()

    const scan = scanData as any

    // Fetch findings count explicitly to avoid nested count issues
    const { count: findingsCount } = await supabase
      .from('scan_findings')
      .select('*', { count: 'exact', head: true })
      .eq('scan_id', scanId)

    // Fetch Top Finding (Hero) for Email
    const { data: topFindings } = await supabase
      .from('scan_findings')
      .select('title, severity')
      .eq('scan_id', scanId)
      // specific sorting might be needed if severity is string, but let's try to get a critical one
      // If severity is text (critical, high, medium, low), alphabetical sort is bad.
      // We'll fetch a few and pick the worst in code to be safe, or just take the first one if we assume default sort (which might be insertion order).
      // Let's fetch 5 and sort in JS to be safe.
      .limit(5)

    let topFinding = undefined
    if (topFindings && topFindings.length > 0) {
      // Simple severity rank
      const severityRank: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1, info: 0 }
      // Type assertion to avoid 'never' error
      topFinding = (topFindings as any[]).sort((a, b) => (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0))[0]
    }

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

    // 3. Generate Magic Link (Auth Token) - Points to dashboard scan viewer
    const nextUrl = `/dashboard?scan=${scanId}&verified=true`
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=${encodeURIComponent(nextUrl)}`
      }
    })

    if (linkError || !linkData.properties?.action_link) {
      console.error('Failed to generate magic link:', linkError)
      return NextResponse.json({ error: 'Auth generation failed' }, { status: 500 })
    }

    // Send magic link email
    // linkData.properties.action_link contains the valid auth token
    const magicLink = linkData.properties.action_link
    const { sendSampleReportEmail } = await import('@/lib/email')

    // We don't await the email to keep UI snappy, but we catch errors
    sendSampleReportEmail(email, scanId, score, count, magicLink, topFinding).catch(err =>
      console.error('Background email send failed:', err)
    )

    if (process.env.NODE_ENV === 'development') {
      console.log('🔗 [DEV] Magic Link:', magicLink)
    }

    console.log('✅ Shadow User Created & Auth Link Sent')
    return NextResponse.json({ success: true, verified: true })
  } catch (error) {
    console.error('Email capture error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
