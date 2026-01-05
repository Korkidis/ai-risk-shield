import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

/**
 * Supabase client for Client Components (browser context)
 *
 * Usage: Import this in any "use client" component
 *
 * Features:
 * - Uses anon key (safe to expose to browser)
 * - Handles cookies automatically in browser
 * - Type-safe with Database types
 *
 * Security:
 * - Only has permissions granted to 'anon' role
 * - RLS policies enforced on all queries
 * - Cannot bypass Row Level Security
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
