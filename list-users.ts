/**
 * List all users in the database (using service role)
 * Run with: npx tsx list-users.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function listUsers() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase credentials')
    return
  }

  // Use service role to bypass RLS
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  console.log('🔍 Checking database...\n')

  // List auth users
  console.log('=== AUTH USERS ===')
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

  if (usersError) {
    console.error('❌ Error fetching users:', usersError.message)
    return
  }

  if (!users || users.length === 0) {
    console.log('No users found in auth.users')
  } else {
    users.forEach((user, i) => {
      console.log(`\n${i + 1}. Email: ${user.email}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Created: ${user.created_at}`)
      console.log(`   Last sign in: ${user.last_sign_in_at || 'Never'}`)
      console.log(`   Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`)
    })
  }

  // List profiles
  console.log('\n\n=== PROFILES ===')
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*, tenants(name, plan)')
    .order('created_at', { ascending: false })

  if (profilesError) {
    console.error('❌ Error fetching profiles:', profilesError.message)
    return
  }

  if (!profiles || profiles.length === 0) {
    console.log('No profiles found')
  } else {
    profiles.forEach((profile: any, i) => {
      console.log(`\n${i + 1}. Name: ${profile.full_name}`)
      console.log(`   Email: ${profile.email}`)
      console.log(`   Role: ${profile.role}`)
      console.log(`   Tenant: ${profile.tenants?.name || 'N/A'}`)
      console.log(`   Plan: ${profile.tenants?.plan || 'N/A'}`)
    })
  }

  console.log('\n')
}

listUsers().catch(console.error)
