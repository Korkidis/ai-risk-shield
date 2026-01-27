-- Enable pg_cron if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 1. Schedule Daily Asset Purge
-- Runs at 3:00 AM every day
SELECT cron.schedule(
    'purge-old-assets-daily',
    '0 3 * * *',
    $$SELECT purge_old_assets()$$
);

-- 2. Schedule Monthly Usage Reset
-- Runs at midnight on the 1st of every month
SELECT cron.schedule(
    'reset-monthly-usage',
    '0 0 1 * *',
    $$SELECT reset_monthly_usage()$$
);

-- Note: To view scheduled jobs, run:
-- SELECT * FROM cron.job;

-- To unschedule:
-- SELECT cron.unschedule('purge-old-assets-daily');
