-- Fix for missing Primary Keys on remediation tables
-- (Run this if the table was created before the PK was added to the schema definition)

DO $$
BEGIN
    -- Fix policy_backups
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'remediation' AND table_name = 'policy_backups') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'remediation' AND table_name = 'policy_backups' AND column_name = 'id') THEN
            ALTER TABLE remediation.policy_backups ADD COLUMN id uuid DEFAULT gen_random_uuid() PRIMARY KEY;
        END IF;
    END IF;

    -- Fix index_backups
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'remediation' AND table_name = 'index_backups') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'remediation' AND table_name = 'index_backups' AND column_name = 'id') THEN
            ALTER TABLE remediation.index_backups ADD COLUMN id uuid DEFAULT gen_random_uuid() PRIMARY KEY;
        END IF;
    END IF;
END $$;
