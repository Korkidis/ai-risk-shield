/**
 * Safe Migration Helper
 * 
 * Instead of blindly executing SQL, this script:
 * 1. Validates preconditions (if possible)
 * 2. Prints the "Game Plan"
 * 3. Provides copy-pasteable commands for the operator
 * 4. Generates a Rollback Plan
 * 
 * Usage: npx tsx scripts/apply-migration.ts [migration-file]
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function checkPreconditions(supabase: any) {
  const checks: any[] = []

  // Check 1: Connectivity
  try {
    const start = Date.now()
    const { error } = await supabase.from('tenants').select('id').limit(1)
    if (error) throw error
    checks.push({ name: 'Database Connectivity', status: '✅', detail: `${Date.now() - start}ms` })
  } catch (err: any) {
    checks.push({ name: 'Database Connectivity', status: '❌', detail: err.message })
    return checks // specific failure, return early
  }

  // Check 2: Extension Availability (Try to query a function provided by the extension)
  // We can't query pg_extension directly via REST, but we can check if uuid_generate_v4 works or just assume common setups.
  // Alternatively, try a dummy RPC call if one exists, or skip.
  // Here we'll skip direct extension verification via REST as it's restricted, 
  // but we can check if the column we are about to add ALREADY exists/

  // Check 3: Does parent_tenant_id already exist?
  try {
    const { error } = await supabase.from('tenants').select('parent_tenant_id').limit(1)
    if (!error) {
      checks.push({ name: 'Column: parent_tenant_id', status: '⚠️', detail: 'Already exists (Safe to skip or ensure IF NOT EXISTS)' })
    } else {
      checks.push({ name: 'Column: parent_tenant_id', status: '✅', detail: 'Does not exist yet (Clean slate)' })
    }
  } catch (e) {
    checks.push({ name: 'Column: parent_tenant_id', status: '❓', detail: 'Could not verify state' })
  }

  return checks
}

async function run() {
  console.log('\n🛡️  AI Risk Shield - Safe Migration Helper\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const dbUrl = process.env.SUPABASE_DB_URL || 'postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres'

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  // 1. Resolve Migration File
  const filename = process.argv[2] || '20260122_hierarchical_tenancy.sql'
  const migrationPath = join(process.cwd(), 'supabase/migrations', filename)

  if (!existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`)
    process.exit(1)
  }

  const sqlContent = readFileSync(migrationPath, 'utf-8')
  console.log(`📄 Loaded: ${filename} (${sqlContent.length} bytes)`)
  const requiresNoTransaction = /create\s+index\s+concurrently/i.test(sqlContent)

  // 2. Validate Preconditions
  console.log('\n🔍 Validating Preconditions...')
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  const checks = await checkPreconditions(supabase)
  checks.forEach(c => console.log(`   ${c.status} ${c.name.padEnd(25)} ${c.detail}`))

  const hasErrors = checks.some(c => c.status === '❌')
  if (hasErrors) {
    console.error('\n🛑 BLOCKING ERRORS FOUND. Fix connectivity before proceeding.')
    process.exit(1)
  }

  // 3. Execution Instructions
  console.log('\n🚀 READY TO MIGRATE')
  console.log('   Review the details below and execute manually.\n')

  console.log('--- OPTION A: SQL EDITOR (Easiest) ---')
  console.log('1. Open: https://supabase.com/dashboard/project/_/sql/new')
  console.log(`2. Paste contents of: supabase/migrations/${filename}`)
  if (requiresNoTransaction) {
    console.log('⚠️  This migration uses CREATE INDEX CONCURRENTLY, which cannot run inside a transaction.')
    console.log('   If your SQL editor wraps statements in a transaction, it will fail.')
    console.log('   Prefer Option B (psql) or a no-transaction runner for this file.')
  } else {
    console.log('3. Run.\n')
  }
  if (!requiresNoTransaction) {
    console.log('\n')
  } else {
    console.log('\n')
  }

  console.log('--- OPTION B: PSQL COMMAND (Scriptable) ---')
  console.log(`   psql "${dbUrl}" -f supabase/migrations/${filename}\n`)

  // 4. Rollback Plan
  console.log('--- ↩️  ROLLBACK PLAN (If things go wrong) ---')
  console.log('   Run this SQL to undo changes:\n')

  // Basic heuristic rollback generator based on specific known migration content
  // In a real CLI this would parse the AST, here we do best-effort for this specific file
  if (filename.includes('hierarchical_tenancy')) {
    console.log(`
    -- Rollback: 20260122_hierarchical_tenancy.sql
    DROP POLICY IF EXISTS "Tenants: agency admin can select own children" ON public.tenants;
    DROP POLICY IF EXISTS "Assets: select only for active tenant" ON public.assets;
    DROP POLICY IF EXISTS "Assets: insert only into active tenant" ON public.assets;
    DROP POLICY IF EXISTS "Assets: update only within active tenant" ON public.assets;
    DROP POLICY IF EXISTS "Assets: delete only within active tenant" ON public.assets;
    
    DROP TABLE IF EXISTS public.tenant_switch_audit;
    DROP FUNCTION IF EXISTS public.is_agency_admin();
    DROP FUNCTION IF EXISTS public.get_active_tenant();
    
    ALTER TABLE public.tenants DROP COLUMN IF EXISTS parent_tenant_id;
    `)
  } else {
    console.log('   -- (No automated rollback available for this generic file. Check file contents.)')
  }

  console.log('\n✅ Verification Complete.')
}

run()
