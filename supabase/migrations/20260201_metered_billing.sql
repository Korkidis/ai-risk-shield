-- Migration: Add Stripe metered subscription item ID to tenants
-- This column stores the subscription_item_id for the metered usage price
-- Required for reporting usage to Stripe

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS stripe_metered_item_id TEXT;

COMMENT ON COLUMN tenants.stripe_metered_item_id IS 
    'Stripe subscription_item_id for metered usage billing. Set when subscription is created.';
