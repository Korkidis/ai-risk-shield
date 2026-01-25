"use client";

import React, { useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { RSScanner } from '@/components/rs/RSScanner';
import { RSSystemLog } from '@/components/rs/RSSystemLog';
import { RSC2PAWidget } from '@/components/rs/RSC2PAWidget';
import { RSPanel } from '@/components/rs/RSPanel';
import { RSRiskBadge } from '@/components/rs/RSRiskBadge';
import { RSMeter } from '@/components/rs/RSMeter';
import { RSAnalogNeedle } from '@/components/rs/RSAnalogNeedle';
import { RSFindingsDossier } from '@/components/rs/RSFindingsDossier';
import { cn } from '@/lib/utils';

// Interface matching the backend response
interface RiskProfile {
    composite_score: number;
    verdict: string;
    ip_report: { score: number; teaser: string; };
    safety_report: { score: number; teaser: string; };
    provenance_report: { score: number; teaser: string; };
    c2pa_report: { status: string; };
}

export default function DashboardPage() {
    const [scanStatus, setScanStatus] = React.useState<'idle' | 'scanning' | 'complete' | 'error'>('idle');
    const [analysisResult, setAnalysisResult] = React.useState<RiskProfile | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | undefined>(undefined);

    // Telemetry State
    const [logs, setLogs] = React.useState<Array<{ id: string, timestamp: string, message: string, status: 'pending' | 'active' | 'done' | 'error' }>>([
        { id: '0', timestamp: 'SYSTEM', message: 'Forensic core initialized. Ready.', status: 'done' }
    ]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial "Ready" log
    useEffect(() => {
        if (scanStatus === 'idle') {
            setLogs([{ id: '0', timestamp: 'SYSTEM', message: 'Forensic core initialized. Ready for input.', status: 'done' }]);
        }
    }, [scanStatus]);

    const addLog = (message: string, status: 'active' | 'done' | 'error' = 'active') => {
        setLogs(prev => {
            // Mark previous active as done
            const newLogs = prev.map(l => l.status === 'active' ? { ...l, status: 'done' as const } : l);
            return [...newLogs, {
                id: Date.now().toString(),
                timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                message,
                status
            }].slice(-6); // Keep last 6
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 1. Setup Preview
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        // 2. Start Scan State
        setScanStatus('scanning');
        setErrorMessage(null);
        setAnalysisResult(null);
        setLogs([]); // Clear old logs

        // 3. Telemetry Simulation
        addLog(`Acquired asset: ${file.name.substring(0, 15)}...`, 'done');

        await new Promise(r => setTimeout(r, 600));
        addLog(`Analyzing metadata structure (${file.type})...`, 'active');

        // 4. API Call
        const formData = new FormData();
        formData.append('file', file);
        formData.append('guidelineId', 'default');

        try {
            // Simulate waiting steps while API runs in background
            const telemetryInterval = setInterval(() => {
                const steps = [
                    "Verifying C2PA digital signature chain...",
                    "Extracting visual feature vectors...",
                    "Checking global IP blocklists...",
                    "Synthesizing risk profile..."
                ];
                const msg = steps[Math.floor(Math.random() * steps.length)];
                addLog(msg, 'active');
            }, 1200);

            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
            });

            clearInterval(telemetryInterval);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Analysis failed');
            }

            const data: RiskProfile = await response.json();

            // 5. Completion
            addLog("Analysis complete. Risk profile generated.", 'done');
            setAnalysisResult(data);
            setScanStatus('complete');

        } catch (err: any) {
            console.error(err);
            setScanStatus('error');
            setErrorMessage(err.message || "Connection lost.");
            addLog(`CRITICAL FAILURE: ${err.message}`, 'error');
        }
    };

    // Derived values based on state
    const isScanning = scanStatus === 'scanning';
    const isComplete = scanStatus === 'complete';
    const isError = scanStatus === 'error';

    // Map API results to UI requirements
    const results = {
        ipRisk: analysisResult?.ip_report.score ?? 0,
        brandSafety: analysisResult?.safety_report.score ?? 0,
        provenance: analysisResult?.provenance_report.score ?? 0,
        composite: analysisResult?.composite_score ?? 0,
        verdict: analysisResult?.verdict ?? 'READY'
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full p-4 w-full min-h-[900px]">

            {/* LEFT PANE: PRIMARY SCANNER (65%) */}
            <div className="flex-[2] bg-[#121212] rounded-[32px] p-8 relative flex flex-col shadow-[var(--rs-shadow-l2)] border-[10px] border-[var(--rs-bg-surface)] overflow-hidden">

                {/* Dark Mode Chassis Overlay */}
                <div className="absolute inset-0 rounded-[22px] pointer-events-none border border-white/5 z-20" />

                {/* Header */}
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                        <div className="text-[#FF4F00] font-mono text-xs font-bold tracking-widest uppercase mb-1">Scanner_v2.0</div>
                        <div className="text-[#FF4F00]/40 font-mono text-[10px] tracking-widest uppercase flex items-center gap-2">
                            <span className={cn("w-2 h-2 rounded-full", isScanning ? "bg-[#FF4F00] animate-pulse" : "bg-rs-gray-600")} />
                            {isScanning ? 'ACQUIRING_DATA...' : isComplete ? 'ANALYSIS_COMPLETE' : 'BUFFER_READY'}
                        </div>
                    </div>
                    <div className="text-[#FF4F00] font-mono text-[10px] tracking-widest uppercase">CH_01_INPUT</div>
                </div>

                {/* Main Viewport */}
                <div className="flex-1 flex items-center justify-center relative z-10 min-h-[400px]">
                    <div className="w-full max-w-2xl">
                        <RSScanner
                            active={isScanning}
                            status={scanStatus === 'error' ? 'error' : scanStatus === 'complete' ? 'complete' : isScanning ? 'scanning' : 'idle'}
                            imageUrl={previewUrl}
                            className="border-0 bg-transparent shadow-none"
                        />

                        {!isScanning && (
                            <div className="text-center mt-8">
                                <label className="inline-flex flex-col items-center gap-4 cursor-pointer group">
                                    <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center text-white/40 group-hover:border-[#FF4F00] group-hover:text-[#FF4F00] transition-colors">
                                        <div className="w-8 h-8 relative">
                                            {isError ? <div className="text-red-500 font-bold">!</div> : <div className="border-t-2 border-current w-full h-full absolute top-1/2" />}
                                            {!isError && <Upload className="w-6 h-6" />}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-white/40 font-mono text-xs uppercase tracking-widest group-hover:text-white transition-colors">
                                            {isError ? 'Scan Failed - Retry?' : 'Drop file here or click to browse'}
                                        </p>
                                        <p className="text-white/20 font-mono text-[10px] uppercase tracking-widest">Max 50MB • .JPG/.PNG/.MP4</p>
                                        {isError && <p className="text-red-500 font-mono text-[10px] uppercase tracking-widest">{errorMessage}</p>}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/jpeg,image/png,image/webp,video/mp4"
                                        onChange={handleFileUpload}
                                    />
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                {/* System Log / Provenance Log Replacement */}
                <div className="mt-8 relative z-10">
                    {!isComplete ? (
                        <RSSystemLog
                            logs={logs}
                            className="bg-black/50 border-white/10 text-white/60 h-40"
                        />
                    ) : (
                        <RSC2PAWidget
                            className="w-full h-[320px]"
                            isComplete={isComplete}
                        />
                    )}
                </div>
            </div>

            {/* RIGHT PANE: ANALYSIS & TELEMETRY (35%) */}
            <div className="flex-1 flex flex-col gap-6 min-h-0 pt-2">

                {/* UNIFIED RISK INSTRUMENT PANEL */}
                <RSPanel
                    title="Risk Analysis Panel"
                    metadata={[{ label: 'ID', value: isComplete ? '44-X' : '--' }]}
                    action={isComplete && <RSRiskBadge level={results.composite > 80 ? 'critical' : results.composite > 40 ? 'warning' : 'safe'} />}
                >
                    {/* TOP SECTION: COMPOSITE SCORE */}
                    <div className="flex items-center gap-10 mb-6">
                        <div className="text-5xl font-black tracking-tighter rs-etched leading-none">
                            {isComplete ? `${results.composite}%` : '00%'}
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="flex justify-between text-[10px] font-black uppercase text-[#9A9691] tracking-widest">
                                <span>Likelihood</span>
                                <span className={cn(
                                    results.composite > 80 ? "text-[#FF4F00]" : results.composite > 40 ? "text-orange-500" : "text-emerald-600",
                                    !isComplete && "opacity-0"
                                )}>
                                    {results.composite > 80 ? 'Critical' : results.composite > 40 ? 'Warning' : 'Safe'}
                                </span>
                            </div>
                            <RSMeter value={isComplete ? results.composite : 0} level={results.composite > 80 ? 'critical' : results.composite > 40 ? 'warning' : 'safe'} />
                        </div>
                    </div>

                    {/* BOTTOM SECTION: ANALOG TELEMETRY */}
                    <div className="pt-4 border-t border-[#1A1A1A]/5">
                        <div className="flex justify-center items-start gap-8">
                            <RSAnalogNeedle value={results.ipRisk} label="IP Risk" isScanning={isScanning} powered={isScanning || isComplete} size={150} />
                            <RSAnalogNeedle value={results.brandSafety} label="Brand Safety" isScanning={isScanning} powered={isScanning || isComplete} size={150} />
                            <RSAnalogNeedle value={results.provenance} label="Provenance" isScanning={isScanning} powered={isScanning || isComplete} size={150} />
                        </div>
                    </div>
                </RSPanel>

                <RSFindingsDossier isComplete={isComplete} results={results} />


            </div>
        </div>
    );
}
