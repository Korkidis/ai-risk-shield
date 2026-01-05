import { ExtendedScan, ScanFinding, ExtendedAsset } from '@/types/database'

interface FullForensicReportProps {
    scan: ExtendedScan
    asset: ExtendedAsset
    findings: ScanFinding[]
    tenantName: string
    userName: string
}

export function FullForensicReport({ scan, asset, findings, tenantName, userName }: FullForensicReportProps) {
    const score = scan.composite_score || 0
    const riskColor = score > 65 ? '#ef4444' : score > 35 ? '#f59e0b' : '#10b981'
    const riskLabel = score > 75 ? 'CRITICAL RISK' : score > 50 ? 'HIGH LIABILITY' : score > 25 ? 'MODERATE RISK' : 'LOW RISK'

    return (
        <div className="max-w-[210mm] mx-auto bg-white text-slate-900 p-12 min-h-screen shadow-2xl print:shadow-none font-sans relative overflow-hidden">

            {/* Watermark for low trust? Or just styling */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] text-[200px] font-black leading-none select-none flex items-center justify-center -rotate-45 uppercase">
                CONFIDENTIAL
            </div>

            {/* Header */}
            <header className="border-b-[4px] border-slate-900 pb-8 mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Forensic Analysis Report</h1>
                    <div className="text-slate-500 text-sm uppercase tracking-widest font-mono">
                        ID: {scan.id} • {new Date().toLocaleDateString()}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Prepared For</div>
                    <div className="text-xl font-black">{tenantName}</div>
                    <div className="text-sm text-slate-500">{userName}</div>
                </div>
            </header>

            {/* Executive Summary Grid */}
            <section className="bg-slate-50 p-8 rounded-xl border-2 border-slate-200 mb-12">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-200 pb-2">Executive Summary</h2>

                <div className="flex items-center gap-12">

                    {/* Big Score */}
                    <div className="text-center relative">
                        <div className="w-40 h-40 rounded-full border-[12px] flex items-center justify-center relative bg-white" style={{ borderColor: riskColor }}>
                            <span className="text-6xl font-black">{score}</span>
                        </div>
                        <div className="mt-4 font-black uppercase tracking-widest text-sm" style={{ color: riskColor }}>
                            {riskLabel}
                        </div>
                    </div>

                    {/* Asset Info */}
                    <div className="flex-1 space-y-4 font-mono text-sm">
                        <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span className="text-slate-500">Asset Filename</span>
                            <span className="font-bold">{asset.filename}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span className="text-slate-500">File Type</span>
                            <span className="font-bold">{asset.file_type.toUpperCase()} / {asset.mime_type}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span className="text-slate-500">Size</span>
                            <span className="font-bold">{(asset.file_size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-1">
                            <span className="text-slate-500">Scan Date</span>
                            <span className="font-bold">{new Date(scan.created_at).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Risk Breakdown */}
            <section className="grid grid-cols-3 gap-6 mb-12">
                {[
                    { label: 'IP Risk', score: scan.ip_risk_score, text: 'Copyright/TM Exposure' },
                    { label: 'Brand Safety', score: scan.safety_risk_score, text: 'NSFW/Hate/Violence' },
                    { label: 'Provenance', score: scan.provenance_risk_score, text: 'C2PA/Chain of Custody' }
                ].map(m => (
                    <div key={m.label} className="border-2 border-slate-900 rounded-lg p-6">
                        <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">{m.label}</div>
                        <div className="text-5xl font-black mb-2">{m.score || 0}<span className="text-lg text-slate-400 font-normal">/100</span></div>
                        <div className="text-xs text-slate-500">{m.text}</div>
                    </div>
                ))}
            </section>

            {/* Findings Table */}
            <section className="mb-12">
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                    <span className="w-2 h-8 bg-indigo-600 block"></span>
                    Key Findings
                </h2>

                <div className="space-y-4">
                    {findings.map((finding) => (
                        <div key={finding.id} className="border-2 border-slate-100 rounded-xl p-6 break-inside-avoid">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded text-xs font-black uppercase tracking-wider ${finding.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                            finding.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {finding.severity}
                                    </span>
                                    <h3 className="font-bold text-lg">{finding.title}</h3>
                                </div>
                                <div className="text-sm font-mono text-slate-400">conf. {finding.confidence_score}%</div>
                            </div>
                            <p className="text-slate-600 mb-4 leading-relaxed bg-slate-50 p-4 rounded-lg text-sm">{finding.description}</p>

                            {/* Recommendation */}
                            <div className="flex gap-4 items-start text-sm">
                                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold flex-shrink-0">!</div>
                                <div>
                                    <span className="font-bold text-slate-900 block mb-1">Recommendation</span>
                                    <span className="text-slate-600">The content should be reviewed. Specific legal counsel advised for this severity level.</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {findings.length === 0 && (
                        <div className="text-center py-12 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
                            <p className="text-slate-400 font-medium">No critical findings detected.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 pt-8 mt-auto flex justify-between text-xs text-slate-400 font-mono uppercase tracking-widest">
                <div>Generated by AI Risk Shield</div>
                <div>Page 1 of 1</div>
            </footer>
        </div>
    )
}
