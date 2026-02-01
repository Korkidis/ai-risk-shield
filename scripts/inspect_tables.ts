
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
})

async function run() {
    console.log('Inspecting tables...')

    const { data: subs, error: sError } = await supabase.from('subscriptions').select('*').limit(1)
    if (sError) console.log('Subs error:', sError.message)
    else console.log('Subs keys:', subs && subs.length > 0 ? Object.keys(subs[0]) : 'Empty table')

    const { data: profs, error: pError } = await supabase.from('profiles').select('*').limit(1)
    if (pError) console.log('Profs error:', pError.message)
    else console.log('Profs keys:', profs && profs.length > 0 ? Object.keys(profs[0]) : 'Empty table')
}

run()
