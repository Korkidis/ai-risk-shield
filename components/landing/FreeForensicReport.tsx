'use client'

import { RiskProfile } from '@/lib/gemini'
import { Lock, TrendingUp, Shield, FileText } from 'lucide-react'
import { RSButton } from '../rs/RSButton'
import { RSPanel } from '../rs/RSPanel'

type Props = {
    riskProfile: RiskProfile
    assetName: string
    scanDate: string
}

export function FreeForensicReport({ riskProfile, assetName, scanDate }: Props) {
    // Get top 3 findings from the risk profile
    const findings = [
        {
            severity: riskProfile.ip_report.score >= 85 ? 'critical' : riskProfile.ip_report.score >= 60 ? 'high' : 'medium',
            title: riskProfile.ip_report.score >= 85 ? 'Copyrighted content detected' :
                riskProfile.ip_report.score >= 60 ? 'Potential IP concerns identified' :
                    'IP elements present',
            description: riskProfile.ip_report.teaser
        },
        {
            severity: riskProfile.provenance_report.score >= 70 ? 'high' : riskProfile.provenance_report.score >= 40 ? 'medium' : 'low',
            title: riskProfile.provenance_report.score >= 70 ? 'Screenshot indicators present' :
                riskProfile.provenance_report.score >= 40 ? 'Source verification recommended' :
                    'Provenance verified',
            description: riskProfile.provenance_report.teaser
        },
        {
            severity: riskProfile.c2pa_report.status === 'missing' ? 'medium' :
                riskProfile.c2pa_report.status === 'invalid' ? 'high' : 'low',
            title: riskProfile.c2pa_report.status === 'missing' ? 'No content credentials (C2PA)' :
                riskProfile.c2pa_report.status === 'invalid' ? 'Invalid content credentials' :
                    'Content credentials verified',
            description: riskProfile.c2pa_report.status === 'missing' ? 'Provenance cannot be verified' :
                riskProfile.c2pa_report.status === 'invalid' ? 'Credentials failed validation' :
                    'C2PA credentials valid'
        }
    ].filter(f => f.severity !== 'low') // Only show concerning findings

    const getRiskColor = (score: number) => {
        if (score >= 85) return 'text-[var(--rs-signal)]'
        if (score >= 60) return 'text-[var(--rs-indicator)]'
        if (score >= 40) return 'text-[var(--rs-text-secondary)]'
        return 'text-[var(--rs-safe)]'
    }

    const getRiskLabel = (score: number) => {
        if (score >= 85) return 'CRITICAL'
        if (score >= 60) return 'HIGH'
        if (score >= 40) return 'MEDIUM'
        return 'LOW'
    }

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return '🔴'
            case 'high': return '🟡'
            case 'medium': return '🟡'
            default: return '🟢'
        }
    }

    return (
        <RSPanel className="max-w-4xl mx-auto p-0 border border-[var(--rs-border-primary)] overflow-hidden">
            {/* Header */}
            <div className="bg-[var(--rs-bg-secondary)] border-b border-[var(--rs-border-primary)] px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--rs-text-primary)] mb-1 uppercase tracking-tight">Risk Shield Forensic Analysis</h1>
                        <p className="text-sm text-[var(--rs-text-secondary)]">Preliminary Assessment Report</p>
                    </div>
                    <div className="text-right text-xs text-[var(--rs-text-tertiary)] font-mono">
                        <div>{new Date(scanDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div>{new Date(scanDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                    </div>
                </div>
            </div>

            {/* Executive Summary */}
            <div className="px-8 py-8 border-b border-[var(--rs-border-primary)]">
                <h2 className="text-lg font-bold text-[var(--rs-text-primary)] mb-6 uppercase tracking-wider">Executive Summary</h2>

                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[var(--rs-text-secondary)]">Overall Risk</span>
                        <span className={`text-lg font-bold ${getRiskColor(riskProfile.composite_score)}`}>
                            {riskProfile.composite_score}% {getRiskLabel(riskProfile.composite_score)}
                        </span>
                    </div>
                    <div className="h-3 bg-[var(--rs-bg-secondary)] rounded-full overflow-hidden shadow-inner">
                        <div
                            className={`h-full ${riskProfile.composite_score >= 85 ? 'bg-[var(--rs-signal)]' :
                                riskProfile.composite_score >= 60 ? 'bg-[var(--rs-indicator)]' :
                                    riskProfile.composite_score >= 40 ? 'bg-[var(--rs-gray-500)]' : 'bg-[var(--rs-safe)]'
                                }`}
                            style={{ width: `${riskProfile.composite_score}%` }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                        <div className="text-xs text-[var(--rs-text-secondary)] mb-1 uppercase tracking-wider">IP Risk</div>
                        <div className={`text-2xl font-bold ${getRiskColor(riskProfile.ip_report.score)}`}>
                            {riskProfile.ip_report.score}%
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-[var(--rs-text-secondary)] mb-1 uppercase tracking-wider">Provenance</div>
                        <div className={`text-2xl font-bold ${getRiskColor(riskProfile.provenance_report.score)}`}>
                            {riskProfile.provenance_report.score}%
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-[var(--rs-text-secondary)] mb-1 uppercase tracking-wider">Brand Safety</div>
                        <div className={`text-2xl font-bold ${getRiskColor(riskProfile.safety_report.score)}`}>
                            {riskProfile.safety_report.score}%
                        </div>
                    </div>
                </div>

                <div className="text-xs text-[var(--rs-text-tertiary)] font-mono">
                    <div><span className="font-bold text-[var(--rs-text-secondary)]">ASSET:</span> {assetName}</div>
                    <div><span className="font-bold text-[var(--rs-text-secondary)]">SCANNED:</span> {new Date(scanDate).toLocaleString()}</div>
                </div>
            </div>

            {/* Key Findings */}
            <div className="px-8 py-8 border-b border-[var(--rs-border-primary)]">
                <h2 className="text-lg font-bold text-[var(--rs-text-primary)] mb-6 uppercase tracking-wider">Key Findings</h2>

                <div className="space-y-4">
                    {findings.slice(0, 3).map((finding, idx) => (
                        <div key={idx} className="bg-[var(--rs-bg-secondary)] rounded-xl p-4 border border-[var(--rs-border-primary)]">
                            <div className="flex items-start gap-3">
                                <span className="text-xl">{getSeverityIcon(finding.severity)}</span>
                                <div className="flex-1">
                                    <div className="font-bold text-[var(--rs-text-primary)] mb-1 uppercase text-xs tracking-wide">
                                        {finding.severity}: {finding.title}
                                    </div>
                                    <div className="text-sm text-[var(--rs-text-secondary)]">{finding.description}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 text-xs text-[var(--rs-text-tertiary)] italic">
                    Additional findings available in full report - details require unlock
                </div>
            </div>

            {/* Locked Section */}
            <div className="px-8 py-8 border-b border-[var(--rs-border-primary)] relative">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[var(--rs-text-primary)] uppercase tracking-wider">Detailed Analysis</h2>
                    <Lock className="w-5 h-5 text-[var(--rs-text-secondary)]" />
                </div>

                <div className="relative">
                    <div className="absolute inset-0 backdrop-blur-md bg-[var(--rs-bg-surface)]/80 rounded-xl flex items-center justify-center z-10 border border-[var(--rs-border-primary)]">
                        <div className="text-center">
                            <Lock className="w-12 h-12 text-[var(--rs-text-tertiary)] mx-auto mb-3" />
                            <p className="text-sm font-bold text-[var(--rs-text-secondary)] uppercase tracking-wider">Unlock for detailed analysis</p>
                        </div>
                    </div>

                    <div className="bg-[var(--rs-bg-secondary)]/30 rounded-xl p-6 text-[var(--rs-text-tertiary)] select-none opacity-50">
                        <div className="space-y-3">
                            <div className="h-4 bg-[var(--rs-bg-element)] rounded w-3/4"></div>
                            <div className="h-4 bg-[var(--rs-bg-element)] rounded w-full"></div>
                            <div className="h-4 bg-[var(--rs-bg-element)] rounded w-5/6"></div>
                            <div className="h-4 bg-[var(--rs-bg-element)] rounded w-2/3"></div>
                            <div className="h-4 bg-[var(--rs-bg-element)] rounded w-full"></div>
                            <div className="h-4 bg-[var(--rs-bg-element)] rounded w-4/5"></div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 text-xs text-[var(--rs-text-secondary)]">
                    <p className="font-bold mb-2 uppercase tracking-wider">Includes:</p>
                    <ul className="space-y-1 text-[var(--rs-text-tertiary)]">
                        <li>• Full forensic reasoning & legal context</li>
                        <li>• Mitigation strategies & action plan</li>
                        <li>• Evidence documentation & confidence scores</li>
                        <li>• Exportable PDF report</li>
                    </ul>
                </div>
            </div>

            {/* Next Steps */}
            <div className="px-8 py-8 bg-[var(--rs-bg-secondary)]">
                <div className="text-center mb-6">
                    <div className="inline-block px-3 py-1 bg-[var(--rs-signal)]/10 border border-[var(--rs-signal)]/20 rounded-full text-xs font-bold text-[var(--rs-signal)] uppercase tracking-wider mb-3 animate-pulse">
                        ⚠️ Immediate Action Required
                    </div>
                    <p className="text-sm text-[var(--rs-text-secondary)] max-w-lg mx-auto">
                        This asset presents {riskProfile.composite_score >= 85 ? 'significant' : riskProfile.composite_score >= 60 ? 'moderate' : 'potential'} risk. Review options below:
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    {/* Unlock Report */}
                    <div className="bg-[var(--rs-bg-surface)] rounded-2xl p-6 border border-[var(--rs-border-primary)] hover:border-[var(--rs-border-focus)] transition-all group flex flex-col items-center text-center shadow-[var(--rs-shadow-l1)]">
                        <FileText className="w-8 h-8 text-[var(--rs-text-primary)] mb-3" />
                        <h3 className="font-bold text-[var(--rs-text-primary)] mb-2 uppercase tracking-wide text-xs">Unlock Full Report</h3>
                        <p className="text-[10px] text-[var(--rs-text-secondary)] mb-4">One-time access to complete analysis</p>
                        <div className="text-2xl font-bold text-[var(--rs-text-primary)] mb-4 font-mono">$29</div>
                        <RSButton variant="secondary" fullWidth size="sm">
                            Purchase Report
                        </RSButton>
                    </div>

                    {/* Upgrade to Pro */}
                    <div className="bg-[var(--rs-bg-surface)] rounded-2xl p-6 border-2 border-[var(--rs-border-focus)] relative overflow-hidden shadow-[var(--rs-shadow-l2)] flex flex-col items-center text-center scale-105 z-10">
                        <div className="absolute top-3 right-[-30px] bg-[var(--rs-signal)] text-white text-[8px] font-black px-8 py-1 rotate-45 uppercase tracking-wider">
                            Best Value
                        </div>
                        <TrendingUp className="w-8 h-8 text-[var(--rs-text-primary)] mb-3" />
                        <h3 className="font-bold text-[var(--rs-text-primary)] mb-2 uppercase tracking-wide text-xs">Upgrade to Pro</h3>
                        <p className="text-[10px] text-[var(--rs-text-secondary)] mb-4">Unlimited scans + team features</p>
                        <div className="text-2xl font-bold text-[var(--rs-text-primary)] mb-1 font-mono">$49.99<span className="text-[10px] font-normal text-[var(--rs-text-tertiary)]">/mo</span></div>
                        <RSButton variant="primary" fullWidth size="sm" className="mt-4">
                            Start Trial
                        </RSButton>
                    </div>

                    {/* IP Insurance */}
                    <div className="bg-[var(--rs-bg-surface)] rounded-2xl p-6 border border-[var(--rs-border-primary)] hover:border-[var(--rs-border-focus)] transition-all group flex flex-col items-center text-center shadow-[var(--rs-shadow-l1)]">
                        <Shield className="w-8 h-8 text-[var(--rs-safe)] mb-3" />
                        <h3 className="font-bold text-[var(--rs-text-primary)] mb-2 uppercase tracking-wide text-xs">Explore IP Insurance</h3>
                        <p className="text-[10px] text-[var(--rs-text-secondary)] mb-4">Protect against copyright claims</p>
                        <div className="text-[10px] text-[var(--rs-text-secondary)] mb-4">Partner coverage available</div>
                        <RSButton variant="ghost" fullWidth size="sm" className="border border-[var(--rs-border-primary)]">
                            Learn More →
                        </RSButton>
                    </div>
                </div>
            </div>
        </RSPanel>
    )
}
