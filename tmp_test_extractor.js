const { extractFrames } = require('./lib/video/processor.ts');
const { promises: fs } = require('fs');

async function main() {
  console.log("Starting test...");
  try {
    // create a dummy buffer
    const buf = Buffer.from('dummy video content');
    console.log("Calling extractFrames...");
    const frames = await extractFrames(buf, 1);
    console.log("Frames:", frames);
  } catch (err) {
    console.error("Caught error:", err.message);
  }
}

main();
