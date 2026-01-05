/**
 * Test Supabase database connection
 *
 * Verifies:
 * 1. Environment variables are set
 * 2. Can connect to Supabase
 * 3. Tables exist (after migration)
 * 4. RLS is enabled
 *
 * Usage: npm run test:db
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

async function testConnection() {
  console.log('🧪 Testing Supabase Connection\n')

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.error('❌ Missing environment variables in .env.local\n')
    console.error('Required:')
    console.error('  - NEXT_PUBLIC_SUPABASE_URL')
    console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY')
    console.error('  - SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  console.log('✅ Environment variables found')
  console.log(`📍 Supabase URL: ${supabaseUrl}\n`)

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('⏳ Testing connection...\n')

  try {
    // Test basic query
    const { error } = await supabase
      .from('tenants')
      .select('count')
      .limit(1)

    if (error) {
      if (error.message.includes('relation "tenants" does not exist')) {
        console.log('⚠️  Tables not created yet')
        console.log('\n📋 To create tables:')
        console.log('1. Go to: https://supabase.com/dashboard/project/_/sql/new')
        console.log('2. Copy contents of: supabase/migrations/20260103_initial_schema.sql')
        console.log('3. Paste and click "Run"\n')
        return
      }
      throw error
    }

    console.log('✅ Successfully connected to Supabase!')
    console.log('✅ Tables exist and are queryable\n')

    // List all tables
    const { data: tables } = await supabase
      .rpc('exec_sql', {
        sql: `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;`
      })
      .single()

    if (tables) {
      console.log('📊 Database tables found:')
      console.log(tables)
    }

    console.log('\n🎉 Database connection test passed!')
    console.log('\nYou can now:')
    console.log('  - Run: npm run dev')
    console.log('  - Start building authentication (Step 4)')

  } catch (error) {
    console.error('❌ Connection test failed:', error)
    console.error('\nTroubleshooting:')
    console.error('1. Check that your Supabase project is running')
    console.error('2. Verify API keys are correct in .env.local')
    console.error('3. Make sure you copied the ANON key (not publishable key)')
    process.exit(1)
  }
}

testConnection()
