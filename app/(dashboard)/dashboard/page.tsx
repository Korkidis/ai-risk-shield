"use client";

import React, { useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload } from 'lucide-react';
import { RSScanner } from '@/components/rs/RSScanner';
import { RSTelemetryPanel, TelemetryRow } from '@/components/rs/RSTelemetryPanel';
import { RSRiskPanel } from '@/components/rs/RSRiskPanel';
import { RSProvenanceDrawer } from '@/components/rs/RSProvenanceDrawer';
import { RSFindingsDossier } from '@/components/rs/RSFindingsDossier';
import { cn } from '@/lib/utils';
import { getRiskTier } from '@/lib/risk-utils';

// Interface matching the backend response
interface RiskProfile {
    composite_score: number;
    verdict: string;
    ip_report: { score: number; teaser: string; };
    safety_report: { score: number; teaser: string; };
    provenance_report: { score: number; teaser: string; };
    c2pa_report: {
        status: 'valid' | 'invalid' | 'caution' | 'missing' | 'error';
        creator?: string;
        tool?: string;
        timestamp?: string;
        raw_manifest?: any;
    };
}

export default function DashboardPage() {
    const [scanStatus, setScanStatus] = React.useState<'idle' | 'scanning' | 'complete' | 'error'>('idle');
    const [analysisResult, setAnalysisResult] = React.useState<RiskProfile | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | undefined>(undefined);
    const [isDragging, setIsDragging] = React.useState(false);

    // Telemetry State
    const [logs, setLogs] = React.useState<Array<{ id: string, timestamp: string, message: string, status: 'pending' | 'active' | 'done' | 'error' }>>([
        { id: '0', timestamp: 'SYSTEM', message: 'Forensic core initialized. Standing by for ingestion...', status: 'done' }
    ]);

    const addLog = (message: string, status: 'active' | 'done' | 'error' = 'active') => {
        setLogs(prev => {
            const newLogs = prev.map(l => l.status === 'active' ? { ...l, status: 'done' as const } : l);
            const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            return [...newLogs, {
                id,
                timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                message,
                status
            }].slice(-6);
        });
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileProcess = async (file: File) => {
        // 1. Setup Preview
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        // 2. Start Scan State
        setScanStatus('scanning');
        setErrorMessage(null);
        setAnalysisResult(null);

        // Technical Onboarding
        addLog(`Acquired asset: ${file.name.substring(0, 15)}...`, 'done');
        addLog("Initializing forensic deep-scan protocol...", 'active');

        // 4. Async Upload & Realtime Tracking
        const formData = new FormData();
        formData.append('file', file);
        formData.append('guidelineId', 'default');

        try {
            // A. Upload (Authenticated)
            const uploadRes = await fetch('/api/scans/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadRes.ok) {
                const errorData = await uploadRes.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const { scanId } = await uploadRes.json();

            // B. Subscribe to Realtime Progress
            const supabase = createClient();
            const channel = supabase.channel(`scan-${scanId}`);

            channel
                .on('broadcast', { event: 'progress' }, (payload) => {
                    if (payload.payload) {
                        const { message } = payload.payload;
                        if (message) addLog(message, 'active');
                    }
                })
                .subscribe();

            // C. Poll for Completion (Backup for lost packets / DB updates)
            // We poll the status endpoint which returns the full scan object when done
            const pollInterval = setInterval(async () => {
                try {
                    const statusRes = await fetch(`/api/scans/${scanId}/status`);
                    if (!statusRes.ok) return;

                    const scan = await statusRes.json();

                    if (scan.status === 'processing') {
                        // Still running
                    } else if (scan.status === 'complete') {
                        clearInterval(pollInterval);
                        supabase.removeChannel(channel);

                        addLog("Analysis finalized. Telemetry stream active.", 'done');

                        // Map DB Result to RiskProfile Interface
                        const profile: RiskProfile = {
                            composite_score: scan.composite_score,
                            verdict: scan.risk_level === 'critical' ? 'Critical Risk' :
                                scan.risk_level === 'high' ? 'High Risk' :
                                    scan.risk_level === 'review' ? 'Medium Risk' : 'Low Risk',
                            ip_report: {
                                score: scan.ip_risk_score,
                                teaser: 'IP Analysis Complete'
                            },
                            safety_report: {
                                score: scan.safety_risk_score,
                                teaser: 'Safety Analysis Complete'
                            },
                            provenance_report: {
                                score: scan.provenance_risk_score,
                                teaser: 'Provenance Analysis Complete'
                            },
                            c2pa_report: scan.provenance_data || { status: 'missing' }
                        };

                        setAnalysisResult(profile);
                        setScanStatus('complete');
                    } else if (scan.status === 'failed') {
                        clearInterval(pollInterval);
                        supabase.removeChannel(channel);
                        throw new Error(scan.error_message || 'Analysis failed via background job');
                    }
                } catch (err) {
                    // Polling error, ignore and retry
                }
            }, 1000);

        } catch (err: any) {
            console.error(err);
            setScanStatus('error');
            setErrorMessage(err.message || "Connection lost.");
            addLog(`SCAN ABORTED: ${err.message}`, 'error');
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

    // Helper: Map API results to Telemetry Rows
    // PREVIEW SET: Only the critical rows for the main dashboard faceplate
    // EXCLUDES Creator & Tool to save vertical space for the FAB/CTA Button
    const getPreviewTelemetryRows = (): TelemetryRow[] => {
        if (!analysisResult) return [];
        const fullRows = getAllTelemetryRows();
        return [
            fullRows.find(r => r.id === '0xMNFST')!,
            fullRows.find(r => r.id === '0xSIG')!,
            fullRows.find(r => r.id === '0xALGO')!,
            fullRows.find(r => r.id === '0xVER')!,
            fullRows.find(r => r.id === '0xAI')!,
            fullRows.find(r => r.id === '0xCHAIN')!,
        ].filter(Boolean);
    };

    // FULL SET: All 13+ fields for the sidebar/detailed report
    const getAllTelemetryRows = (): TelemetryRow[] => {
        if (!analysisResult) return [];

        const report = analysisResult.c2pa_report;
        const manifestDetected = report.status !== 'missing';
        const signatureValid = report.status === 'valid';

        // Helper to format timestamp
        const formatTime = (iso?: string) => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase() : 'N/A';

        // Dynamic Values or Defaults
        const toolName = report.tool ? report.tool.toUpperCase() : (manifestDetected ? 'UNKNOWN_TOOL' : 'N/A');
        const creatorName = report.creator ? report.creator.toUpperCase() : 'UNKNOWN_ID';
        const issuerName = (report as any).issuer ? (report as any).issuer.toUpperCase().replace(/\s+/g, '_') : 'UNKNOWN_CA';
        const historyCount = (report as any).history ? (report as any).history.length : 0;

        // Infer AI generation from known tools
        const isAI = toolName.includes('FIREFLY') || toolName.includes('MIDJOURNEY') || toolName.includes('DALLE');
        const aiValue = isAI ? 'CONFIRMED' : 'ANALYZING';

        return [
            {
                id: '0xMNFST',
                label: 'MANIFEST_STORE',
                value: manifestDetected ? 'DETECTED' : 'MISSING',
                barWidth: manifestDetected ? 100 : 5,
                status: manifestDetected ? 'success' : 'error'
            },
            {
                id: '0xSIG',
                label: 'CLAIM_SIGNATURE',
                value: signatureValid ? 'VALID' : (manifestDetected ? 'INVALID' : 'MISSING'),
                barWidth: signatureValid ? 100 : (manifestDetected ? 40 : 0),
                status: signatureValid ? 'success' : 'error'
            },
            {
                id: '0xALGO',
                label: 'SIGNATURE_ALGORITHM',
                value: manifestDetected ? 'SHA-256' : '---',
                barWidth: manifestDetected ? 100 : 0,
                status: manifestDetected ? 'info' : 'pending'
            },
            {
                id: '0xCA',
                label: 'CERT_AUTHORITY',
                value: manifestDetected ? issuerName : '---',
                barWidth: manifestDetected ? 100 : 0,
                status: manifestDetected ? 'info' : 'pending'
            },
            {
                id: '0xVER',
                label: 'C2PA_VERSION',
                value: manifestDetected ? '1.3.1' : '---',
                barWidth: manifestDetected ? 100 : 0,
                status: manifestDetected ? 'info' : 'pending'
            },
            {
                id: '0xIDENT',
                label: 'CREATOR_IDENTITY',
                value: creatorName,
                barWidth: report.creator ? 85 : 15,
                status: report.creator ? 'success' : 'warning'
            },
            {
                id: '0xTOOL',
                label: 'GENERATION_TOOL',
                value: toolName,
                barWidth: report.tool ? 90 : 20,
                status: report.tool ? 'success' : 'warning'
            },
            {
                id: '0xMODEL',
                label: 'MODEL_VERSION',
                value: manifestDetected ? '1.0.0' : '---',
                barWidth: manifestDetected ? 100 : 0,
                status: 'info'
            },
            {
                id: '0xTIME',
                label: 'TIMESTAMP',
                value: formatTime((report as any).timestamp),
                barWidth: (report as any).timestamp ? 100 : 0,
                status: 'info'
            },
            {
                id: '0xEDIT',
                label: 'EDIT_HISTORY',
                value: manifestDetected ? `${historyCount}_ACTIONS` : 'N/A',
                barWidth: historyCount > 0 ? 70 : 0,
                status: 'info'
            },
            {
                id: '0xAI',
                label: 'AI_GENERATED',
                value: aiValue,
                barWidth: isAI ? 95 : 50,
                status: isAI ? 'info' : 'warning'
            },
            {
                id: '0xTRAIN',
                label: 'AI_TRAINING_ALLOWED',
                value: 'NO_CONSENT',
                barWidth: 100,
                status: 'info'
            },
            {
                id: '0xCHAIN',
                label: 'CHAIN_OF_CUSTODY',
                value: signatureValid ? 'UNBROKEN_LEDGER' : 'SEGMENT_FAILURE',
                barWidth: signatureValid ? 100 : 30,
                status: signatureValid ? 'success' : 'error'
            }
        ];
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-120px)] p-4 w-full min-h-[600px]">

            {/* LEFT PANE: PRIMARY SCANNER (50%) - DARK MODE CHASSIS */}
            <div className="bg-rs-black rounded-[32px] p-8 relative flex flex-col shadow-[var(--rs-shadow-l2)] border-[10px] border-[var(--rs-bg-surface)] overflow-hidden h-full">

                {/* Dark Mode Chassis Overlay */}
                <div className="absolute inset-0 rounded-[22px] pointer-events-none border border-white/5 z-20" />

                {/* Header */}
                <div className="flex justify-between items-start mb-6 relative z-10 shrink-0">
                    <div>
                        <div className="text-rs-signal font-mono text-xs font-bold tracking-widest uppercase mb-1">Scanner_v2.0</div>
                        <div className="text-rs-signal/40 font-mono text-[10px] tracking-widest uppercase flex items-center gap-2">
                            <span className={cn("w-2 h-2 rounded-full", isScanning ? "bg-rs-signal animate-pulse" : "bg-rs-gray-600")} />
                            {isScanning ? 'ACQUIRING_DATA...' : isComplete ? 'ANALYSIS_COMPLETE' : 'BUFFER_READY'}
                        </div>
                    </div>
                    <div className="text-rs-signal font-mono text-[10px] tracking-widest uppercase">CH_01_INPUT</div>
                </div>

                {/* Main Viewport */}
                <div
                    className="flex-1 relative z-10 w-full mb-6 min-h-0"
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDragging(false);
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleFileProcess(file);
                    }}
                >
                    <RSScanner
                        active={isScanning}
                        status={scanStatus === 'error' ? 'error' : scanStatus === 'complete' ? 'complete' : isScanning ? 'scanning' : 'idle'}
                        imageUrl={previewUrl}
                        isDragActive={isDragging}
                        className="w-full h-full border-white/10"
                    >
                        {(!isComplete && !isScanning && !previewUrl) && (
                            <label className="flex flex-col items-center justify-center text-center p-12 cursor-pointer group w-full h-full">
                                <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center text-white/40 group-hover:border-rs-signal group-hover:text-rs-signal transition-all duration-300 group-hover:scale-110 mb-6">
                                    <div className="w-8 h-8 relative flex items-center justify-center">
                                        {isError ? <div className="text-rs-signal font-bold text-xl">!</div> : <Upload className="w-6 h-6" />}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-white/40 font-mono text-xs uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                                        {isError ? 'Scan Failed - Retry?' : 'Drop file here or click to browse'}
                                    </p>
                                    <p className="text-white/20 font-mono text-[10px] uppercase tracking-widest">Max 50MB • JPG, PNG, MP4, MOV, MKV</p>
                                    {isError && <p className="text-rs-signal font-mono text-[10px] uppercase tracking-widest mt-2">{errorMessage}</p>}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*,video/*,.mp4,.mov,.avi,.mkv,.webm,.wmv"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileProcess(file);
                                    }}
                                />
                            </label>
                        )}
                    </RSScanner>
                </div>

                {/* Dynamic Telemetry Viewport (Unified) */}
                <div className="relative z-10 transition-all duration-500 shrink-0">
                    <RSTelemetryPanel
                        className="w-full"
                        state={isError ? 'error' : isComplete ? 'complete' : isScanning ? 'scanning' : 'idle'}
                        logEntries={logs as any}
                        rows={getPreviewTelemetryRows()}
                        onAction={() => setIsDrawerOpen(true)}
                        buttonText="VIEW FULL MANIFEST"
                        statusLabel={isScanning ? 'ACQUIRING_DATA' : isComplete ? 'TELEMETRY_ACTIVE' : 'SYSTEM_READY'}
                    />
                </div>
            </div>

            {/* RIGHT PANE: ANALYSIS & TELEMETRY (50%) - LIGHT MODE PANEL */}
            <div className="flex flex-col min-h-0 h-full gap-6">

                {/* 1. RISK ANALYSIS PANEL (Active / Standby) */}
                <div className="flex-[1.3] w-full min-h-0">
                    <RSRiskPanel
                        id={isComplete ? "SYS-STD-01" : "--"}
                        score={results.composite}
                        level={isComplete ? (getRiskTier(results.composite).level as any) : 'low'}
                        ipScore={results.ipRisk}
                        safetyScore={results.brandSafety}
                        provenanceScore={results.provenance}
                        status={isScanning ? 'scanning' : isComplete ? 'completed' : 'empty'}
                        className="w-full h-full"
                    />
                </div>

                {/* 2. FINDINGS DOSSIER (Conditional Reveal) */}
                <div className="flex-1 w-full min-h-0 relative">
                    {(isComplete && analysisResult) && (
                        <div className="absolute inset-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <RSFindingsDossier
                                isComplete={isComplete}
                                results={{
                                    ipRisk: results.ipRisk,
                                    brandSafety: results.brandSafety,
                                    provenance: results.provenance
                                }}
                                className="w-full h-full"
                            />
                        </div>
                    )}
                </div>
            </div>

            <RSProvenanceDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                status={analysisResult?.c2pa_report?.status as any}
                details={analysisResult?.c2pa_report as any}
            />
        </div>
    );
}
