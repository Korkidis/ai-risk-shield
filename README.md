# AI Risk Shield

Complete AI Content Validation Platform - Validate AI-generated images and videos for copyright risk, brand safety, and content provenance.

## Tech Stack

- **Frontend:** Next.js 14 (App Router, TypeScript, Tailwind CSS)
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI Analysis:** Google Gemini 2.5 Flash
- **Provenance:** C2PA Node
- **Payments:** Stripe
- **Email:** Resend
- **Video Processing:** FFmpeg
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account
- Google Gemini API key
- Stripe account
- Resend account

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.local.example .env.local
```

3. Fill in your environment variables in `.env.local`:
   - Supabase: Get from https://supabase.com/dashboard/project/_/settings/api
   - Gemini: Get from https://aistudio.google.com/app/apikey
   - Stripe: Get from https://dashboard.stripe.com/apikeys
   - Resend: Get from https://resend.com/api-keys

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
ai-risk-shield/
├── app/                    # Next.js App Router pages
├── components/             # React components
├── lib/                    # Utility functions and integrations
├── public/                 # Static assets
├── .claude/               # Claude Code documentation
└── ...config files
```

## Security

- All API keys stored in environment variables (never committed)
- Row Level Security (RLS) enabled on all database tables
- Multi-tenant isolation enforced at database level
- Input validation and sanitization on all user inputs
- HTTPS enforced in production

## License

Proprietary - All rights reserved

---

Built with Claude Code
