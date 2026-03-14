/**
 * Database Cleanup Utility
 * 
 * Safely removes old test data to reduce Supabase egress and storage usage.
 * Run this script periodically during development to clean up test scans.
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface CleanupStats {
    scansDeleted: number
    findingsDeleted: number
    assetsDeleted: number
    storageFilesDeleted: number
}

/**
 * Clean up old test data older than specified days
 */
async function cleanupOldData(daysOld: number = 7): Promise<CleanupStats> {
    const stats: CleanupStats = {
        scansDeleted: 0,
        findingsDeleted: 0,
        assetsDeleted: 0,
        storageFilesDeleted: 0,
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    console.log(`🧹 Cleaning up data older than ${daysOld} days (before ${cutoffDate.toISOString()})...\n`)

    try {
        // 1. Find old scans (include tenant_id for frame cleanup paths)
        const { data: oldScans, error: scanError } = await supabase
            .from('scans')
            .select('id, tenant_id, is_video')
            .lt('created_at', cutoffDate.toISOString())

        if (scanError) {
            console.error('❌ Error finding old scans:', scanError)
            throw scanError
        }

        if (oldScans && oldScans.length > 0) {
            const scanIds = oldScans.map(s => s.id)
            console.log(`📋 Found ${scanIds.length} old scans`)

            // 2a. Delete video frame storage files for video scans
            const videoScans = oldScans.filter(s => s.is_video && s.tenant_id)
            if (videoScans.length > 0) {
                let frameFilesDeleted = 0
                for (const vs of videoScans) {
                    const framePath = `${vs.tenant_id}/frames/${vs.id}`
                    try {
                        const { data: frameFiles } = await supabase.storage
                            .from('uploads')
                            .list(framePath)
                        if (frameFiles && frameFiles.length > 0) {
                            const paths = frameFiles.map(f => `${framePath}/${f.name}`)
                            await supabase.storage.from('uploads').remove(paths)
                            frameFilesDeleted += paths.length
                        }
                    } catch (err) {
                        console.warn(`⚠️  Failed to cleanup frames for scan ${vs.id}:`, err)
                    }
                }
                if (frameFilesDeleted > 0) {
                    console.log(`✅ Deleted ${frameFilesDeleted} video frame files from storage`)
                }
            }

            // 2b. Delete video_frames records (FK constraint)
            const { error: vfError, count: vfCount } = await supabase
                .from('video_frames')
                .delete()
                .in('scan_id', scanIds)

            if (vfError) {
                console.warn('⚠️  Error deleting video_frames:', vfError)
            } else if (vfCount) {
                console.log(`✅ Deleted ${vfCount} video frame records`)
            }

            // 2c. Delete scan findings (FK constraint)
            const { error: findingsError, count: findingsCount } = await supabase
                .from('scan_findings')
                .delete()
                .in('scan_id', scanIds)

            if (findingsError) {
                console.error('❌ Error deleting findings:', findingsError)
                throw findingsError
            }

            stats.findingsDeleted = findingsCount || 0
            console.log(`✅ Deleted ${stats.findingsDeleted} scan findings`)

            // 3. Delete scans
            const { error: scansDeleteError, count: scansCount } = await supabase
                .from('scans')
                .delete()
                .in('id', scanIds)

            if (scansDeleteError) {
                console.error('❌ Error deleting scans:', scansDeleteError)
                throw scansDeleteError
            }

            stats.scansDeleted = scansCount || 0
            console.log(`✅ Deleted ${stats.scansDeleted} scans`)
        } else {
            console.log('✅ No old scans to delete')
        }

        // 4. Find and delete old assets
        const { data: oldAssets, error: assetsError } = await supabase
            .from('assets')
            .select('id, storage_path')
            .lt('created_at', cutoffDate.toISOString())

        if (assetsError) {
            console.error('❌ Error finding old assets:', assetsError)
            throw assetsError
        }

        if (oldAssets && oldAssets.length > 0) {
            console.log(`\n📁 Found ${oldAssets.length} old assets`)

            // 5. Delete from storage bucket first
            const filePaths = oldAssets.map(a => a.storage_path).filter(Boolean) as string[]

            if (filePaths.length > 0) {
                const { data: deletedFiles, error: storageError } = await supabase.storage
                    .from('uploads')
                    .remove(filePaths)

                if (storageError) {
                    console.warn('⚠️  Storage deletion error (may already be deleted):', storageError)
                } else {
                    stats.storageFilesDeleted = deletedFiles?.length || 0
                    console.log(`✅ Deleted ${stats.storageFilesDeleted} files from storage`)
                }
            }

            // 6. Delete asset records
            const assetIds = oldAssets.map(a => a.id)
            const { error: assetDeleteError, count: assetsCount } = await supabase
                .from('assets')
                .delete()
                .in('id', assetIds)

            if (assetDeleteError) {
                console.error('❌ Error deleting assets:', assetDeleteError)
                throw assetDeleteError
            }

            stats.assetsDeleted = assetsCount || 0
            console.log(`✅ Deleted ${stats.assetsDeleted} asset records`)
        } else {
            console.log('✅ No old assets to delete')
        }

        console.log('\n📊 Cleanup Summary:')
        console.log('─'.repeat(40))
        console.log(`  Scans deleted:         ${stats.scansDeleted}`)
        console.log(`  Findings deleted:      ${stats.findingsDeleted}`)
        console.log(`  Assets deleted:        ${stats.assetsDeleted}`)
        console.log(`  Storage files deleted: ${stats.storageFilesDeleted}`)
        console.log('─'.repeat(40))

        // Log audit trail for compliance
        try {
            await supabase.from('audit_log').insert({
                action: 'cleanup_old_data',
                resource_type: 'maintenance',
                metadata: {
                    days_old: daysOld,
                    cutoff_date: cutoffDate.toISOString(),
                    stats: {
                        scans_deleted: stats.scansDeleted,
                        findings_deleted: stats.findingsDeleted,
                        assets_deleted: stats.assetsDeleted,
                        storage_files_deleted: stats.storageFilesDeleted,
                    },
                },
            })
        } catch (auditError) {
            console.warn('⚠️  Failed to log audit trail:', auditError)
            // Don't fail the cleanup if audit logging fails
        }

        return stats
    } catch (error) {
        console.error('\n❌ Cleanup failed:', error)

        // Log failure to audit trail
        try {
            await supabase.from('audit_log').insert({
                action: 'cleanup_old_data_failed',
                resource_type: 'maintenance',
                metadata: {
                    days_old: daysOld,
                    error: error instanceof Error ? error.message : String(error),
                },
            })
        } catch (auditError) {
            console.warn('⚠️  Failed to log error to audit trail:', auditError)
        }

        throw error
    }
}

/**
 * Main execution
 */
async function main() {
    const args = process.argv.slice(2)
    const daysOld = args[0] ? parseInt(args[0], 10) : 7

    if (isNaN(daysOld) || daysOld < 1) {
        console.error('❌ Invalid days argument. Usage: npm run cleanup [days]')
        process.exit(1)
    }

    console.log('🛡️  AI Content Risk Score - Data Cleanup Utility\n')

    const stats = await cleanupOldData(daysOld)

    console.log('\n✅ Cleanup complete!')
}

main().catch(console.error)
