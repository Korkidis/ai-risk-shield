'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
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
    const scanChannelsRef = useRef<Record<string, RealtimeChannel>>({})
    const [ephemeralState, setEphemeralState] = useState<Record<string, { progress: number, message: string }>>({})

    // Explicitly track subscription state for the global channel
    const [isSubscribed, setIsSubscribed] = useState(false)

    // Use stable primitive key to memoize the array, avoiding effect churn on every render
    const processingIdsKey = scans
        .filter(s => s.status === 'pending' || s.status === 'processing')
        .map(s => s.id)
        .sort()
        .join(',')

    const processingIds = useMemo(() => processingIdsKey ? processingIdsKey.split(',') : [], [processingIdsKey])

    const hasProcessingScans = processingIds.length > 0

    // Stable callback ref
    const onUpdateRef = useRef(onScanUpdate)
    useEffect(() => {
        onUpdateRef.current = onScanUpdate
    }, [onScanUpdate])

    // 1. Global Table Subscription
    useEffect(() => {
        const cleanup = () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current)
                channelRef.current = null
                setIsSubscribed(false)
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
                    type RealtimeScanPayload = {
                        id: string; status: string; composite_score: number | null;
                        ip_risk_score: number | null; safety_risk_score: number | null;
                        provenance_risk_score: number | null; risk_level: string | null;
                        updated_at: string | null;
                    }
                    const newRecord = payload.new as RealtimeScanPayload

                    if (!processingIds.includes(newRecord?.id)) return

                    const newStatus = newRecord?.status

                    if (newStatus === 'complete' || newStatus === 'failed') {
                        setEphemeralState(prev => {
                            const next = { ...prev }
                            delete next[newRecord.id]
                            return next
                        })
                    }

                    onUpdateRef.current({
                        id: newRecord.id,
                        status: newStatus as ScanWithRelations['status'],
                        composite_score: newRecord.composite_score ?? undefined,
                        ip_risk_score: newRecord.ip_risk_score ?? undefined,
                        safety_risk_score: newRecord.safety_risk_score ?? undefined,
                        provenance_risk_score: newRecord.provenance_risk_score ?? undefined,
                        risk_level: (newRecord.risk_level ?? undefined) as ScanWithRelations['risk_level'],
                        updated_at: newRecord.updated_at ?? undefined,
                    })
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    setIsSubscribed(true)
                }
            })

        channelRef.current = channel
        return cleanup
    }, [enabled, hasProcessingScans, processingIdsKey, processingIds])

    // 2. Individual Broadcast Subscriptions
    useEffect(() => {
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

        Object.keys(scanChannelsRef.current).forEach(id => {
            if (!processingIds.includes(id)) {
                supabase.removeChannel(scanChannelsRef.current[id])
                delete scanChannelsRef.current[id]

                setEphemeralState(prev => {
                    const next = { ...prev }
                    delete next[id]
                    return next
                })
            }
        })

        return () => {
            Object.values(scanChannelsRef.current).forEach(ch => supabase.removeChannel(ch))
            scanChannelsRef.current = {}
        }
    }, [processingIdsKey, processingIds])

    return {
        isSubscribed,
        processingCount: processingIds.length,
        ephemeralState,
    }
}
