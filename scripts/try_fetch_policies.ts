
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
})

async function run() {
    console.log('Fetching policies...')
    // Try to query pg_policies via RPC if a helper exists, or direct table access if exposed
    // Usually PostgREST doesn't expose pg_policies. 
    // But we can try to find ANY way.

    // If this fails, we will try to use the 'rpc' fallback if there is one.
    // If not, we are blind.

    try {
        const { data, error } = await supabase.from('pg_policies').select('*')
        if (error) {
            console.log('Direct select failed:', error.message)
        } else {
            console.log('Detected policies:', JSON.stringify(data, null, 2))
            return
        }
    } catch (e) {
        console.log('Error:', e)
    }

    console.log('Trying known tables to sanity check connection...')
    const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(1)
    if (pError) console.log('Profiles check failed')
    else console.log('Profiles check passed')
}

run()
