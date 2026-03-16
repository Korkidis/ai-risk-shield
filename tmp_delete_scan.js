const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const scanId = 'd9d96f66-7c17-4f98-9dc4-d706af2b0ea4';
  
  const { data: scan, error: fetchErr } = await supabase
    .from('scans')
    .select('asset_id')
    .eq('id', scanId)
    .single();
    
  if (fetchErr) {
    console.error("Fetch err:", fetchErr);
  }

  const { error: delScanErr } = await supabase.from('scans').delete().eq('id', scanId);
  console.log("Deleted scan:", delScanErr ? delScanErr.message : "Success");

  if (scan && scan.asset_id) {
    const { error: delAssetErr } = await supabase.from('assets').delete().eq('id', scan.asset_id);
    console.log("Deleted asset:", delAssetErr ? delAssetErr.message : "Success");
  } else {
    console.log("No asset_id found or scan didn't exist");
  }
}

main();
