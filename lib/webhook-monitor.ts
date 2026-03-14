import { createServiceRoleClient } from './supabase/server'

type WebhookSeverity = 'info' | 'warning' | 'error' | 'critical'

/**
 * Log webhook events to audit_log for observability.
 * Uses service role since webhooks don't have user context.
 */
export async function logWebhookEvent(params: {
    action: string
    resourceType: string
    resourceId?: string | null
    tenantId?: string | null
    severity: WebhookSeverity
    metadata?: Record<string, unknown>
}) {
    try {
        const supabase = await createServiceRoleClient()
        await supabase.from('audit_log').insert({
            tenant_id: params.tenantId || null,
            user_id: null, // Webhooks have no user context
            action: params.action,
            resource_type: params.resourceType,
            resource_id: params.resourceId || null,
            metadata: {
                severity: params.severity,
                timestamp: new Date().toISOString(),
                ...params.metadata,
            },
        })
    } catch (err) {
        // Last resort — if audit logging itself fails, console is all we have
        console.error('[WebhookMonitor] Failed to write audit log:', err)
    }
}

/**
 * Send alert email for critical webhook failures.
 * Only for errors that lose revenue (payment processing, usage reporting).
 * Silently no-ops if WEBHOOK_ALERT_EMAIL is not configured.
 */
export async function alertWebhookFailure(params: {
    eventType: string
    errorMessage: string
    tenantId?: string
    eventId?: string
}) {
    const alertEmail = process.env.WEBHOOK_ALERT_EMAIL
    if (!alertEmail) return // Silently skip if not configured

    try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        const fromAddress = process.env.EMAIL_FROM || 'reports@airiskshield.com'

        await resend.emails.send({
            from: `AI Content Risk Score Alerts <${fromAddress}>`,
            to: alertEmail,
            subject: `[WEBHOOK ALERT] ${params.eventType} failed`,
            html: `
                <h2>Webhook Processing Failure</h2>
                <p><strong>Event:</strong> ${params.eventType}</p>
                <p><strong>Event ID:</strong> ${params.eventId || 'N/A'}</p>
                <p><strong>Tenant:</strong> ${params.tenantId || 'N/A'}</p>
                <p><strong>Error:</strong> ${params.errorMessage}</p>
                <p><strong>Time:</strong> ${new Date().toISOString()}</p>
                <hr />
                <p style="color: #666; font-size: 12px;">This is an automated alert from AI Content Risk Score webhook monitoring.</p>
            `,
        })
    } catch (err) {
        console.error('[WebhookMonitor] Failed to send alert email:', err)
    }
}
