import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

async function seed() {
    console.log('🌱 Seeding Agency Data...')

    // 1. Create Agency Tenant
    console.log('   Creating Agency Tenant...')
    const { data: agency, error: agencyError } = await supabase
        .from('tenants')
        .insert({
            name: 'Apex Agency',
            plan: 'agency',
            monthly_scan_limit: 1000
        })
        .select()
        .single()

    if (agencyError) {
        console.error('❌ Failed to create agency:', agencyError)
        process.exit(1)
    }
    console.log(`   ✅ Created Agency: ${agency.name} (${agency.id})`)

    // 2. Create Child Tenant
    console.log('   Creating Child Tenant (Client Corp)...')
    const { data: client, error: clientError } = await supabase
        .from('tenants')
        .insert({
            name: 'Client Corp',
            plan: 'team',
            monthly_scan_limit: 100,
            parent_tenant_id: agency.id
        })
        .select()
        .single()

    if (clientError) {
        console.error('❌ Failed to create client:', clientError)
        process.exit(1)
    }
    console.log(`   ✅ Created Client: ${client.name} (${client.id})`)

    // 3. Create Agency Admin User
    const email = 'agency@example.com'
    const password = 'password123'

    console.log(`   Creating User: ${email}...`)

    // Clean up if exists
    const { data: existingUser } = await supabase.from('profiles').select('id').eq('email', email).single()
    if (existingUser) {
        console.log('   User exists in profiles, attempting clean slate...')
        // Can't delete from auth via client easily without admin API, but we'll try to just signup
        // If signup fails, we assume user exists and we just update their profile mapping
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Agency Admin' }
    })

    // If user already exists, authError might be "User already registered"
    // In that case we need to get their ID to update profile
    let userId = authData.user?.id

    if (authError) {
        console.log(`   ⚠️ Auth note: ${authError.message}`)
        // Try to find them
        // Note: Admin API listUsers is restricted usually? Let's assume for dev we can just warn user.
        console.log('   If user exists, we will attempt to update their profile linkage.')

        if (existingUser) {
            userId = existingUser.id
        } else {
            console.log('   User likely exists in Auth but not in Profiles (orphaned). Fetching from Auth...')
            const { data: users, error: listError } = await supabase.auth.admin.listUsers()
            if (listError) {
                console.error('   ❌ Could not list users:', listError)
                process.exit(1)
            }
            const found = users.users.find(u => u.email === email)
            if (found) {
                userId = found.id
                console.log(`   Found orphaned user ID: ${userId}`)
            } else {
                console.error('   ❌ Could not find user even in list.')
                process.exit(1)
            }
        }
    }

    if (!userId) {
        console.error('   ❌ No User ID found.')
        process.exit(1)
    }

    // 4. Link Profile to Agency Tenant
    console.log(`   Linking User ${userId} to Agency Tenant...`)

    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            email: email,
            tenant_id: agency.id,
            role: 'owner',
            full_name: 'Agency Admin'
        })

    if (profileError) {
        console.error('❌ Failed to update profile:', profileError)
        process.exit(1)
    }

    console.log('   ✅ Profile updated.')

    console.log('\n🎉 SEED COMPLETE')
    console.log('------------------------------------------------')
    console.log(`Login:    ${email}`)
    console.log(`Password: ${password}`)
    console.log('------------------------------------------------')
}

seed()
