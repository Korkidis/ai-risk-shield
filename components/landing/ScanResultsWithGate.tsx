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

                                    // -- HEADER --
                                    doc.setFillColor(2, 6, 23);
                                    doc.rect(0, 0, 210, 40, 'F');
                                    doc.setTextColor(255, 255, 255);
                                    doc.setFontSize(18);
                                    doc.setFont("helvetica", "bold");
                                    doc.text("Unified Compliance Audit", 20, 20);
                                    doc.setFontSize(10);
                                    doc.setFont("helvetica", "normal");
                                    doc.text("FORENSIC IP & BRAND SAFETY ASSESSMENT REPORT", 20, 28);
                                    doc.text(`REPORT ID: US-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, 150, 28);

                                    // -- SUMMARY --
                                    doc.setTextColor(51, 65, 85);
                                    doc.setFontSize(10);
                                    doc.text("Forensic Summary", 20, 55);
                                    doc.setFontSize(9);
                                    doc.setTextColor(100, 116, 139);
                                    doc.text(`Recipient: ${email}`, 20, 62);
                                    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 67);

                                    // -- SCORES --
                                    doc.setFillColor(241, 245, 249);
                                    doc.roundedRect(20, 80, 170, 35, 3, 3, 'F');
                                    doc.setTextColor(15, 23, 42);
                                    doc.setFontSize(12);
                                    doc.setFont("helvetica", "bold");
                                    doc.text(`Aggregate Risk: ${riskProfile.composite_score}/100`, 30, 92);

                                    doc.setFontSize(10);
                                    doc.text("IP RISK", 30, 105);
                                    doc.setTextColor(riskProfile.ip_report.score > 50 ? 239 : 16, riskProfile.ip_report.score > 50 ? 68 : 185, riskProfile.ip_report.score > 50 ? 68 : 129);
                                    doc.text(`${riskProfile.ip_report.score}/100`, 55, 105);

                                    doc.setTextColor(15, 23, 42);
                                    doc.text("SAFETY", 90, 105);
                                    doc.setTextColor(riskProfile.safety_report.score > 50 ? 239 : 16, riskProfile.safety_report.score > 50 ? 68 : 185, riskProfile.safety_report.score > 50 ? 68 : 129);
                                    doc.text(`${riskProfile.safety_report.score}/100`, 115, 105);

                                    doc.setTextColor(15, 23, 42);
                                    doc.text("PROVENANCE", 145, 105);
                                    doc.setTextColor(riskProfile.provenance_report.score > 50 ? 239 : 16, riskProfile.provenance_report.score > 50 ? 68 : 185, riskProfile.provenance_report.score > 50 ? 68 : 129);
                                    doc.text(`${riskProfile.provenance_report.score}/100`, 180, 105);

                                    // -- FINDINGS --
                                    doc.setTextColor(15, 23, 42);
                                    doc.setFontSize(11);
                                    doc.setFont("helvetica", "bold");
                                    doc.text("Critical Findings (Teaser)", 20, 130);
                                    doc.setLineWidth(0.5);
                                    doc.setDrawColor(203, 213, 225);
                                    doc.line(20, 133, 190, 133);

                                    doc.setFontSize(9);
                                    doc.text("IP Specialist:", 20, 145);
                                    doc.setFont("helvetica", "normal");
                                    doc.setTextColor(71, 85, 105);
                                    const ipText = doc.splitTextToSize(riskProfile.ip_report.teaser, 160);
                                    doc.text(ipText, 50, 145);

                                    doc.setFont("helvetica", "bold");
                                    doc.setTextColor(15, 23, 42);
                                    doc.text("Safety Analyst:", 20, 165);
                                    doc.setFont("helvetica", "normal");
                                    doc.setTextColor(71, 85, 105);
                                    const safetyText = doc.splitTextToSize(riskProfile.safety_report.teaser, 160);
                                    doc.text(safetyText, 55, 165);

                                    doc.setFont("helvetica", "bold");
                                    doc.setTextColor(15, 23, 42);
                                    doc.text("Provenance Engineer:", 20, 185);
                                    doc.setFont("helvetica", "normal");
                                    doc.setTextColor(71, 85, 105);
                                    const provText = doc.splitTextToSize(riskProfile.provenance_report.teaser, 160);
                                    doc.text(provText, 65, 185);

                                    // -- CTA --
                                    doc.setTextColor(79, 70, 229);
                                    doc.setFontSize(11);
                                    doc.setFont("helvetica", "bold");
                                    doc.text("UNLOCK FULL REPORT TO ACCESS:", 55, 220);
                                    doc.setFontSize(9);
                                    doc.setTextColor(15, 23, 42);
                                    doc.text("• Chief Officer Strategic Mitigation Plan", 60, 230);
                                    doc.text("• Detailed Forensic Logs & Evidence", 60, 236);
                                    doc.text("• C2PA Content Credentials Chain", 60, 242);

                                    doc.save("Risk_Shield_Forensic_Sample.pdf");
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
        </div>
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
