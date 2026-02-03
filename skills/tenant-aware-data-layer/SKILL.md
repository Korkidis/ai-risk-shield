---
name: tenant-aware-data-layer
description: RLS policies, tenant switching, and audit logging for the hierarchical tenancy model. Use when writing any database migration, query, or feature that touches tenant data.
---

# Tenant-Aware Data Layer Skill

## 1. Context & Philosophy
Our application uses a **Hierarchical Tenancy** model to support B2B Agencies managed by `parent_tenant_id` logic.
*   **Zero Trust**: Frontend code is untrusted. All security is enforced by Postgres RLS.
*   **Isolation**: Data never leaks between tenants. Agency Admins can "switch" into Client Tenants, but Client users are sandboxed.
*   **SOC 2 Audit**: Every context switch and mutation is logged.

## 2. Core Rules (The "Must Haves")

### A. RLS is Mandatory
Every table (except public static data) MUST have Row Level Security enabled.
```sql
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
```

### B. Use Helper Functions for Policies
Never write raw `auth.uid()` logic for tenancy checks. Use the `get_active_tenant()` helper to handle the Agency/Client complexity.
```sql
-- BAD
using ( tenant_id = (select tenant_id from users where id = auth.uid()) )

-- GOOD
using ( tenant_id = public.get_active_tenant() )
```

### C. The "Auth Schema" Forbidden Zone
**NEVER** attempt to create functions or tables inside the `auth` schema in a migration.
*   **Why**: Supabase restricts permissions.
*   **Fix**: Create helper functions in `public` with `SECURITY DEFINER` if they need access to auth internals (like `auth.users`).

## 3. Implementation Patterns

### Pattern 1: Safe Migration Structure
Always follow this template for migrations to ensure no downtime or broken permissions.

```sql
-- 1. Enable RLS
alter table public.feature_table enable row level security;

-- 2. Add Tenant ID (Indexed)
alter table public.feature_table 
add column tenant_id uuid references public.tenants(id) not null;

create index ix_feature_table_tenant_id on public.feature_table(tenant_id);

-- 3. Add RLS Policies (Select/Insert/Update/Delete)
create policy "Tenants can view own data"
on public.feature_table for select
using ( tenant_id = public.get_active_tenant() );

create policy "Tenants can insert own data"
on public.feature_table for insert
with check ( tenant_id = public.get_active_tenant() );
```

### Pattern 2: Tenant Context Switching
When building features for Agency Admins (e.g., "View as Client"):
1.  Frontend calls `POST /api/tenants/switch`.
2.  Backend verifies `parent_tenant_id` relationship (is this really their child?).
3.  Backend logs to `public.tenant_switch_audit`.
4.  Backend issues new session token with `current_tenant` claim.

**Do NOT** build "sudo" modes in the frontend. The database session must change.

## 4. Verification Check
Before marking a backend task complete, run:
1.  [ ] Did I add an index to `tenant_id`? (Fixes performance)
2.  [ ] Did I enable RLS? (Fixes security)
3.  [ ] Did I use `get_active_tenant()`? (Fixes hierarchy)
4.  [ ] Did I avoid the `auth` schema? (Fixes migration errors)
