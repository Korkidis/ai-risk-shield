
import { verifyContentCredentials } from '../lib/c2pa';
import path from 'path';

async function runTest() {
    const testFile = path.resolve(process.cwd(), 'Screenshot 2026-01-16 at 10.04.15 PM.png');
    console.log(`Testing with file: ${testFile}`);

    const report = await verifyContentCredentials(testFile);
    console.log('Report Result:', JSON.stringify(report, null, 2));
}

runTest();
