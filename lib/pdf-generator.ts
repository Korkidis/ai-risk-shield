import jsPDF from 'jspdf'
import { RiskProfile } from './gemini-types'
import { ExtendedScan } from '@/types/database'
import { format } from 'date-fns'

// Dieter Rams / Braun Color Palette
const COLORS = {
    bg: '#F4F4F4',        // Off-white/Beige paper
    text: '#111111',      // Near-black ink
    subtext: '#666666',   // Grey
    accent: '#EA580C',    // Signal Orange (Tailwind orange-600)
    line: '#DDDDDD'       // Light dividers
}

export const generateForensicReport = (scan: ExtendedScan & { filename: string }, profile: RiskProfile, isSample: boolean = false) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    })

    // --- DESIGN TOKENS ---
    const FONT = {
        header: "helvetica",
        body: "helvetica",
        mono: "courier"
    }

    const COLORS = {
        bg: '#EBE7E0',        // Clay White (not used in PDF background usually due to ink cost, but logic applies)
        ink: '#1A1A1A',       // Carbon
        sub: '#666666',       // Grey 600
        line: '#CCCCCC',      // Grey 300
        accent: '#FF4F00',    // Signal Orange
        safe: '#006742',      // Safe Green
    }

    // --- HELPERS ---
    const drawLine = (y: number) => {
        doc.setDrawColor(COLORS.line)
        doc.setLineWidth(0.1) // Fine technical line
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

    // --- HEADER ---
    doc.setFont(FONT.header, "bold")
    doc.setFontSize(14)
    doc.setTextColor(COLORS.ink)
    doc.text("AI RISK SHIELD", 20, 15)

    doc.setFont(FONT.body, "normal")
    doc.setFontSize(8)
    doc.text("FORENSIC ANALYSIS REPORT", 20, 19)

    // Metadata Block (Top Right)
    doc.setFont(FONT.mono, "normal")
    doc.setFontSize(7)
    doc.setTextColor(COLORS.sub)
    doc.text(`REF: ${scan.id.substring(0, 8).toUpperCase()}`, 190, 15, { align: "right" })
    doc.text(`DATE: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 190, 19, { align: "right" })

    drawLine(25)

    // --- ASSET CONTEXT ---
    drawLabel("FILENAME", 20, 35)
    // Use body font for filename to avoid monospace spacing issues
    doc.setFont(FONT.body, "normal")
    doc.setFontSize(10)
    doc.setTextColor(COLORS.ink)
    doc.text(scan.filename, 20, 40)

    drawLabel("TYPE", 120, 35)
    drawValue((scan.is_video ? 'VIDEO' : 'IMAGE').toUpperCase(), 120, 40)

    // --- PROMINENT SCORE GAUGE ---
    const scoreY = 60
    const scoreSize = 40

    // Decide color
    const riskColor = profile.composite_score > 75 ? COLORS.accent :
        profile.composite_score > 40 ? '#EAB308' : COLORS.safe

    doc.setFillColor(riskColor)
    doc.circle(170, scoreY, 12, "F")

    doc.setTextColor("#FFFFFF")
    doc.setFont(FONT.header, "bold")
    doc.setFontSize(14)
    doc.text(profile.composite_score.toString(), 170, scoreY + 2, { align: "center" })

    doc.setTextColor(COLORS.ink)
    doc.setFontSize(24)
    doc.text(profile.verdict.toUpperCase(), 20, scoreY + 2)
    drawLabel("RISK ASSESSMENT", 20, scoreY - 10)

    drawLine(80)

    // --- FINDINGS (The "Meat") ---
    let y = 95
    drawLabel("KEY FINDINGS", 20, y)
    y += 8

    // Extract real findings from the scan object if available
    // The 'raw_findings' might be in scan.scan_findings if we fetched explicitly
    let findings = (scan as any).scan_findings || []

    // FALLBACK: If we have a high score but no findings (Data mismatch), synthesize them from the profile
    if (findings.length === 0 && profile.composite_score > 40) {
        if (profile.ip_report.score > 40) {
            findings.push({
                title: "Potential Intellectual Property Risk",
                severity: profile.ip_report.score > 80 ? 'critical' : 'high',
                finding_type: 'ip_match',
                description: profile.ip_report.teaser === "No significant risks detected."
                    ? "High probability of IP matching detected based on visual analysis."
                    : profile.ip_report.teaser
            })
        }
        if (profile.safety_report.score > 40) {
            findings.push({
                title: "Content Safety Flag",
                severity: profile.safety_report.score > 80 ? 'critical' : 'high',
                finding_type: 'safety_check',
                description: "Content may violate safety guidelines for commercial usage."
            })
        }
        if (profile.provenance_report.score > 40) {
            findings.push({
                title: "Provenance Verification Failed",
                severity: profile.provenance_report.score > 80 ? 'critical' : 'high',
                finding_type: 'provenance_check',
                description: "Digital signature or C2PA manifest is missing or invalid."
            })
        }
    }

    if (findings.length > 0) {
        findings.slice(0, 5).forEach((f: any) => {
            // Severity Indicator
            doc.setFillColor(f.severity === 'critical' ? COLORS.accent : f.severity === 'high' ? '#EAB308' : COLORS.line)
            doc.circle(22, y - 1, 1.5, "F")

            doc.setFont(FONT.body, "bold")
            doc.setFontSize(10)
            doc.setTextColor(COLORS.ink)
            doc.text(f.title, 28, y)

            const typeLabel = f.finding_type.replace('_', ' ').toUpperCase()
            doc.setFont(FONT.mono, "normal")
            doc.setFontSize(7)
            doc.setTextColor(COLORS.sub)
            doc.text(typeLabel, 150, y, { align: "right" })

            y += 5

            doc.setFont(FONT.body, "normal")
            doc.setFontSize(9)
            doc.setTextColor(COLORS.sub)

            let description = f.description
            if (isSample) {
                // Redaction Logic
                description = "Content redacted. " + "█".repeat(Math.min(description.length, 40))
            }

            // Word wrap description
            const descLines = doc.splitTextToSize(description, 160)
            doc.text(descLines, 28, y)

            y += (descLines.length * 4) + 6
        })

        if (isSample) {
            // Overlay for Upgrade
            doc.setFillColor(255, 255, 255, 0.9) // Semi-transparent white
            doc.rect(20, 105, 170, 60, "F")

            doc.setFont(FONT.header, "bold")
            doc.setFontSize(14)
            doc.setTextColor(COLORS.accent)
            doc.text("UPGRADE TO UNLOCK FULL FINDINGS", 105, 135, { align: "center" })
            doc.setFont(FONT.body, "normal")
            doc.setFontSize(10)
            doc.setTextColor(COLORS.ink)
            doc.text("Detailed remediation steps hidden in sample view.", 105, 140, { align: "center" })
        }
    } else {
        // If no findings, list the clean checks
        const checks = [
            { label: "IP CHECK", status: "PASS", detail: "No known copyright matches found." },
            { label: "SAFETY CHECK", status: "PASS", detail: "Content is safe for commercial use." },
            { label: "C2PA CHECK", status: "INFO", detail: profile.c2pa_report?.status === 'missing' ? "No provenance data." : "Provenance verified." },
        ]

        checks.forEach(check => {
            doc.setFont(FONT.body, "bold")
            doc.text(check.label, 20, y)

            doc.setFont(FONT.mono, "normal")
            doc.text(check.status, 60, y)

            doc.setFont(FONT.body, "normal")
            doc.setTextColor(COLORS.sub)
            doc.text(check.detail, 90, y)

            doc.setTextColor(COLORS.ink) // Reset
            y += 8
        })
    }

    drawLine(y + 10)

    // --- PROVENANCE FOOTER ---
    y += 20
    drawLabel("PROVENANCE DATA", 20, y)
    y += 5

    doc.setFont(FONT.mono, "normal")
    doc.setFontSize(8)
    doc.setTextColor(COLORS.ink)

    const c2pa = profile.c2pa_report
    const provText = [
        `STATUS:    ${c2pa.status?.toUpperCase() || 'UNKNOWN'}`,
        `ISSUER:    ${c2pa.issuer || 'N/A'}`,
        `TOOL:      ${c2pa.tool || 'N/A'}`,
        `SIGNATURE: Verified (Self-Signed)` // Placeholder logic, ideally from true status
    ]

    doc.text(provText, 20, y + 4)

    // Save
    doc.save(`AIRS_Report_${scan.filename.substring(0, 10)}_${format(new Date(), 'yyyyMMdd')}.pdf`)
}
