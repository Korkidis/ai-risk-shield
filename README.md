# AI Risk Shield
**The Forensic Instrument for AI Content Validation**

AI Risk Shield is a specialized platform for analyzing visual assets (images/video) to detect copyright infringement risk (IP), brand safety violations, and provenance authenticity (C2PA).

---

## 📚 Documentation Architecture (The "Brain")
This project is driven by a set of "Hyper-Critical" documents that serve as the source of truth.

| Document | Purpose |
| :--- | :--- |
| **[NORTH_STAR.md](NORTH_STAR.md)** | **Strategic Vision**. The "Why". Business goals, target audience, and emotional resonance. |
| **[FUNCTIONAL_PRD.md](FUNCTIONAL_PRD.md)** | **Execution Blueprint**. The "What". Detailed feature specs, user flows, and technical constraints. |
| **[GEMINI_C2PA_STANDARDS.md](GEMINI_C2PA_STANDARDS.md)** | **Forensic Logic**. The "How". Detailed AI scoring rules, prompts, and C2PA verification logic. |
| **[DATABASE_BACKEND.md](DATABASE_BACKEND.md)** | **Infrastructure Truth**. Schema audit, storage policies, and backend architecture. |
| **[DESIGN_CONTEXT.md](DESIGN_CONTEXT.md)** | **Visual System**. Design tokens, "Forensic Instrument" aesthetic, and component rules. |

---

## 🛠 Tech Stack

*   **Frontend**: Next.js 14 (App Router), Tailwind CSS
*   **Database**: Supabase (PostgreSQL, RLS, Storage, **Hierarchical Tenancy**)
*   **AI Engine**: Google Gemini 1.5 Flash (via Google AI Studio)
*   **Provenance**: C2PA Node (Content Credentials)
*   **Payments**: Stripe
*   **Email**: Resend

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
    # Populate keys: NEXT_PUBLIC_SUPABASE_URL, GEMINI_API_KEY, STRIPE_SECRET_KEY, etc.
    ```
3.  **Run Development**:
    ```bash
    npm run dev
    ```

## 🔐 Security & Privacy
*   **No Persistent User Data without Consent**: Anonymous uploads are session-locked.
*   **Ephemeral Processing**: Video assets are temporarily passed to Google Cloud for analysis and immediately deleted.
*   **RLS Everywhere**: All database access is scoped by Tenant ID or Session ID.

---
*Built with Agentic AI*
