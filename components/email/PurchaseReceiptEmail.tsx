import * as React from 'react'
import { getRiskTier } from '@/lib/risk/tiers'

interface PurchaseReceiptEmailProps {
    scanId: string
    score: number
    filename: string
    dashboardUrl: string
    transactionId?: string
}

export const PurchaseReceiptEmail: React.FC<PurchaseReceiptEmailProps> = ({
    score,
    filename,
    dashboardUrl,
    transactionId,
}) => {
    const colors = {
        bg: '#EBE7E0',
        card: '#F4F4F4',
        ink: '#1A1A1A',
        orange: '#FF4F00',
        grey: '#666666',
        lightGrey: '#DDDDDD',
        safe: '#1E8E3E',
    }

    const riskTier = getRiskTier(score)
    const riskLabel = riskTier.verdict.toUpperCase()

    return (
        <div style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', backgroundColor: colors.bg, padding: '40px 20px', margin: 0 }}>
            <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: colors.card, borderRadius: '16px', border: `1px solid ${colors.lightGrey}`, overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>

                {/* Header */}
                <div style={{ backgroundColor: colors.ink, padding: '30px', textAlign: 'center' }}>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        AI Content Risk Score
                    </h1>
                    <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                        Purchase Confirmation
                    </p>
                </div>

                {/* Body */}
                <div style={{ padding: '40px' }}>

                    {/* Confirmation */}
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: colors.safe, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#FFFFFF', fontSize: '24px', lineHeight: 1 }}>&#10003;</span>
                        </div>
                        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700, color: colors.ink }}>
                            Payment Confirmed
                        </h2>
                        <p style={{ margin: 0, fontSize: '14px', color: colors.grey }}>
                            Your full forensic report is ready.
                        </p>
                    </div>

                    <hr style={{ border: 0, borderTop: `1px solid ${colors.lightGrey}`, margin: '0 0 30px 0' }} />

                    {/* Receipt Details */}
                    <div style={{ backgroundColor: '#FFFFFF', border: `1px solid ${colors.lightGrey}`, borderRadius: '8px', padding: '20px', marginBottom: '30px' }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: colors.grey, letterSpacing: '1px' }}>
                            Receipt
                        </p>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '8px 0', fontSize: '13px', color: colors.ink, borderBottom: `1px solid ${colors.lightGrey}` }}>
                                        Full Forensic Report
                                    </td>
                                    <td style={{ padding: '8px 0', fontSize: '13px', color: colors.ink, textAlign: 'right', fontWeight: 700, borderBottom: `1px solid ${colors.lightGrey}` }}>
                                        $29.00
                                    </td>
                                </tr>
                                {transactionId && (
                                    <tr>
                                        <td style={{ padding: '8px 0', fontSize: '11px', color: colors.grey, borderBottom: `1px solid ${colors.lightGrey}` }}>
                                            Transaction ID
                                        </td>
                                        <td style={{ padding: '8px 0', fontSize: '11px', color: colors.grey, textAlign: 'right', fontFamily: 'monospace', borderBottom: `1px solid ${colors.lightGrey}` }}>
                                            {transactionId.substring(0, 27)}
                                        </td>
                                    </tr>
                                )}
                                <tr>
                                    <td style={{ padding: '8px 0', fontSize: '11px', color: colors.grey }}>
                                        File: {filename}
                                    </td>
                                    <td style={{ padding: '8px 0', fontSize: '11px', color: colors.grey, textAlign: 'right' }}>
                                        Risk Score: {score} ({riskLabel})
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* What's Included */}
                    <div style={{ marginBottom: '30px' }}>
                        <p style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 700, color: colors.ink }}>
                            Your report includes:
                        </p>
                        <ul style={{ paddingLeft: '20px', margin: 0, color: colors.grey, fontSize: '13px', lineHeight: '2' }}>
                            <li>Full IP &amp; trademark risk analysis</li>
                            <li>C2PA provenance verification</li>
                            <li>Brand safety assessment</li>
                            <li>Legal remediation steps</li>
                            <li>Downloadable PDF audit trail</li>
                        </ul>
                    </div>

                    {/* CTA */}
                    <div style={{ textAlign: 'center' }}>
                        <a href={dashboardUrl} style={{
                            display: 'block',
                            backgroundColor: colors.orange,
                            color: '#FFFFFF',
                            textDecoration: 'none',
                            padding: '18px 24px',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            Access Your Report
                        </a>
                        <p style={{ marginTop: '12px', fontSize: '11px', color: colors.grey }}>
                            Or copy this link: {dashboardUrl}
                        </p>
                    </div>

                </div>

                {/* Footer */}
                <div style={{ borderTop: `1px solid ${colors.lightGrey}`, padding: '20px', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
                    <p style={{ margin: 0, fontSize: '10px', color: colors.grey }}>
                        This is your receipt. Keep for your records.
                    </p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '9px', textTransform: 'uppercase', color: '#999999', letterSpacing: '1px' }}>
                        AI Content Risk Score &bull; {new Date().getFullYear()}
                    </p>
                </div>

            </div>
        </div>
    )
}
