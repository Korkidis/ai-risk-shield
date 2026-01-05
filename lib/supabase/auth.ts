import { createClient } from './server'
import { cache } from 'react'

/**
 * Authentication helper functions
 *
 * These are cached per request to avoid multiple database calls
 * Use in Server Components, Server Actions, and API Routes
 */

/**
 * Get the currently authenticated user
 *
 * Returns: User object or null if not authenticated
 * Cached: Yes (per request)
 *
 * Usage:
 * ```ts
 * const user = await getCurrentUser()
 * if (!user) {
 *   redirect('/login')
 * }
 * ```
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

/**
 * Get current user's profile (includes tenant_id and role)
 *
 * Returns: Profile object with tenant information
 * Throws: Error if not authenticated
 * Cached: Yes (per request)
 *
 * Usage:
 * ```ts
 * const profile = await getCurrentProfile()
 * console.log(profile.tenant_id) // User's organization
 * console.log(profile.role) // owner, admin, or member
 * ```
 */
export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    throw new Error(`Failed to get profile: ${error.message}`)
  }

  return profile
})

/**
 * Get current user's tenant_id
 *
 * Returns: UUID string
 * Throws: Error if not authenticated
 * Cached: Yes (per request)
 *
 * Usage:
 * ```ts
 * const tenantId = await getTenantId()
 * // Use in queries to filter by tenant
 * const { data } = await supabase
 *   .from('scans')
 *   .select('*')
 *   .eq('tenant_id', tenantId)
 * ```
 */
export const getTenantId = cache(async () => {
  const profile = await getCurrentProfile()
  return (profile as any).tenant_id
})

/**
 * Get current user's tenant (organization) data
 *
 * Returns: Tenant object with plan, quota, etc.
 * Throws: Error if not authenticated
 * Cached: Yes (per request)
 *
 * Usage:
 * ```ts
 * const tenant = await getTenant()
 * console.log(tenant.plan) // free, individual, team, agency
 * console.log(tenant.monthly_scan_limit) // 3, 50, 200, 1000
 * ```
 */
export const getTenant = cache(async () => {
  const tenantId = await getTenantId()

  const supabase = await createClient()
  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .single()

  if (error) {
    throw new Error(`Failed to get tenant: ${error.message}`)
  }

  return tenant
})

/**
 * Require authentication (throw error if not authenticated)
 *
 * Throws: Error if not authenticated
 * Returns: User object
 *
 * Usage:
 * ```ts
 * // At top of Server Action or API route
 * const user = await requireAuth()
 * // Continue with authenticated logic
 * ```
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

/**
 * Check if current user has specific role
 *
 * Returns: boolean
 *
 * Usage:
 * ```ts
 * const isOwner = await hasRole('owner')
 * const isAdmin = await hasRole(['owner', 'admin']) // Multiple roles
 * ```
 */
export async function hasRole(
  role: string | string[]
): Promise<boolean> {
  try {
    const profile = await getCurrentProfile()
    const roles = Array.isArray(role) ? role : [role]
    return roles.includes((profile as any).role)
  } catch {
    return false
  }
}

/**
 * Require specific role (throw error if not authorized)
 *
 * Throws: Error if not authenticated or doesn't have role
 *
 * Usage:
 * ```ts
 * await requireRole('owner') // Only owners can proceed
 * await requireRole(['owner', 'admin']) // Owners or admins
 * ```
 */
export async function requireRole(role: string | string[]) {
  const hasRequiredRole = await hasRole(role)
  if (!hasRequiredRole) {
    const roles = Array.isArray(role) ? role.join(' or ') : role
    throw new Error(`Requires ${roles} role`)
  }
}
