import { Resend } from 'resend'
import { SampleReportEmail } from '@/components/email/SampleReportEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

// Helper to determine risk label
function getRiskLabel(score: number): string {
    if (score > 75) return 'CRITICAL RISK'
    if (score > 50) return 'HIGH LIABILITY'
    if (score > 25) return 'MODERATE RISK'
    return 'LOW RISK'
}

export async function sendSampleReportEmail(
    email: string,
    scanId: string,
    score: number,
    findingsCount: number
) {
    // Graceful fallback for dev if no key
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping email send.')
        console.log(`[EMAIL MOCK] To: ${email}, Subject: Risk Report ${score}, Scan: ${scanId}`)
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
            subject: `Your Risk Analysis Complete: Score ${score}`,
            react: SampleReportEmail({ scanId, score, riskLevel, findingsCount }) as any,
        })

        return { success: true, data }
    } catch (error) {
        console.error('Failed to send email:', error)
        // We return successful false but don't throw to avoid crashing the route
        return { success: false, error }
    }
}
