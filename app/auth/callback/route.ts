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

      // Track magic link click server-side via PostHog HTTP API (fire-and-forget)
      if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
        fetch(`${process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'}/capture/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
            event: 'magic_link_clicked',
            distinct_id: sessionData.user.id,
            properties: { $set: { email_verified: true } }
          })
        }).catch(() => { })
      }
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

  // ── Invite-aware provisioning ────────────────────────────────────────
  // Check for a pending team invite BEFORE creating a new tenant.
  // Without this, invited users get a stray free tenant on first auth.
  if (user.email) {
    const { data: invite } = await supabaseAdmin
      .from('tenant_invites')
      .select('id, tenant_id, role')
      .eq('email', user.email.toLowerCase())
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (invite && invite.tenant_id) {
      // Join the inviter's tenant instead of creating a new one
      const userEmail = user.email!  // Guaranteed by outer `if (user.email)` check
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: user.id,
          tenant_id: invite.tenant_id,
          email: userEmail,
          full_name: (user.user_metadata?.full_name as string) || userEmail.split('@')[0] || 'User',
          role: invite.role || 'member',
        })

      if (profileError) {
        console.error('[auth/callback] Failed to create profile for invited user:', profileError)
        // Fall through to normal tenant creation as fallback
      } else {
        // Mark invite as accepted
        await supabaseAdmin
          .from('tenant_invites')
          .update({ accepted_at: new Date().toISOString() })
          .eq('id', invite.id)

        console.log(`[auth/callback] Invited user ${user.id} joined tenant ${invite.tenant_id} as ${invite.role}`)
        return
      }
    }
  }

  // ── Default path: create new tenant ──────────────────────────────────
  const emailDomain = user.email?.split('@')[1] || 'Unknown'
  const orgName = emailDomain.charAt(0).toUpperCase() + emailDomain.slice(1).split('.')[0]

  const { data: tenant, error: tenantError } = await supabaseAdmin
    .from('tenants')
    .insert({
      name: `${orgName} Workspace`,
      plan: 'free',
      monthly_scan_limit: 3,
    })
    .select()
    .single()

  if (tenantError || !tenant) {
    console.error('[auth/callback] Failed to create tenant for shadow user:', tenantError)
    return // Don't block the redirect — user can still land, we'll handle gracefully
  }

  // Create profile linking user to tenant
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: user.id,
      tenant_id: tenant.id,
      email: user.email || '',
      full_name: (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'User',
      role: 'owner',
    })

  if (profileError) {
    // Rollback tenant
    await supabaseAdmin.from('tenants').delete().eq('id', tenant.id)
    console.error('[auth/callback] Failed to create profile for shadow user:', profileError)
    return
  }

  console.log(`[auth/callback] Auto-provisioned tenant + profile for shadow user: ${user.id}`)
}
