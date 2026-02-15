import { createClient } from "npm:@supabase/supabase-js@2.35.0";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    throw new Error('Missing environment variables');
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
});

// Config
const CUTOFF_DAYS = 14;
const BATCH_SIZE = 100;

async function sleep(ms: number) {
    return new Promise(res => setTimeout(res, ms));
}

async function cleanup(): Promise<any> {
    const results: any = {
        scans_deleted: 0,
        findings_deleted: 0,
        assets_deleted: 0,
        storage_files_deleted: 0,
        shadow_users_deleted: 0,
        errors: []
    };

    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - CUTOFF_DAYS);
        const cutoffISO = cutoffDate.toISOString();

        console.log(`🧹 Cleaning up data older than ${CUTOFF_DAYS} days (before ${cutoffISO})`);

        // 1. Find old scans (scans reference assets, not the other way around)
        const { data: oldScans, error: scanErr } = await sb
            .from('scans')
            .select('id, asset_id')
            .lt('created_at', cutoffISO);

        if (scanErr) {
            results.errors.push(`scan_query: ${scanErr.message}`);
            throw scanErr;
        }

        const scanIds = (oldScans || []).map((r: any) => r.id);
        const assetIds = [...new Set((oldScans || []).map((r: any) => r.asset_id))];

        console.log(`Found ${scanIds.length} old scans referencing ${assetIds.length} assets`);

        // 2. Delete scan_findings first (FK constraint)
        if (scanIds.length > 0) {
            for (let i = 0; i < scanIds.length; i += BATCH_SIZE) {
                const chunk = scanIds.slice(i, i + BATCH_SIZE);
                const { error: sfErr, count } = await sb
                    .from('scan_findings')
                    .delete()
                    .in('scan_id', chunk);

                if (sfErr) {
                    results.errors.push(`scan_findings: ${sfErr.message}`);
                } else {
                    results.findings_deleted += (count || 0);
                }
                await sleep(200);
            }
            console.log(`✅ Deleted ${results.findings_deleted} scan findings`);

            // 3. Delete scans
            for (let i = 0; i < scanIds.length; i += BATCH_SIZE) {
                const chunk = scanIds.slice(i, i + BATCH_SIZE);
                const { error: delSc, count } = await sb
                    .from('scans')
                    .delete()
                    .in('id', chunk);

                if (delSc) {
                    results.errors.push(`scans: ${delSc.message}`);
                } else {
                    results.scans_deleted += (count || 0);
                }
                await sleep(200);
            }
            console.log(`✅ Deleted ${results.scans_deleted} scans`);
        }

        // 4. Delete assets and their storage files
        if (assetIds.length > 0) {
            const { data: assets, error: aErr } = await sb
                .from('assets')
                .select('id, storage_path')
                .in('id', assetIds);

            if (aErr) {
                results.errors.push(`assets_query: ${aErr.message}`);
            } else if (assets) {
                // Delete storage files first
                const storagePaths = assets
                    .map((a: any) => a.storage_path)
                    .filter(Boolean);

                if (storagePaths.length > 0) {
                    const { data: removed, error: storageErr } = await sb.storage
                        .from('uploads')  // Correct bucket name
                        .remove(storagePaths);

                    if (storageErr) {
                        results.errors.push(`storage: ${storageErr.message}`);
                    } else {
                        results.storage_files_deleted = removed?.length || 0;
                        console.log(`✅ Deleted ${results.storage_files_deleted} storage files`);
                    }
                }

                // Delete asset records
                for (let i = 0; i < assetIds.length; i += BATCH_SIZE) {
                    const chunk = assetIds.slice(i, i + BATCH_SIZE);
                    const { error: delAsset, count } = await sb
                        .from('assets')
                        .delete()
                        .in('id', chunk);

                    if (delAsset) {
                        results.errors.push(`assets_delete: ${delAsset.message}`);
                    } else {
                        results.assets_deleted += (count || 0);
                    }
                    await sleep(200);
                }
                console.log(`✅ Deleted ${results.assets_deleted} assets`);
            }
        }

        // 5. Cleanup Shadow Users (via RPC)
        const { data: shadowDeleted, error: shadowErr } = await sb.rpc('cleanup_stale_shadow_users', { days_old: CUTOFF_DAYS });
        if (shadowErr) {
            results.errors.push(`shadow_users: ${shadowErr.message}`);
        } else {
            results.shadow_users_deleted = shadowDeleted || 0;
            console.log(`✅ Deleted ${results.shadow_users_deleted} shadow users`);
        }

        console.log('📊 Cleanup Summary:', results);
    } catch (err) {
        results.errors.push(String(err));
        console.error('❌ Cleanup failed:', err);
    }

    return results;
}

Deno.serve(async (req: Request) => {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const res = await cleanup();
        return new Response(JSON.stringify(res, null, 2), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(
            JSON.stringify({ error: String(e) }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});
