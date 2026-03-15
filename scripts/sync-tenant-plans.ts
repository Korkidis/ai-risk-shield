import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { PLANS, PlanId } from '../lib/plans';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Fetching all tenants...');
  const { data: tenants, error } = await supabase
    .from('tenants')
    .select('id, name, plan');

  if (error) {
    console.error('Error fetching tenants:', error);
    process.exit(1);
  }

  console.log(`Found ${tenants.length} tenants. Updating limits according to lib/plans.ts...`);

  let updatedCount = 0;
  for (const tenant of tenants) {
    const planId = (tenant.plan as PlanId) || 'free';
    const planConfig = PLANS[planId] || PLANS['free'];

    const { error: updateError } = await supabase
      .from('tenants')
      .update({
        monthly_scan_limit: planConfig.monthlyScans,
        monthly_report_limit: planConfig.monthlyReports,
        monthly_mitigation_limit: planConfig.monthlyMitigations,
        seat_limit: planConfig.seats,
        brand_profile_limit: planConfig.brandProfiles,
        retention_days: planConfig.retentionDays,
        scan_overage_cost_cents: planConfig.scanOverageCents,
        report_overage_cost_cents: planConfig.reportOverageCents,
        feature_bulk_upload: planConfig.features.bulkUpload,
        feature_co_branding: planConfig.features.coBranding,
        feature_white_label: planConfig.features.whiteLabel,
        feature_team_dashboard: planConfig.features.teamDashboard,
        feature_audit_logs: planConfig.features.auditLogs,
        feature_priority_queue: planConfig.features.priorityQueue,
        feature_sso: planConfig.features.sso,
      })
      .eq('id', tenant.id);

    if (updateError) {
      console.error(`Error updating tenant ${tenant.id} (${tenant.name}):`, updateError);
    } else {
      updatedCount++;
    }
  }

  console.log(`Successfully updated ${updatedCount}/${tenants.length} tenants.`);
}

main();
