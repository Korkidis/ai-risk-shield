import jsPDF from 'jspdf'
import { RiskProfile } from './gemini-types'
import { ExtendedScan } from '@/types/database'
import { format } from 'date-fns'
import { getRiskTier } from './risk/tiers'

// Dieter Rams / Braun Design Tokens
const FONT = {
    header: "helvetica",
    body: "helvetica",
    mono: "courier"
}

const COLORS = {
    bg: '#EBE7E0',        // Clay White
    ink: '#1A1A1A',       // Carbon
    sub: '#666666',       // Grey 600
    line: '#CCCCCC',      // Grey 300
    accent: '#FF4F00',    // Signal Orange
    safe: '#006742',      // Safe Green
    caution: '#EAB308',   // Warning Yellow
}

/**
 * Map canonical risk level to PDF ink color.
 */
function riskLevelColor(level: string): string {
    if (level === 'critical' || level === 'high') return COLORS.accent
    if (level === 'review' || level === 'caution') return COLORS.caution
    return COLORS.safe
}

/**
 * Map finding severity to PDF dot color.
 */
function severityDotColor(severity: string): string {
    if (severity === 'critical') return COLORS.accent
    if (severity === 'high') return COLORS.caution
    return COLORS.line
}

export const generateForensicReport = (
    scan: ExtendedScan & { filename: string },
    profile: RiskProfile,
    isSample: boolean = false
) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    })

    const tier = getRiskTier(profile.composite_score)

    // --- HELPERS ---
    const drawLine = (y: number) => {
        doc.setDrawColor(COLORS.line)
        doc.setLineWidth(0.1)
        doc.line(20, y, 190, y)
    }

    const drawLabel = (text: string, x: number, y: number) => {
        doc.setFont(FONT.body, "bold")
        doc.setFontSize(8)
        doc.setTextColor(COLORS.sub)
        doc.text(text.toUpperCase(), x, y)
    }

    const drawValue = (text: string, x: number, y: number) => {
        doc.setFont(FONT.mono, "normal")
        doc.setFontSize(10)
        doc.setTextColor(COLORS.ink)
        doc.text(text, x, y)
    }

    const checkPageBreak = (y: number, needed: number): number => {
        if (y + needed > 270) {
            doc.addPage()
            return 20
        }
        return y
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HEADER
    // ═══════════════════════════════════════════════════════════════════════════

    doc.setFont(FONT.header, "bold")
    doc.setFontSize(14)
    doc.setTextColor(COLORS.ink)
    doc.text("AI RISK SHIELD", 20, 15)

    doc.setFont(FONT.body, "normal")
    doc.setFontSize(8)
    doc.text(isSample ? "SAMPLE FORENSIC ANALYSIS" : "FORENSIC ANALYSIS REPORT", 20, 19)

    // Metadata (Top Right)
    doc.setFont(FONT.mono, "normal")
    doc.setFontSize(7)
    doc.setTextColor(COLORS.sub)
    doc.text(`REF: ${scan.id.substring(0, 8).toUpperCase()}`, 190, 15, { align: "right" })
    doc.text(`DATE: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 190, 19, { align: "right" })

    drawLine(25)

    // ═══════════════════════════════════════════════════════════════════════════
    // ASSET CONTEXT
    // ═══════════════════════════════════════════════════════════════════════════

    drawLabel("FILENAME", 20, 35)
    doc.setFont(FONT.body, "normal")
    doc.setFontSize(10)
    doc.setTextColor(COLORS.ink)
    doc.text(scan.filename, 20, 40)

    drawLabel("TYPE", 120, 35)
    drawValue((scan.is_video ? 'VIDEO' : 'IMAGE').toUpperCase(), 120, 40)

    // ═══════════════════════════════════════════════════════════════════════════
    // PROMINENT SCORE GAUGE
    // ═══════════════════════════════════════════════════════════════════════════

    const scoreY = 60
    const riskColor = riskLevelColor(tier.level)

    doc.setFillColor(riskColor)
    doc.circle(170, scoreY, 12, "F")

    doc.setTextColor("#FFFFFF")
    doc.setFont(FONT.header, "bold")
    doc.setFontSize(14)
    doc.text(profile.composite_score.toString(), 170, scoreY + 2, { align: "center" })

    doc.setTextColor(COLORS.ink)
    doc.setFontSize(24)
    doc.text(tier.verdict.toUpperCase(), 20, scoreY + 2)
    drawLabel("RISK ASSESSMENT", 20, scoreY - 10)

    drawLine(80)

    // ═══════════════════════════════════════════════════════════════════════════
    // SUB-SCORES
    // ═══════════════════════════════════════════════════════════════════════════

    let y = 90
    drawLabel("RISK BREAKDOWN", 20, y)
    y += 8

    const subScores = [
        { label: "IP EXPOSURE", score: profile.ip_report.score },
        { label: "BRAND SAFETY", score: profile.safety_report.score },
        { label: "PROVENANCE", score: profile.provenance_report.score },
    ]

    subScores.forEach(({ label, score }) => {
        const subTier = getRiskTier(score)
        doc.setFont(FONT.body, "bold")
        doc.setFontSize(9)
        doc.setTextColor(COLORS.ink)
        doc.text(label, 28, y)

        doc.setFont(FONT.mono, "bold")
        doc.setFontSize(11)
        doc.setTextColor(riskLevelColor(subTier.level))
        doc.text(`${score}`, 80, y)

        doc.setFont(FONT.body, "normal")
        doc.setFontSize(8)
        doc.setTextColor(COLORS.sub)
        doc.text(subTier.label, 95, y)

        y += 7
    })

    // C2PA Status Summary
    y += 2
    const c2pa = profile.c2pa_report
    drawLabel("C2PA PROVENANCE", 28, y)
    y += 5
    doc.setFont(FONT.mono, "normal")
    doc.setFontSize(9)
    const c2paStatus = c2pa.status || 'unknown'
    const c2paColor = c2paStatus === 'valid' ? COLORS.safe :
        c2paStatus === 'caution' ? COLORS.caution :
            c2paStatus === 'missing' ? COLORS.sub : COLORS.accent
    const c2paLabel = c2paStatus === 'caution' ? 'WARN' : c2paStatus.toUpperCase()
    doc.setTextColor(c2paColor)
    doc.text(`STATUS: ${c2paLabel}`, 28, y)

    if (c2pa.issuer) {
        doc.setTextColor(COLORS.ink)
        doc.text(`ISSUER: ${c2pa.issuer}`, 90, y)
    }
    if (c2pa.tool) {
        y += 5
        doc.setTextColor(COLORS.sub)
        doc.text(`TOOL: ${c2pa.tool}${c2pa.tool_version ? ` v${c2pa.tool_version}` : ''}`, 28, y)
    }

    y += 8
    drawLine(y)
    y += 10

    // ═══════════════════════════════════════════════════════════════════════════
    // KEY FINDINGS
    // ═══════════════════════════════════════════════════════════════════════════

    y = checkPageBreak(y, 40)
    drawLabel("KEY FINDINGS", 20, y)
    y += 8

    // Build findings list: DB findings first, then synthesized from profile
    let findings = [...((scan as any).scan_findings || [])]

    if (findings.length === 0 && profile.composite_score > 25) {
        if (profile.ip_report.score > 25) {
            const ipTier = getRiskTier(profile.ip_report.score)
            findings.push({
                title: "Intellectual Property Risk Detected",
                severity: ipTier.level === 'critical' ? 'critical' : ipTier.level === 'high' ? 'high' : 'medium',
                finding_type: 'ip_violation',
                description: profile.ip_report.teaser,
                _teaser: profile.ip_report.teaser,
            })
        }
        if (profile.safety_report.score > 25) {
            const safeTier = getRiskTier(profile.safety_report.score)
            findings.push({
                title: "Content Safety Flag",
                severity: safeTier.level === 'critical' ? 'critical' : safeTier.level === 'high' ? 'high' : 'medium',
                finding_type: 'safety_violation',
                description: profile.safety_report.teaser,
                _teaser: profile.safety_report.teaser,
            })
        }
        if (profile.provenance_report.score > 25) {
            const provTier = getRiskTier(profile.provenance_report.score)
            findings.push({
                title: "Provenance Verification Issue",
                severity: provTier.level === 'critical' ? 'critical' : provTier.level === 'high' ? 'high' : 'medium',
                finding_type: 'provenance_issue',
                description: profile.provenance_report.teaser,
                _teaser: profile.provenance_report.teaser,
            })
        }
    }

    // Sort by severity (critical first)
    const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
    findings.sort((a: any, b: any) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4))

    if (findings.length > 0) {
        // Determine which findings to show in sample mode
        let shownFindings: any[] = []
        let hiddenFindings: any[] = []
        let lockedList: string[] = []

        if (isSample) {
            // 1. Pick Hero Finding (Highest Severity)
            // Already sorted by severity above
            const hero = findings[0]
            shownFindings = [hero]
            hiddenFindings = findings.slice(1)

            // 2. content for "Locked" section (Dynamic Counts)
            // Count hidden findings by unique type to avoid clutter
            const hiddenCounts: Record<string, number> = {}
            hiddenFindings.forEach((f: any) => {
                const type = f.finding_type || 'unknown'
                hiddenCounts[type] = (hiddenCounts[type] || 0) + 1
            })

            // Generate specific strings for locked content
            Object.entries(hiddenCounts).forEach(([type, count]) => {
                const label = type.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                lockedList.push(`${count} Additional ${label} ${count > 1 ? 'Risks' : 'Risk'}`)
            })

            // Add Chief Officer Strategy if missing (it usually is for sample)
            if (profile.chief_officer_strategy) {
                lockedList.push("Chief Safety Officer Strategy")
            }
            if (profile.c2pa_report?.history && profile.c2pa_report.history.length > 0) {
                lockedList.push("Full C2PA Custody History")
            }

            // 3. Inject Teasers for MISSING categories (if not covered by Hero/Shown Findings)
            // We want to ensure that if a category has risk in the profile, it is represented either by a real finding or a teaser.
            const coveredCategories = new Set<string>()
            shownFindings.forEach(f => {
                const type = (f.finding_type || '').toLowerCase()
                if (type.includes('ip') || type.includes('copyright') || type.includes('trademark')) coveredCategories.add('ip')
                if (type.includes('safety') || type.includes('nsfw') || type.includes('violent')) coveredCategories.add('safety')
                if (type.includes('provenance') || type.includes('c2pa') || type.includes('fake')) coveredCategories.add('provenance')
            })

            const teasersToAdd = []

            if (!coveredCategories.has('ip') && profile.ip_report.score > 25) {
                teasersToAdd.push({
                    title: "Intellectual Property Risk Detected",
                    severity: 'medium', // Visual placeholder
                    finding_type: 'ip_violation',
                    description: profile.ip_report.teaser,
                    _isTeaser: true
                })
            }
            if (!coveredCategories.has('safety') && profile.safety_report.score > 25) {
                teasersToAdd.push({
                    title: "Content Safety Flag",
                    severity: 'medium',
                    finding_type: 'safety_violation',
                    description: profile.safety_report.teaser,
                    _isTeaser: true
                })
            }
            if (!coveredCategories.has('provenance') && profile.provenance_report.score > 25) {
                teasersToAdd.push({
                    title: "Provenance Verification Issue",
                    severity: 'medium',
                    finding_type: 'provenance_issue',
                    description: profile.provenance_report.teaser,
                    _isTeaser: true
                })
            }

            // Append teasers to shown list
            shownFindings = [...shownFindings, ...teasersToAdd]

        } else {
            // Full Report: Show detailed list
            shownFindings = findings.slice(0, 10) // Limit fairly high
            hiddenFindings = findings.slice(10)
        }

        // Render shown findings
        shownFindings.forEach((f: any) => {
            y = checkPageBreak(y, 25)

            // Severity dot
            doc.setFillColor(severityDotColor(f.severity))
            doc.circle(22, y - 1, 1.5, "F")

            // Title
            doc.setFont(FONT.body, "bold")
            doc.setFontSize(10)
            doc.setTextColor(COLORS.ink)
            doc.text(f.title, 28, y)

            // Type label
            const typeLabel = f.finding_type.replace(/_/g, ' ').toUpperCase()
            doc.setFont(FONT.mono, "normal")
            doc.setFontSize(7)
            doc.setTextColor(COLORS.sub)
            const labelText = f._isTeaser ? "DETECTED - PARTIAL" : typeLabel
            doc.text(labelText, 150, y, { align: "right" })

            y += 5

            // Description / Teaser Body
            doc.setFont(FONT.body, "normal")
            // If it's a teaser, blur it or make it distinct?
            // For now, just show the text but maybe italicized or lighter if it's a teaser
            if (f._isTeaser) {
                doc.setTextColor(COLORS.sub)
                doc.setFont(FONT.body, "italic")
            } else {
                doc.setTextColor(COLORS.sub)
                doc.setFont(FONT.body, "normal")
            }

            doc.setFontSize(9)
            const descLines = doc.splitTextToSize(f.description || '', 160)
            doc.text(descLines, 28, y)
            y += (descLines.length * 4) + 3

            // Mitigation hint (teaser-aligned, one line)
            // For teasers, we hide the mitigation to encourage unlock
            const teaser = f._teaser || f.description || ''
            if (!f._isTeaser && teaser && teaser !== "No significant risks detected.") {
                y = checkPageBreak(y, 8)
                doc.setFont(FONT.mono, "normal")
                doc.setFontSize(7)
                doc.setTextColor(COLORS.ink)

                // Truncate teaser to one clean line
                const hintText = teaser.length > 80 ? teaser.substring(0, 77) + '...' : teaser
                doc.text(`MITIGATION: ${hintText}`, 28, y)
                y += 6
            } else if (f._isTeaser) {
                // For teasers, explicitly say "Unlock for details"
                y = checkPageBreak(y, 8)
                doc.setFont(FONT.mono, "bold")
                doc.setFontSize(7)
                doc.setTextColor(COLORS.accent)
                doc.text("MITIGATION: [LOCKED] Unlock full report to view strategy", 28, y)
                y += 6
            }

            y += 3
        })

        // ───────────────────────────────────────────────────────────────────
        // SAMPLE: Locked content indicator + upgrade CTA
        // ───────────────────────────────────────────────────────────────────
        if (isSample && (hiddenFindings.length > 0 || profile.chief_officer_strategy)) {
            y = checkPageBreak(y, 40)
            drawLine(y)
            y += 8

            // Locked section
            doc.setFont(FONT.body, "bold")
            doc.setFontSize(9)
            doc.setTextColor(COLORS.sub)
            doc.text("FULL REPORT INCLUDES:", 28, y)
            y += 6

            doc.setFont(FONT.body, "normal")
            doc.setFontSize(8)

            // Use our dynamic list
            if (lockedList.length === 0) {
                // Fallback if nothing specific is hidden but it is a sample
                lockedList.push("Complete Evidence & Citations")
                lockedList.push("Legal Grade Mitigation Strategy")
            }

            lockedList.forEach(item => {
                doc.text(`\u2022  ${item}`, 32, y)
                y += 5
            })

            y += 4

            // Upgrade CTA
            drawLine(y)
            y += 8

            doc.setFont(FONT.header, "bold")
            doc.setFontSize(12)
            doc.setTextColor(COLORS.accent)
            doc.text("UNLOCK COMPLETE FORENSIC ANALYSIS", 105, y, { align: "center" })
            y += 6

            doc.setFont(FONT.mono, "normal")
            doc.setFontSize(8)
            doc.setTextColor(COLORS.ink)
            doc.text(`airiskshield.com/dashboard/scans-reports?highlight=${scan.id}`, 105, y, { align: "center" })
            y += 4
        }

        // ───────────────────────────────────────────────────────────────────
        // FULL REPORT: Additional content
        // ───────────────────────────────────────────────────────────────────
        if (!isSample && profile.chief_officer_strategy) {
            y = checkPageBreak(y, 30)
            drawLine(y)
            y += 10

            drawLabel("CHIEF OFFICER RISK BRIEFING", 20, y)
            y += 6

            doc.setFont(FONT.body, "normal")
            doc.setFontSize(9)
            doc.setTextColor(COLORS.ink)
            const strategyLines = doc.splitTextToSize(profile.chief_officer_strategy, 160)
            doc.text(strategyLines, 20, y)
            y += (strategyLines.length * 4) + 6
        }

    } else {
        // No findings — clean checks
        const checks = [
            { label: "IP CHECK", status: "PASS", detail: "No known copyright matches found." },
            { label: "SAFETY CHECK", status: "PASS", detail: "Content is safe for commercial use." },
            {
                label: "C2PA CHECK",
                status: c2pa.status === 'valid' ? "PASS" : c2pa.status === 'caution' ? "WARN" : (c2pa.status === 'invalid' || c2pa.status === 'error') ? "FAIL" : "INFO",
                detail: c2pa.status === 'missing' ? "No provenance data." : c2pa.status === 'valid' ? "Provenance verified." : c2pa.status === 'caution' ? "Partial/Self-signed credentials." : "Verification failed."
            },
        ]

        checks.forEach(check => {
            doc.setFont(FONT.body, "bold")
            doc.setFontSize(9)
            doc.setTextColor(COLORS.ink)
            doc.text(check.label, 28, y)

            doc.setFont(FONT.mono, "normal")
            doc.setFontSize(9)
            doc.setTextColor(
                check.status === 'PASS' ? COLORS.safe :
                    check.status === 'WARN' ? COLORS.caution :
                        check.status === 'FAIL' ? COLORS.accent :
                            COLORS.sub
            )
            doc.text(check.status, 70, y)

            doc.setFont(FONT.body, "normal")
            doc.setFontSize(8)
            doc.setTextColor(COLORS.sub)
            doc.text(check.detail, 90, y)

            y += 8
        })
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PROVENANCE FOOTER (Full reports only)
    // ═══════════════════════════════════════════════════════════════════════════

    if (!isSample) {
        y = checkPageBreak(y, 30)
        drawLine(y + 10)
        y += 20

        drawLabel("PROVENANCE DATA", 20, y)
        y += 5

        doc.setFont(FONT.mono, "normal")
        doc.setFontSize(8)
        doc.setTextColor(COLORS.ink)

        const signatureLabel = c2paStatus === 'valid' ? 'Verified' :
            c2paStatus === 'caution' ? 'Verified (Non-Standard)' :
                c2paStatus === 'missing' ? 'Not Present' : 'Failed'
        const provText = [
            `STATUS:    ${c2paLabel}`,
            `ISSUER:    ${c2pa.issuer || 'N/A'}`,
            `TOOL:      ${c2pa.tool || 'N/A'}`,
            `SIGNATURE: ${signatureLabel}`,
        ]

        doc.text(provText, 20, y + 4)
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // FOOTER
    // ═══════════════════════════════════════════════════════════════════════════

    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFont(FONT.mono, "normal")
        doc.setFontSize(6)
        doc.setTextColor(COLORS.sub)
        doc.text(
            `AI RISK SHIELD  |  ${isSample ? 'SAMPLE' : 'FULL'} REPORT  |  ${format(new Date(), 'yyyy-MM-dd')}  |  Page ${i}/${pageCount}`,
            105, 290, { align: "center" }
        )
    }

    // Save
    const prefix = isSample ? 'AIRS_Sample_' : 'AIRS_Report_'
    doc.save(`${prefix}${scan.filename.substring(0, 10)}_${format(new Date(), 'yyyyMMdd')}.pdf`)
}
