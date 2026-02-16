import { Resend } from 'resend'

import { SampleReportEmail } from '@/components/email/SampleReportEmail'
import { getRiskTier } from '@/lib/risk/tiers'

const resend = new Resend(process.env.RESEND_API_KEY)

// Helper to determine risk label (single source of truth)
function getRiskLabel(score: number): string {
    return getRiskTier(score).verdict
}

export async function sendSampleReportEmail(
    email: string,
    scanId: string,
    score: number,
    findingsCount: number,
    magicLink: string,
    topFinding?: { title: string; severity: string }
) {
    // Graceful fallback for dev if no key
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping email send.')
        console.log(`[EMAIL MOCK] To: ${email}, Subject: Risk Report ${score}, Scan: ${scanId}, Top: ${topFinding?.title}`)
        return { success: true, mocked: true }
    }

    const riskLevel = getRiskLabel(score)

    try {
        // In dev, Resend only allows sending to your own email unless domain is verified.
        // We assume the user has set this up or is testing with their own email.
        const fromAddress = process.env.EMAIL_FROM || 'reports@airiskshield.com'

        const data = await resend.emails.send({
            from: `AI Risk Shield <${fromAddress}>`,
            to: email,
            subject: `🔒 Forensic Analysis Complete • Risk Score: ${score}`,
            react: SampleReportEmail({ scanId, score, riskLevel, findingsCount, magicLink, topFinding }) as any,
        })

        return { success: true, data }
    } catch (error) {
        console.error('Failed to send email:', error)
        // We return successful false but don't throw to avoid crashing the route
        return { success: false, error }
    }
}

export async function sendMagicLinkEmail(email: string, magicLink: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping email send.')
        console.log(`[EMAIL MOCK] To: ${email}, Subject: Magic Link, Link: ${magicLink}`)
        return { success: true, mocked: true }
    }

    try {
        const fromAddress = process.env.EMAIL_FROM || 'reports@airiskshield.com'
        const data = await resend.emails.send({
            from: `AI Risk Shield <${fromAddress}>`,
            to: email,
            subject: 'Access your AI Risk Shield Report',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1>Thank you for your purchase</h1>
                    <p>Your forensic analysis report is ready.</p>
                    <p>
                        <a href="${magicLink}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                            Access Dashboard
                        </a>
                    </p>
                    <p style="color: #666; font-size: 14px;">Or copy this link: ${magicLink}</p>
                </div>
            `
        })
        return { success: true, data }
    } catch (error) {
        console.error('Failed to send magic link email:', error)
        return { success: false, error }
    }
}
