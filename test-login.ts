/**
 * Test login functionality
 * Run with: npx tsx test-login.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testLogin() {
  console.log('🧪 Testing login flow...\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // You'll need to provide actual test credentials
  console.log('Enter your test credentials:')
  const email = process.argv[2] || 'test@example.com'
  const password = process.argv[3] || 'TestPassword123'

  console.log(`Testing with email: ${email}`)

  // Test 1: Login
  console.log('\n1️⃣ Attempting login...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    console.error('❌ Login failed:', authError.message)
    return
  }

  if (!authData.user) {
    console.error('❌ No user data returned')
    return
  }

  console.log('✅ Login successful!')
  console.log(`   User ID: ${authData.user.id}`)
  console.log(`   Email: ${authData.user.email}`)

  // Test 2: Fetch profile
  console.log('\n2️⃣ Fetching profile...')
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single()

  if (profileError) {
    console.error('❌ Profile fetch failed:', profileError.message)
    console.error('   Code:', profileError.code)
    console.error('   Details:', profileError.details)
    return
  }

  if (!profile) {
    console.error('❌ No profile found')
    return
  }

  console.log('✅ Profile fetched successfully!')
  console.log(`   Name: ${profile.full_name}`)
  console.log(`   Role: ${profile.role}`)
  console.log(`   Tenant ID: ${profile.tenant_id}`)

  // Test 3: Fetch tenant
  console.log('\n3️⃣ Fetching tenant...')
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', profile.tenant_id)
    .single()

  if (tenantError) {
    console.error('❌ Tenant fetch failed:', tenantError.message)
    return
  }

  console.log('✅ Tenant fetched successfully!')
  console.log(`   Name: ${tenant.name}`)
  console.log(`   Plan: ${tenant.plan}`)
  console.log(`   Monthly limit: ${tenant.monthly_scan_limit}`)

  console.log('\n🎉 All tests passed! Login flow works correctly.')
}

testLogin().catch(console.error)
