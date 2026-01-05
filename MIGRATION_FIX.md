# Migration Fix - Permission Error Resolved

## What Was Wrong

The original migration tried to create a function in the `auth` schema:

```sql
CREATE OR REPLACE FUNCTION auth.user_tenant_id() ...
```

**Problem:** Regular Supabase users don't have permission to modify the `auth` schema (security restriction).

**Error you saw:**
```
ERROR: 42501: permission denied for schema auth
```

## What Was Fixed

Changed the function to live in the `public` schema instead:

```sql
CREATE OR REPLACE FUNCTION public.user_tenant_id() ...
```

All RLS policies now reference `public.user_tenant_id()` instead of `auth.user_tenant_id()`.

This works exactly the same way - it still calls `auth.uid()` internally to get the current user.

## How to Apply the Fixed Migration

The migration file has been updated: `supabase/migrations/20260103_initial_schema.sql`

### Option 1: SQL Editor (Recommended)

1. **Go to Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/_/sql/new
   ```

2. **Copy the ENTIRE migration file:**
   - Open: `supabase/migrations/20260103_initial_schema.sql`
   - Select all (Cmd+A / Ctrl+A)
   - Copy (Cmd+C / Ctrl+C)

3. **Paste and run:**
   - Paste into SQL Editor
   - Click **"Run"** button
   - Wait for "Success. No rows returned"

4. **Verify it worked:**
   ```bash
   npm run test:db
   ```

   Expected output:
   ```
   ✅ Successfully connected to Supabase!
   ✅ Tables exist and are queryable
   ```

### Option 2: If you already ran the old migration

If you already attempted the migration and got an error:

1. **Don't worry** - Postgres rolled back the transaction automatically
2. No tables were created (the error prevented it)
3. Just run the fixed migration (Option 1 above)

---

## What Gets Created

When the migration succeeds, you'll have:

✅ 10 database tables (tenants, profiles, scans, etc.)
✅ Row Level Security enabled on all tables
✅ RLS policies for multi-tenant isolation
✅ `consume_quota()` function for atomic quota checking
✅ `public.user_tenant_id()` helper function for RLS
✅ Auto-update triggers for `updated_at` columns
✅ Proper indexes for performance

---

## Next Steps After Migration

Once the migration succeeds:

1. **Create storage buckets** (see SUPABASE_SETUP.md Step 2)
2. **Configure auth settings** (see SUPABASE_SETUP.md Step 3)
3. **Verify with test:**
   ```bash
   npm run test:db
   ```

Then you're ready for Step 3: Authentication Flow!
