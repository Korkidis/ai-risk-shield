import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

/**
 * Supabase client for Server Components and API Routes
 *
 * Usage: Import this in Server Components, Server Actions, or API routes
 *
 * Features:
 * - Uses anon key by default (can use service role if needed)
 * - Handles cookies in Next.js server environment
 * - Type-safe with Database types
 *
 * Security:
 * - Default: anon key with RLS enforced
 * - For admin operations: Use createServiceRoleClient()
 * - Never expose service role key to client
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Service role client (ADMIN ONLY - bypasses RLS)
 *
 * ⚠️ DANGER: This client has FULL database access
 *
 * Use ONLY for:
 * - Stripe webhook processing (system operations)
 * - Admin operations that need to bypass RLS
 * - Background jobs
 *
 * NEVER use in Client Components
 * NEVER expose service role key to client
 */
export async function createServiceRoleClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore
          }
        },
      },
    }
  )
}
