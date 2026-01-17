#!/usr/bin/env tsx
/**
 * Apply brand_guidelines migration
 * Temporary script to fix /api/guidelines 500 error
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials')
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

async function applyMigration() {
    console.log('🚀 Applying brand_guidelines migration...\n')

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    // Read migration file
    const migrationPath = resolve(process.cwd(), 'supabase/migrations/20260116_create_brand_guidelines.sql')
    const sql = readFileSync(migrationPath, 'utf-8')

    console.log('📄 Migration file:', migrationPath)
    console.log('📊 SQL length:', sql.length, 'characters\n')

    try {
        // Execute migration
        const { data, error } = await supabase.rpc('exec_sql', { sql })

        if (error) {
            // If exec_sql doesn't exist, try direct execution (Supabase may not have this RPC)
            console.log('⚠️  exec_sql RPC not available, using alternative method...\n')

            // Split SQL into individual statements
            const statements = sql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'))

            console.log(`📝 Executing ${statements.length} SQL statements...\n`)

            for (let i = 0; i < statements.length; i++) {
                const statement = statements[i] + ';'
                console.log(`[${i + 1}/${statements.length}] Executing...`)

                // Note: Supabase JS client doesn't support raw SQL execution
                // User will need to apply via Dashboard
                console.log(statement.substring(0, 80) + '...\n')
            }

            console.log('\n⚠️  Cannot execute SQL directly via Supabase JS client')
            console.log('\n📋 Please apply migration manually:')
            console.log('1. Go to: https://supabase.com/dashboard/project/_/sql/new')
            console.log('2. Copy contents of: supabase/migrations/20260116_create_brand_guidelines.sql')
            console.log('3. Paste and click "Run"\n')

            return
        }

        console.log('✅ Migration applied successfully!')
        console.log('Data:', data)

    } catch (err) {
        console.error('❌ Migration failed:', err)
        process.exit(1)
    }
}

applyMigration()
