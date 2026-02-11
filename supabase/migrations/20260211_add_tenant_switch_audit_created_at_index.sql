-- Migration: Add created_at index to tenant_switch_audit
-- Description: Live DB missing idx_tenant_switch_audit_created_at
-- NOTE: This migration must be run without a transaction (CREATE INDEX CONCURRENTLY).

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_switch_audit_created_at
  ON public.tenant_switch_audit(created_at);
