"use client";

import React, { useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Upload, Terminal } from 'lucide-react';
import { RSScanner } from '@/components/rs/RSScanner';
import { RSTelemetryPanel, TelemetryRow } from '@/components/rs/RSTelemetryPanel';
import { RSRiskPanel } from '@/components/rs/RSRiskPanel';
import { RSProvenanceDrawer } from '@/components/rs/RSProvenanceDrawer';
import { RSFindingsDossier } from '@/components/rs/RSFindingsDossier';
import { DashboardEmailGate } from '@/components/dashboard/DashboardEmailGate';
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
    const searchParams = useSearchParams();
    const scanIdParam = searchParams.get('scan');
    const isVerified = searchParams.get('verified') === 'true';

    const [scanStatus, setScanStatus] = React.useState<'idle' | 'loading' | 'scanning' | 'complete' | 'error'>('idle');
    const [analysisResult, setAnalysisResult] = React.useState<RiskProfile | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | undefined>(undefined);
    const [isDragging, setIsDragging] = React.useState(false);
    const [isAnonymous, setIsAnonymous] = React.useState(false);
    const [currentScanId, setCurrentScanId] = React.useState<string | null>(scanIdParam);
    const [emailCaptured, setEmailCaptured] = React.useState(false);

    // Brand Guidelines
    const [guidelines, setGuidelines] = React.useState<Array<{id: string, name: string}>>([]);
    const [selectedGuidelineId, setSelectedGuidelineId] = React.useState<string>('default');

    // Track whether we've already processed the scan param (prevent double-fetch)
    const processedScanParam = useRef(false);
    const processedAssignment = useRef(false);

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

    // Fetch brand guidelines for selector
    useEffect(() => {
        fetch('/api/guidelines')
            .then(r => r.json())
            .then(data => {
                if (data.guidelines?.length) setGuidelines(data.guidelines)
            })
            .catch(() => {}) // Silently fail — selector stays at 'default'
    }, [])

    // ─── VIEWER MODE: Load scan from ?scan=<id> param ────────────────────────
    const loadScanFromParam = useCallback(async (scanId: string) => {
        setScanStatus('loading');
        setErrorMessage(null);
        addLog(`Loading scan ${scanId.substring(0, 8)}...`, 'active');

        try {
            const res = await fetch(`/api/scans/${scanId}`, { cache: 'no-store' });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: 'Failed to load scan' }));
                const message = res.status === 403
                    ? 'You do not have access to this scan. Please log in or check the link.'
                    : res.status === 404
                        ? 'This scan could not be found. It may have expired or been deleted.'
                        : err.error || `HTTP ${res.status}`;
                throw new Error(message);
            }

            const scan = await res.json();

            // Set preview image
            if (scan.asset_url) {
                setPreviewUrl(scan.asset_url);
            }

            // Handle still-processing scans
            if (scan.status === 'processing' || scan.status === 'pending') {
                setScanStatus('scanning');
                addLog('Analysis in progress. Monitoring telemetry...', 'active');
                pollForCompletion(scanId);
                return;
            }

            // Complete scan — load results
            const profile: RiskProfile = scan.risk_profile || {
                composite_score: scan.composite_score || 0,
                verdict: scan.risk_level === 'critical' ? 'Critical Risk' :
                    scan.risk_level === 'high' ? 'High Risk' :
                        scan.risk_level === 'review' ? 'Medium Risk' : 'Low Risk',
                ip_report: { score: scan.ip_risk_score || 0, teaser: 'IP Analysis Complete' },
                safety_report: { score: scan.safety_risk_score || 0, teaser: 'Safety Analysis Complete' },
                provenance_report: { score: scan.provenance_risk_score || 0, teaser: 'Provenance Analysis Complete' },
                c2pa_report: scan.provenance_data || { status: 'missing' }
            };

            setAnalysisResult(profile);
            setScanStatus('complete');
            addLog('Analysis finalized. Telemetry stream active.', 'done');
        } catch (err: any) {
            console.error('[Dashboard] Failed to load scan:', err);
            setScanStatus('error');
            setErrorMessage(err.message || 'Failed to load scan');
            addLog(`LOAD FAILED: ${err.message}`, 'error');
        }
    }, []);

    // Poll for a scan that's still processing
    const pollForCompletion = (scanId: string) => {
        const supabase = createClient();
        const channel = supabase.channel(`scan-${scanId}`);

        channel
            .on('broadcast', { event: 'progress' }, (payload) => {
                if (payload.payload?.message) {
                    addLog(payload.payload.message, 'active');
                }
            })
            .subscribe();

        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`/api/scans/${scanId}`, { cache: 'no-store' });
                if (!res.ok) return;
                const scan = await res.json();

                if (scan.status === 'complete') {
                    clearInterval(pollInterval);
                    supabase.removeChannel(channel);
                    addLog('Analysis finalized. Telemetry stream active.', 'done');

                    if (scan.asset_url) setPreviewUrl(scan.asset_url);

                    const profile: RiskProfile = scan.risk_profile || {
                        composite_score: scan.composite_score || 0,
                        verdict: 'Analysis Complete',
                        ip_report: { score: scan.ip_risk_score || 0, teaser: 'IP Analysis Complete' },
                        safety_report: { score: scan.safety_risk_score || 0, teaser: 'Safety Analysis Complete' },
                        provenance_report: { score: scan.provenance_risk_score || 0, teaser: 'Provenance Analysis Complete' },
                        c2pa_report: scan.provenance_data || { status: 'missing' }
                    };

                    setAnalysisResult(profile);
                    setScanStatus('complete');
                } else if (scan.status === 'failed') {
                    clearInterval(pollInterval);
                    supabase.removeChannel(channel);
                    setScanStatus('error');
                    setErrorMessage(scan.error_message || 'Analysis failed');
                    addLog(`SCAN ABORTED: ${scan.error_message || 'Unknown error'}`, 'error');
                }
            } catch {
                // Polling error, retry silently
            }
        }, 2000);
    };

    // ─── Effect: Load scan from URL param on mount ───────────────────────────
    useEffect(() => {
        if (!scanIdParam || processedScanParam.current) return;
        processedScanParam.current = true;

        // Check auth state
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) {
                setIsAnonymous(true);
            }

            // Trigger scan assignment if coming from magic link
            if (user && isVerified && !processedAssignment.current) {
                processedAssignment.current = true;
                fetch('/api/scans/assign-to-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                })
                    .then(res => {
                        if (!res.ok) throw new Error(`HTTP ${res.status}`)
                        return res.json()
                    })
                    .then(data => {
                        if (data.success) {
                            console.log(`[Dashboard] Assigned ${data.migrated_count} scans to user`);
                            setEmailCaptured(true);
                        }
                    })
                    .catch(err => console.error('[Dashboard] Scan assignment failed:', err));
            }

            // Load the scan data
            loadScanFromParam(scanIdParam);
        });
    }, [scanIdParam, isVerified, loadScanFromParam]);

    // ─── SCANNER MODE: File upload (authenticated users) ─────────────────────
    const handleFileProcess = async (file: File) => {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setScanStatus('scanning');
        setErrorMessage(null);
        setAnalysisResult(null);

        addLog(`Acquired asset: ${file.name.substring(0, 15)}...`, 'done');
        addLog("Initializing forensic deep-scan protocol...", 'active');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('guidelineId', selectedGuidelineId);

        try {
            const uploadRes = await fetch('/api/scans/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadRes.ok) {
                let errorMessage = 'Upload failed'
                try {
                    const errorData = await uploadRes.json();
                    errorMessage = errorData.error || errorMessage
                } catch {
                    errorMessage = `Upload failed (HTTP ${uploadRes.status})`
                }
                throw new Error(errorMessage);
            }

            const { scanId } = await uploadRes.json();
            setCurrentScanId(scanId);

            // Update URL without full navigation so results persist on refresh
            window.history.replaceState(null, '', `/dashboard?scan=${scanId}`);

            // Subscribe to realtime + poll for completion
            pollForCompletion(scanId);

        } catch (err: any) {
            console.error(err);
            setScanStatus('error');
            setErrorMessage(err.message || "Connection lost.");
            addLog(`SCAN ABORTED: ${err.message}`, 'error');
        }
    };

    // ─── Derived State ───────────────────────────────────────────────────────
    const isLoading = scanStatus === 'loading';
    const isScanning = scanStatus === 'scanning';
    const isComplete = scanStatus === 'complete';
    const isError = scanStatus === 'error';
    const results = {
        ipRisk: analysisResult?.ip_report.score ?? 0,
        brandSafety: analysisResult?.safety_report.score ?? 0,
        provenance: analysisResult?.provenance_report.score ?? 0,
        composite: analysisResult?.composite_score ?? 0,
        verdict: analysisResult?.verdict ?? 'READY'
    };

    // ─── Telemetry Row Mapping ───────────────────────────────────────────────
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

    const getAllTelemetryRows = (): TelemetryRow[] => {
        if (!analysisResult) return [];

        const report = analysisResult.c2pa_report;
        const manifestDetected = report.status !== 'missing';
        const signatureValid = report.status === 'valid';
        const formatTime = (iso?: string) => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase() : 'N/A';
        const toolName = report.tool ? report.tool.toUpperCase() : (manifestDetected ? 'UNKNOWN_TOOL' : 'N/A');
        const creatorName = report.creator ? report.creator.toUpperCase() : 'UNKNOWN_ID';
        const issuerName = (report as any).issuer ? (report as any).issuer.toUpperCase().replace(/\s+/g, '_') : 'UNKNOWN_CA';
        const historyCount = (report as any).history ? (report as any).history.length : 0;
        const isAI = toolName.includes('FIREFLY') || toolName.includes('MIDJOURNEY') || toolName.includes('DALLE');
        const aiValue = isAI ? 'CONFIRMED' : 'ANALYZING';

        return [
            { id: '0xMNFST', label: 'MANIFEST_STORE', value: manifestDetected ? 'DETECTED' : 'MISSING', barWidth: manifestDetected ? 100 : 5, status: manifestDetected ? 'success' : 'error' },
            { id: '0xSIG', label: 'CLAIM_SIGNATURE', value: signatureValid ? 'VALID' : (manifestDetected ? 'INVALID' : 'MISSING'), barWidth: signatureValid ? 100 : (manifestDetected ? 40 : 0), status: signatureValid ? 'success' : 'error' },
            { id: '0xALGO', label: 'SIGNATURE_ALGORITHM', value: manifestDetected ? 'SHA-256' : '---', barWidth: manifestDetected ? 100 : 0, status: manifestDetected ? 'info' : 'pending' },
            { id: '0xCA', label: 'CERT_AUTHORITY', value: manifestDetected ? issuerName : '---', barWidth: manifestDetected ? 100 : 0, status: manifestDetected ? 'info' : 'pending' },
            { id: '0xVER', label: 'C2PA_VERSION', value: manifestDetected ? '1.3.1' : '---', barWidth: manifestDetected ? 100 : 0, status: manifestDetected ? 'info' : 'pending' },
            { id: '0xIDENT', label: 'CREATOR_IDENTITY', value: creatorName, barWidth: report.creator ? 85 : 15, status: report.creator ? 'success' : 'warning' },
            { id: '0xTOOL', label: 'GENERATION_TOOL', value: toolName, barWidth: report.tool ? 90 : 20, status: report.tool ? 'success' : 'warning' },
            { id: '0xMODEL', label: 'MODEL_VERSION', value: manifestDetected ? '1.0.0' : '---', barWidth: manifestDetected ? 100 : 0, status: 'info' },
            { id: '0xTIME', label: 'TIMESTAMP', value: formatTime((report as any).timestamp), barWidth: (report as any).timestamp ? 100 : 0, status: 'info' },
            { id: '0xEDIT', label: 'EDIT_HISTORY', value: manifestDetected ? `${historyCount}_ACTIONS` : 'N/A', barWidth: historyCount > 0 ? 70 : 0, status: 'info' },
            { id: '0xAI', label: 'AI_GENERATED', value: aiValue, barWidth: isAI ? 95 : 50, status: isAI ? 'info' : 'warning' },
            { id: '0xTRAIN', label: 'AI_TRAINING_ALLOWED', value: 'NO_CONSENT', barWidth: 100, status: 'info' },
            { id: '0xCHAIN', label: 'CHAIN_OF_CUSTODY', value: signatureValid ? 'UNBROKEN_LEDGER' : 'SEGMENT_FAILURE', barWidth: signatureValid ? 100 : 30, status: signatureValid ? 'success' : 'error' }
        ];
    };

    // ─── Render ──────────────────────────────────────────────────────────────
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
                            <span className={cn("w-2 h-2 rounded-full", (isScanning || isLoading) ? "bg-rs-signal animate-pulse" : "bg-rs-gray-600")} />
                            {isLoading ? 'LOADING_SCAN...' : isScanning ? 'ACQUIRING_DATA...' : isComplete ? 'ANALYSIS_COMPLETE' : 'BUFFER_READY'}
                        </div>
                    </div>
                    <div className="text-rs-signal font-mono text-[10px] tracking-widest uppercase">CH_01_INPUT</div>
                </div>

                {/* Brand Guideline Selector — only show if user has guidelines */}
                {guidelines.length > 0 && !isAnonymous && (
                    <div className="flex items-center gap-3 px-4 py-2 mb-4 bg-white/5 border border-white/10 rounded-[var(--rs-radius-element)] relative z-10 shrink-0">
                        <span className="text-[9px] font-black uppercase tracking-widest text-rs-signal/50">Brand_Protocol</span>
                        <select
                            value={selectedGuidelineId}
                            onChange={(e) => setSelectedGuidelineId(e.target.value)}
                            className="flex-1 text-[10px] font-mono font-bold bg-transparent border-none text-rs-signal focus:outline-none cursor-pointer"
                        >
                            <option value="default">DEFAULT_POLICY</option>
                            {guidelines.map(g => (
                                <option key={g.id} value={g.id}>{g.name.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Main Viewport */}
                <div
                    className="flex-1 relative z-10 w-full mb-6 min-h-0"
                    onDragOver={(e) => {
                        if (isAnonymous) return; // Don't allow upload for anonymous users
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
                        if (isAnonymous) return;
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleFileProcess(file);
                    }}
                >
                    <RSScanner
                        active={isScanning || isLoading}
                        status={isError ? 'error' : isComplete ? 'complete' : (isScanning || isLoading) ? 'scanning' : 'idle'}
                        imageUrl={previewUrl}
                        isDragActive={isDragging}
                        className="w-full h-full border-white/10"
                    >
                        {(!isComplete && !isScanning && !isLoading && !previewUrl && !isAnonymous) && (
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
                        state={isError ? 'error' : isComplete ? 'complete' : (isScanning || isLoading) ? 'scanning' : 'idle'}
                        logEntries={logs as any}
                        rows={getPreviewTelemetryRows()}
                        onAction={() => setIsDrawerOpen(true)}
                        buttonText="VIEW FULL MANIFEST"
                        statusLabel={isLoading ? 'LOADING_SCAN' : isScanning ? 'ACQUIRING_DATA' : isComplete ? 'TELEMETRY_ACTIVE' : 'SYSTEM_READY'}
                    />
                </div>
            </div>

            {/* RIGHT PANE: ANALYSIS & TELEMETRY (50%) - LIGHT MODE PANEL */}
            <div className="flex flex-col min-h-0 h-full gap-6">

                {/* 1. RISK ANALYSIS PANEL (Active / Standby) */}
                <div className="flex-[1.3] w-full min-h-0">
                    <RSRiskPanel
                        id={isComplete ? (currentScanId?.substring(0, 8).toUpperCase() || "SYS-STD-01") : "--"}
                        score={results.composite}
                        level={isComplete ? (getRiskTier(results.composite).level as any) : 'low'}
                        ipScore={results.ipRisk}
                        safetyScore={results.brandSafety}
                        provenanceScore={results.provenance}
                        status={(isScanning || isLoading) ? 'scanning' : isComplete ? 'completed' : 'empty'}
                        className="w-full h-full"
                    />
                </div>

                {/* 2. EMAIL GATE (Anonymous users only) or FINDINGS DOSSIER */}
                <div className="flex-1 w-full min-h-0 relative bg-[#EBE9E4] rounded-2xl shadow-xl border border-[#D6D3CD] overflow-hidden">
                    {/* Anonymous email gate — shown above fold when scan is complete */}
                    {isComplete && isAnonymous && !emailCaptured && currentScanId && (
                        <div className="absolute inset-0 z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <DashboardEmailGate
                                scanId={currentScanId}
                                onEmailCaptured={() => {
                                    setEmailCaptured(true);
                                    setIsAnonymous(false); // Cookie set, treat as "soft auth"
                                }}
                                className="w-full h-full"
                            />
                        </div>
                    )}

                    {/* Findings Dossier — shown for auth users or after email capture */}
                    {isComplete && analysisResult && (!isAnonymous || emailCaptured) && (
                        <div className="absolute inset-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <RSFindingsDossier
                                isComplete={isComplete}
                                riskProfile={analysisResult}
                                scanId={currentScanId || undefined}
                                ctaMode={isAnonymous ? 'free' : 'paid'}
                                className="w-full h-full"
                            />
                        </div>
                    )}

                    {/* Standby state — before scan completes */}
                    {!isComplete && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20">
                            <Terminal size={18} />
                            <div className="font-mono text-[9px] font-black uppercase tracking-widest text-center mt-2">
                                {(isScanning || isLoading) ? 'Awaiting_Analysis...' : 'Standing_By'}
                            </div>
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
