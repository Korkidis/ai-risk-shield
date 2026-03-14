import { Resend } from 'resend'

import { SampleReportEmail } from '@/components/email/SampleReportEmail'
import { PurchaseReceiptEmail } from '@/components/email/PurchaseReceiptEmail'
import { MagicLinkEmail } from '@/components/email/MagicLinkEmail'
import { getRiskTier } from '@/lib/risk/tiers'

const resend = new Resend(process.env.RESEND_API_KEY)

// Helper to determine risk label (single source of truth)
function getRiskLabel(score: number): string {
    return getRiskTier(score).verdict
}

/**
 * Retry helper with exponential backoff.
 * Wraps email sends to handle transient Resend API failures.
 * Silent email failure means user pays $29 and never gets receipt or magic link.
 *
 * Note: Resend SDK returns { data, error } on API failures instead of throwing.
 * This wrapper checks both thrown exceptions AND Resend error responses.
 */
async function withRetry<T extends { data: unknown; error: unknown }>(
    fn: () => Promise<T>,
    maxAttempts = 3
): Promise<T> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const result = await fn()
            // Resend returns { data, error } — check for error response
            if (result.error) {
                if (attempt === maxAttempts) return result // Return the error on final attempt
                await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500))
                continue
            }
            return result
        } catch (error) {
            if (attempt === maxAttempts) throw error
            await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500))
        }
    }
    throw new Error('Unreachable')
}

export async function sendSampleReportEmail(
    email: string,
    scanId: string,
    score: number,
    findingsCount: number,
    magicLink: string,
    topFinding?: { title: string; severity: string },
    pdfBuffer?: Buffer
) {
    // Graceful fallback for dev if no key
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping email send.')
        console.log(`[EMAIL MOCK] To: [redacted], Subject: Risk Report ${score}, Scan: ${scanId}, Top: ${topFinding?.title}`)
        return { success: true, mocked: true }
    }

    const riskLevel = getRiskLabel(score)

    try {
        // In dev, Resend only allows sending to your own email unless domain is verified.
        // We assume the user has set this up or is testing with their own email.
        const fromAddress = process.env.EMAIL_FROM || 'reports@airiskshield.com'

        const attachments = pdfBuffer ? [{
            filename: `Sample_Report_${scanId.slice(0, 8)}.pdf`,
            content: pdfBuffer
        }] : []

        const result = await withRetry(() => resend.emails.send({
            from: `AI Content Risk Score <${fromAddress}>`,
            to: email,
            subject: `🔒 Forensic Analysis Complete • Risk Score: ${score}`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- React Email component return type incompatible with Resend's react prop
            react: SampleReportEmail({ scanId, score, riskLevel, findingsCount, magicLink, topFinding }) as any,
            attachments
        }))

        if (result.error) {
            console.error('Resend API error after retries:', result.error)
            return { success: false, error: result.error }
        }

        return { success: true, data: result.data }
    } catch (error) {
        console.error('Failed to send email after 3 attempts:', error)
        // We return successful false but don't throw to avoid crashing the route
        return { success: false, error }
    }
}

export async function sendMagicLinkEmail(
    email: string,
    magicLink: string,
    scanId?: string,
    score?: number,
    findingsCount?: number
) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping email send.')
        console.log(`[EMAIL MOCK] To: [redacted], Subject: Magic Link`)
        return { success: true, mocked: true }
    }

    try {
        const fromAddress = process.env.EMAIL_FROM || 'reports@airiskshield.com'
        const riskLevel = score != null ? getRiskLabel(score) : 'N/A'

        const result = await withRetry(() => resend.emails.send({
            from: `AI Content Risk Score <${fromAddress}>`,
            to: email,
            subject: 'Access your AI Content Risk Score Report',
            react: MagicLinkEmail({
                scanId: scanId || 'unknown',
                score: score ?? 0,
                riskLevel,
                findingsCount: findingsCount ?? 0,
                magicLink
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- React Email component return type incompatible with Resend's react prop
            }) as any,
        }))

        if (result.error) {
            console.error('Resend API error after retries:', result.error)
            return { success: false, error: result.error }
        }

        return { success: true, data: result.data }
    } catch (error) {
        console.error('Failed to send magic link email after 3 attempts:', error)
        return { success: false, error }
    }
}

export async function sendPurchaseReceiptEmail(
    email: string,
    scanId: string,
    score: number,
    filename: string,
    dashboardUrl: string,
    transactionId?: string
) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping receipt email send.')
        console.log(`[EMAIL MOCK] Receipt to: [redacted], Scan: ${scanId}, Score: ${score}`)
        return { success: true, mocked: true }
    }

    try {
        const fromAddress = process.env.EMAIL_FROM || 'reports@airiskshield.com'

        const result = await withRetry(() => resend.emails.send({
            from: `AI Content Risk Score <${fromAddress}>`,
            to: email,
            subject: `Receipt: Full Forensic Report — ${filename}`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- React Email component return type incompatible with Resend's react prop
            react: PurchaseReceiptEmail({ scanId, score, filename, dashboardUrl, transactionId }) as any,
        }))

        if (result.error) {
            console.error('Resend API error after retries:', result.error)
            return { success: false, error: result.error }
        }

        return { success: true, data: result.data }
    } catch (error) {
        console.error('Failed to send purchase receipt email after 3 attempts:', error)
        return { success: false, error }
    }
}
