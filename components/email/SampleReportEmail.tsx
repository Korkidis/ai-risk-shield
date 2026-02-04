import * as React from 'react'

interface SampleReportEmailProps {
    scanId: string
    score: number
    riskLevel: string
    findingsCount: number
    magicLink: string
}

export const SampleReportEmail: React.FC<SampleReportEmailProps> = ({
    scanId,
    score,
    riskLevel,
    findingsCount,
    magicLink,
}) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-risk-shield.com'

    const statusColor = score > 65 ? '#ef4444' : score > 35 ? '#f59e0b' : '#10b981'

    return (
        <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f8fafc', padding: '40px 20px' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, textTransform: 'uppercase', color: '#1e293b' }}>
                        Risk Shield
                    </h1>
                    <p style={{ marginTop: '8px', color: '#64748b', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                        Forensic Analysis Report
                    </p>
                </div>

                {/* Score Card */}
                <div style={{ textAlign: 'center', marginBottom: '32px', padding: '32px', backgroundColor: '#1e293b', borderRadius: '12px', color: 'white' }}>
                    <div style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, marginBottom: '16px' }}>
                        ClearCheck Score
                    </div>
                    <div style={{ fontSize: '64px', fontWeight: 900, lineHeight: 1, color: statusColor, marginBottom: '16px' }}>
                        {score}
                    </div>
                    <div style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {riskLevel}
                    </div>
                </div>

                {/* Details */}
                <div style={{ marginBottom: '32px' }}>
                    <p style={{ color: '#334155', lineHeight: '1.6', fontSize: '16px', marginBottom: '24px' }}>
                        Your AI asset analysis is complete. We identified <strong>{findingsCount} potential risk indicators</strong> in your uploaded content.
                    </p>
                    <ul style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px' }}>
                        <li style={{ marginBottom: '8px' }}>IP & Trademark Exposure</li>
                        <li style={{ marginBottom: '8px' }}>Brand Safety Violations</li>
                        <li style={{ marginBottom: '8px' }}>Provenance Verification (C2PA)</li>
                    </ul>
                </div>

                {/* CTA */}
                <div style={{ textAlign: 'center' }}>
                    <a
                        href={magicLink}
                        style={{
                            display: 'inline-block',
                            backgroundColor: '#4f46e5',
                            color: '#ffffff',
                            padding: '16px 32px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: 700,
                            fontSize: '16px',
                        }}
                    >
                        View Full Report
                    </a>
                    <p style={{ marginTop: '24px', fontSize: '12px', color: '#94a3b8' }}>
                        This link expires in 15 minutes for your security.
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: '32px', color: '#94a3b8', fontSize: '12px' }}>
                <p style={{ margin: 0 }}>© {new Date().getFullYear()} AI Risk Shield. All rights reserved.</p>
                <p style={{ margin: '8px 0 0 0' }}>Automated Legal Forensic Analysis</p>
            </div>
        </div>
    )
}
