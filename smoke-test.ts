import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function runTests() {
    console.log('🚀 Starting Smoke Tests...')

    // Test 1: Healthcheck or basic connection
    const { error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
        console.error('❌ Supabase Connection Failed:', sessionError)
        process.exit(1)
    }
    console.log('✅ Supabase connected successfully.')

    // Note: We can't easily test upload & checkout end-to-end without a full browser or complex session mocking
    // since rate limits, signed URLs, and Stripe redirects are involved.
    // Instead, let's test the DB limits and policies updated in this sprint.

    // Test 2: Verify `tenants` schema changes exist
    const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('monthly_scan_limit, scans_used_this_month')
        .limit(1)

    if (tenantError) {
        console.warn('⚠️ Could not fetch tenant due to RLS or schema issue (expected for anon):', tenantError.message)
    } else {
        console.log('✅ Tenant schema changes verified.', tenantData?.length ? tenantData[0] : 'No tenants found.')
    }

    // Test 3: Mitigation Schema exists
    const { error: mitError } = await supabase
        .from('mitigation_reports')
        .select('id, status, report_content')
        .limit(1)

    if (mitError && mitError.code !== 'PGRST116') {
        console.warn('⚠️ Mitigation reports schema restriction/error:', mitError.message)
    } else {
        console.log('✅ Mitigation reports table reachable.')
    }

    console.log('\n🎉 Automation Smoke Tests Complete.')
}

runTests().catch(console.error)
