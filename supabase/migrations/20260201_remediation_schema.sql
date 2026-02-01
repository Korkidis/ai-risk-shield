-- Remediation Schema Setup
BEGIN;

CREATE SCHEMA IF NOT EXISTS remediation;

CREATE TABLE IF NOT EXISTS remediation.policy_backups (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    taken_at timestamptz DEFAULT now(),
    schema_name text,
    table_name text,
    policy_name text,
    policy_def text
);

CREATE TABLE IF NOT EXISTS remediation.index_backups (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    taken_at timestamptz DEFAULT now(),
    schemaname text,
    tablename text,
    indexname text,
    indexdef text
);

COMMIT;
