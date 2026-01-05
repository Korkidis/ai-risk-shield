/**
 * Confirm a user's email address (bypass email confirmation)
 * Run with: npx tsx confirm-user.ts <email>
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function confirmUser(email: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase credentials')
    return
  }

  // Use service role to bypass RLS
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  console.log(`🔧 Confirming email for: ${email}\n`)

  // Find the user
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

  if (listError) {
    console.error('❌ Error fetching users:', listError.message)
    return
  }

  const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

  if (!user) {
    console.error(`❌ User not found: ${email}`)
    return
  }

  console.log(`Found user: ${user.email} (ID: ${user.id})`)

  // Update user to mark email as confirmed
  const { data, error } = await supabase.auth.admin.updateUserById(
    user.id,
    { email_confirm: true }
  )

  if (error) {
    console.error('❌ Error confirming email:', error.message)
    return
  }

  console.log(`\n✅ Email confirmed successfully!`)
  console.log(`   User: ${data.user.email}`)
  console.log(`   Confirmed at: ${data.user.email_confirmed_at}`)
  console.log(`\n🎉 You can now login with this email!`)
}

const email = process.argv[2] || 'john.doe12345678@gmail.com'
confirmUser(email).catch(console.error)
