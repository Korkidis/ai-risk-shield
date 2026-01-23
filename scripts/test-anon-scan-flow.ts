
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const COOKIE_NAME = 'ars_session_id';

async function runTest() {
    console.log('🚀 Starting Anonymous Scan Flow Verification...');
    console.log(`Target: ${BASE_URL}`);

    // 1. Create a dummy image file (1x1 transparent pixel) or just a test buffer
    // GIF header for a tiny image
    const dummyImage = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    const blob = new Blob([dummyImage], { type: 'image/gif' });

    const formData = new FormData();
    formData.append('file', blob, 'test-anon-scan.gif');

    // 2. Upload File
    console.log('\n📤 Uploading file...');
    const uploadRes = await fetch(`${BASE_URL}/api/scans/anonymous-upload`, {
        method: 'POST',
        body: formData,
    });

    if (!uploadRes.ok) {
        const text = await uploadRes.text();
        console.error('❌ Upload failed:', uploadRes.status, text);
        process.exit(1);
    }

    // Caputure cookies
    const cookies = uploadRes.headers.get('set-cookie');
    console.log('🍪 Received cookies:', cookies);

    // Extract our specific cookie if needed, or just pass all set-cookies back
    // For this test, simply passing the raw set-cookie string usually works for simple cases,
    // but let's be robust and parse it if we need to. 
    // Should be sufficient to pass it as the 'Cookie' header.

    const data = await uploadRes.json();
    console.log('✅ Upload successful! Response:', data);

    if (!data.success || !data.scanId) {
        console.error('❌ Invalid response format: missing success or scanId');
        process.exit(1);
    }

    const scanId = data.scanId;

    // 3. Trigger Processing Manually
    console.log(`\n⚙️ Triggering processing for scan ID: ${scanId}...`);
    const processRes = await fetch(`${BASE_URL}/api/scans/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId }),
    });

    if (!processRes.ok) {
        const text = await processRes.text();
        console.error('❌ Processing trigger failed:', processRes.status, text);
    } else {
        const processData = await processRes.json();
        console.log('✅ Processing triggered:', processData);
    }

    console.log(`\n🕵️ Polling status for scan ID: ${scanId}...`);

    // 3. Poll Status
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout

    while (attempts < maxAttempts) {
        attempts++;

        const statusRes = await fetch(`${BASE_URL}/api/scans/${scanId}/status`, {
            headers: {
                'Cookie': cookies || ''
            }
        });

        if (!statusRes.ok) {
            console.error(`❌ Status check failed (${statusRes.status})`);
            if (statusRes.status === 404) {
                console.error("Scan not found - possibly session cookie issue or propagation delay");
            }
            break;
        }

        const statusData = await statusRes.json();
        console.log(`Attempt ${attempts}: Status = ${statusData.status}, Risk = ${statusData.risk_level ?? 'N/A'}`);

        if (statusData.status === 'completed') {
            console.log('\n✨ Scan completed successfully!');
            console.log('Final Result:', JSON.stringify(statusData, null, 2));
            process.exit(0);
        }

        if (statusData.status === 'failed') {
            console.error('\n❌ Scan failed processing.');
            process.exit(1);
        }

        // Wait 1s
        await new Promise(r => setTimeout(r, 1000));
    }

    console.error('\n⏰ Timeout waiting for scan completion.');
    process.exit(1);
}

runTest().catch(e => {
    console.error('Test error:', e);
    process.exit(1);
});
