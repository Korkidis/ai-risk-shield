import * as React from 'react'

interface SampleReportEmailProps {
    scanId: string
    score: number
    riskLevel: string
    findingsCount: number
    magicLink: string
    topFinding?: {
        title: string
        severity: string
    }
}

export const SampleReportEmail: React.FC<SampleReportEmailProps> = ({
    score,
    riskLevel,
    findingsCount,
    magicLink,
    topFinding,
}) => {
    // Dieter Rams / Clay White Palette
    const colors = {
        bg: '#EBE7E0',
        card: '#F4F4F4',
        ink: '#1A1A1A',
        orange: '#FF4F00',
        grey: '#666666',
        lightGrey: '#DDDDDD',
        critical: '#D10000',
        safe: '#1E8E3E',
        caution: '#B56A00',
    }

    const riskLabel = riskLevel.toUpperCase()
    const isCritical = riskLabel.includes('CRITICAL') || riskLabel.includes('HIGH')
    const isCaution = riskLabel.includes('MEDIUM') || riskLabel.includes('REVIEW') || riskLabel.includes('CAUTION')
    const isLowRisk = riskLabel.includes('LOW') || riskLabel.includes('SAFE')
    const riskTone = isCritical ? colors.critical : isCaution ? colors.caution : colors.safe
    const topFindingBg = isCritical ? '#FFF0ED' : isCaution ? '#FFF7E6' : '#EDF7EF'
    const topFindingLabel = isLowRisk ? 'Top Finding' : 'Top Detected Risk'

    return (
        <div style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', backgroundColor: colors.bg, padding: '40px 20px', margin: 0 }}>
            <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: colors.card, borderRadius: '16px', border: `1px solid ${colors.lightGrey}`, overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>

                {/* Header */}
                <div style={{ backgroundColor: colors.ink, padding: '30px', textAlign: 'center' }}>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        AI Risk Shield
                    </h1>
                    <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                        Forensic Analysis Complete
                    </p>
                </div>

                {/* Body */}
                <div style={{ padding: '40px' }}>

                    {/* Score Hero */}
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div style={{ fontSize: '80px', fontWeight: 800, lineHeight: 1, color: colors.orange, letterSpacing: '-2px' }}>
                            {score}
                        </div>
                        <div style={{ display: 'inline-block', borderTop: `1px solid ${colors.lightGrey}`, paddingTop: '10px', marginTop: '10px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: colors.grey, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                ClearCheck Score
                            </span>
                            <span style={{ display: 'inline-block', marginLeft: '10px', backgroundColor: colors.lightGrey, padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, color: riskTone, textTransform: 'uppercase' }}>
                                {riskLevel}
                            </span>
                        </div>
                    </div>

                    <hr style={{ border: 0, borderTop: `1px solid ${colors.lightGrey}`, margin: '0 0 30px 0' }} />

                    {/* Top Finding Injection */}
                    {topFinding && (
                        <div style={{ backgroundColor: topFindingBg, borderLeft: `4px solid ${riskTone}`, padding: '16px', marginBottom: '30px' }}>
                            <p style={{ margin: '0 0 4px 0', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: riskTone, letterSpacing: '1px' }}>
                                {topFindingLabel}
                            </p>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: colors.ink }}>
                                {topFinding.title}
                            </p>
                        </div>
                    )}

                    {/* Findings */}
                    <div style={{ marginBottom: '40px' }}>
                        <p style={{ fontSize: '16px', lineHeight: '1.5', color: colors.ink, marginBottom: '20px' }}>
                            {isLowRisk ? (
                                <>Analysis complete. We found <strong>{findingsCount} {findingsCount === 1 ? 'signal' : 'signals'}</strong> to review. Overall risk remains low.</>
                            ) : (
                                <>Analysis complete. We identified <strong>{findingsCount} risk indicators</strong> in your uploaded content.</>
                            )}
                        </p>
                        <ul style={{ paddingLeft: '20px', margin: 0, color: colors.grey, fontSize: '14px', lineHeight: '1.8' }}>
                            <li>IP & Trademark {isLowRisk ? 'Checks' : 'Exposure'}</li>
                            <li>Brand Safety {isLowRisk ? 'Checks' : 'Violations'}</li>
                            <li>Provenance Verification (C2PA)</li>
                        </ul>
                    </div>

                    {/* CTA */}
                    <div style={{ textAlign: 'center' }}>
                        <a href={magicLink} style={{
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
                            View Full Report →
                        </a>
                        <p style={{ marginTop: '20px', fontSize: '11px', color: colors.grey, fontFamily: 'monospace' }}>
                            SECURE ACCESS LINK • EXPIRES IN 15 MINUTES
                        </p>
                        <p style={{ marginTop: '10px', fontSize: '10px', color: '#999999', lineHeight: '1.4' }}>
                            By accessing this report, a secure guest account will be created so you can retrieve your scan results later.
                        </p>
                    </div>

                </div>

                {/* Footer */}
                <div style={{ borderTop: `1px solid ${colors.lightGrey}`, padding: '20px', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
                    <p style={{ margin: 0, fontSize: '9px', textTransform: 'uppercase', color: colors.grey, letterSpacing: '1px' }}>
                        AI Risk Shield • Automated Legal Forensic Analysis
                    </p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '9px', color: '#999999' }}>
                        © {new Date().getFullYear()} All rights reserved
                    </p>
                </div>

            </div>
        </div>
    )
}
