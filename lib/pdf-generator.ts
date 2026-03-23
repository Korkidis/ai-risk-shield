import jsPDF from 'jspdf'
import { RiskProfile, formatChiefStrategy } from './gemini-types'
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

        const strategyLabel = isSample ? "RISK INTELLIGENCE SUMMARY" : "CONTENT STRATEGY ADVISORY"
        drawLabel(strategyLabel, 20, y)
        y += 6

        doc.setFont(FONT.body, "normal")
        doc.setFontSize(9)
        doc.setTextColor(COLORS.ink)
        const strategyText = formatChiefStrategy(profile.chief_officer_strategy)
        const strategyLines = doc.splitTextToSize(strategyText, 160)
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
// ADVISORY REPORT PDF (v3.0)
// Multi-page premium layout. Dieter Rams aesthetic. Advisory vocabulary.
// Designed to feel like a $29 professional document with breathing room.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Normalize domain analysis from old (v2: severity/exposures/remediation_status)
 * or new (v3: signal_strength/observations/action_suggested) format.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic JSONB shape varies by generator version
function normalizeDomainForPDF(d: any): MitigationReportContent['ip_analysis'] {
    if (!d) return { signal_strength: 'none', confidence: 0, observations: [], action_suggested: false }
    return {
        signal_strength: d.signal_strength || d.severity || 'none',
        confidence: d.confidence || 0,
        observations: (d.observations || d.exposures || []).map((o: Record<string, unknown>) => ({
            type: o.type || '',
            description: o.description || '',
            evidence_ref: o.evidence_ref || '',
            context: o.context || o.legal_rationale || '',
        })),
        action_suggested: typeof d.action_suggested === 'boolean' ? d.action_suggested : d.remediation_status === 'required',
    }
}

/**
 * Map domain signal strength to PDF color.
 */
function signalStrengthColor(strength: string): string {
    if (strength === 'strong' || strength === 'significant') return COLORS.accent
    if (strength === 'moderate') return COLORS.caution
    return COLORS.safe
}

export const generateMitigationPDF = (
    reportInput: MitigationReportContent,
    scan: ScanWithRelations,
    reportId?: string,
    generatedAt?: string,
) => {
    // Normalize old (v2) and new (v3) report schemas for backward compat
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic JSONB from Supabase, shape varies by generator version
    const raw = reportInput as any
    const report: MitigationReportContent = {
        ...reportInput,
        // Explainability may not exist on old reports
        explainability: raw.explainability || {
            summary: 'This asset was analyzed across intellectual property, brand safety, and provenance dimensions.',
            ip_methodology: 'Visual comparison against known protected works.',
            safety_methodology: 'Evaluation against platform policies and brand safety standards.',
            provenance_methodology: 'C2PA credential verification and chain of custody analysis.',
            score_explanation: '',
        },
        // Executive summary field renames
        executive_summary: {
            recommendation: raw.executive_summary?.recommendation || raw.executive_summary?.decision || 'review',
            confidence: raw.executive_summary?.confidence || 0,
            rationale: raw.executive_summary?.rationale || '',
            disclaimer: raw.executive_summary?.disclaimer || '',
        },
        // Domain analysis normalization
        ip_analysis: normalizeDomainForPDF(raw.ip_analysis),
        safety_analysis: normalizeDomainForPDF(raw.safety_analysis),
        provenance_analysis: normalizeDomainForPDF(raw.provenance_analysis),
        // Recommendations may be in old mitigation_plan field
        recommendations: raw.recommendations || {
            actions: (raw.mitigation_plan?.actions || []).map((a: Record<string, unknown>) => ({
                ...a,
                impact: a.impact || a.risk_reduction || '',
                alternatives: a.alternatives || a.safer_alternatives || [],
            })),
        },
        // Outlook may be in old residual_risk field
        outlook: raw.outlook || {
            summary: raw.residual_risk?.remaining_risk || '',
            readiness: raw.residual_risk?.publish_decision === 'approved' ? 'ready' as const
                : raw.residual_risk?.publish_decision === 'blocked' ? 'needs_attention' as const
                : 'conditional' as const,
            conditions: raw.residual_risk?.conditions || [],
            next_steps: raw.residual_risk?.maintenance_checks || [],
        },
    }
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    })

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

    const checkPageBreak = (y: number, needed: number): number => {
        if (y + needed > 265) {
            doc.addPage()
            return 25
        }
        return y
    }

    // Content integrity checksum
    const contentJson = JSON.stringify(report)
    let checksum = '0000000000000000'
    try {
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
    // PAGE 1: COVER + EXECUTIVE SUMMARY
    // ═══════════════════════════════════════════════════════════════════════════

    // Brand header
    doc.setFont(FONT.header, "bold")
    doc.setFontSize(18)
    doc.setTextColor(COLORS.ink)
    doc.text("AI CONTENT RISK SCORE", 20, 25)

    doc.setFont(FONT.body, "normal")
    doc.setFontSize(10)
    doc.setTextColor(COLORS.sub)
    doc.text("Content Advisory Report", 20, 32)

    // Metadata block
    doc.setFont(FONT.mono, "normal")
    doc.setFontSize(7)
    doc.setTextColor(COLORS.sub)
    doc.text(`SCAN: ${scan.id.substring(0, 8).toUpperCase()}`, 190, 20, { align: "right" })
    if (reportId) {
        doc.text(`REPORT: ${reportId.substring(0, 8).toUpperCase()}`, 190, 24, { align: "right" })
    }
    doc.text(`DATE: ${format(generatedAt ? new Date(generatedAt) : new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 190, 28, { align: "right" })

    drawLine(38)

    // Asset context — compact
    let y = 48
    const ac = report.asset_context
    drawLabel("ASSET", 20, y)
    doc.setFont(FONT.mono, "normal")
    doc.setFontSize(8)
    doc.setTextColor(COLORS.ink)
    doc.text(`${ac.filename}  |  ${ac.type.toUpperCase()}  |  ${ac.size > 0 ? Math.round(ac.size / 1024) + ' KB' : 'Unknown'}  |  C2PA: ${ac.c2pa_chain_status.toUpperCase()}`, 48, y)

    y += 12
    drawLine(y)
    y += 12

    // Recommendation badge (large, prominent)
    const es = report.executive_summary
    const rec = es.recommendation as string // may contain old enum values from legacy reports
    const recColor = (rec === 'proceed' || rec === 'clear') ? COLORS.safe
        : (rec === 'monitor' || rec === 'watch') ? COLORS.sub
        : COLORS.caution
    // Descriptive labels — never directives
    const recDisplay = (rec === 'proceed' || rec === 'clear') ? 'LOW RISK'
        : (rec === 'monitor' || rec === 'watch') ? 'WORTH MONITORING'
        : (rec === 'escalate' || rec === 'block') ? 'NEEDS ATTENTION'
        : 'WORTH REVIEWING'

    drawLabel("ASSESSMENT", 20, y)
    y += 8

    doc.setFont(FONT.header, "bold")
    doc.setFontSize(22)
    doc.setTextColor(recColor)
    doc.text(recDisplay, 20, y)

    doc.setFont(FONT.mono, "normal")
    doc.setFontSize(8)
    doc.setTextColor(COLORS.sub)
    doc.text(`CONFIDENCE: ${es.confidence}%`, 90, y - 2)

    y += 10

    doc.setFont(FONT.body, "normal")
    doc.setFontSize(10)
    doc.setTextColor(COLORS.ink)
    const rationaleLines = doc.splitTextToSize(es.rationale, 160)
    doc.text(rationaleLines, 20, y)
    y += (rationaleLines.length * 4.5) + 8

    // Disclaimer
    if (es.disclaimer) {
        doc.setFont(FONT.body, "italic")
        doc.setFontSize(7)
        doc.setTextColor(COLORS.sub)
        const disclaimerLines = doc.splitTextToSize(es.disclaimer, 160)
        doc.text(disclaimerLines, 20, y)
        y += (disclaimerLines.length * 3) + 6
    }

    drawLine(y)
    y += 12

    // ═══════════════════════════════════════════════════════════════════════════
    // EXPLAINABILITY — How We Analyzed
    // ═══════════════════════════════════════════════════════════════════════════

    if (report.explainability) {
        y = checkPageBreak(y, 60)
        drawLabel("HOW WE ANALYZED THIS CONTENT", 20, y)
        y += 8

        doc.setFont(FONT.body, "normal")
        doc.setFontSize(9)
        doc.setTextColor(COLORS.ink)
        const summaryLines = doc.splitTextToSize(report.explainability.summary, 160)
        doc.text(summaryLines, 20, y)
        y += (summaryLines.length * 4) + 6

        // Methodology breakdown
        const methodologies = [
            { label: 'IP ANALYSIS', text: report.explainability.ip_methodology },
            { label: 'SAFETY ANALYSIS', text: report.explainability.safety_methodology },
            { label: 'PROVENANCE ANALYSIS', text: report.explainability.provenance_methodology },
        ]

        methodologies.forEach(({ label, text }) => {
            y = checkPageBreak(y, 15)
            doc.setFont(FONT.body, "bold")
            doc.setFontSize(7)
            doc.setTextColor(COLORS.sub)
            doc.text(label, 26, y)
            y += 4
            doc.setFont(FONT.body, "normal")
            doc.setFontSize(8)
            doc.setTextColor(COLORS.ink)
            const mLines = doc.splitTextToSize(text, 155)
            doc.text(mLines, 26, y)
            y += (mLines.length * 3.5) + 5
        })

        // Score explanation
        y = checkPageBreak(y, 15)
        drawLabel("YOUR SCORE", 26, y)
        y += 5
        doc.setFont(FONT.body, "normal")
        doc.setFontSize(9)
        doc.setTextColor(COLORS.ink)
        const scoreLines = doc.splitTextToSize(report.explainability.score_explanation, 155)
        doc.text(scoreLines, 26, y)
        y += (scoreLines.length * 4) + 8

        drawLine(y)
        y += 12
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DOMAIN ANALYSES — always start on a fresh area
    // ═══════════════════════════════════════════════════════════════════════════

    const domains: { label: string; data: typeof report.ip_analysis }[] = [
        { label: 'INTELLECTUAL PROPERTY', data: report.ip_analysis },
        { label: 'BRAND SAFETY', data: report.safety_analysis },
        { label: 'PROVENANCE & AUTHENTICITY', data: report.provenance_analysis },
    ]

    domains.forEach(({ label, data }) => {
        y = checkPageBreak(y, 40)
        drawLabel(label, 20, y)
        y += 7

        // Signal strength + confidence
        const strengthColor = signalStrengthColor(data.signal_strength)
        doc.setFont(FONT.header, "bold")
        doc.setFontSize(12)
        doc.setTextColor(strengthColor)
        doc.text(data.signal_strength.toUpperCase(), 20, y)

        doc.setFont(FONT.mono, "normal")
        doc.setFontSize(8)
        doc.setTextColor(COLORS.sub)
        const statusText = data.action_suggested ? 'Action Suggested' : 'No Action Needed'
        doc.text(`CONFIDENCE: ${data.confidence}%  |  ${statusText.toUpperCase()}`, 65, y)
        y += 9

        // Observations
        if (data.observations && data.observations.length > 0) {
            data.observations.forEach(obs => {
                y = checkPageBreak(y, 18)

                doc.setFillColor(strengthColor)
                doc.circle(22, y - 1, 1, "F")

                doc.setFont(FONT.body, "bold")
                doc.setFontSize(9)
                doc.setTextColor(COLORS.ink)
                doc.text(obs.type, 26, y)

                y += 4.5
                doc.setFont(FONT.body, "normal")
                doc.setFontSize(8.5)
                doc.setTextColor(COLORS.ink)
                const descLines = doc.splitTextToSize(obs.description, 155)
                doc.text(descLines, 26, y)
                y += (descLines.length * 3.8) + 2

                if (obs.context) {
                    doc.setFont(FONT.body, "italic")
                    doc.setFontSize(7.5)
                    doc.setTextColor(COLORS.sub)
                    const ctxLines = doc.splitTextToSize(obs.context, 155)
                    doc.text(ctxLines, 26, y)
                    y += (ctxLines.length * 3.2) + 2
                }
                y += 3
            })
        } else {
            doc.setFont(FONT.body, "italic")
            doc.setFontSize(8)
            doc.setTextColor(COLORS.sub)
            doc.text("No observations for this domain.", 26, y)
            y += 6
        }

        y += 5
        drawLine(y)
        y += 12
    })

    // ═══════════════════════════════════════════════════════════════════════════
    // BIAS ANALYSIS
    // ═══════════════════════════════════════════════════════════════════════════

    y = checkPageBreak(y, 25)
    drawLabel("BIAS ANALYSIS", 20, y)
    y += 6

    const bias = report.bias_analysis
    if (!bias.applicable) {
        doc.setFont(FONT.body, "italic")
        doc.setFontSize(8)
        doc.setTextColor(COLORS.sub)
        doc.text(`Not applicable: ${bias.not_applicable_reason || 'Content type not subject to bias evaluation.'}`, 20, y)
        y += 8
    } else {
        doc.setFont(FONT.header, "bold")
        doc.setFontSize(10)
        doc.setTextColor(signalStrengthColor(bias.severity || 'low'))
        doc.text((bias.severity || 'NONE').toUpperCase(), 20, y)

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
            y += (bLines.length * 3.5) + 3
        })
    }

    y += 4
    drawLine(y)
    y += 12

    // ═══════════════════════════════════════════════════════════════════════════
    // GUIDELINE MAPPING
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
        y += 6

        if (gm.mappings && gm.mappings.length > 0) {
            gm.mappings.forEach(m => {
                y = checkPageBreak(y, 8)
                doc.setFont(FONT.body, "normal")
                doc.setFontSize(8)
                doc.setTextColor(COLORS.ink)
                doc.text(`${m.finding_ref} \u2192 ${m.guideline_item}: ${m.status.toUpperCase()}`, 26, y)
                y += 5
            })
        } else {
            doc.setFont(FONT.body, "italic")
            doc.setFontSize(8)
            doc.setTextColor(COLORS.sub)
            doc.text("No guideline issues mapped.", 26, y)
            y += 5
        }
    } else {
        doc.setFont(FONT.body, "italic")
        doc.setFontSize(8)
        doc.setTextColor(COLORS.sub)
        doc.text("No brand guideline applied to this scan.", 20, y)
        y += 5
    }

    y += 4
    drawLine(y)
    y += 12

    // ═══════════════════════════════════════════════════════════════════════════
    // COMPLIANCE MATRIX
    // ═══════════════════════════════════════════════════════════════════════════

    y = checkPageBreak(y, 30)
    drawLabel("COMPLIANCE LANDSCAPE", 20, y)
    y += 8

    const cm = report.compliance_matrix

    // Jurisdictions
    if (cm.jurisdictions?.length > 0) {
        drawLabel("JURISDICTIONS", 26, y)
        y += 5
        cm.jurisdictions.forEach(j => {
            y = checkPageBreak(y, 12)
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
            y += (rLines.length * 3) + 4
        })
        y += 3
    }

    // Platforms
    if (cm.platforms?.length > 0) {
        drawLabel("PLATFORMS", 26, y)
        y += 5
        cm.platforms.forEach(p => {
            y = checkPageBreak(y, 12)
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
            y += (rLines.length * 3) + 4
        })
    }

    y += 4
    drawLine(y)
    y += 12

    // ═══════════════════════════════════════════════════════════════════════════
    // RECOMMENDATIONS
    // ═══════════════════════════════════════════════════════════════════════════

    y = checkPageBreak(y, 35)
    drawLabel("RECOMMENDATIONS", 20, y)
    y += 8

    report.recommendations?.actions?.forEach(a => {
        y = checkPageBreak(y, 30)

        // Priority badge
        doc.setFont(FONT.header, "bold")
        doc.setFontSize(11)
        doc.setTextColor(COLORS.accent)
        doc.text(`${a.priority}`, 22, y)

        doc.setFont(FONT.mono, "bold")
        doc.setFontSize(8)
        doc.setTextColor(COLORS.ink)
        doc.text(a.domain.toUpperCase(), 30, y)

        doc.setFont(FONT.mono, "normal")
        doc.setFontSize(7)
        doc.setTextColor(COLORS.sub)
        doc.text(`${a.effort}  |  ${a.owner}`, 65, y)

        y += 6

        // Action text (larger for readability)
        doc.setFont(FONT.body, "normal")
        doc.setFontSize(9)
        doc.setTextColor(COLORS.ink)
        const actionLines = doc.splitTextToSize(a.action, 155)
        doc.text(actionLines, 26, y)
        y += (actionLines.length * 4) + 3

        // Impact + verification
        doc.setFont(FONT.mono, "normal")
        doc.setFontSize(7)
        doc.setTextColor(COLORS.sub)
        doc.text(`IMPACT: ${a.impact}`, 26, y)
        y += 3.5
        doc.text(`VERIFY: ${a.verification}`, 26, y)
        y += 3.5

        // Alternatives
        if (a.alternatives && a.alternatives.length > 0) {
            doc.text(`ALTERNATIVES: ${a.alternatives.join(' | ')}`, 26, y)
            y += 3.5
        }

        y += 6
    })

    y += 2
    drawLine(y)
    y += 12

    // ═══════════════════════════════════════════════════════════════════════════
    // OUTLOOK
    // ═══════════════════════════════════════════════════════════════════════════

    y = checkPageBreak(y, 35)
    drawLabel("OUTLOOK", 20, y)
    y += 7

    const ol = report.outlook
    const readinessColor = ol.readiness === 'ready' ? COLORS.safe
        : ol.readiness === 'conditional' ? COLORS.caution
        : COLORS.caution
    const readinessDisplay = ol.readiness === 'ready' ? 'READY TO PUBLISH'
        : ol.readiness === 'conditional' ? 'SOME ITEMS TO CONSIDER'
        : 'WORTH REVIEWING'

    doc.setFont(FONT.header, "bold")
    doc.setFontSize(14)
    doc.setTextColor(readinessColor)
    doc.text(readinessDisplay, 20, y)

    y += 8

    doc.setFont(FONT.body, "normal")
    doc.setFontSize(9)
    doc.setTextColor(COLORS.ink)
    const olLines = doc.splitTextToSize(ol.summary, 160)
    doc.text(olLines, 20, y)
    y += (olLines.length * 4) + 5

    if (ol.conditions && ol.conditions.length > 0) {
        drawLabel("CONDITIONS", 26, y)
        y += 5
        ol.conditions.forEach(c => {
            y = checkPageBreak(y, 6)
            doc.setFont(FONT.body, "normal")
            doc.setFontSize(8)
            doc.setTextColor(COLORS.ink)
            doc.text(`\u2022  ${c}`, 30, y)
            y += 5
        })
        y += 2
    }

    if (ol.next_steps && ol.next_steps.length > 0) {
        drawLabel("NEXT STEPS", 26, y)
        y += 5
        ol.next_steps.forEach(ns => {
            y = checkPageBreak(y, 6)
            doc.setFont(FONT.body, "normal")
            doc.setFontSize(8)
            doc.setTextColor(COLORS.ink)
            doc.text(`\u2022  ${ns}`, 30, y)
            y += 5
        })
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INTEGRITY + FOOTER
    // ═══════════════════════════════════════════════════════════════════════════

    y += 12
    y = checkPageBreak(y, 15)
    drawLine(y)
    y += 6
    doc.setFont(FONT.mono, "normal")
    doc.setFontSize(6)
    doc.setTextColor(COLORS.sub)
    doc.text(`INTEGRITY: FNV1A64 ${checksum}`, 20, y)

    // Page footers on all pages
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFont(FONT.mono, "normal")
        doc.setFontSize(6)
        doc.setTextColor(COLORS.sub)
        doc.text(
            `AI CONTENT RISK SCORE  |  ADVISORY REPORT  |  ${format(generatedAt ? new Date(generatedAt) : new Date(), 'yyyy-MM-dd')}  |  Page ${i}/${pageCount}`,
            105, 290, { align: "center" }
        )
    }

    // Save or Return
    if (typeof window !== 'undefined') {
        const filename = scan.filename || 'scan'
        doc.save(`AIRS_Advisory_${filename.substring(0, 10)}_${format(new Date(), 'yyyyMMdd')}.pdf`)
    }

    return doc
}
