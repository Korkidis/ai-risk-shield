-- Prevent duplicate pending invites for the same email within a tenant.
-- Partial unique index: only applies to non-accepted invites.
-- This allows re-inviting someone after their previous invite was accepted or expired.

CREATE UNIQUE INDEX IF NOT EXISTS idx_tenant_invites_unique_pending
    ON tenant_invites (tenant_id, lower(email))
    WHERE accepted_at IS NULL;
