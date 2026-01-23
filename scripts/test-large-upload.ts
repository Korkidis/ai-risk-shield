
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function runTest() {
    console.log('🚀 Starting Large File Upload Verification...');
    console.log(`Target: ${BASE_URL}`);

    // Create a 5MB buffer
    const size = 5 * 1024 * 1024;
    const buffer = Buffer.alloc(size, 'a'); // Fill with 'a'
    const blob = new Blob([buffer], { type: 'text/plain' }); // Using text/plain might trigger invalid type, let's use image/jpeg signature

    // Mock JPEG header to pass file type check
    buffer[0] = 0xFF;
    buffer[1] = 0xD8;
    buffer[2] = 0xFF;

    // Re-blob with correct type
    const largeFileBlob = new Blob([buffer], { type: 'image/jpeg' });

    const formData = new FormData();
    formData.append('file', largeFileBlob, 'large-test.jpg');

    // Upload File
    console.log(`\n📤 Uploading ${size / 1024 / 1024}MB file...`);
    const uploadRes = await fetch(`${BASE_URL}/api/scans/anonymous-upload`, {
        method: 'POST',
        body: formData,
    });

    if (!uploadRes.ok) {
        const text = await uploadRes.text();
        console.error('❌ Upload failed:', uploadRes.status, text);
        // If 413, that's the issue
        if (uploadRes.status === 413) {
            console.error("⚠️  Confirmed: Payload Too Large");
        }
        process.exit(1);
    }

    const data = await uploadRes.json();
    console.log('✅ Upload successful! Response:', data);
    process.exit(0);
}

runTest().catch(e => {
    console.error('Test error:', e);
    process.exit(1);
});
