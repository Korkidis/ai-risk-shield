"use client";

import React, { useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getAnonSessionId, getTenantBillingStatus, type BillingStatus } from '@/app/actions/billing';
import { Upload, Terminal } from 'lucide-react';
import { RSScanner } from '@/components/rs/RSScanner';
import { RSTelemetryPanel, TelemetryRow } from '@/components/rs/RSTelemetryPanel';
import { RSRiskPanel } from '@/components/rs/RSRiskPanel';
import { RSFindingsDossier } from '@/components/rs/RSFindingsDossier';
import { DashboardEmailGate } from '@/components/dashboard/DashboardEmailGate';
import { UnifiedScanDrawer } from '@/components/dashboard/UnifiedScanDrawer';
import { AuditModal } from '@/components/marketing/AuditModal';
import { cn } from '@/lib/utils';
import { getRiskTier } from '@/lib/risk-utils';
import { trackEvent } from '@/lib/analytics';
import { Entitlements } from '@/lib/entitlements';
import { generateForensicReport } from '@/lib/pdf-generator';
import { type PlanId } from '@/lib/plans';
import { type ScanWithRelations } from '@/types/database';

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
        issuer?: string;
        history?: Array<{ action: string; when?: string }>;
        raw_manifest?: Record<string, unknown>;
    };
}

const INITIAL_LOG_ENTRY = {
    id: '0',
    timestamp: 'SYSTEM',
    message: 'Forensic core initialized. Standing by for ingestion...',
    status: 'done' as const
};

export default function DashboardPage() {
    const searchParams = useSearchParams();
    const scanIdParam = searchParams.get('scan');
    const isVerified = searchParams.get('verified') === 'true';

    const [scanStatus, setScanStatus] = React.useState<'idle' | 'loading' | 'scanning' | 'complete' | 'error'>('idle');
    const [analysisResult, setAnalysisResult] = React.useState<RiskProfile | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | undefined>(undefined);
    const [isDragging, setIsDragging] = React.useState(false);
    const [isAnonymous, setIsAnonymous] = React.useState(false);
    const [currentScanId, setCurrentScanId] = React.useState<string | null>(scanIdParam);
    const [emailCaptured, setEmailCaptured] = React.useState(false);
    const [showAuditModal, setShowAuditModal] = React.useState(false);
    const [userPlan, setUserPlan] = React.useState<string>('free');
    const [billingStatus, setBillingStatus] = React.useState<BillingStatus | null>(null);
    const [anonSessionId, setAnonSessionId] = React.useState<string | null>(null);
    const [scanRecord, setScanRecord] = React.useState<ScanWithRelations | null>(null);
    const [isUnifiedDrawerOpen, setIsUnifiedDrawerOpen] = React.useState(false);
    const [notesBuffer, setNotesBuffer] = React.useState('');
    const [isUpdatingNotes, setIsUpdatingNotes] = React.useState(false);
    const [shareToast, setShareToast] = React.useState<string | null>(null);
    const [showDownloadBanner, setShowDownloadBanner] = React.useState(false);
    const [userContext, setUserContext] = React.useState<{ id: string; tenant_id: string; plan: PlanId } | null>(null);

    // Brand Guidelines
    const [guidelines, setGuidelines] = React.useState<Array<{ id: string, name: string }>>([]);
    const [selectedGuidelineId, setSelectedGuidelineId] = React.useState<string>('none');

    // Track whether we've already processed the scan param (prevent double-fetch)
    const processedScanParam = useRef(false);
    const processedAssignment = useRef(false);

    // Telemetry State
    const [logs, setLogs] = React.useState<Array<{ id: string, timestamp: string, message: string, status: 'pending' | 'active' | 'done' | 'error' }>>([
        INITIAL_LOG_ENTRY
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
    const emailGateRef = useRef<HTMLDivElement>(null);

    const mapScanToRecord = useCallback((scan: Record<string, any>): ScanWithRelations => {
        const riskProfile: RiskProfile = scan.risk_profile || {
            composite_score: scan.composite_score || 0,
            verdict: scan.risk_level === 'critical' ? 'Critical Risk' :
                scan.risk_level === 'high' ? 'High Risk' :
                    scan.risk_level === 'review' ? 'Medium Risk' : 'Low Risk',
            ip_report: { score: scan.ip_risk_score || 0, teaser: 'IP Analysis Complete' },
            safety_report: { score: scan.safety_risk_score || 0, teaser: 'Safety Analysis Complete' },
            provenance_report: { score: scan.provenance_risk_score || 0, teaser: 'Provenance Analysis Complete' },
            c2pa_report: scan.provenance_data || { status: 'missing' }
        };

        return {
            ...scan,
            filename: scan.assets?.filename || 'Unnamed Asset',
            file_type: scan.assets?.file_type || (scan.is_video ? 'video' : 'image'),
            file_size: scan.assets?.file_size || scan.file_size || 0,
            assets: scan.assets,
            asset_url: scan.asset_url || null,
            risk_profile: riskProfile,
            scan_findings: scan.scan_findings || [],
            provenance_details: scan.provenance_details || null,
            mitigation_reports: scan.mitigation_reports || [],
            notes: scan.notes || '',
        } as ScanWithRelations;
    }, []);

    // Fetch brand guidelines for selector + auto-select first/default
    useEffect(() => {
        fetch('/api/guidelines')
            .then(r => r.json())
            .then(data => {
                if (data.guidelines?.length) {
                    setGuidelines(data.guidelines)
                    // Auto-select: prefer is_default guideline, else first one
                    const defaultG = data.guidelines.find((g: any) => g.is_default)
                    setSelectedGuidelineId(defaultG?.id || data.guidelines[0].id)
                }
            })
            .catch(() => { }) // Silently fail — selector stays at 'none'
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
            const mappedScan = mapScanToRecord(scan);
            setScanRecord(mappedScan);
            setCurrentScanId(scan.id);
            setNotesBuffer(mappedScan.notes || '');
            setEmailCaptured((prev) => prev || Boolean(scan.email));

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
            const profile = mappedScan.risk_profile as RiskProfile;

            setAnalysisResult(profile);
            setScanStatus('complete');
            addLog('Analysis finalized. Telemetry stream active.', 'done');
            trackEvent('scan_completed', { scanId, score: profile.composite_score });
        } catch (err: any) {
            console.error('[Dashboard] Failed to load scan:', err);
            setScanStatus('error');
            setErrorMessage(err.message || 'Failed to load scan');
            addLog(`LOAD FAILED: ${err.message}`, 'error');
        }
    }, [mapScanToRecord]);

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

                    const mappedScan = mapScanToRecord(scan);
                    setScanRecord(mappedScan);
                    setCurrentScanId(scan.id);
                    setNotesBuffer(mappedScan.notes || '');
                    setEmailCaptured((prev) => prev || Boolean(scan.email));

                    if (scan.asset_url) setPreviewUrl(scan.asset_url);

                    const profile = mappedScan.risk_profile as RiskProfile;

                    setAnalysisResult(profile);
                    setScanStatus('complete');
                    trackEvent('scan_completed', { scanId, score: profile.composite_score });
                } else if (scan.status === 'failed') {
                    clearInterval(pollInterval);
                    supabase.removeChannel(channel);
                    setScanStatus('error');
                    setErrorMessage(scan.error_message || 'Analysis failed');
                    addLog(`SCAN ABORTED: ${scan.error_message || 'Unknown error'}`, 'error');
                    const mappedScan = mapScanToRecord(scan);
                    setScanRecord(mappedScan);
                    setCurrentScanId(scan.id);
                    setEmailCaptured((prev) => prev || Boolean(scan.email));
                }
            } catch {
                // Polling error, retry silently
            }
        }, 2000);
    };

    // ─── Effect: Fetch billing/plan status on mount (always, for all authenticated users) ──
    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) {
                setIsAnonymous(true);
                setUserContext(null);
                return;
            }
            setIsAnonymous(false);
            getTenantBillingStatus().then(billing => {
                console.log('[Dashboard] Billing status:', billing?.planId)
                setBillingStatus(billing);
                if (billing?.planId) {
                    setUserPlan(billing.planId);
                }
            }).catch((err) => {
                console.error('[Dashboard] Billing fetch failed:', err)
            });
        });
    }, []);

    // Needed for teaser entitlement checks in anonymous session mode.
    useEffect(() => {
        getAnonSessionId().then(setAnonSessionId).catch(() => { /* non-critical */ });
    }, []);

    useEffect(() => {
        if (!billingStatus) return;
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) return;
            setUserContext({
                id: user.id,
                tenant_id: scanRecord?.tenant_id || '',
                plan: (billingStatus.planId || 'free') as PlanId,
            });
        });
    }, [billingStatus, scanRecord?.tenant_id]);

    // ─── Effect: Load scan from URL param on mount ───────────────────────────
    useEffect(() => {
        if (!scanIdParam || processedScanParam.current) return;
        processedScanParam.current = true;

        // Check auth state
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            // Trigger scan assignment if coming from magic link
            // IMPORTANT: Must await assignment before loading scan, otherwise scan
            // may still be session-owned (not yet migrated to tenant) and auth fails
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
                    .catch(err => console.error('[Dashboard] Scan assignment failed:', err))
                    .finally(() => {
                        // Load scan AFTER assignment completes (success or failure)
                        loadScanFromParam(scanIdParam);
                    });
            } else {
                // No assignment needed — load scan immediately
                loadScanFromParam(scanIdParam);
            }
        });
    }, [scanIdParam, isVerified, loadScanFromParam]);

    useEffect(() => {
        if (!scanRecord) return;
        setNotesBuffer(scanRecord.notes || '');
    }, [scanRecord?.id]);

    // ─── SCANNER MODE: File upload (anonymous + authenticated) ───────────────
    const handleFileProcess = async (file: File) => {
        // Client-side video gate: block free users before upload
        const isVideoFile = file.type.startsWith('video/')
        if (isVideoFile && userPlan === 'free') {
            setScanStatus('error')
            setErrorMessage('Video analysis requires a PRO plan. Upgrade to unlock video scanning.')
            setShowAuditModal(true)
            return
        }

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setScanStatus('scanning');
        setErrorMessage(null);
        setAnalysisResult(null);
        setScanRecord(null);
        setIsUnifiedDrawerOpen(false);
        setNotesBuffer('');

        addLog(`Acquired asset: ${file.name.substring(0, 15)}...`, 'done');
        addLog("Initializing forensic deep-scan protocol...", 'active');

        const formData = new FormData();
        formData.append('file', file);
        if (!isAnonymous) {
            formData.append('guidelineId', selectedGuidelineId);
        }

        try {
            const uploadRes = await fetch(isAnonymous ? '/api/scans/anonymous-upload' : '/api/scans/upload', {
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
            setEmailCaptured(false);

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
    const isEmailLocked = isComplete && isAnonymous && !emailCaptured;
    const canViewFull = scanRecord
        ? Entitlements.canViewScanReport(userContext, scanRecord, anonSessionId || undefined)
        : false;
    const mitigationEntitlement = billingStatus
        ? Entitlements.getMitigationEntitlement({
            id: userContext?.tenant_id || scanRecord?.tenant_id || '',
            plan: (billingStatus.planId || 'free') as PlanId,
            monthly_scan_limit: billingStatus.monthlyScanLimit,
            monthly_report_limit: billingStatus.monthlyReportLimit ?? 0,
            seat_limit: billingStatus.seatLimit ?? 1,
            brand_profile_limit: billingStatus.brandProfileLimit ?? 1,
            monthly_mitigation_limit: billingStatus.monthlyMitigationLimit ?? 0,
            mitigations_used_this_month: billingStatus.mitigationsUsedThisMonth ?? 0,
        })
        : { included: 0, used: 0, canGenerate: false, overageCents: 2900 };
    const results = {
        ipRisk: analysisResult?.ip_report.score ?? 0,
        brandSafety: analysisResult?.safety_report.score ?? 0,
        provenance: analysisResult?.provenance_report.score ?? 0,
        composite: analysisResult?.composite_score ?? 0,
        verdict: analysisResult?.verdict ?? 'READY'
    };

    const handleNewScanAction = () => {
        setIsUnifiedDrawerOpen(false);
        setScanRecord(null);
        setCurrentScanId(null);
        setScanStatus('idle');
        setAnalysisResult(null);
        setErrorMessage(null);
        setPreviewUrl(undefined);
        setNotesBuffer('');
        setShowDownloadBanner(false);
        setEmailCaptured(false);
        setLogs([INITIAL_LOG_ENTRY]);

        trackEvent('new_scan_clicked', { source: 'manifest_panel', target: '/dashboard' });
        window.history.replaceState(null, '', '/dashboard');
    };

    const handleOpenScanResults = () => {
        if (!scanRecord || scanRecord.status !== 'complete') return;

        if (isEmailLocked) {
            emailGateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setIsUnifiedDrawerOpen(true);
        trackEvent('open_scan_results_clicked', { scanId: scanRecord.id, source: 'findings_panel' });
    };

    const handleDownload = (scan: ScanWithRelations) => {
        if (scan.status !== 'complete' || !scan.risk_profile) return;
        // Scan reports are always full for in-app downloads (scan report = free baseline)
        // isSample=true is only used for the sample PDF emailed during capture-email
        generateForensicReport(scan, scan.risk_profile, false);
    };

    const handleShare = async (scanId: string) => {
        if (!userContext) {
            setShareToast('Sign up required for sharing');
            setTimeout(() => setShareToast(null), 2500);
            return;
        }

        try {
            const res = await fetch(`/api/scans/${scanId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'share' }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const shareUrl = `${window.location.origin}/scan/${scanId}?token=${data.scan.share_token}`;
            await navigator.clipboard.writeText(shareUrl);
            setShareToast('Link_Copied');
            setTimeout(() => setShareToast(null), 2500);
        } catch (err) {
            console.error('Share failed:', err);
            setShareToast('Share_Failed');
            setTimeout(() => setShareToast(null), 2500);
        }
    };

    const handleDelete = async (scanId: string) => {
        if (!userContext) {
            setShareToast('Sign up required for archive actions');
            setTimeout(() => setShareToast(null), 2500);
            return;
        }
        if (!confirm('Are you sure you want to purge this record from the archive?')) return;
        try {
            const res = await fetch(`/api/scans/${scanId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setIsUnifiedDrawerOpen(false);
            window.location.assign('/dashboard');
        } catch (err) {
            console.error('Delete failed:', err);
            setShareToast('Delete_Failed');
            setTimeout(() => setShareToast(null), 2500);
        }
    };

    const handleSaveNotes = async (scanId: string, notes: string) => {
        if (!userContext) return;
        if (!scanRecord || scanRecord.id !== scanId) return;
        if (notes === (scanRecord.notes || '')) return;

        setIsUpdatingNotes(true);
        try {
            const res = await fetch(`/api/scans/${scanId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setScanRecord(prev => prev ? { ...prev, notes } : prev);
        } catch (err) {
            console.error('Failed to save notes:', err);
        } finally {
            setIsUpdatingNotes(false);
        }
    };

    const handleGenerateMitigation = async (scanId: string) => {
        if (!userContext) {
            setShowAuditModal(true);
            return;
        }

        setScanRecord(prev => {
            if (!prev || prev.id !== scanId) return prev;
            return {
                ...prev,
                mitigation_reports: [{
                    id: 'temp',
                    scan_id: prev.id,
                    tenant_id: prev.tenant_id || '',
                    advice_content: '',
                    status: 'processing',
                    report_content: null,
                    report_version: 0,
                    generator_version: '1.0.0',
                    generation_inputs: null,
                    idempotency_key: null,
                    created_by: null,
                    completed_at: null,
                    error_message: null,
                    created_at: new Date().toISOString(),
                }],
            };
        });

        try {
            const res = await fetch(`/api/scans/${scanId}/mitigation`, { method: 'POST' });
            const data = await res.json();

            if (res.ok && data.report) {
                setScanRecord(prev => prev && prev.id === scanId
                    ? { ...prev, mitigation_reports: [data.report] }
                    : prev
                );
                setShareToast('Mitigation report generated');
                setTimeout(() => setShareToast(null), 3000);
                return;
            }

            if (res.status === 202) {
                setShareToast('Report already generating...');
                setTimeout(() => setShareToast(null), 3000);
                return;
            }

            if (res.status === 402) {
                setShareToast('Credits exhausted — purchase required');
                setTimeout(() => setShareToast(null), 4000);
                return;
            }

            throw new Error(data.message || 'Generation failed');
        } catch (err) {
            console.error('Mitigation generation failed:', err);
            setShareToast('Failed to generate report');
            setTimeout(() => setShareToast(null), 3000);
            setScanRecord(prev => prev && prev.id === scanId
                ? { ...prev, mitigation_reports: [] }
                : prev
            );
        }
    };

    // ─── Telemetry Row Mapping ───────────────────────────────────────────────
    const getPreviewTelemetryRows = (): TelemetryRow[] => {
        if (!analysisResult) return [];
        const fullRows = getAllTelemetryRows();
        const previewRows = [
            fullRows.find(r => r.id === '0xMNFST')!,
            fullRows.find(r => r.id === '0xSIG')!,
            fullRows.find(r => r.id === '0xALGO')!,
            fullRows.find(r => r.id === '0xVER')!,
            fullRows.find(r => r.id === '0xAI')!,
            fullRows.find(r => r.id === '0xCHAIN')!,
        ].filter(Boolean);

        if (!isEmailLocked) return previewRows;

        return previewRows.map((row) => ({
            ...row,
            value: 'HIDDEN_UNLOCK_REQUIRED',
            barWidth: Math.max(12, Math.min(30, row.barWidth)),
            status: 'warning' as const,
        }));
    };

    const getAllTelemetryRows = (): TelemetryRow[] => {
        if (!analysisResult) return [];

        const report = analysisResult.c2pa_report;
        const manifestDetected = report.status !== 'missing';
        const signatureValid = report.status === 'valid';
        const formatTime = (iso?: string) => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase() : 'N/A';
        const toolName = report.tool ? report.tool.toUpperCase() : (manifestDetected ? 'UNKNOWN_TOOL' : 'N/A');
        const creatorName = report.creator ? report.creator.toUpperCase() : 'UNKNOWN_ID';
        const issuerName = report.issuer ? report.issuer.toUpperCase().replace(/\s+/g, '_') : 'UNKNOWN_CA';
        const historyCount = report.history ? report.history.length : 0;
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
            { id: '0xTIME', label: 'TIMESTAMP', value: formatTime(report.timestamp), barWidth: report.timestamp ? 100 : 0, status: 'info' },
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
            <div className="bg-[var(--rs-bg-dark)] rounded-[var(--rs-radius-chassis)] p-8 relative flex flex-col shadow-[var(--rs-shadow-l2)] border-[4px] border-[var(--rs-bg-surface)] overflow-hidden h-full">

                {/* Dark Mode Chassis Overlay */}
                <div className="absolute inset-0 rounded-[var(--rs-radius-chassis)] pointer-events-none border border-white/5 z-20" />

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
                            <option value="none">NO_PROTOCOL</option>
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
                        active={isScanning || isLoading}
                        status={isError ? 'error' : isComplete ? 'complete' : (isScanning || isLoading) ? 'scanning' : 'idle'}
                        imageUrl={previewUrl}
                        isDragActive={isDragging}
                        className="w-full h-full border-white/10"
                    >
                        {(!isComplete && !isScanning && !isLoading && !previewUrl) && (
                            <label className="flex flex-col items-center justify-center text-center p-12 cursor-pointer group w-full h-full">
                                <div className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center text-white/50 group-hover:border-rs-signal group-hover:text-rs-signal transition-all duration-300 group-hover:scale-110 mb-6">
                                    <div className="w-8 h-8 relative flex items-center justify-center">
                                        {isError ? <div className="text-rs-signal font-bold text-xl">!</div> : <Upload className="w-6 h-6" />}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-white/60 font-mono text-xs uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                                        {isError ? 'Scan Failed - Retry?' : 'Drop file here or click to browse'}
                                    </p>
                                    <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">
                                        {userPlan === 'free'
                                            ? <>Max 50MB • JPG, PNG <span className="text-white/20">|</span> <span className="text-rs-accent/80">Video requires PRO plan</span></>
                                            : 'Max 50MB • JPG, PNG, MP4, MOV, MKV'}
                                    </p>
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
                        logEntries={logs}
                        rows={getPreviewTelemetryRows()}
                        onAction={handleNewScanAction}
                        buttonText="NEW_SCAN"
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
                        level={isComplete ? getRiskTier(results.composite).level as 'critical' | 'high' | 'medium' | 'low' | 'safe' : 'low'}
                        ipScore={results.ipRisk}
                        safetyScore={results.brandSafety}
                        provenanceScore={results.provenance}
                        status={(isScanning || isLoading) ? 'scanning' : isComplete ? 'completed' : 'empty'}
                        className="w-full h-full"
                    />
                </div>

                {/* 2. EMAIL GATE (Anonymous users only) or FINDINGS DOSSIER */}
                <div className="flex-1 w-full min-h-0 relative bg-[var(--rs-bg-surface)] rounded-2xl shadow-xl border border-[var(--rs-border-primary)] overflow-hidden">
                    {/* Anonymous email gate — shown above fold when scan is complete */}
                    {isComplete && isAnonymous && !emailCaptured && currentScanId && (
                        <div ref={emailGateRef} className="absolute inset-0 z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <DashboardEmailGate
                                scanId={currentScanId}
                                onEmailCaptured={() => {
                                    setEmailCaptured(true);
                                    if (currentScanId) {
                                        loadScanFromParam(currentScanId);
                                    }
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
                                ctaMode="paid"
                                reportButtonLabel="Open Scan Results"
                                onOpenReport={handleOpenScanResults}
                                onUpgradeClick={() => {
                                    trackEvent('upgrade_modal_opened', { scanId: currentScanId, source: 'dashboard_findings' })
                                    setShowAuditModal(true)
                                }}
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

            {scanRecord && (
                <UnifiedScanDrawer
                    scan={scanRecord}
                    isOpen={isUnifiedDrawerOpen}
                    onClose={() => setIsUnifiedDrawerOpen(false)}
                    entitlements={{
                        canViewScanReport: !!canViewFull,
                        mitigationCredits: mitigationEntitlement,
                    }}
                    onGenerateMitigation={handleGenerateMitigation}
                    onShare={handleShare}
                    onDelete={handleDelete}
                    onNotesUpdate={handleSaveNotes}
                    onDownload={handleDownload}
                    onUnlock={() => setShowAuditModal(true)}
                    notesBuffer={notesBuffer}
                    onNotesChange={setNotesBuffer}
                    isUpdatingNotes={isUpdatingNotes}
                    shareToast={shareToast}
                    showDownloadBanner={showDownloadBanner}
                    onDismissDownloadBanner={() => setShowDownloadBanner(false)}
                />
            )}

            <AuditModal
                isOpen={showAuditModal}
                onClose={() => setShowAuditModal(false)}
                scanId={currentScanId || ''}
                compositeScore={analysisResult?.composite_score}
                findingCount={scanRecord?.scan_findings?.length}
            />

            {shareToast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 bg-rs-text-primary text-white text-[10px] font-mono font-bold uppercase tracking-widest rounded-[2px] shadow-lg">
                    {shareToast}
                </div>
            )}
        </div>
    );
}
