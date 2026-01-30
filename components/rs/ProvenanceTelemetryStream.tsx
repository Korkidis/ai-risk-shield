"use client";

import { useEffect, useState } from 'react';
import { ProvenanceDetails } from '@/types/database';

export interface TelemetryRow {
    id: string;
    label: string; // Left side ID (e.g. 0x44F1...)
    value: string; // Right side Label (e.g. PARITY_CHECK)
    barWidth: number; // 0-100
    status: 'success' | 'warning' | 'error' | 'info' | 'pending';
    // ...
}

interface ProvenanceTelemetryStreamProps {
    details?: ProvenanceDetails | null;
    customRows?: TelemetryRow[];
    scanStatus: 'pending' | 'processing' | 'completed' | 'failed';
    onDetailsClick?: () => void;
}

export function ProvenanceTelemetryStream({ details, customRows, scanStatus, onDetailsClick }: ProvenanceTelemetryStreamProps) {
    const [rows, setRows] = useState<TelemetryRow[]>([]);

    useEffect(() => {
        // Map provenance data to the visual rows
        // If loading or no details, show animated simulated data or empty state

        if (customRows) {
            setRows(customRows);
            return;
        }

        let newRows: TelemetryRow[] = [];

        if (!details) {
            // Loading / Simulated State
            newRows = Array(6).fill(0).map((_, i) => ({
                id: `0xWAIT_${i}`,
                label: `SCANNING_SECTOR_${i}`,
                value: 'PENDING',
                barWidth: Math.random() * 60 + 20,
                status: 'pending'
            }));
        } else {
            // Actual Data Mapping
            const manifestDetected = !!details.raw_manifest;
            const signatureValid = details.signature_status === 'valid';
            const hasIdentity = !!details.creator_name;
            // Infer AI status from manifest or default to 'undeclared' if no specific field exists yet
            const aiConfirmed = false; // logic would go here based on assertions

            newRows = [
                {
                    id: '0xMNFST',
                    label: 'MANIFEST_INTEGRITY',
                    value: manifestDetected ? 'DETECTED' : 'MISSING',
                    barWidth: manifestDetected ? 95 : 5,
                    status: manifestDetected ? 'success' : 'error'
                },
                {
                    id: '0xSIG_V',
                    label: 'DIGITAL_SIGNATURE',
                    value: signatureValid ? 'VALID' : (!manifestDetected ? 'MISSING' : 'INVALID'),
                    barWidth: signatureValid ? 100 : (!manifestDetected ? 0 : 40),
                    status: signatureValid ? 'success' : 'error'
                },
                {
                    id: '0xIDENT',
                    label: 'CREATOR_IDENTITY',
                    value: hasIdentity ? 'VERIFIED' : 'UNKNOWN',
                    barWidth: hasIdentity ? 88 : 20,
                    status: hasIdentity ? 'success' : 'warning'
                },
                {
                    id: '0xAI_MK',
                    label: 'AI_WATERMARK',
                    value: aiConfirmed ? 'DETECTED' : 'UNDECLARED',
                    barWidth: aiConfirmed ? 100 : 15,
                    status: aiConfirmed ? 'info' : 'warning'
                },
                {
                    id: '0xCHAIN',
                    label: 'CHAIN_OF_CUSTODY',
                    // Derive chain custody from signature status
                    value: signatureValid ? 'FULL' : 'BROKEN',
                    barWidth: signatureValid ? 100 : 30,
                    status: signatureValid ? 'success' : 'warning'
                }
            ];
        }

        setRows(newRows);

    }, [details, customRows, scanStatus]);

    const getStatusColor = (status: TelemetryRow['status']) => {
        switch (status) {
            case 'success': return 'var(--rs-safe)'; // Brand Green
            case 'warning': return 'var(--rs-risk-caution)'; // Amber
            case 'error': return 'var(--rs-signal)';   // Brand Red (Signal)
            case 'info': return '#00DDFF';    // Brand Cyan
            case 'pending': default: return '#FFFFFF';
        }
    };

    return (
        <div className="relative w-full">
            {/* Physical Housing Bezel (Reused from RSTelemetryStream) */}
            <div className="relative bg-[#0A0A0A] rounded-[var(--rs-radius-container)] border border-[var(--rs-border-primary)] shadow-[inset_0_0_60px_rgba(0,0,0,1)] overflow-hidden flex flex-col font-mono text-[10px] min-h-[300px]">

                {/* Phosphor & Scan-line Overlay */}
                <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_3px,3px_100%]" />

                {/* Internal Content */}
                <div className="relative z-10 flex-1 p-8 flex flex-col justify-between">

                    {/* Top Metadata */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1">
                            <div className="text-rs-signal text-xs font-black tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-rs-signal rounded-full animate-ping shadow-[0_0_8px_var(--rs-signal)]" />
                                LOG_TELEMETRY_STREAM
                            </div>
                            <div className="text-[9px] text-white/20 uppercase tracking-[0.3em]">Module: BRAVO-RACK-09</div>
                        </div>
                        <div className="text-right text-white/10 text-[10px] leading-tight">
                            LATENCY: 4.12 MS<br />PID: 7710-X
                        </div>
                    </div>

                    {/* Data Visualization / Waveforms */}
                    <div className="flex-1 flex flex-col justify-center space-y-3">
                        {rows.map((row, i) => (
                            <div key={i} className="h-5 bg-white/5 rounded flex items-center px-4 overflow-hidden border border-white/5 group hover:bg-white/10 transition-colors">
                                <div className="text-[9px] font-bold w-24 shrink-0" style={{ color: getStatusColor(row.status) }}>
                                    {row.id}
                                </div>

                                {/* Bar Track */}
                                <div className="h-1.5 bg-white/10 flex-1 mx-4 rounded-full overflow-hidden relative">
                                    <div
                                        className="h-full transition-all duration-1000 ease-in-out relative"
                                        style={{
                                            width: `${row.barWidth}%`,
                                            backgroundColor: getStatusColor(row.status),
                                            opacity: 0.6
                                        }}
                                    >
                                        {/* Glow effect on bar tip */}
                                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 blur-[2px]" />
                                    </div>
                                </div>

                                <div className="text-[8px] text-white/40 uppercase w-24 text-right truncate font-bold tracking-wider">
                                    {row.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Controls */}
                    <div className="flex justify-between items-center pt-6 border-t border-white/5 mt-6">
                        <div className="flex gap-6 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                            <span>Buffer: Ready</span>
                            <span>Rec: Tracking</span>
                        </div>

                        {onDetailsClick && (
                            <button
                                onClick={onDetailsClick}
                                className="px-4 py-1.5 bg-white/10 rounded text-[9px] text-rs-signal font-black tracking-[0.2em] uppercase border border-rs-signal/20 hover:bg-rs-signal/20 cursor-pointer transition-colors"
                            >
                                FULL_DIAGNOSTIC
                            </button>
                        )}
                    </div>
                </div>

                {/* Global Screen Glare & Vignette */}
                <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] pointer-events-none z-10" />
            </div>
        </div>
    );
}
