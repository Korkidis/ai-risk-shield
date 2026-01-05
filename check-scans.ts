/**
 * Check scan results in database
 * Run with: npx tsx check-scans.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function checkScans() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  console.log('🔍 Checking recent scans...\n')

  // Get recent scans with findings
  const { data: scans, error } = await supabase
    .from('scans')
    .select(`
      *,
      assets(filename, file_type),
      scan_findings(*)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  if (!scans || scans.length === 0) {
    console.log('No scans found')
    return
  }

  scans.forEach((scan: any, i) => {
    console.log(`\n=== Scan ${i + 1} ===`)
    console.log(`ID: ${scan.id}`)
    console.log(`File: ${scan.assets?.filename || 'N/A'}`)
    console.log(`Status: ${scan.status}`)
    console.log(`Risk Level: ${scan.risk_level || 'N/A'}`)
    console.log(`Composite Score: ${scan.composite_score || 'N/A'}`)
    console.log(`IP Risk Score: ${scan.ip_risk_score || 'N/A'}`)
    console.log(`Safety Risk Score: ${scan.safety_risk_score || 'N/A'}`)
    console.log(`Created: ${new Date(scan.created_at).toLocaleString()}`)
    console.log(`Completed: ${scan.completed_at ? new Date(scan.completed_at).toLocaleString() : 'Pending'}`)

    if (scan.scan_findings && scan.scan_findings.length > 0) {
      console.log(`\nFindings (${scan.scan_findings.length}):`)
      scan.scan_findings.forEach((finding: any, j: number) => {
        console.log(`  ${j + 1}. [${finding.severity}] ${finding.title}`)
        console.log(`     ${finding.description}`)
      })
    } else {
      console.log(`\nNo findings detected`)
    }
  })

  console.log('\n')
}

checkScans().catch(console.error)
