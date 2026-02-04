/**
 * Storage Management Helpers
 * 
 * Provides utilities for managing Supabase Storage files alongside database records.
 * Ensures storage files are properly cleaned up when database records are deleted.
 */

import { createClient } from '@/lib/supabase/server'

export interface DeleteAssetResult {
    success: boolean
    storageDeleted: boolean
    dbDeleted: boolean
    error?: string
}

/**
 * Delete an asset record along with its storage file
 * 
 * This helper ensures that when an asset is deleted from the database,
 * its corresponding file in Supabase Storage is also removed to prevent orphans.
 * 
 * @param assetId - UUID of the asset to delete
 * @returns Result indicating success and what was deleted
 */
export async function deleteAssetWithStorage(
    assetId: string
): Promise<DeleteAssetResult> {
    const supabase = await createClient()

    try {
        // 1. Fetch asset metadata first
        const { data: asset, error: fetchError } = await supabase
            .from('assets')
            .select('id, storage_path, storage_bucket')
            .eq('id', assetId)
            .single()

        if (fetchError) {
            return {
                success: false,
                storageDeleted: false,
                dbDeleted: false,
                error: `Failed to fetch asset: ${fetchError.message}`,
            }
        }

        if (!asset) {
            return {
                success: false,
                storageDeleted: false,
                dbDeleted: false,
                error: 'Asset not found',
            }
        }

        // Type assertion for flexible property access
        const assetData = asset as { storage_path: string; storage_bucket: string }
        let storageDeleted = false

        // 2. Delete from storage first (if path exists)
        if (assetData.storage_path) {
            const bucket = assetData.storage_bucket || 'uploads'
            const { error: storageError } = await supabase.storage
                .from(bucket)
                .remove([assetData.storage_path])

            if (storageError) {
                console.warn(
                    `⚠️  Storage deletion warning for ${assetData.storage_path}:`,
                    storageError
                )
                // Don't fail the whole operation - file might already be deleted
            } else {
                storageDeleted = true
            }
        }

        // 3. Delete database record
        const { error: dbError } = await supabase
            .from('assets')
            .delete()
            .eq('id', assetId)

        if (dbError) {
            return {
                success: false,
                storageDeleted,
                dbDeleted: false,
                error: `Failed to delete asset record: ${dbError.message}`,
            }
        }

        // 4. Log audit trail
        await supabase.from('audit_log').insert({
            action: 'delete_asset',
            resource_type: 'asset',
            resource_id: assetId,
            metadata: {
                storage_path: assetData.storage_path,
                storage_deleted: storageDeleted,
            },
        } as any)

        return {
            success: true,
            storageDeleted,
            dbDeleted: true,
        }
    } catch (error) {
        return {
            success: false,
            storageDeleted: false,
            dbDeleted: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

/**
 * Bulk delete multiple assets with their storage files
 * 
 * @param assetIds - Array of asset UUIDs to delete
 * @returns Summary of deletion results
 */
export async function bulkDeleteAssetsWithStorage(
    assetIds: string[]
): Promise<{
    totalRequested: number
    successfulDeletes: number
    failedDeletes: number
    errors: string[]
}> {
    const results = {
        totalRequested: assetIds.length,
        successfulDeletes: 0,
        failedDeletes: 0,
        errors: [] as string[],
    }

    for (const assetId of assetIds) {
        const result = await deleteAssetWithStorage(assetId)
        if (result.success) {
            results.successfulDeletes++
        } else {
            results.failedDeletes++
            if (result.error) {
                results.errors.push(`${assetId}: ${result.error}`)
            }
        }
    }

    return results
}

/**
 * Find orphaned storage files that have no corresponding database record
 * 
 * Useful for periodic audits to detect and clean up orphaned files.
 * 
 * @param bucket - Storage bucket to audit (default: 'uploads')
 * @returns Array of orphaned file paths
 */
export async function findOrphanedStorageFiles(
    bucket: string = 'uploads'
): Promise<string[]> {
    const supabase = await createClient()
    const orphans: string[] = []

    try {
        // 1. List all files in storage bucket
        const { data: files, error: listError } = await supabase.storage
            .from(bucket)
            .list()

        if (listError) {
            console.error('Error listing storage files:', listError)
            return orphans
        }

        if (!files || files.length === 0) {
            return orphans
        }

        // 2. Get all storage paths from database
        const { data: assets, error: dbError } = await supabase
            .from('assets')
            .select('storage_path')
            .eq('storage_bucket', bucket)

        if (dbError) {
            console.error('Error fetching assets:', dbError)
            return orphans
        }

        const dbPaths = new Set((assets || []).map((a: any) => a.storage_path))

        // 3. Find files not in database
        for (const file of files) {
            if (!dbPaths.has(file.name)) {
                orphans.push(file.name)
            }
        }

        return orphans
    } catch (error) {
        console.error('Error finding orphaned files:', error)
        return orphans
    }
}
