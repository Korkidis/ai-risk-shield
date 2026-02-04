/**
 * Magic Link Email Template
 * Matches "Forensic Instrument" design system
 */

import * as React from 'react'
import { Html, Head, Body, Container, Section, Text, Link, Hr } from '@react-email/components'

interface MagicLinkEmailProps {
    scanId: string
    score: number
    riskLevel: string
    findingsCount: number
    magicLink: string
}

export const MagicLinkEmail: React.FC<MagicLinkEmailProps> = ({
    score,
    riskLevel,
    findingsCount,
    magicLink,
}) => {
    // Forensic color mapping
    const riskColor = score >= 75 ? '#FF4F00' : // Signal Orange (Critical)
        score >= 50 ? '#E67E22' : // High
            score >= 25 ? '#F39C12' : // Medium
                '#006742' // Safe Green

    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    {/* Header - Forensic Style */}
                    <Section style={header}>
                        <Text style={headerTitle}>AI RISK SHIELD</Text>
                        <Text style={headerSubtitle}>FORENSIC ANALYSIS COMPLETE</Text>
                    </Section>

                    {/* Score Panel - Industrial Design */}
                    <Section style={scorePanel}>
                        <div style={scoreBadge}>
                            <Text style={{ ...scoreValue, color: riskColor }}>{score}</Text>
                            <Text style={scoreLabel}>CLEARCHECK SCORE</Text>
                        </div>
                        <div style={riskBadge}>
                            <Text style={{ ...riskText, color: riskColor }}>{riskLevel}</Text>
                        </div>
                    </Section>

                    {/* Summary - Clean Typography */}
                    <Section style={summarySection}>
                        <Text style={summaryText}>
                            Analysis complete. We identified <strong>{findingsCount} risk indicators</strong> in your uploaded content.
                        </Text>

                        <ul style={findingsList}>
                            <li style={findingsItem}>IP & Trademark Exposure</li>
                            <li style={findingsItem}>Brand Safety Violations</li>
                            <li style={findingsItem}>Provenance Verification (C2PA)</li>
                        </ul>
                    </Section>

                    <Hr style={divider} />

                    {/* CTA - High Contrast Button */}
                    <Section style={ctaSection}>
                        <Link href={magicLink} style={ctaButton}>
                            VIEW FULL REPORT →
                        </Link>
                        <Text style={expiryNotice}>
                            Secure access link • Expires in 15 minutes
                        </Text>
                    </Section>

                    {/* Footer - Technical Grid Style */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            AI RISK SHIELD • AUTOMATED LEGAL FORENSIC ANALYSIS
                        </Text>
                        <Text style={footerSmall}>
                            © {new Date().getFullYear()} All rights reserved
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    )
}

// Styles - Forensic Instrument Design System
const main = {
    backgroundColor: '#EBE7E0', // Clay White (chassis)
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '40px 0',
}

const container = {
    backgroundColor: '#FFFFFF',
    margin: '0 auto',
    maxWidth: '600px',
    border: '2px solid #1A1A1A', // Carbon Matte border
    borderRadius: '16px',
}

const header = {
    backgroundColor: '#1A1A1A', // Carbon Matte
    padding: '32px 24px',
    textAlign: 'center' as const,
    borderBottom: '4px solid #FF4F00', // Signal Orange accent
}

const headerTitle = {
    fontSize: '24px',
    fontWeight: 900,
    color: '#FFFFFF',
    margin: '0',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
}

const headerSubtitle = {
    fontSize: '11px',
    fontWeight: 700,
    color: '#9A9691', // Lufthansa Grey
    margin: '8px 0 0',
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
}

const scorePanel = {
    backgroundColor: '#F5F5F5',
    padding: '40px 24px',
    textAlign: 'center' as const,
}

const scoreBadge = {
    display: 'inline-block',
    marginBottom: '16px',
}

const scoreValue = {
    fontSize: '72px',
    fontWeight: 900,
    margin: '0',
    lineHeight: '1',
}

const scoreLabel = {
    fontSize: '10px',
    fontWeight: 700,
    color: '#9A9691',
    margin: '8px 0 0',
    letterSpacing: '0.15em',
}

const riskBadge = {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: '4px',
}

const riskText = {
    fontSize: '12px',
    fontWeight: 900,
    margin: '0',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
}

const summarySection = {
    padding: '32px 24px',
}

const summaryText = {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#1A1A1A',
    margin: '0 0 24px',
}

const findingsList = {
    margin: '0',
    padding: '0 0 0 24px',
    fontSize: '14px',
    color: '#666666',
}

const findingsItem = {
    marginBottom: '8px',
}

const divider = {
    borderColor: '#E5E1DA',
    margin: '0',
}

const ctaSection = {
    padding: '40px 24px',
    textAlign: 'center' as const,
}

const ctaButton = {
    backgroundColor: '#FF4F00', // Signal Orange
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 700,
    textDecoration: 'none',
    padding: '16px 48px',
    borderRadius: '8px',
    display: 'inline-block',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
}

const expiryNotice = {
    fontSize: '11px',
    color: '#9A9691',
    margin: '16px 0 0',
    fontFamily: 'monospace',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
}

const footer = {
    padding: '24px',
    textAlign: 'center' as const,
    borderTop: '1px solid #E5E1DA',
}

const footerText = {
    fontSize: '10px',
    fontWeight: 700,
    color: '#9A9691',
    margin: '0 0 8px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
}

const footerSmall = {
    fontSize: '10px',
    color: '#CCCCCC',
    margin: '0',
}
