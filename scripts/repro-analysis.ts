
import { analyzeImageMultiPersona } from '../lib/gemini';

(async () => {
    try {
        console.log("Starting analysis repro...");
        const buffer = Buffer.from("test image data");
        console.log("Mocking Asset...");
        const res = await analyzeImageMultiPersona(buffer, "image/jpeg", "test.jpg");
        console.log("Result:", res.verdict);
        console.log("C2PA:", res.c2pa_report);

    } catch (e) {
        console.error("Repro Error:", e);
    }
})();
