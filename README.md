# AI Content Risk Score
**The Forensic Instrument for AI Content Validation**

AI Content Risk Score is a SaaS platform for analyzing visual assets (images/video) to detect copyright infringement risk (IP), brand safety violations, and provenance authenticity (C2PA). Score, report, and mitigate — in 15 seconds.

**Production:** [contentriskscore.com](https://contentriskscore.com)

---

## 🛠 Tech Stack

*   **Frontend**: Next.js 16 (App Router, Turbopack), Tailwind CSS v4
*   **Database**: Supabase (PostgreSQL, RLS, Storage, Realtime)
*   **AI Engine**: Google Gemini 2.5 Flash (multi-persona analysis)
*   **Provenance**: C2PA Node (Content Credentials verification)
*   **Payments**: Stripe (subscriptions + one-time purchases + metered overage)
*   **Email**: Resend (transactional + magic links)

## ✅ Features

*   **Freemium On-Ramp**: Anonymous upload → instant risk score → email gate → dashboard
*   **Multi-Persona AI Analysis**: IP (copyright), Safety (brand), Provenance (C2PA) scored independently
*   **Scan Dashboard**: Canonical product surface at `/dashboard/scans-reports`
*   **Mitigation Reports**: AI-generated remediation plans ($29 one-time or subscription credits)
*   **Brand Guidelines**: Custom rules applied to scan analysis
*   **Video Analysis**: Frame extraction + per-frame scoring (paid plans)
*   **Multi-Tenant**: Hierarchical tenancy with RLS isolation
*   **5-Tier Pricing**: Free / Pro ($49) / Team ($199) / Agency ($499) / Enterprise

## 🚀 Getting Started

### Prerequisites
*   Node.js 18+
*   Supabase Project
*   Google AI Studio Key
*   Stripe Account

### Installation
1.  **Clone & Install**:
    ```bash
    npm install
    ```
2.  **Environment Setup**:
    ```bash
    cp .env.local.example .env.local
    # Populate all keys (see .env.local.example for descriptions)
    ```
3.  **Run Development**:
    ```bash
    npm run dev
    ```

## 🔐 Security & Privacy

*   **Row-Level Security**: All database access scoped by tenant ID or session ID
*   **Anonymous Session Isolation**: Uploads session-locked, email gate for full access
*   **Rate Limiting**: IP and tenant-based limits on all sensitive endpoints
*   **Lazy SDK Init**: External SDKs initialize at request time (not build time)
*   **No PII in Logs**: Email addresses, user IDs scrubbed from server logs

## 🔮 Future Hardening

The following are planned but not yet implemented:

1.  **Server-side file sniffing on upload** — magic-byte validation to prevent MIME type spoofing
2.  **Cloudflare Turnstile** on anonymous upload, email capture, login, and password reset endpoints
3.  **Brand guideline encryption at rest** — AES-256 (schema ready, encryption not yet wired)

---
*Built with Agentic AI*
