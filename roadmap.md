# Product Roadmap

## Status Overview
*   **Current Phase:** Phase 2 (Production Core)
*   **Focus:** SOC 2 Compliance, Freemium Flow, Billing Integration
*   **Next Milestone:** Deep Mitigation & Insurance Upsells

## Phase 1: Foundation & Security (COMPLETED)
*   [x] **Core Infrastructure**
    *   Next.js 14 App Router setup
    *   Supabase (Auth, Postgres, Storage)
    *   Tailwind CSS "Forensic" Design System
*   [x] **Security Hardening (SOC 2 Prep)**
    *   Row Level Security (RLS) on all tables
    *   Secure Storage Policies
    *   Audit Logging Architecture
*   [x] **Multi-Tenancy**
    *   Hierarchical Tenants (Agencies -> Clients)
    *   Tenant Switching API
    *   Role-Based Availability

## Phase 2: Production Core (CURRENT)
*   **Goal:** 0-1000 Users, Frictionless "Time to Value"
*   [ ] **Anonymous Scan Flow**
    *   [x] Drag-and-drop Upload
    *   [x] Session-based (cookie) tracking
    *   [ ] Real-time Gemini Analysis Display
*   [ ] **The "Gate" & Report**
    *   [x] Teaser Results (Blurred)
    *   [ ] Email Capture (Magic Link)
    *   [ ] PDF Report Generation
*   [ ] **Monetization (Stripe)**
    *   [x] Subscription Models (Free/Pro/Team)
    *   [x] Metered Billing (Overages)
    *   [ ] One-time Report Purchase Flow
*   [ ] **Brand Guidelines**
    *   [x] Schema & Storage
    *   [ ] Upload/Management UI

## ⚠ Architectural Tripwires (Async Pipeline Trigger)
**Condition: Immediate Refactor Required if ANY are met:**
1.  **Latency**: Average processing > 15s (hitting serverless limits).
2.  **Concurrency**: > 50 simultaneous scans (database connection pool exhaustion).
3.  **Volume**: Bulk uploads enabled (Phase 3).
*   **Action**: Move `POST /api/analyze` to Async Job Queue (Supabase Edge + PgQueues).

## Phase 3: Enterprise & Scale (NEXT)
*   **Goal:** High-Ticket B2B & Automated Compliance
*   [ ] **Deep Mitigation**
    *   AI-generated remediation steps
    *   "Fix it for me" prompts
*   [ ] **Insurance Integration**
    *   Partner API connection
    *   Quote generation based on Risk Score
*   [ ] **API Access**
    *   Public REST API for CMS/DAM integrations
    *   Rate limiting & Developer Keys
*   [ ] **Bulk Operations**
    *   Batch Upload & Scan
    *   CSV Export

## Phase 4: Market Expansion (FUTURE)
*   [ ] White-label Reports for Agencies
*   [ ] Enterprise SSO (SAML/OIDC)
*   [ ] Regional Data Residency (EU/US)
