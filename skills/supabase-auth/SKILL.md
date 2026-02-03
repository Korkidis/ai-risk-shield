---
name: supabase-auth-session-management
description: Protocols for handling Auth, Sessions, and detailed RLS context in a simplified manner. Use when modifying login flows, middleware, or session-handling logic.
---

# Supabase Auth & Session Management Skill

## 1. Context
We use Supabase GoTrue for authentication, coupled with a custom RLS implementation for Hierarchical Tenancy.
*   **HttpOnly Cookies**: Sessions are stored securely. Client-side storage is avoided for sensitive tokens.
*   **Middleware Protection**: `middleware.ts` guards routes and refreshes tokens.
*   **Tenant Context**: The session alone is not enough; the `tenant_id` determines access scope.

## 2. Core Patterns

### A. Server Component Access
In App Router, use `createClient` from `@supabase/ssr` (or your configured lib helper).
```typescript
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();

if (!user) redirect('/login');
```

### B. Route Handlers (API)
Always validate the user within the handler.
```typescript
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Continue...
}
```

### C. Client Side (Hooks)
Use the provided `useUser()` or similar context hooks rather than raw `supabase.auth.getSession()` to avoid race conditions and waterfall requests.

## 3. Tenancy & Permissions
*   **Switching**: When a user "switches" tenants, the *session* stays the same, but the *application state* (cookie or context) updates the active `tenant_id`.
*   **RLS**: The database uses `public.get_active_tenant()` which reads from detailed request context or claims.

## 4. Verification Checklist
- [ ] Are we using `getUser()` (secure) instead of `getSession()` (insecure) on the server?
- [ ] Is `middleware.ts` configured to refresh sessions?
- [ ] Are we checking `error` on every auth call?
