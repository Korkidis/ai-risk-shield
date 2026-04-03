/**
 * Resolve the Supabase anon/publishable key from environment variables.
 *
 * The Supabase Vercel integration syncs NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
 * but our codebase historically uses NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * This helper accepts either name so deployments work regardless of which is set.
 *
 * Both env var names appear as literal process.env.NEXT_PUBLIC_* references
 * so the Next.js bundler can inline them for client-side code.
 */
export function getSupabaseAnonKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!key) {
    throw new Error(
      'Missing Supabase anon key: set NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
    )
  }
  return key
}
