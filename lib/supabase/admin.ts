import type { Database } from './types'

/**
 * Create a Supabase client with Service Role Access.
 * BYPASSES RLS — USE WITH CAUTION.
 *
 * Separated from server.ts so modules that only need the admin client
 * don't pull in `next/headers` (which breaks client bundle boundaries).
 */
export async function createServiceRoleClient() {
    const { createClient } = await import('@supabase/supabase-js')

    return createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        }
    )
}
