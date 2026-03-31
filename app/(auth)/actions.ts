'use server'

/**
 * Authentication Server Actions
 *
 * These functions run on the server and handle:
 * - Sign up (create user + tenant + profile)
 * - Login (authenticate user)
 * - Logout (clear session)
 *
 * Security:
 * - All validation happens server-side
 * - Passwords never exposed to client
 * - Supabase handles password hashing
 * - Atomic tenant + profile creation
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { checkRateLimit, getRateLimitKey } from '@/lib/ratelimit'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// ============================================================================
// SIGN UP
// ============================================================================

export async function signUp(_prevState: unknown, formData: FormData) {
  // Parse and validate form data
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
    organizationName: formData.get('organizationName'),
  }

  const validation = signUpSchema.safeParse(rawData)
  if (!validation.success) {
    const firstError = validation.error.issues[0]
    return {
      error: firstError?.message || 'Validation failed',
    }
  }

  const { email, password, fullName, organizationName } = validation.data

  // Rate limit: 5 signups per 15 min per IP
  const ipKey = await getRateLimitKey()
  const rl = await checkRateLimit({ action: 'signup', key: ipKey, maxAttempts: 5, windowSeconds: 900 })
  if (!rl.allowed) {
    return { error: 'Too many attempts. Please try again later.' }
  }

  const supabase = await createClient()

  // Step 1: Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (authError) {
    return {
      error: authError.message,
    }
  }

  if (!authData.user) {
    return {
      error: 'Failed to create user account',
    }
  }

  // Step 2: Create tenant (organization) using service role
  // We need service role because the user isn't fully authenticated yet
  const supabaseAdmin = await createServiceRoleClient()

  const { data: tenant, error: tenantError } = await supabaseAdmin
    .from('tenants')
    .insert({
      name: organizationName,
      plan: 'free',
      monthly_scan_limit: 3,
    })
    .select()
    .single()

  if (tenantError || !tenant) {
    // Rollback: Delete the auth user we just created
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    return {
      error: 'Failed to create organization',
    }
  }

  // Step 3: Create profile linking user to tenant
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: authData.user.id,
      tenant_id: tenant.id,
      email: email,
      full_name: fullName,
      role: 'owner', // First user is always owner
    })

  if (profileError) {
    // Rollback: Delete tenant and user
    await supabaseAdmin.from('tenants').delete().eq('id', tenant.id)
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    return {
      error: 'Failed to create user profile',
    }
  }

  // Success! Redirect to dashboard
  // Success! Redirect to dashboard or next url
  const next = formData.get('next') as string
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    redirect(next)
  }
  redirect('/dashboard')
}

// ============================================================================
// LOGIN
// ============================================================================

export async function login(_prevState: unknown, formData: FormData) {
  // Parse and validate form data
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const validation = loginSchema.safeParse(rawData)
  if (!validation.success) {
    const firstError = validation.error.issues[0]
    return {
      error: firstError?.message || 'Validation failed',
    }
  }

  const { email, password } = validation.data

  // Rate limit: 5 logins per 15 min per IP, block for 1 hour after 10 rapid failures
  const ipKey = await getRateLimitKey()
  const rl = await checkRateLimit({ action: 'login', key: ipKey, maxAttempts: 5, windowSeconds: 900, blockSeconds: 3600 })
  if (!rl.allowed) {
    return { error: 'Too many login attempts. Please try again later.' }
  }

  const supabase = await createClient()

  // Authenticate user
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login error:', error)
    return {
      error: 'Invalid email or password',
    }
  }

  if (!data.user) {
    console.error('No user data returned from Supabase')
    return {
      error: 'Authentication failed - please try again',
    }
  }

  console.log('✅ Login successful for user:', data.user?.id)

  // Success! Redirect to next url or dashboard
  const next = formData.get('next') as string
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    redirect(next)
  }
  redirect('/dashboard')
}

// ============================================================================
// LOGOUT
// ============================================================================

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

// ============================================================================
// PASSWORD RESET
// ============================================================================

export async function requestPasswordReset(_prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string

  if (!email || !z.string().email().safeParse(email).success) {
    return {
      error: 'Please enter a valid email address',
      success: false,
    }
  }

  // Rate limit: 3 reset requests per hour per IP
  const ipKey = await getRateLimitKey()
  const rl = await checkRateLimit({ action: 'password_reset', key: ipKey, maxAttempts: 3, windowSeconds: 3600 })
  if (!rl.allowed) {
    return { error: 'Too many reset requests. Please try again later.', success: false }
  }

  const supabase = await createClient()
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    'http://localhost:3000'
  const normalizedAppUrl =
    appUrl.startsWith('http://') || appUrl.startsWith('https://')
      ? appUrl.replace(/\/+$/, '')
      : `https://${appUrl.replace(/\/+$/, '')}`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Route recovery links through the existing auth callback so the code is
    // exchanged for a session before the user lands on the password form.
    redirectTo: `${normalizedAppUrl}/auth/callback?next=/reset-password`,
  })

  if (error) {
    console.error('Password reset error:', error)
    return {
      error: 'Failed to send reset email. Please try again.',
      success: false,
    }
  }

  // Always return success to prevent email enumeration
  return { error: '', success: true }
}

export async function resetPassword(_prevState: unknown, formData: FormData) {
  const password = formData.get('password') as string

  const validation = z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .safeParse(password)

  if (!validation.success) {
    return {
      error: validation.error.issues[0]?.message || 'Invalid password',
      success: false,
    }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: validation.data,
  })

  if (error) {
    console.error('Password update error:', error)
    return {
      error: 'Failed to reset password. Please try again or request a new reset link.',
      success: false,
    }
  }

  return { error: '', success: true }
}
