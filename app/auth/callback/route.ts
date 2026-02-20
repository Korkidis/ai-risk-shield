import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * Auth Callback Route
 *
 * Handles OAuth callbacks, email confirmation links, and magic links from Supabase.
 *
 * Flow:
 * 1. User clicks magic link / email confirmation
 * 2. Supabase redirects here with `code`
 * 3. We exchange code for session
 * 4. Auto-provision tenant + profile if missing (shadow users from capture-email)
 * 5. Redirect to `next` or /dashboard
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (!sessionError && sessionData?.user) {
      // Auto-provision tenant + profile for shadow users (created via capture-email)
      // Normal signup users already have these from the signup action.
      await ensureProfileExists(sessionData.user)
    }
  }

  // Validate redirect: must be a relative path starting with / (prevent open redirect)
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    return NextResponse.redirect(requestUrl.origin + next)
  }

  return NextResponse.redirect(requestUrl.origin + '/dashboard')
}

/**
 * Ensure the authenticated user has a profile + tenant.
 *
 * Shadow users (created by /api/scans/capture-email) only exist in auth.users —
 * they have no profiles row and no tenant. Without these, getTenantId() throws
 * and the dashboard crashes.
 *
 * This function is idempotent: if a profile already exists, it returns immediately.
 */
async function ensureProfileExists(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
  const supabaseAdmin = await createServiceRoleClient()

  // Check if profile already exists (normal signup users will have one)
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (existingProfile) return // Already provisioned

  // Create tenant (free plan, matching normal signup defaults)
  const emailDomain = user.email?.split('@')[1] || 'Unknown'
  const orgName = emailDomain.charAt(0).toUpperCase() + emailDomain.slice(1).split('.')[0]

  const { data: tenant, error: tenantError } = await (supabaseAdmin
    .from('tenants') as any)
    .insert({
      name: `${orgName} Workspace`,
      plan: 'free',
      monthly_scan_limit: 3,
    })
    .select()
    .single()

  if (tenantError) {
    console.error('[auth/callback] Failed to create tenant for shadow user:', tenantError)
    return // Don't block the redirect — user can still land, we'll handle gracefully
  }

  // Create profile linking user to tenant
  const { error: profileError } = await (supabaseAdmin
    .from('profiles') as any)
    .insert({
      id: user.id,
      tenant_id: (tenant as any).id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      role: 'owner',
    })

  if (profileError) {
    // Rollback tenant
    await supabaseAdmin.from('tenants').delete().eq('id', (tenant as any).id)
    console.error('[auth/callback] Failed to create profile for shadow user:', profileError)
    return
  }

  console.log(`[auth/callback] Auto-provisioned tenant + profile for shadow user: ${user.id}`)
}
