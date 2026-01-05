import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

async function main() {
  console.log('🔍 Checking scans and quota...\n')

  // Get all scans for the user's tenant
  const { data: profiles } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('email', 'john.doe12345678@gmail.com')
    .single()

  if (!profiles) {
    console.error('❌ User not found')
    return
  }

  const tenantId = profiles.tenant_id

  // Check all scans
  const { data: scans } = await supabase
    .from('scans')
    .select('id, status, created_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  console.log(`📊 Found ${scans?.length || 0} scans:`)
  scans?.forEach((scan) => {
    console.log(`  - ${scan.id}: ${scan.status} (${new Date(scan.created_at).toLocaleString()})`)
  })

  // Check usage ledger
  const { data: usage } = await supabase
    .from('usage_ledger')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(10)

  console.log(`\n📈 Recent usage entries: ${usage?.length || 0}`)
  let totalUsed = 0
  usage?.forEach((entry) => {
    totalUsed += entry.quantity
    console.log(`  - ${entry.action}: ${entry.quantity} (${new Date(entry.created_at).toLocaleString()})`)
  })

  console.log(`\n📊 Total scans used this month: ${totalUsed}`)

  // Reset quota by deleting this month's usage entries
  const firstOfMonth = new Date()
  firstOfMonth.setDate(1)
  firstOfMonth.setHours(0, 0, 0, 0)

  console.log('\n🔄 Resetting quota (deleting usage entries)...')
  const { error: deleteError } = await supabase
    .from('usage_ledger')
    .delete()
    .eq('tenant_id', tenantId)
    .gte('created_at', firstOfMonth.toISOString())

  if (deleteError) {
    console.error('❌ Error resetting quota:', deleteError)
  } else {
    console.log('✅ Quota reset successfully')
  }

  // Check for stuck processing scans (older than 5 minutes)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const { data: stuckScans } = await supabase
    .from('scans')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('status', 'processing')
    .lt('created_at', fiveMinutesAgo)

  if (stuckScans && stuckScans.length > 0) {
    console.log(`\n⚠️  Found ${stuckScans.length} stuck scans. Marking as failed...`)
    for (const scan of stuckScans) {
      await supabase
        .from('scans')
        .update({ status: 'failed' })
        .eq('id', scan.id)
      console.log(`  - Marked ${scan.id} as failed`)
    }
  } else {
    console.log('\n✅ No stuck scans found')
  }

  console.log('\n✨ Done! You can now upload images again.')
}

main().catch(console.error)
