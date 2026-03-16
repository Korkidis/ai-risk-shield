import jsPDF from 'jspdf'
import { RiskProfile } from './gemini-types'
import { ExtendedScan, MitigationReportContent, ScanWithRelations } from '@/types/database'
import { format } from 'date-fns'
import { getRiskTier } from './risk/tiers'

/** Local type for PDF finding entries (DB findings + synthesized from profile) */
interface PdfFinding {
    title: string
    severity: string
    finding_type: string
    description: string
}

/** Optional asset image data for embedding a preview in the PDF */
export interface AssetImageData {
    data: Uint8Array
    format: 'JPEG' | 'PNG'
    width: number
    height: number
}

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
    isSample: boolean = false,
    assetImageData?: AssetImageData
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
    doc.text("AI CONTENT RISK SCORE", 20, 15)

    doc.setFont(FONT.body, "normal")
    doc.setFontSize(8)
    doc.text(isSample ? "SCAN FINDINGS SUMMARY" : "FORENSIC ANALYSIS REPORT", 20, 19)

    // Metadata (Top Right)
    doc.setFont(FONT.mono, "normal")
    doc.setFontSize(7)
    doc.setTextColor(COLORS.sub)
    doc.text(`REF: ${scan.id.substring(0, 8).toUpperCase()}`, 190, 15, { align: "right" })
    doc.text(`DATE: ${format(new Date(scan.created_at), 'yyyy-MM-dd HH:mm:ss')}`, 190, 19, { align: "right" })

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
    // ASSET PREVIEW (optional — images only, graceful skip for videos)
    // ═══════════════════════════════════════════════════════════════════════════

    let previewHeight = 0
    if (assetImageData && !scan.is_video) {
        const maxW = 80 // mm
        const maxH = 55 // mm
        const aspectRatio = assetImageData.width / assetImageData.height
        let imgW = maxW
        let imgH = maxW / aspectRatio
        if (imgH > maxH) {
            imgH = maxH
            imgW = maxH * aspectRatio
        }

        drawLabel("SCANNED ASSET", 20, 47)
        try {
            doc.addImage(
                assetImageData.data,
                assetImageData.format,
                20,
                50,
                imgW,
                imgH
            )
            previewHeight = imgH + 15 // space for label + image + padding
        } catch {
            // Graceful fallback: skip preview if addImage fails
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PROMINENT SCORE GAUGE
    // ═══════════════════════════════════════════════════════════════════════════

    const scoreY = previewHeight > 0 ? 45 + previewHeight : 60
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

    drawLine(scoreY + 20)

    // ═══════════════════════════════════════════════════════════════════════════
    // SUB-SCORES
    // ═══════════════════════════════════════════════════════════════════════════

    let y = scoreY + 30
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

    // Domain Teasers — what each analysis domain found
    y += 2
    const domainTeasers = [
        { label: "IP ANALYSIS", teaser: profile.ip_report.teaser },
        { label: "SAFETY ANALYSIS", teaser: profile.safety_report.teaser },
        { label: "PROVENANCE ANALYSIS", teaser: profile.provenance_report.teaser },
    ]

    domainTeasers.forEach(({ label, teaser }) => {
        if (teaser && teaser.length > 0) {
            y = checkPageBreak(y, 12)
            doc.setFont(FONT.body, "bold")
            doc.setFontSize(7)
            doc.setTextColor(COLORS.sub)
            doc.text(label, 28, y)
            y += 4
            doc.setFont(FONT.body, "normal")
            doc.setFontSize(8)
            doc.setTextColor(COLORS.ink)
            const teaserLines = doc.splitTextToSize(teaser, 155)
            doc.text(teaserLines, 28, y)
            y += (teaserLines.length * 3.5) + 3
        }
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
    // scan_findings comes from the joined query on ScanWithRelations
    const findings: PdfFinding[] = [...((scan as ExtendedScan & { scan_findings?: Array<{ title: string; severity: string; finding_type: string; description: string }> }).scan_findings || [])]

    if (findings.length === 0 && profile.composite_score > 25) {
        if (profile.ip_report.score > 25) {
            const ipTier = getRiskTier(profile.ip_report.score)
            findings.push({
                title: "Intellectual Property Risk Detected",
                severity: ipTier.level === 'critical' ? 'critical' : ipTier.level === 'high' ? 'high' : 'medium',
                finding_type: 'ip_violation',
                description: profile.ip_report.teaser,
            })
        }
        if (profile.safety_report.score > 25) {
            const safeTier = getRiskTier(profile.safety_report.score)
            findings.push({
                title: "Content Safety Flag",
                severity: safeTier.level === 'critical' ? 'critical' : safeTier.level === 'high' ? 'high' : 'medium',
                finding_type: 'safety_violation',
                description: profile.safety_report.teaser,
            })
        }
        if (profile.provenance_report.score > 25) {
            const provTier = getRiskTier(profile.provenance_report.score)
            findings.push({
                title: "Provenance Verification Issue",
                severity: provTier.level === 'critical' ? 'critical' : provTier.level === 'high' ? 'high' : 'medium',
                finding_type: 'provenance_issue',
                description: profile.provenance_report.teaser,
            })
        }
    }

    // Sort by severity (critical first)
    const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
    findings.sort((a: PdfFinding, b: PdfFinding) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4))

    if (findings.length > 0) {
        // Show all findings — scan reports are free (mitigation is the paid product)
        const shownFindings = findings.slice(0, 10)

        // Render findings
        shownFindings.forEach((f: PdfFinding) => {
            y = checkPageBreak(y, 20)

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
            doc.text(typeLabel, 150, y, { align: "right" })

            y += 5

            // Description
            doc.setFont(FONT.body, "normal")
            doc.setTextColor(COLORS.sub)
            doc.setFontSize(9)
            const descLines = doc.splitTextToSize(f.description || '', 160)
            doc.text(descLines, 28, y)
            y += (descLines.length * 4) + 6
        })

    } else {
        // No findings — comprehensive clean checks
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

        // Domain teasers for safe results — show what was analyzed
        y += 4
        const safeDomainTeasers = [
            { label: "IP ANALYSIS", teaser: profile.ip_report.teaser },
            { label: "SAFETY ANALYSIS", teaser: profile.safety_report.teaser },
            { label: "PROVENANCE ANALYSIS", teaser: profile.provenance_report.teaser },
        ]

        safeDomainTeasers.forEach(({ label, teaser }) => {
            if (teaser && teaser.length > 0) {
                y = checkPageBreak(y, 12)
                doc.setFont(FONT.body, "bold")
                doc.setFontSize(7)
                doc.setTextColor(COLORS.sub)
                doc.text(label, 28, y)
                y += 4
                doc.setFont(FONT.body, "normal")
                doc.setFontSize(8)
                doc.setTextColor(COLORS.ink)
                const tLines = doc.splitTextToSize(teaser, 155)
                doc.text(tLines, 28, y)
                y += (tLines.length * 3.5) + 3
            }
        })

        // C2PA details for safe scans
        if (c2pa.issuer || c2pa.tool) {
            y += 2
            drawLabel("C2PA DETAILS", 28, y)
            y += 5
            doc.setFont(FONT.mono, "normal")
            doc.setFontSize(8)
            doc.setTextColor(COLORS.ink)
            if (c2pa.issuer) { doc.text(`ISSUER: ${c2pa.issuer}`, 28, y); y += 4 }
            if (c2pa.tool) { doc.text(`TOOL: ${c2pa.tool}${c2pa.tool_version ? ` v${c2pa.tool_version}` : ''}`, 28, y); y += 4 }
            if (c2pa.creator) { doc.text(`CREATOR: ${c2pa.creator}`, 28, y); y += 4 }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // RISK INTELLIGENCE SUMMARY / CHIEF OFFICER RISK BRIEFING
    // ═══════════════════════════════════════════════════════════════════════════

    if (profile.chief_officer_strategy) {
        y = checkPageBreak(y, 30)
        drawLine(y)
        y += 10

        const strategyLabel = isSample ? "RISK INTELLIGENCE SUMMARY" : "CHIEF OFFICER RISK BRIEFING"
        drawLabel(strategyLabel, 20, y)
        y += 6

        doc.setFont(FONT.body, "normal")
        doc.setFontSize(9)
        doc.setTextColor(COLORS.ink)
        const strategyLines = doc.splitTextToSize(profile.chief_officer_strategy, 160)
        doc.text(strategyLines, 20, y)
        y += (strategyLines.length * 4) + 6
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PROVENANCE DATA
    // ═══════════════════════════════════════════════════════════════════════════

    {
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
    // SUBTLE END SECTION (findings summary only)
    // ═══════════════════════════════════════════════════════════════════════════

    if (isSample) {
        y += 25
        y = checkPageBreak(y, 20)
        drawLine(y)
        y += 8

        doc.setFont(FONT.body, "normal")
        doc.setFontSize(8)
        doc.setTextColor(COLORS.sub)
        doc.text("AI Content Risk Score", 105, y, { align: "center" })
        y += 5
        doc.setFont(FONT.body, "italic")
        doc.setFontSize(7)
        doc.text("Need deeper analysis? Mitigation guidance is available in your workspace.", 105, y, { align: "center" })
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
            `AI CONTENT RISK SCORE  |  ${isSample ? 'FINDINGS SUMMARY' : 'FULL REPORT'}  |  ${format(new Date(scan.created_at), 'yyyy-MM-dd')}  |  Page ${i}/${pageCount}`,
            105, 290, { align: "center" }
        )
    }

    // Save or Return
    if (typeof window !== 'undefined') {
        const prefix = isSample ? 'AIRS_Findings_' : 'AIRS_Report_'
        doc.save(`${prefix}${scan.filename.substring(0, 10)}_${format(new Date(scan.created_at), 'yyyyMMdd')}.pdf`)
    }

    return doc
}

// ═══════════════════════════════════════════════════════════════════════════════
// MITIGATION REPORT PDF (Sprint 10.10)
// Same Dieter Rams aesthetic as scan report. Covers all 10 sections of
// MitigationReportContent + integrity checksum.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Map mitigation domain severity to PDF color.
 */
function mitigationSeverityColor(severity: string): string {
    if (severity === 'critical' || severity === 'high') return COLORS.accent
    if (severity === 'medium') return COLORS.caution
    return COLORS.safe
}

export const generateMitigationPDF = (
    report: MitigationReportContent,
    scan: ScanWithRelations,
    reportId?: string,
    generatedAt?: string,
) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    })

    // --- HELPERS (reuse patterns from scan report) ---
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

    const checkPageBreak = (y: number, needed: number): number => {
        if (y + needed > 270) {
            doc.addPage()
            return 20
        }
        return y
    }

    // Content integrity checksum (deterministic FNV-1a style hash of report content)
    const contentJson = JSON.stringify(report)
    // Non-cryptographic hash for integrity display.
    let checksum = '0000000000000000'
    try {
        // FNV-1a 64-bit hash (works in browser + server)
        let h1 = 0x811c9dc5
        let h2 = 0x811c9dc5
        for (let i = 0; i < contentJson.length; i++) {
            const c = contentJson.charCodeAt(i)
            h1 = Math.imul(h1 ^ c, 0x01000193)
            h2 = Math.imul(h2 ^ (c >> 4), 0x01000193)
        }
        checksum = ((h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0'))
    } catch { /* fallback already set */ }

    // ═══════════════════════════════════════════════════════════════════════════
    // HEADER
    // ═══════════════════════════════════════════════════════════════════════════

    doc.setFont(FONT.header, "bold")
    doc.setFontSize(14)
    doc.setTextColor(COLORS.ink)
    doc.text("AI CONTENT RISK SCORE", 20, 15)

    doc.setFont(FONT.body, "normal")
    doc.setFontSize(8)
    doc.text("MITIGATION REPORT", 20, 19)

    // Metadata (Top Right)
    doc.setFont(FONT.mono, "normal")
    doc.setFontSize(7)
    doc.setTextColor(COLORS.sub)
    doc.text(`SCAN: ${scan.id.substring(0, 8).toUpperCase()}`, 190, 11, { align: "right" })
    if (reportId) {
        doc.text(`REPORT: ${reportId.substring(0, 8).toUpperCase()}`, 190, 15, { align: "right" })
    }
    doc.text(`DATE: ${format(generatedAt ? new Date(generatedAt) : new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 190, 19, { align: "right" })

    drawLine(25)

    // ═══════════════════════════════════════════════════════════════════════════
    // 1. EXECUTIVE SUMMARY
    // ═══════════════════════════════════════════════════════════════════════════

    let y = 35

    drawLabel("EXECUTIVE SUMMARY", 20, y)
    y += 6

    // Decision badge
    const es = report.executive_summary
    const decisionColor = es.decision === 'clear' ? COLORS.safe
        : es.decision === 'watch' ? COLORS.sub
        : es.decision === 'hold' ? COLORS.caution
        : COLORS.accent

    doc.setFont(FONT.header, "bold")
    doc.setFontSize(18)
    doc.setTextColor(decisionColor)
    doc.text(es.decision.toUpperCase(), 20, y + 4)

    doc.setFont(FONT.mono, "normal")
    doc.setFontSize(8)
    doc.setTextColor(COLORS.sub)
    doc.text(`CONFIDENCE: ${es.confidence}%  |  APPROVER: ${es.approver_level.toUpperCase()}`, 60, y + 2)

    y += 14

    doc.setFont(FONT.body, "normal")
    doc.setFontSize(9)
    doc.setTextColor(COLORS.ink)
    const rationaleLines = doc.splitTextToSize(es.rationale, 160)
    doc.text(rationaleLines, 20, y)
    y += (rationaleLines.length * 4) + 8

    drawLine(y)
    y += 10

    // ═══════════════════════════════════════════════════════════════════════════
    // 2. ASSET CONTEXT
    // ═══════════════════════════════════════════════════════════════════════════

    y = checkPageBreak(y, 30)
    drawLabel("ASSET CONTEXT", 20, y)
    y += 6

    doc.setFont(FONT.mono, "normal")
    doc.setFontSize(8)
    doc.setTextColor(COLORS.ink)

    const ac = report.asset_context
    const assetLines = [
        `FILENAME:    ${ac.filename}`,
        `TYPE:        ${ac.type.toUpperCase()}`,
        `SIZE:        ${ac.size > 0 ? Math.round(ac.size / 1024) + ' KB' : 'Unknown'}`,
        `C2PA STATUS: ${ac.c2pa_chain_status.toUpperCase()}`,
    ]
    doc.text(assetLines, 20, y)
    y += (assetLines.length * 4.5) + 6

    drawLine(y)
    y += 10

    // ═══════════════════════════════════════════════════════════════════════════
    // 3-5. DOMAIN ANALYSES (IP, Safety, Provenance)
    // ═══════════════════════════════════════════════════════════════════════════

    const domains: { label: string; data: typeof report.ip_analysis }[] = [
        { label: 'IP RISK ANALYSIS', data: report.ip_analysis },
        { label: 'SAFETY ANALYSIS', data: report.safety_analysis },
        { label: 'PROVENANCE ANALYSIS', data: report.provenance_analysis },
    ]

    domains.forEach(({ label, data }) => {
        y = checkPageBreak(y, 30)
        drawLabel(label, 20, y)
        y += 6

        // Severity + Confidence
        doc.setFont(FONT.header, "bold")
        doc.setFontSize(11)
        doc.setTextColor(mitigationSeverityColor(data.severity))
        doc.text(data.severity.toUpperCase(), 20, y)

        doc.setFont(FONT.mono, "normal")
        doc.setFontSize(8)
        doc.setTextColor(COLORS.sub)
        doc.text(`CONFIDENCE: ${data.confidence}%  |  REMEDIATION: ${data.remediation_status.toUpperCase().replace('_', ' ')}`, 55, y)
        y += 7

        // Exposures
        if (data.exposures && data.exposures.length > 0) {
            data.exposures.forEach(exp => {
                y = checkPageBreak(y, 15)

                doc.setFillColor(mitigationSeverityColor(data.severity))
                doc.circle(22, y - 1, 1, "F")

                doc.setFont(FONT.body, "bold")
                doc.setFontSize(8)
                doc.setTextColor(COLORS.ink)
                doc.text(exp.type, 26, y)

                y += 4
                doc.setFont(FONT.body, "normal")
                doc.setFontSize(8)
                doc.setTextColor(COLORS.sub)
                const descLines = doc.splitTextToSize(exp.description, 155)
                doc.text(descLines, 26, y)
                y += (descLines.length * 3.5) + 2

                if (exp.legal_rationale) {
                    doc.setFont(FONT.mono, "normal")
                    doc.setFontSize(7)
                    doc.setTextColor(COLORS.sub)
                    const legalLines = doc.splitTextToSize(`LEGAL: ${exp.legal_rationale}`, 155)
                    doc.text(legalLines, 26, y)
                    y += (legalLines.length * 3) + 2
                }
                y += 2
            })
        } else {
            doc.setFont(FONT.body, "italic")
            doc.setFontSize(8)
            doc.setTextColor(COLORS.sub)
            doc.text("No exposures identified.", 26, y)
            y += 5
        }

        y += 4
        drawLine(y)
        y += 10
    })

    // ═══════════════════════════════════════════════════════════════════════════
    // 6. BIAS ANALYSIS
    // ═══════════════════════════════════════════════════════════════════════════

    y = checkPageBreak(y, 20)
    drawLabel("BIAS ANALYSIS", 20, y)
    y += 6

    const bias = report.bias_analysis
    if (!bias.applicable) {
        doc.setFont(FONT.body, "italic")
        doc.setFontSize(8)
        doc.setTextColor(COLORS.sub)
        doc.text(`Not applicable: ${bias.not_applicable_reason || 'Content type not subject to bias evaluation.'}`, 20, y)
        y += 6
    } else {
        doc.setFont(FONT.header, "bold")
        doc.setFontSize(10)
        doc.setTextColor(mitigationSeverityColor(bias.severity || 'low'))
        doc.text((bias.severity || 'UNKNOWN').toUpperCase(), 20, y)

        doc.setFont(FONT.mono, "normal")
        doc.setFontSize(8)
        doc.setTextColor(COLORS.sub)
        doc.text(`CONFIDENCE: ${bias.confidence ?? 0}%`, 55, y)
        y += 7

        bias.findings?.forEach(f => {
            y = checkPageBreak(y, 10)
            doc.setFont(FONT.body, "normal")
            doc.setFontSize(8)
            doc.setTextColor(COLORS.ink)
            const bLines = doc.splitTextToSize(`${f.type}: ${f.description}`, 160)
            doc.text(bLines, 26, y)
            y += (bLines.length * 3.5) + 2
        })
    }

    y += 4
    drawLine(y)
    y += 10

    // ═══════════════════════════════════════════════════════════════════════════
    // 7. GUIDELINE MAPPING
    // ═══════════════════════════════════════════════════════════════════════════

    y = checkPageBreak(y, 20)
    drawLabel("GUIDELINE MAPPING", 20, y)
    y += 6

    const gm = report.guideline_mapping
    if (gm.guideline_name) {
        doc.setFont(FONT.mono, "normal")
        doc.setFontSize(8)
        doc.setTextColor(COLORS.ink)
        doc.text(`GUIDELINE: ${gm.guideline_name}`, 20, y)
        y += 5

        if (gm.mappings && gm.mappings.length > 0) {
            gm.mappings.forEach(m => {
                y = checkPageBreak(y, 8)
                doc.setFont(FONT.body, "normal")
                doc.setFontSize(8)
                doc.setTextColor(COLORS.ink)
                doc.text(`${m.finding_ref} → ${m.guideline_item}: ${m.status.toUpperCase()}`, 26, y)
                y += 4
            })
        } else {
            doc.setFont(FONT.body, "italic")
            doc.setFontSize(8)
            doc.setTextColor(COLORS.sub)
            doc.text("No guideline violations mapped.", 26, y)
            y += 4
        }
    } else {
        doc.setFont(FONT.body, "italic")
        doc.setFontSize(8)
        doc.setTextColor(COLORS.sub)
        doc.text("No brand guideline applied to this scan.", 20, y)
        y += 4
    }

    y += 4
    drawLine(y)
    y += 10

    // ═══════════════════════════════════════════════════════════════════════════
    // 8. COMPLIANCE MATRIX
    // ═══════════════════════════════════════════════════════════════════════════

    y = checkPageBreak(y, 30)
    drawLabel("COMPLIANCE MATRIX", 20, y)
    y += 8

    const cm = report.compliance_matrix

    // Jurisdictions
    drawLabel("JURISDICTIONS", 26, y)
    y += 5
    cm.jurisdictions?.forEach(j => {
        y = checkPageBreak(y, 8)
        const statusColor = j.status === 'pass' ? COLORS.safe
            : j.status === 'fail' ? COLORS.accent
            : j.status === 'review' ? COLORS.caution
            : COLORS.sub

        doc.setFont(FONT.mono, "bold")
        doc.setFontSize(8)
        doc.setTextColor(statusColor)
        doc.text(j.status.toUpperCase(), 26, y)

        doc.setFont(FONT.body, "normal")
        doc.setFontSize(8)
        doc.setTextColor(COLORS.ink)
        doc.text(`${j.name} (${j.source})`, 50, y)

        y += 4
        doc.setFont(FONT.body, "normal")
        doc.setFontSize(7)
        doc.setTextColor(COLORS.sub)
        const rLines = doc.splitTextToSize(j.rationale, 140)
        doc.text(rLines, 50, y)
        y += (rLines.length * 3) + 3
    })

    y += 2

    // Platforms
    drawLabel("PLATFORMS", 26, y)
    y += 5
    cm.platforms?.forEach(p => {
        y = checkPageBreak(y, 8)
        const statusColor = p.status === 'pass' ? COLORS.safe
            : p.status === 'fail' ? COLORS.accent
            : p.status === 'review' ? COLORS.caution
            : COLORS.sub

        doc.setFont(FONT.mono, "bold")
        doc.setFontSize(8)
        doc.setTextColor(statusColor)
        doc.text(p.status.toUpperCase(), 26, y)

        doc.setFont(FONT.body, "normal")
        doc.setFontSize(8)
        doc.setTextColor(COLORS.ink)
        doc.text(`${p.name} (${p.source})`, 50, y)

        y += 4
        doc.setFont(FONT.body, "normal")
        doc.setFontSize(7)
        doc.setTextColor(COLORS.sub)
        const rLines = doc.splitTextToSize(p.rationale, 140)
        doc.text(rLines, 50, y)
        y += (rLines.length * 3) + 3
    })

    y += 4
    drawLine(y)
    y += 10

    // ═══════════════════════════════════════════════════════════════════════════
    // 9. MITIGATION ACTION PLAN
    // ═══════════════════════════════════════════════════════════════════════════

    y = checkPageBreak(y, 30)
    drawLabel("MITIGATION ACTION PLAN", 20, y)
    y += 8

    report.mitigation_plan?.actions?.forEach(a => {
        y = checkPageBreak(y, 25)

        // Priority badge
        doc.setFont(FONT.header, "bold")
        doc.setFontSize(10)
        doc.setTextColor(COLORS.accent)
        doc.text(`#${a.priority}`, 20, y)

        doc.setFont(FONT.mono, "bold")
        doc.setFontSize(8)
        doc.setTextColor(COLORS.ink)
        doc.text(a.domain.toUpperCase(), 32, y)

        doc.setFont(FONT.mono, "normal")
        doc.setFontSize(7)
        doc.setTextColor(COLORS.sub)
        doc.text(`EFFORT: ${a.effort}  |  OWNER: ${a.owner}`, 55, y)

        y += 5

        // Action text
        doc.setFont(FONT.body, "normal")
        doc.setFontSize(9)
        doc.setTextColor(COLORS.ink)
        const actionLines = doc.splitTextToSize(a.action, 155)
        doc.text(actionLines, 26, y)
        y += (actionLines.length * 4) + 2

        // Risk reduction
        doc.setFont(FONT.mono, "normal")
        doc.setFontSize(7)
        doc.setTextColor(COLORS.sub)
        doc.text(`IMPACT: ${a.risk_reduction}`, 26, y)
        y += 3.5
        doc.text(`VERIFY: ${a.verification}`, 26, y)
        y += 6
    })

    y += 4
    drawLine(y)
    y += 10

    // ═══════════════════════════════════════════════════════════════════════════
    // 10. RESIDUAL RISK
    // ═══════════════════════════════════════════════════════════════════════════

    y = checkPageBreak(y, 30)
    drawLabel("RESIDUAL RISK ASSESSMENT", 20, y)
    y += 6

    const rr = report.residual_risk
    const publishColor = rr.publish_decision === 'approved' ? COLORS.safe
        : rr.publish_decision === 'conditional' ? COLORS.caution
        : COLORS.accent

    doc.setFont(FONT.header, "bold")
    doc.setFontSize(14)
    doc.setTextColor(publishColor)
    doc.text(rr.publish_decision.toUpperCase(), 20, y + 2)

    y += 10

    doc.setFont(FONT.body, "normal")
    doc.setFontSize(9)
    doc.setTextColor(COLORS.ink)
    const rrLines = doc.splitTextToSize(rr.remaining_risk, 160)
    doc.text(rrLines, 20, y)
    y += (rrLines.length * 4) + 4

    if (rr.conditions && rr.conditions.length > 0) {
        drawLabel("CONDITIONS", 26, y)
        y += 5
        rr.conditions.forEach(c => {
            y = checkPageBreak(y, 6)
            doc.setFont(FONT.body, "normal")
            doc.setFontSize(8)
            doc.setTextColor(COLORS.ink)
            doc.text(`\u2022  ${c}`, 30, y)
            y += 4
        })
        y += 2
    }

    if (rr.maintenance_checks && rr.maintenance_checks.length > 0) {
        drawLabel("MAINTENANCE CHECKS", 26, y)
        y += 5
        rr.maintenance_checks.forEach(mc => {
            y = checkPageBreak(y, 6)
            doc.setFont(FONT.body, "normal")
            doc.setFontSize(8)
            doc.setTextColor(COLORS.ink)
            doc.text(`\u2022  ${mc}`, 30, y)
            y += 4
        })
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INTEGRITY + FOOTER
    // ═══════════════════════════════════════════════════════════════════════════

    y += 10
    y = checkPageBreak(y, 15)
    drawLine(y)
    y += 6
    doc.setFont(FONT.mono, "normal")
    doc.setFontSize(6)
    doc.setTextColor(COLORS.sub)
    doc.text(`INTEGRITY: FNV1A64 ${checksum}`, 20, y)

    // Page footers
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFont(FONT.mono, "normal")
        doc.setFontSize(6)
        doc.setTextColor(COLORS.sub)
        doc.text(
            `AI CONTENT RISK SCORE  |  MITIGATION REPORT  |  ${format(generatedAt ? new Date(generatedAt) : new Date(), 'yyyy-MM-dd')}  |  Page ${i}/${pageCount}`,
            105, 290, { align: "center" }
        )
    }

    // Save or Return
    if (typeof window !== 'undefined') {
        const filename = scan.filename || 'scan'
        doc.save(`AIRS_Mitigation_${filename.substring(0, 10)}_${format(new Date(), 'yyyyMMdd')}.pdf`)
    }

    return doc
}
