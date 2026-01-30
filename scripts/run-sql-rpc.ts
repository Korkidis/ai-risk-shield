
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function run() {
    const filename = process.argv[2]
    if (!filename) {
        console.error('Please provide a filename')
        process.exit(1)
    }

    console.log(`Reading ${filename}...`)
    const sql = readFileSync(filename, 'utf-8')

    console.log('Executing SQL...')
    const { data, error } = await supabase.rpc('exec_sql', { sql })

    if (error) {
        console.error('Error executing SQL:', error)
        process.exit(1)
    }

    console.log('Success!', data)
}

run()
