
import { config } from 'dotenv'

// Load .env.local first
config({ path: '.env.local' })

if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is missing from .env.local')
    process.exit(1)
}

// Now import the library that uses the key
// Use dynamic import to force env loading first
import('@/lib/email').then(async ({ sendSampleReportEmail }) => {
    console.log('Testing Email Sending...')
    console.log('RESEND_API_KEY present:', !!process.env.RESEND_API_KEY)
    console.log('EMAIL_FROM present:', !!process.env.EMAIL_FROM)

    try {
        const res = await sendSampleReportEmail(
            'test@example.com',
            'test-scan-id',
            95,
            3,
            'https://example.com/magic-link'
        )
        console.log('Result:', JSON.stringify(res, null, 2))
    } catch (e) {
        console.error('Error:', e)
    }
})
