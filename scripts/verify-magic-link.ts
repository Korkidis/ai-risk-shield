
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Bypass RLS using service role
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BASE_URL = 'http://localhost:3000'

async function runTest() {
    console.log('🧪 Starting Magic Link Verification Test...')

    // 1. Create a Fake Session ID
    const sessionId = uuidv4()
    console.log(`🔹 Generated Session ID: ${sessionId}`)

    // 2. Insert a Mock Asset (Required by Foreign Key)
    // We mock the storage path and checksum
    const { data: asset, error: assetError } = await supabase
        .from('assets')
        .insert({
            session_id: sessionId,
            tenant_id: null,
            uploaded_by: null,
            filename: 'test-magic-link.jpg',
            file_type: 'image',
            mime_type: 'image/jpeg',
            file_size: 1024,
            storage_path: `mock/${sessionId}/test.jpg`,
            storage_bucket: 'uploads',
            sha256_checksum: 'mock-checksum',
            delete_after: new Date(Date.now() + 86400000).toISOString()
        })
        .select()
        .single()

    if (assetError) {
        console.error('❌ Failed to create mock asset:', assetError)
        return
    }
    console.log(`✅ Created Mock Asset: ${asset.id}`)

    // 3. Insert a Mock Scan
    const { data: scan, error: scanError } = await supabase
        .from('scans')
        .insert({
            session_id: sessionId,
            asset_id: asset.id, // Link to asset
            tenant_id: null,
            analyzed_by: null,
            status: 'complete',
            composite_score: 88,
            risk_level: 'critical',
            // No meta column
        })
        .select()
        .single()

    if (scanError) {
        console.error('❌ Failed to create mock scan:', scanError)
        return
    }
    console.log(`✅ Created Mock Scan: ${scan.id}`)

    // 4. Simulate API Call to /api/scans/capture-email
    // We use fetch with the cookie header to simulate the browser
    const testEmail = `test-${Date.now()}@example.com`
    console.log(`🔹 Attempting to capture email: ${testEmail}`)

    try {
        const res = await fetch(`${BASE_URL}/api/scans/capture-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `ars_session_id=${sessionId}`
            },
            body: JSON.stringify({
                scanId: scan.id,
                email: testEmail
            })
        })

        if (!res.ok) {
            const txt = await res.text()
            console.error(`❌ API Call Failed: ${res.status}`, txt)
            return
        }

        console.log('✅ API Call Successful (Email Captured)')

        // 5. Retrieve the Token from DB directly
        const { data: link, error: linkError } = await supabase
            .from('magic_links')
            .select('*')
            .eq('scan_id', scan.id)
            .single()

        if (linkError || !link) {
            console.error('❌ Token not found in DB!', linkError)
            return
        }

        console.log('✅ Magic Link Record Found in DB')
        console.log('---------------------------------------------------')
        console.log('🔗 VERIFICATION LINK:')
        console.log(`${BASE_URL}/auth/verify?token=${link.token}`)
        console.log('---------------------------------------------------')
        console.log('👉 Since we are automated, I will verify this link now...')

    } catch (err) {
        console.error('❌ Script Error:', err)
    }
}

runTest()
