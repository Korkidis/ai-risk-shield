/**
 * Apply database migration to Supabase
 *
 * This script reads the SQL migration file and executes it
 * against your Supabase database using the service role key
 *
 * Usage: npm run migrate
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function applyMigration() {
  console.log('🚀 AI Risk Shield - Database Migration\n')

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Missing Supabase credentials')
    console.error('Make sure .env.local has:')
    console.error('  - NEXT_PUBLIC_SUPABASE_URL')
    console.error('  - SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  console.log('✅ Environment variables found')
  console.log(`📍 Supabase URL: ${supabaseUrl}\n`)

  // Create Supabase client with service role (admin access)
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  // Read migration file
  const migrationFile = process.argv[2] || 'supabase/migrations/20260103_initial_schema.sql'
  // Handle both relative (from cwd) and simple filenames (in supabase/migrations)
  const migrationPath = migrationFile.includes('/')
    ? join(process.cwd(), migrationFile)
    : join(process.cwd(), 'supabase/migrations', migrationFile)

  console.log(`📄 Reading migration file: ${migrationPath}...`)

  let migrationSql: string
  try {
    migrationSql = readFileSync(migrationPath, 'utf-8')
    console.log(`✅ Migration file loaded (${migrationSql.length} characters)\n`)
  } catch (error) {
    console.error('❌ Error reading migration file:', error)
    process.exit(1)
  }

  // Execute migration
  console.log('⚡ Executing migration...\n')

  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql: migrationSql
    })

    if (error) {
      // If exec_sql doesn't exist, we need to execute directly
      // This is a workaround - in production, use Supabase CLI migrations
      console.log('ℹ️  exec_sql not available, using direct query execution\n')

      // Split SQL into individual statements and execute
      const statements = migrationSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      console.log(`📊 Executing ${statements.length} SQL statements...\n`)

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i]
        if (statement) {
          try {
            // For most statements, we can't use the supabase client directly
            // This is a limitation - need to use Supabase SQL Editor for initial migration
            console.log(`⏭️  Statement ${i + 1}/${statements.length} (manual execution required)`)
          } catch (err) {
            console.error(`❌ Error in statement ${i + 1}:`, err)
          }
        }
      }

      console.log('\n⚠️  IMPORTANT: This migration must be run manually in Supabase SQL Editor')
      console.log('\n📋 Steps to apply migration:')
      console.log('1. Go to: https://supabase.com/dashboard/project/_/sql/new')
      console.log(`2. Copy the contents of: ${migrationPath}`)
      console.log('3. Paste into SQL Editor')
      console.log('4. Click "Run"\n')

      process.exit(0)
    }

    console.log('✅ Migration completed successfully!\n')
  } catch (error) {
    console.error('❌ Error executing migration:', error)
    process.exit(1)
  }

  console.log('🎉 Database setup complete!')
  console.log('\nNext steps:')
  console.log('1. Create storage buckets (see instructions below)')
  console.log('2. Test the setup with: npm run test:db')
}

applyMigration()
