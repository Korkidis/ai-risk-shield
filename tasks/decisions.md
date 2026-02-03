# Founder Decision Log

## Architecture & Tech Stack

| Date | Decision | Context/Reasoning | Status |
| :--- | :--- | :--- | :--- |
| **Jan 2026** | **Supabase over Firebase** | Needed strict SQL relational data and Row Level Security (RLS) for SOC 2 compliance. Firebase rules were too brittle. | ✅ Proven |
| **Jan 2026** | **Gemini 1.5 Pro** | Selected for "Reasoning" capabilities (understanding context of an image) vs. simple object detection (AWS Rekognition). | ✅ Active |
| **Jan 2026** | **Tailwind "Forensic" System** | Decided against component libraries (MUI/Chakra) to achieve the custom "Braun/Dieter Rams" physical aesthetic. | ✅ Core Brand |
| **Jan 2026** | **Hierarchical Tenancy** | Implemented `parent_tenant_id` to support Agency use cases (Managing multiple client workspaces). Essential for B2B. | ✅ Live |
| **Feb 2026** | **Metered Billing** | Chose Stripe Usage Records over simple subscriptions to capture upside from heavy users (Agencies). | ✅ Live |

## Product & Business

| Date | Decision | Context/Reasoning | Status |
| :--- | :--- | :--- | :--- |
| **Jan 2026** | **No "Create" Features** | We VALIDATE content, we do not CREATE it. Avoids competing with Midjourney/Adobe and keeps legal liability clear. | 🔒 Permanent |
| **Jan 2026** | **Anonymous Scan (The Hook)** | Allow scanning without signup (cookie-based). Frictionless value demonstration > forced signup drop-off. | ⚠️ Monitoring |
| **Feb 2026** | **Strict RLS Everywhere** | Every table must have RLS. No "Service Key" bypasses in frontend code. Critical for SOC 2. | 🛡️ Enforced |
