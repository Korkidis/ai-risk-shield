'use client'

import { RiskProfile } from '@/lib/gemini'
import { Lock, TrendingUp, Shield, FileText } from 'lucide-react'

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
        if (score >= 85) return 'text-red-500'
        if (score >= 60) return 'text-orange-500'
        if (score >= 40) return 'text-yellow-500'
        return 'text-green-500'
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
        <div className="max-w-4xl mx-auto bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-slate-800 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">RISK SHIELD FORENSIC ANALYSIS</h1>
                        <p className="text-sm text-slate-400">Preliminary Assessment Report</p>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                        <div>{new Date(scanDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div>{new Date(scanDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                    </div>
                </div>
            </div>

            {/* Executive Summary */}
            <div className="px-8 py-8 border-b border-slate-800">
                <h2 className="text-lg font-bold text-white mb-6">EXECUTIVE SUMMARY</h2>

                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-400">Overall Risk</span>
                        <span className={`text-lg font-bold ${getRiskColor(riskProfile.composite_score)}`}>
                            {riskProfile.composite_score}% {getRiskLabel(riskProfile.composite_score)}
                        </span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${riskProfile.composite_score >= 85 ? 'bg-red-500' :
                                    riskProfile.composite_score >= 60 ? 'bg-orange-500' :
                                        riskProfile.composite_score >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                            style={{ width: `${riskProfile.composite_score}%` }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                        <div className="text-xs text-slate-500 mb-1">IP Risk</div>
                        <div className={`text-2xl font-bold ${getRiskColor(riskProfile.ip_report.score)}`}>
                            {riskProfile.ip_report.score}%
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 mb-1">Provenance</div>
                        <div className={`text-2xl font-bold ${getRiskColor(riskProfile.provenance_report.score)}`}>
                            {riskProfile.provenance_report.score}%
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 mb-1">Brand Safety</div>
                        <div className={`text-2xl font-bold ${getRiskColor(riskProfile.safety_report.score)}`}>
                            {riskProfile.safety_report.score}%
                        </div>
                    </div>
                </div>

                <div className="text-xs text-slate-500">
                    <div><span className="font-medium">Asset:</span> {assetName}</div>
                    <div><span className="font-medium">Scanned:</span> {new Date(scanDate).toLocaleString()}</div>
                </div>
            </div>

            {/* Key Findings */}
            <div className="px-8 py-8 border-b border-slate-800">
                <h2 className="text-lg font-bold text-white mb-6">KEY FINDINGS</h2>

                <div className="space-y-4">
                    {findings.slice(0, 3).map((finding, idx) => (
                        <div key={idx} className="bg-slate-800/50 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <span className="text-xl">{getSeverityIcon(finding.severity)}</span>
                                <div className="flex-1">
                                    <div className="font-semibold text-white mb-1 uppercase text-xs tracking-wide">
                                        {finding.severity}: {finding.title}
                                    </div>
                                    <div className="text-sm text-slate-400">{finding.description}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 text-xs text-slate-500 italic">
                    Additional findings available in full report - details require unlock
                </div>
            </div>

            {/* Locked Section */}
            <div className="px-8 py-8 border-b border-slate-800 relative">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">DETAILED ANALYSIS</h2>
                    <Lock className="w-5 h-5 text-slate-600" />
                </div>

                <div className="relative">
                    <div className="absolute inset-0 backdrop-blur-md bg-slate-900/80 rounded-xl flex items-center justify-center z-10">
                        <div className="text-center">
                            <Lock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-sm font-medium text-slate-400">Unlock for detailed analysis</p>
                        </div>
                    </div>

                    <div className="bg-slate-800/30 rounded-xl p-6 text-slate-600 select-none">
                        <div className="space-y-3">
                            <div className="h-4 bg-slate-700/30 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-700/30 rounded w-full"></div>
                            <div className="h-4 bg-slate-700/30 rounded w-5/6"></div>
                            <div className="h-4 bg-slate-700/30 rounded w-2/3"></div>
                            <div className="h-4 bg-slate-700/30 rounded w-full"></div>
                            <div className="h-4 bg-slate-700/30 rounded w-4/5"></div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 text-xs text-slate-400">
                    <p className="font-medium mb-2">Includes:</p>
                    <ul className="space-y-1 text-slate-500">
                        <li>• Full forensic reasoning & legal context</li>
                        <li>• Mitigation strategies & action plan</li>
                        <li>• Evidence documentation & confidence scores</li>
                        <li>• Exportable PDF report</li>
                    </ul>
                </div>
            </div>

            {/* Next Steps */}
            <div className="px-8 py-8 bg-slate-900/80">
                <div className="text-center mb-6">
                    <div className="inline-block px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-xs font-bold text-red-400 uppercase tracking-wider mb-3">
                        ⚠️ Immediate Action Required
                    </div>
                    <p className="text-sm text-slate-400 max-w-lg mx-auto">
                        This asset presents {riskProfile.composite_score >= 85 ? 'significant' : riskProfile.composite_score >= 60 ? 'moderate' : 'potential'} risk. Review options below:
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    {/* Unlock Report */}
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-indigo-500/50 transition-all group">
                        <FileText className="w-8 h-8 text-indigo-500 mb-3" />
                        <h3 className="font-bold text-white mb-2">Unlock Full Report</h3>
                        <p className="text-xs text-slate-400 mb-4">One-time access to complete analysis</p>
                        <div className="text-2xl font-bold text-white mb-4">$29</div>
                        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all">
                            Purchase Report
                        </button>
                    </div>

                    {/* Upgrade to Pro */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 border border-indigo-400 relative overflow-hidden shadow-xl">
                        <div className="absolute top-3 right-[-30px] bg-white text-indigo-600 text-[8px] font-black px-8 py-1 rotate-45 uppercase tracking-wider">
                            Best Value
                        </div>
                        <TrendingUp className="w-8 h-8 text-white mb-3" />
                        <h3 className="font-bold text-white mb-2">Upgrade to Pro</h3>
                        <p className="text-xs text-indigo-100 mb-4">Unlimited scans + team features</p>
                        <div className="text-2xl font-bold text-white mb-1">$49.99<span className="text-sm font-normal">/mo</span></div>
                        <p className="text-[10px] text-indigo-200 mb-4">Starting at</p>
                        <button className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all">
                            Start Trial
                        </button>
                    </div>

                    {/* IP Insurance */}
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-emerald-500/50 transition-all group">
                        <Shield className="w-8 h-8 text-emerald-500 mb-3" />
                        <h3 className="font-bold text-white mb-2">Explore IP Insurance</h3>
                        <p className="text-xs text-slate-400 mb-4">Protect against copyright claims</p>
                        <div className="text-sm text-slate-500 mb-4">Partner coverage available</div>
                        <button className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all">
                            Learn More →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
