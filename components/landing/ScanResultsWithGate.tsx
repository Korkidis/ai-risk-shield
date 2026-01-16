'use client'

import { useState, useEffect } from 'react'
import { UpgradeModal } from './UpgradeModal'
import { RiskProfile } from '@/lib/gemini'

export function ScanResultsWithGate({ scanId, riskProfile }: { scanId: string, riskProfile: RiskProfile }) {

    const [showUpgrade, setShowUpgrade] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Calculate Ring Offset (Circumference = 502.6)
    const circumference = 502.6
    const offset = circumference - (riskProfile.composite_score / 100) * circumference

    // Decide Color
    let color = "#10b981"
    if (riskProfile.composite_score > 65) color = "#ef4444"
    else if (riskProfile.composite_score > 35) color = "#f59e0b"

    return (
        <div className="space-y-12 max-w-5xl mx-auto">
            {showUpgrade && <UpgradeModal scanId={scanId} onClose={() => setShowUpgrade(false)} />}

            <div className="grid lg:grid-cols-2 gap-8 items-start">
                {/* Left: Scores */}
                <div className="space-y-6">
                    <div className="glass p-10 rounded-[3rem] text-center relative overflow-hidden">
                        <div className="shimmer absolute inset-0 pointer-events-none"></div>
                        <div className="relative z-10">
                            <div className="relative inline-flex items-center justify-center mb-6">
                                <svg className="w-48 h-48">
                                    <circle className="text-slate-800" strokeWidth="10" stroke="currentColor" fill="transparent" r="80" cx="96" cy="96" />
                                    <circle
                                        key={mounted ? 'mounted' : 'unmounted'}
                                        className="gauge-ring"
                                        strokeWidth="10"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={mounted ? offset : circumference}
                                        strokeLinecap="round"
                                        stroke={color}
                                        fill="transparent"
                                        r="80" cx="96" cy="96"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-6xl font-bold tracking-tighter text-white">{riskProfile.composite_score}</span>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Risk Index</span>
                                </div>
                            </div>
                            <h3 className="text-2xl font-black mb-2 uppercase tracking-tight" style={{ color }}>{riskProfile.verdict}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed font-medium">{riskProfile.ip_report.teaser}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <ScoreRow label="IP Exposure" value={riskProfile.ip_report.score} />
                        <ScoreRow label="Brand Safety" value={riskProfile.safety_report.score} />
                        <ScoreRow label="Provenance" value={riskProfile.provenance_report.score} />
                    </div>
                </div>

                {/* Right: Forensic Log */}
                <div className="glass p-10 rounded-[3rem] h-full flex flex-col justify-between border-indigo-500/20 shadow-2xl shadow-indigo-500/5">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold uppercase tracking-tight text-white">Forensic Log</h3>
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Locked</span>
                            </div>
                        </div>

                        {/* Locked Reasoning - Simple placeholder, no content leak */}
                        <p className="text-slate-400 text-sm leading-relaxed mb-4">
                            <span className="block mb-2 font-bold text-slate-300">Analysis Complete.</span>
                            The Multi-Persona Engine has flagged <span className="text-white font-bold">{riskProfile.verdict}</span> based on weighted risk indicators across IP, Safety, and Provenance vectors.
                        </p>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center space-x-3">
                                <span className="text-[9px] uppercase tracking-widest text-slate-600 w-24">IP Specialist</span>
                                <div className="flex-1 h-2 bg-slate-800 rounded"></div>
                                <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-[9px] uppercase tracking-widest text-slate-600 w-24">Safety Analyst</span>
                                <div className="flex-1 h-2 bg-slate-800 rounded"></div>
                                <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-[9px] uppercase tracking-widest text-slate-600 w-24">Provenance Eng.</span>
                                <div className="flex-1 h-2 bg-slate-800 rounded"></div>
                                <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                            </div>
                        </div>

                        <p className="text-indigo-400 text-xs font-semibold italic mb-6">
                            🔒 Detailed reasoning + Chief Officer Mitigation Strategy available in Sample Report
                        </p>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Company Email to Receive Sample Report</label>
                        <div className="flex flex-col space-y-3">
                            <input
                                id="email-input"
                                type="email"
                                placeholder="email@company.com"
                                className="bg-slate-900 border border-slate-700 rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-full text-white"
                            />
                            <button
                                onClick={async () => {
                                    const email = (document.getElementById('email-input') as HTMLInputElement).value;
                                    if (!email || !email.includes('@')) {
                                        alert('Please enter a valid email');
                                        return;
                                    }

                                    const { jsPDF } = await import('jspdf');
                                    const doc = new jsPDF();

                                    const reportId = `RS-${Math.random().toString(36).substr(2, 3).toUpperCase()}-${Math.random().toString(36).substr(2, 1).toUpperCase()}`;
                                    const fileHash = `4e3d${Math.random().toString(36).substr(2, 4)}...${Math.random().toString(36).substr(2, 4)}`;

                                    // BACKGROUND - Light gray/off-white throughout
                                    doc.setFillColor(250, 250, 248); // Off-white
                                    doc.rect(0, 0, 210, 297, 'F');

                                    // DOCUMENT BORDER - Subtle frame
                                    doc.setDrawColor(200, 200, 195);
                                    doc.setLineWidth(0.5);
                                    doc.rect(10, 10, 190, 277);

                                    // HEADER - Clean, professional (no dark background)
                                    doc.setTextColor(60, 60, 60);
                                    doc.setFontSize(8);
                                    doc.setFont("helvetica", "normal");
                                    doc.text("RISK SHIELD", 15, 18);

                                    doc.setFontSize(18);
                                    doc.setFont("helvetica", "bold");
                                    doc.text("FORENSIC ANALYSIS REPORT", 15, 28);

                                    doc.setFontSize(9);
                                    doc.setFont("helvetica", "normal");
                                    doc.setTextColor(100, 100, 100);
                                    doc.text("Preliminary IP & Brand Safety Assessment", 15, 35);

                                    // Top-right metadata (Monospace style)
                                    doc.setFontSize(7);
                                    doc.setFont("courier", "normal"); // Monospace
                                    doc.setTextColor(80, 80, 80);
                                    doc.text("REPORT ID:", 155, 18);
                                    doc.setFont("courier", "bold");
                                    doc.text(reportId, 155, 23);

                                    doc.setFont("courier", "normal");
                                    doc.setTextColor(180, 50, 50);
                                    doc.text("CONFIDENTIAL", 155, 28);
                                    doc.setTextColor(80, 80, 80);
                                    doc.text("LEVEL 2", 155, 32);

                                    // Horizontal divider
                                    doc.setDrawColor(180, 180, 175);
                                    doc.setLineWidth(0.3);
                                    doc.line(15, 40, 195, 40);

                                    // SECTION 1: ASSET METADATA - Minimalist Clean Layout
                                    doc.setTextColor(60, 60, 60);
                                    doc.setFontSize(7);
                                    doc.setFont("helvetica", "bold");
                                    doc.text("1. ASSET METADATA", 15, 48);

                                    // Simple metadata list - no boxes
                                    doc.setFontSize(6);
                                    doc.setFont("helvetica", "normal");
                                    doc.setTextColor(100, 100, 100);

                                    doc.text("Asset Name", 15, 54);
                                    doc.text("File Hash", 15, 59);
                                    doc.text("Scan Timestamp", 15, 64);
                                    doc.text("Analysis Engine", 15, 69);

                                    doc.setFont("courier", "normal");
                                    doc.setTextColor(40, 40, 40);
                                    doc.text("asset_scan.png", 55, 54);
                                    doc.text(fileHash, 55, 59);
                                    doc.text(new Date().toISOString(), 55, 64);
                                    doc.text("Multi-Persona v2.1", 55, 69);

                                    // Risk score - right aligned, minimal
                                    const badgeColor = riskProfile.composite_score >= 85 ? [220, 38, 38] :
                                        riskProfile.composite_score >= 60 ? [234, 88, 12] :
                                            riskProfile.composite_score >= 40 ? [202, 138, 4] : [21, 128, 61];

                                    doc.setTextColor(badgeColor[0], badgeColor[1], badgeColor[2]);
                                    doc.setFontSize(28);
                                    doc.setFont("courier", "bold");
                                    doc.text(`${riskProfile.composite_score}%`, 195, 60, { align: 'right' });
                                    doc.setFontSize(5);
                                    doc.setFont("helvetica", "normal");
                                    doc.setTextColor(100, 100, 100);
                                    doc.text("COMPOSITE RISK", 195, 66, { align: 'right' });

                                    // Subtle divider
                                    doc.setDrawColor(220, 220, 215);
                                    doc.setLineWidth(0.2);
                                    doc.line(15, 75, 195, 75);

                                    // SECTION 2: EXECUTIVE SUMMARY
                                    doc.setTextColor(60, 60, 60);
                                    doc.setFontSize(7);
                                    doc.setFont("helvetica", "bold");
                                    doc.text("2. EXECUTIVE SUMMARY", 15, 82);

                                    const riskColor = riskProfile.composite_score >= 85 ? [220, 38, 38] :
                                        riskProfile.composite_score >= 60 ? [234, 88, 12] :
                                            riskProfile.composite_score >= 40 ? [202, 138, 4] : [21, 128, 61];

                                    doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
                                    doc.setFontSize(9);
                                    doc.setFont("helvetica", "bold");
                                    doc.text(riskProfile.verdict.toUpperCase(), 15, 90);

                                    // Linear scale - minimal
                                    doc.setDrawColor(230, 230, 228);
                                    doc.setLineWidth(2);
                                    doc.line(15, 95, 195, 95);

                                    // Risk indicator
                                    const needleX = 15 + (180 * riskProfile.composite_score / 100);
                                    doc.setDrawColor(riskColor[0], riskColor[1], riskColor[2]);
                                    doc.setLineWidth(3);
                                    doc.line(needleX, 93, needleX, 97);

                                    // Scale labels
                                    doc.setFontSize(5);
                                    doc.setTextColor(120, 120, 120);
                                    doc.setFont("courier", "normal");
                                    doc.text("0", 15, 100);
                                    doc.text("50", 105, 100, { align: 'center' });
                                    doc.text("100", 195, 100, { align: 'right' });

                                    doc.setDrawColor(220, 220, 215);
                                    doc.setLineWidth(0.2);
                                    doc.line(15, 105, 195, 105);

                                    // SECTION 3: RISK MITIGATION ADVISORY (Moved Up)
                                    let yPos = 110;
                                    doc.setTextColor(60, 60, 60);
                                    doc.setFontSize(7);
                                    doc.setFont("helvetica", "bold");
                                    doc.text("3. RISK MITIGATION ADVISORY", 15, yPos);

                                    yPos += 5;
                                    doc.setTextColor(146, 64, 14);
                                    doc.setFontSize(6);
                                    doc.setFont("helvetica", "bold");
                                    doc.text(`⚠ HIGH LIABILITY CLASSIFICATION (${riskProfile.composite_score}% Risk Score)`, 15, yPos);

                                    yPos += 4;
                                    doc.setTextColor(80, 80, 80);
                                    doc.setFontSize(5);
                                    doc.setFont("helvetica", "normal");
                                    const insuranceText = "This asset's risk profile indicates potential exposure to statutory damages and legal defense costs. IP Insurance Coverage provides protection against copyright infringement claims, with coverage tiers starting at $2,500/year for assets in this risk category.";
                                    const wrappedInsurance = doc.splitTextToSize(insuranceText, 180);
                                    doc.text(wrappedInsurance, 15, yPos);

                                    yPos += 8;
                                    doc.setTextColor(37, 99, 235);
                                    doc.setFontSize(5);
                                    doc.setFont("helvetica", "bold");
                                    doc.text("View Policy Rates & Coverage Tiers →", 15, yPos);

                                    yPos += 8;
                                    doc.setDrawColor(220, 220, 215);
                                    doc.setLineWidth(0.2);
                                    doc.line(15, yPos, 195, yPos);

                                    // SECTION 4: RISK BREAKDOWN BY CATEGORY
                                    yPos += 8;
                                    doc.setTextColor(60, 60, 60);
                                    doc.setFontSize(7);
                                    doc.setFont("helvetica", "bold");
                                    doc.text("4. RISK BREAKDOWN BY CATEGORY", 15, yPos);

                                    yPos += 6;
                                    const risks = [
                                        { label: 'IP Exposure', score: riskProfile.ip_report.score },
                                        { label: 'Provenance', score: riskProfile.provenance_report.score },
                                        { label: 'Brand Safety', score: riskProfile.safety_report.score }
                                    ];

                                    risks.forEach(risk => {
                                        doc.setTextColor(100, 100, 100);
                                        doc.setFontSize(6);
                                        doc.setFont("helvetica", "normal");
                                        doc.text(risk.label, 15, yPos);

                                        const scoreColor = risk.score >= 70 ? [220, 38, 38] : [21, 128, 61];
                                        doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
                                        doc.setFontSize(14);
                                        doc.setFont("courier", "bold");
                                        doc.text(`${risk.score}%`, 195, yPos, { align: 'right' });

                                        // Minimal progress line
                                        doc.setDrawColor(240, 240, 238);
                                        doc.setLineWidth(1);
                                        doc.line(15, yPos + 2, 195, yPos + 2);
                                        doc.setDrawColor(scoreColor[0], scoreColor[1], scoreColor[2]);
                                        doc.setLineWidth(1);
                                        doc.line(15, yPos + 2, 15 + (180 * risk.score / 100), yPos + 2);

                                        yPos += 10;
                                    });

                                    // SECTION 5: KEY FINDINGS
                                    yPos += 5;
                                    doc.setTextColor(60, 60, 60);
                                    doc.setFontSize(7);
                                    doc.setFont("helvetica", "bold");
                                    doc.text("5. KEY FINDINGS", 15, yPos);

                                    const findings = [
                                        {
                                            id: 'F-001',
                                            severity: riskProfile.ip_report.score >= 85 ? 'CRITICAL' : 'HIGH',
                                            title: riskProfile.ip_report.score >= 85 ? 'Copyrighted Content Detected' : 'IP Concerns Identified',
                                            desc: riskProfile.ip_report.teaser
                                        },
                                        {
                                            id: 'F-002',
                                            severity: riskProfile.provenance_report.score >= 70 ? 'HIGH' : 'MEDIUM',
                                            title: riskProfile.provenance_report.score >= 70 ? 'Screenshot Indicators Present' : 'Source Verification Recommended',
                                            desc: riskProfile.provenance_report.teaser
                                        },
                                        {
                                            id: 'F-003',
                                            severity: 'MEDIUM',
                                            title: 'No Content Credentials (C2PA)',
                                            desc: 'Asset lacks verifiable provenance chain'
                                        }
                                    ];

                                    yPos += 6;
                                    findings.forEach(finding => {
                                        const sevColor = finding.severity === 'CRITICAL' ? [220, 38, 38] :
                                            finding.severity === 'HIGH' ? [234, 88, 12] : [202, 138, 4];

                                        doc.setTextColor(100, 100, 100);
                                        doc.setFontSize(5);
                                        doc.setFont("courier", "normal");
                                        doc.text(finding.id, 15, yPos);

                                        doc.setTextColor(sevColor[0], sevColor[1], sevColor[2]);
                                        doc.setFontSize(5);
                                        doc.setFont("helvetica", "bold");
                                        doc.text(finding.severity, 28, yPos);

                                        doc.setTextColor(40, 40, 40);
                                        doc.setFontSize(6);
                                        doc.setFont("helvetica", "bold");
                                        doc.text(finding.title, 15, yPos + 5);

                                        doc.setTextColor(80, 80, 80);
                                        doc.setFontSize(5);
                                        doc.setFont("helvetica", "normal");
                                        const wrappedDesc = doc.splitTextToSize(finding.desc, 180);
                                        doc.text(wrappedDesc, 15, yPos + 9);

                                        yPos += 16;
                                    });

                                    // FULL REPORT PREVIEW & UPSELL
                                    yPos += 5;
                                    doc.setDrawColor(200, 200, 195);
                                    doc.setLineWidth(0.5);
                                    doc.line(15, yPos, 195, yPos);

                                    yPos += 8;
                                    doc.setTextColor(120, 120, 120);
                                    doc.setFontSize(7);
                                    doc.setFont("courier", "bold");
                                    doc.text("FULL FORENSIC DOSSIER CONTENTS", 15, yPos);

                                    yPos += 6;
                                    const lockedSections = [
                                        "6. Detailed IP Infringement Mapping",
                                        "7. Evidence Log & Chain of Custody",
                                        "8. Mitigation Action Plan & Legal Citations"
                                    ];

                                    lockedSections.forEach(section => {
                                        doc.setTextColor(150, 150, 150);
                                        doc.setFontSize(6);
                                        doc.setFont("helvetica", "normal");
                                        doc.text(section, 15, yPos);

                                        doc.setFont("courier", "normal");
                                        doc.text("[LOCKED]", 195, yPos, { align: 'right' });

                                        // Thin line connecting
                                        doc.setDrawColor(240, 240, 238);
                                        doc.setLineWidth(0.5);
                                        doc.line(60, yPos - 1, 180, yPos - 1);

                                        yPos += 5;
                                    });

                                    // Bleed/Fade Effect - Visual fade out
                                    const fadeStart = yPos;
                                    for (let i = 0; i < 6; i++) {
                                        doc.setFillColor(255, 255, 255, 0.2 + (i * 0.15));
                                        doc.rect(15, fadeStart + i * 2, 180, 2, 'F');
                                    }

                                    // STRONG UPSELL
                                    yPos += 10;
                                    doc.setTextColor(15, 23, 42);
                                    doc.setFontSize(14);
                                    doc.setFont("helvetica", "bold");
                                    doc.text("DECRYPT FULL REPORT", 105, yPos, { align: 'center' });

                                    yPos += 6;
                                    doc.setTextColor(80, 80, 80);
                                    doc.setFontSize(6);
                                    doc.setFont("helvetica", "normal");
                                    doc.text("Instant access to all evidence, legal citations, and mitigation plans.", 105, yPos, { align: 'center' });

                                    yPos += 8;
                                    doc.setTextColor(15, 23, 42);
                                    doc.setFontSize(16);
                                    doc.setFont("courier", "bold");
                                    doc.text("$29.00", 105, yPos, { align: 'center' });

                                    yPos += 5;
                                    doc.setTextColor(60, 60, 200);
                                    doc.setFontSize(6);
                                    doc.setFont("helvetica", "bold");
                                    doc.text("Or save 60% with Pro Subscription ($49.99/mo) →", 105, yPos, { align: 'center' });

                                    // FOOTER - Improved positioning
                                    const footerY = 285;
                                    doc.setDrawColor(180, 180, 175);
                                    doc.setLineWidth(0.3);
                                    doc.line(15, footerY - 4, 195, footerY - 4);

                                    doc.setTextColor(100, 100, 100);
                                    doc.setFontSize(6);
                                    doc.setFont("courier", "bold");
                                    doc.text("Page 1 of 8 | INTERNAL USE ONLY", 15, footerY);

                                    doc.setFont("courier", "normal");
                                    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 195, footerY, { align: 'right' });

                                    doc.save("Risk_Shield_Forensic_Report.pdf");
                                    setShowUpgrade(true);
                                }}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all"
                            >
                                Download Sample Report
                            </button>
                        </div>
                        <p className="text-[9px] text-center text-slate-500 uppercase tracking-widest">Confidential technical log delivery</p>
                    </div>
                </div>
            </div>
        </div >
    )
}

function ScoreRow({ label, value }: { label: string, value: number }) {
    const getColor = (v: number) => {
        if (v >= 70) return 'text-red-400'
        if (v >= 40) return 'text-amber-400'
        return 'text-emerald-400'
    }
    return (
        <div className="glass p-5 rounded-2xl flex justify-between items-center group cursor-help" title={`${label} risk indicator based on forensic analysis`}>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-indigo-400 transition-colors">{label}</span>
            <span className={`text-lg font-bold ${getColor(value)}`}>{value}%</span>
        </div>
    )
}
