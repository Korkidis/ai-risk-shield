-- Create table for tracking anonymous IP usage (hashed)
CREATE TABLE IF NOT EXISTS ips (
  ip_hash TEXT PRIMARY KEY,
  scan_timestamps TIMESTAMPTZ[] DEFAULT ARRAY[]::TIMESTAMPTZ[],
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Secure it: Only service_role can access (backend logic only)
ALTER TABLE ips ENABLE ROW LEVEL SECURITY;

-- Comment
COMMENT ON TABLE ips IS 'Tracks anonymous scan timestamps by hashed IP address for rolling window throttling';
