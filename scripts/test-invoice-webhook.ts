import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { v4 as uuidv4 } from 'uuid'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

if (!supabaseUrl || !supabaseServiceKey || !stripeSecretKey || !webhookSecret) {
    console.error('Missing required environment variables.')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-12-15.clover' })

async function main() {
    const sessionId = uuidv4()
    const scanId = uuidv4()
    // Use a unique email to trigger user creation
    const testEmail = `test.anon.${Date.now()}@example.com`

    console.log('--- SETUP ---')
    console.log(`Scan ID: ${scanId}`)
    console.log(`Session ID: ${sessionId}`)
    console.log(`Email: ${testEmail}`)

    // 1. Create Data
    // Create Asset first
    const assetId = uuidv4()
    const { error: assetError } = await supabase.from('assets').insert({
        id: assetId,
        session_id: sessionId,
        filename: 'test_evidence.jpg',
        file_type: 'image',
        mime_type: 'image/jpeg',
        file_size: 1024,
        storage_path: `scans/${sessionId}/${assetId}`,
        storage_bucket: 'scans',
        sha256_checksum: 'dummy_checksum',
        delete_after: new Date(Date.now() + 86400000).toISOString(),
        created_at: new Date().toISOString()
    })

    if (assetError) {
        console.error('Failed to insert asset:', assetError)
        return
    }
    console.log('Asset inserted successfully.')

    // Create Scan
    const { error: insertError } = await supabase.from('scans').insert({
        id: scanId,
        asset_id: assetId,
        session_id: sessionId,
        status: 'complete',
        ip_risk_score: 55,
        composite_score: 55,
        created_at: new Date().toISOString()
    })

    if (insertError) {
        console.error('Failed to insert scan:', insertError)
        return
    }
    console.log('Scan inserted successfully.')

    // 2. Construct Webhook Payload
    const payload = {
        id: `evt_test_${Date.now()}`,
        object: 'event',
        api_version: '2025-01-27.acacia',
        created: Math.floor(Date.now() / 1000),
        type: 'checkout.session.completed',
        data: {
            object: {
                id: `cs_test_${Date.now()}`,
                object: 'checkout.session',
                customer: `cus_test_${Date.now()}`,
                customer_details: {
                    email: testEmail,
                    name: 'Test Anonymous User'
                },
                metadata: {
                    scanId: scanId,
                    userId: 'anonymous',
                    tenantId: 'anonymous',
                    purchaseType: 'one_time'
                },
                payment_intent: `pi_test_${Date.now()}`,
                payment_status: 'paid',
                status: 'complete',
                mode: 'payment',
                amount_total: 2900,
                currency: 'usd',
            }
        }
    }

    const payloadString = JSON.stringify(payload)

    // 3. Generate Valid Signature
    const header = stripe.webhooks.generateTestHeaderString({
        payload: payloadString,
        secret: webhookSecret!,
    })

    // 4. Send to Local Webhook Endpoint
    console.log('Sending webhook to http://localhost:3000/api/stripe/webhook...')
    const res = await fetch('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Stripe-Signature': header
        },
        body: payloadString
    })

    const text = await res.text()
    console.log(`Response: ${res.status} ${text}`)
    require('fs').writeFileSync('webhook_response.log', `Response: ${res.status} ${text}`)

    if (!res.ok) {
        console.error('Webhook failed.')
        return
    }

    // 5. Verify Database State
    console.log('--- VERIFICATION ---')

    // Check Scan
    const { data: scan } = await supabase.from('scans').select('*').eq('id', scanId).single()

    if (!scan) {
        console.error('Scan not found!')
        return
    }

    console.log(`Scan User ID: ${scan.user_id}`)
    console.log(`Scan Tenant ID: ${scan.tenant_id}`)
    console.log(`Scan Session ID: ${scan.session_id}`)

    if (scan.user_id && scan.tenant_id && !scan.session_id) {
        console.log('✅ SUCCESS: Scan assigned to user and session cleared.')
    } else {
        console.error('❌ FAILURE: Scan state incorrect.')
    }

    // Check User
    // We can't query auth.users directly via client easily, but if scan.user_id is set it implies user exists (FK constraint).
    console.log('✅ IMPLICIT: User created (FK constraint satisfied).')
}

main().catch(e => console.error(e))
