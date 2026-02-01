'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ScanWithRelations } from '@/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

const supabase = createClient()

interface UseRealtimeScansOptions {
    scans: ScanWithRelations[]
    onScanUpdate: (updatedScan: Partial<ScanWithRelations> & { id: string }) => void
    enabled?: boolean
}

/**
 * Hook to subscribe to realtime updates on processing scans
 * 
 * Instead of polling, this uses Supabase Realtime to listen for
 * status changes on scans that are currently processing.
 * 
 * Usage:
 * ```tsx
 * useRealtimeScans({
 *   scans,
 *   onScanUpdate: (updated) => {
 *     setScans(prev => prev.map(s => s.id === updated.id ? { ...s, ...updated } : s))
 *   }
 * })
 * ```
 */
export function useRealtimeScans({
    scans,
    onScanUpdate,
    enabled = true
}: UseRealtimeScansOptions) {
    const channelRef = useRef<RealtimeChannel | null>(null)

    // Check if any scans are currently processing
    const processingIds = scans
        .filter(s => s.status === 'pending' || s.status === 'processing')
        .map(s => s.id)

    const hasProcessingScans = processingIds.length > 0

    // Stable callback ref
    const onUpdateRef = useRef(onScanUpdate)
    onUpdateRef.current = onScanUpdate

    useEffect(() => {
        // Cleanup helper
        const cleanup = () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current)
                channelRef.current = null
            }
        }

        // Don't subscribe if disabled or no processing scans
        if (!enabled || !hasProcessingScans) {
            cleanup()
            return
        }

        // Create channel for scan updates
        // We listen to ALL updates on scans table and filter client-side
        // because the processing IDs change frequently
        const channel = supabase
            .channel('scans-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'scans'
                },
                (payload) => {
                    const newRecord = payload.new as any
                    const oldRecord = payload.old as any

                    // Only process if this was a scan we were watching
                    if (!processingIds.includes(newRecord?.id)) {
                        return
                    }

                    // Check for status transition
                    const oldStatus = oldRecord?.status
                    const newStatus = newRecord?.status

                    console.log(`[Realtime] Scan ${newRecord.id} status: ${oldStatus} -> ${newStatus}`)

                    // Update the scan in state with flat fields only
                    // The existing risk_profile will be preserved from initial load
                    onUpdateRef.current({
                        id: newRecord.id,
                        status: newStatus === 'complete' ? 'completed' : newStatus,
                        composite_score: newRecord.composite_score,
                        ip_risk_score: newRecord.ip_risk_score,
                        safety_risk_score: newRecord.safety_risk_score,
                        provenance_risk_score: newRecord.provenance_risk_score,
                        risk_level: newRecord.risk_level,
                        updated_at: newRecord.updated_at,
                    })
                }
            )
            .subscribe((status) => {
                console.log('[Realtime] Channel status:', status)
            })

        channelRef.current = channel

        // Cleanup on unmount or when processing scans change
        return cleanup

        // We intentionally only re-subscribe when hasProcessingScans changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, hasProcessingScans])

    return {
        isSubscribed: !!channelRef.current,
        processingCount: processingIds.length
    }
}
