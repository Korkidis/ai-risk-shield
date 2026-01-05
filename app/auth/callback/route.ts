import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Auth Callback Route
 *
 * Handles OAuth callbacks and email confirmation links from Supabase
 *
 * Flow:
 * 1. User clicks email confirmation link (if enabled)
 * 2. Supabase redirects to this route with code
 * 3. We exchange code for session
 * 4. Redirect to dashboard
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()

    // Exchange code for session
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to dashboard on success, or home on error
  return NextResponse.redirect(requestUrl.origin + '/dashboard')
}
