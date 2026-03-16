const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: scans, error } = await supabase
    .from('scans')
    .select('id, status, is_video, error_message, created_at, assets(filename)')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (error) {
    console.error("Error fetching scans:", error);
  } else {
    console.log("Recent Scans:");
    console.log(JSON.stringify(scans, null, 2));
  }
}

main();
