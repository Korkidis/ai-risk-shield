
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * Broadcast scan progress to listeners
 * Uses Supabase Realtime 'broadcast' channel
 */
export async function broadcastScanProgress(scanId: string, progress: number, message: string) {
    try {
        const supabase = await createServiceRoleClient()

        const channel = supabase.channel(`scan-${scanId}`)

        await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Broadcast timeout'))
            }, 5000)

            channel.subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.send({
                        type: 'broadcast',
                        event: 'progress',
                        payload: { scanId, progress, message, timestamp: Date.now() },
                    })
                    clearTimeout(timeout)
                    resolve()
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    clearTimeout(timeout)
                    reject(new Error(`Channel status: ${status}`))
                }
            })
        })

        await supabase.removeChannel(channel)

    } catch (err) {
        console.error('Failed to broadcast progress:', err)
        // Non-blocking failure - scan must continue
    }
}
