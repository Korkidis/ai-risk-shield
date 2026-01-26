const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function runTest() {
    console.log('🚀 Starting Invalid File Upload Verification...');
    console.log(`Target: ${BASE_URL}`);

    const blob = new Blob(['some text content'], { type: 'text/plain' });

    const formData = new FormData();
    formData.append('file', blob, 'invalid.txt');

    // Upload File
    console.log(`\n📤 Uploading invalid file...`);
    const uploadRes = await fetch(`${BASE_URL}/api/scans/anonymous-upload`, {
        method: 'POST',
        body: formData,
    });

    if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        console.log('✅ Correctly rejected with status:', uploadRes.status);
        console.log('Error Data:', errorData);

        if (errorData.error === 'Invalid file type') {
            console.log('✨ Assertion Passed: Error message matches expected.');
            process.exit(0);
        } else {
            console.error('❌ Unexpected error message:', errorData.error);
            process.exit(1);
        }
    }

    console.error('❌ Failed: Should have rejected the upload but it succeeded.');
    process.exit(1);
}

runTest().catch(e => {
    console.error('Test error:', e);
    process.exit(1);
});
