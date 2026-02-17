"use client";

import { useState } from 'react';
import { Lock, Mail, CheckCircle } from 'lucide-react';
import { RSButton } from '@/components/rs/RSButton';
import { cn } from '@/lib/utils';

const RISK_THEME = {
    surface: "bg-[#EBE9E4]",
    header: "bg-[#F5F4F1]",
    border: "border-[#D6D3CD]",
    text: "text-[#1A1A1A]",
    textMuted: "text-[#B4B0AB]",
    textDim: "text-[#666]"
};

interface DashboardEmailGateProps {
    scanId: string;
    onEmailCaptured: () => void;
    className?: string;
}

/**
 * Email capture gate for anonymous users viewing scan results on /dashboard.
 * Replaces the findings dossier slot until email is provided.
 * Matches the Braun/forensic instrument aesthetic of RSFindingsDossier.
 */
export function DashboardEmailGate({ scanId, onEmailCaptured, className }: DashboardEmailGateProps) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (status === 'sending') return;

        if (!email || !email.includes('@')) {
            setStatus('error');
            setErrorMsg('Please enter a valid email.');
            return;
        }

        try {
            setStatus('sending');
            setErrorMsg(null);

            const res = await fetch('/api/scans/capture-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scanId, email })
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to process');
            }

            setStatus('sent');
            onEmailCaptured();
        } catch (err) {
            console.error('[EmailGate]', err);
            setStatus('error');
            setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Try again.');
        }
    };

    return (
        <div
            className={cn(
                "rounded-2xl shadow-xl overflow-hidden flex flex-col transition-colors duration-500",
                RISK_THEME.surface,
                RISK_THEME.border,
                "border font-sans",
                RISK_THEME.text,
                className
            )}
        >
            {/* Header - Matches RSFindingsDossier */}
            <div className={cn("flex justify-between items-start px-8 py-6 shrink-0", RISK_THEME.header)}>
                <div className="space-y-1">
                    <div className={cn("text-[10px] font-black uppercase tracking-[0.2em] leading-none", RISK_THEME.text)}>
                        Unlock Findings
                    </div>
                    <div className="font-mono text-[10px] text-[#888] uppercase tracking-widest leading-none">
                        Clearance_Required
                    </div>
                </div>
                <Lock size={14} className={RISK_THEME.textMuted} />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col p-8 pt-0">
                <div className="flex-1 flex flex-col justify-center space-y-5 pt-4">
                    {/* Lock Message */}
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded border border-[#D6D3CD] bg-[#F5F4F1] shrink-0 mt-0.5">
                            <Lock size={14} className="text-[#1A1A1A]" />
                        </div>
                        <div>
                            <p className={cn("font-mono text-[11px] font-bold uppercase tracking-wider leading-snug", RISK_THEME.text)}>
                                Detailed findings are restricted
                            </p>
                            <p className={cn("font-mono text-[10px] leading-relaxed mt-1", RISK_THEME.textDim)}>
                                Enter your email to unlock the full risk analysis, evidence log, and receive a sample forensic report.
                            </p>
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className={cn("block text-[9px] uppercase tracking-[0.2em] font-bold", RISK_THEME.textMuted)}>
                            Authorized Recipient
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B4B0AB]" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (status === 'error') {
                                            setStatus('idle');
                                            setErrorMsg(null);
                                        }
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                    placeholder="officer@company.com"
                                    className={cn(
                                        "w-full bg-white border text-sm pl-9 pr-3 py-2.5 rounded-[4px] outline-none transition-colors font-mono text-[11px]",
                                        "placeholder:text-[#B4B0AB] text-[#1A1A1A]",
                                        status === 'error' ? "border-[var(--rs-signal)]" : "border-[#D6D3CD] focus:border-[#1A1A1A]"
                                    )}
                                    disabled={status === 'sending' || status === 'sent'}
                                />
                            </div>
                        </div>
                        {status === 'error' && errorMsg && (
                            <p className="text-[10px] font-mono text-[var(--rs-signal)]">{errorMsg}</p>
                        )}
                    </div>
                </div>

                {/* Action Button */}
                <div className="mt-4 pt-4 border-t border-[#D6D3CD] space-y-2">
                    {status === 'sent' ? (
                        <div className="flex items-center gap-2 justify-center py-3">
                            <CheckCircle size={14} className="text-[var(--rs-safe)]" />
                            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--rs-safe)] font-bold">
                                Access link sent — check your inbox
                            </span>
                        </div>
                    ) : (
                        <RSButton
                            variant="danger"
                            fullWidth
                            size="lg"
                            className="font-bold tracking-[0.3em] shadow-lg rounded-[2px]"
                            onClick={handleSubmit}
                            disabled={status === 'sending'}
                        >
                            {status === 'sending' ? 'Processing...' : 'Unlock Full Analysis'}
                        </RSButton>
                    )}
                    <p className={cn("font-mono text-[8px] uppercase tracking-widest text-center leading-tight", RISK_THEME.textMuted)}>
                        A secure guest account will be created to manage your reports
                    </p>
                </div>
            </div>
        </div>
    );
}
