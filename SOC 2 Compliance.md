# SOC 2 Compliance Guide

## Core Principles (Trust Services Criteria)

### 1. Security
*   **Access Control**: All access must be authenticated and authorized.
    *   **RLS (Row Level Security)**: Every table MUST have RLS enabled.
    *   **Policy Granularity**: Policies must explicitly define access for `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
    *   **Tenant Isolation**: Data MUST be isolated by `tenant_id`. No cross-tenant leakage.
*   **Encryption**:
    *   **At Rest**: All sensitive data (PII, credentials) must be encrypted.
    *   **In Transit**: All API communication must use HTTPS/TLS.

### 2. Availability
*   **Backups**: Automated daily backups required.
*   **Disaster Recovery**: Plan for restoring services in case of failure.

### 3. Processing Integrity
*   **Validation**: Start-to-finish validation of all data inputs.
*   **Completeness**: Audit trails for all critical actions (scans, deletions, permission changes).

### 4. Confidentiality
*   **Data Classification**: Tag sensitive data.
*   **Least Privilege**: Agents and users only access what they need.

### 5. Privacy
*   **Consent**: Users must consent to data collection (Terms of Service).
*   **Retention**: Data must be deleted upon request (Right to be Forgotten).

## Implementation Checklist

### Database
- [ ] RLS enabled on all tables
- [ ] `tenant_id` present on all multi-tenant tables
- [ ] Audit logs table tracking mutations
- [ ] Encryption keys managed securely

### API & Backend
- [ ] Authentication required for all private routes
- [ ] Input validation (Zod) for all API endpoints
- [ ] Rate limiting to prevent DoS

### Frontend
- [ ] No sensitive data logged to console
- [ ] Secure session management (HttpOnly cookies)
- [ ] Clear privacy notices

## Development Rules
1.  **Stop and Think**: Before merging, ask "Does this violate SOC 2?"
2.  **Audit First**: If an action changes state, log it.
3.  **No Hardcoded Secrets**: Use environment variables for all keys.
