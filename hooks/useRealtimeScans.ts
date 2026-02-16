'use client'

import { useEffect, useRef, useState } from 'react'
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
 * const { isSubscribed, ephemeralState } = useRealtimeScans({
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
    // Keep track of individual scan channels
    const scanChannelsRef = useRef<Record<string, RealtimeChannel>>({})

    // Store ephemeral state (progress/message) for processing scans
    const [ephemeralState, setEphemeralState] = useState<Record<string, { progress: number, message: string }>>({})

    // Check if any scans are currently processing
    const processingIds = scans
        .filter(s => s.status === 'pending' || s.status === 'processing')
        .map(s => s.id)

    const hasProcessingScans = processingIds.length > 0

    // Stable callback ref
    const onUpdateRef = useRef(onScanUpdate)
    onUpdateRef.current = onScanUpdate

    // 1. Global Table Subscription (Status & Scores)
    useEffect(() => {
        const cleanup = () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current)
                channelRef.current = null
            }
        }

        if (!enabled || !hasProcessingScans) {
            cleanup()
            return
        }

        const channel = supabase
            .channel('scans-realtime-global')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'scans'
                },
                (payload) => {
                    const newRecord = payload.new as any

                    // Only process currently tracked scans
                    if (!processingIds.includes(newRecord?.id)) return

                    const newStatus = newRecord?.status

                    // If complete, clear ephemeral state for this ID
                    if (newStatus === 'complete' || newStatus === 'failed') {
                        setEphemeralState(prev => {
                            const next = { ...prev }
                            delete next[newRecord.id]
                            return next
                        })
                    }

                    onUpdateRef.current({
                        id: newRecord.id,
                        status: newStatus,
                        composite_score: newRecord.composite_score,
                        ip_risk_score: newRecord.ip_risk_score,
                        safety_risk_score: newRecord.safety_risk_score,
                        provenance_risk_score: newRecord.provenance_risk_score,
                        risk_level: newRecord.risk_level,
                        updated_at: newRecord.updated_at,
                    })
                }
            )
            .subscribe()

        channelRef.current = channel
        return cleanup
    }, [enabled, hasProcessingScans, processingIds.join(',')])

    // 2. Individual Broadcast Subscriptions (Ephemeral Progress)
    useEffect(() => {
        // Subscribe to new IDs
        processingIds.forEach(id => {
            if (!scanChannelsRef.current[id]) {
                const channel = supabase.channel(`scan-${id}`)
                    .on('broadcast', { event: 'progress' }, (payload) => {
                        if (payload.payload) {
                            setEphemeralState(prev => ({
                                ...prev,
                                [id]: {
                                    progress: payload.payload.progress || 0,
                                    message: payload.payload.message || 'Processing...'
                                }
                            }))
                        }
                    })
                    .subscribe()

                scanChannelsRef.current[id] = channel
            }
        })

        // Cleanup stale IDs
        Object.keys(scanChannelsRef.current).forEach(id => {
            if (!processingIds.includes(id)) {
                supabase.removeChannel(scanChannelsRef.current[id])
                delete scanChannelsRef.current[id]

                // Also clear state
                setEphemeralState(prev => {
                    const next = { ...prev }
                    delete next[id]
                    return next
                })
            }
        })

        return () => {
            // Cleanup all on unmount
            Object.values(scanChannelsRef.current).forEach(ch => supabase.removeChannel(ch))
            scanChannelsRef.current = {}
        }
    }, [processingIds.join(',')])

    return {
        isSubscribed: !!channelRef.current,
        processingCount: processingIds.length,
        ephemeralState,
    }
}
