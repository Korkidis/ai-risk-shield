"use client";

import { RSButton } from "@/components/rs/RSButton";
import { RSInput } from "@/components/rs/RSInput";
import { RSLED } from "@/components/rs/RSLED";
import { AlertCircle, ArrowRight, Shield, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { useActionState, Suspense } from "react";
import { login } from "../actions";

const initialState = {
    error: "",
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <RSButton
            type="submit"
            variant="primary"
            fullWidth
            disabled={pending}
            className="h-14 text-sm tracking-[0.2em] font-black italic uppercase"
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {pending ? (
                    <>Processing...</>
                ) : (
                    <>
                        <ArrowRight className="w-4 h-4" />
                        INITIATE LOGIN
                    </>
                )}
            </span>
        </RSButton>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-rs-text-tertiary" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    const searchParams = useSearchParams();
    const errorParam = searchParams.get('error');
    // @ts-ignore - useActionState types might need generic adjustment depending on react version
    const [state, formAction] = useActionState(login, initialState);

    const errorMessage = state?.error || errorParam;

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Header Area - Split Logic */}
            <div className="border-b border-[var(--rs-border-primary)]/40 pb-6">
                {/* Top Row: Meta & status */}
                <div className="flex items-center justify-between w-full mb-4">
                    {/* Integrated Logo Header */}
                    <div className="flex items-center gap-1.5 opacity-80">
                        <Shield className="w-3 h-3 text-[var(--rs-black)]" />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--rs-black)]">
                            RISK_SHIELD
                        </span>
                    </div>

                    {/* Status Indicator - True Diode */}
                    <div className="pt-0.5">
                        <RSLED level="safe" label="SYSTEM_READY" size="sm" labelPosition="left" />
                    </div>
                </div>

                {/* Bottom Row: Main Title */}
                <h1 className="text-4xl font-black italic tracking-tighter text-[var(--rs-black)] transform -skew-x-12 leading-[0.85] origin-left">
                    ACCESS<br />TERMINAL
                </h1>
            </div>

            <form action={formAction} className="flex flex-col gap-6">
                {/* Recessed Input Bays */}
                <div className="space-y-6">
                    <hr className="border-t border-[var(--rs-border-primary)]/50" />
                    <div className="space-y-1 group">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[var(--rs-text-secondary)] pl-1 mb-1 block opacity-60 group-focus-within:opacity-100 transition-opacity">
                            EMAIL IDENTITY
                        </label>
                        <RSInput
                            name="email"
                            type="email"
                            placeholder="user@organization.com"
                            fullWidth
                            // Deep Recess Override
                            className="bg-rs-bg-surface-3 border border-rs-border-primary focus:ring-2 focus:ring-rs-action-primary/50 text-rs-text-primary rounded-[var(--rs-radius-element)]"
                        />
                    </div>

                    <hr className="border-t border-[var(--rs-border-primary)]/50" />
                    <div className="space-y-1 group">
                        <div className="flex items-center justify-between mb-1 pl-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-[var(--rs-text-secondary)] opacity-60 group-focus-within:opacity-100 transition-opacity">
                                SECURE PASSPHRASE
                            </label>
                        </div>
                        <RSInput
                            name="password"
                            type="password"
                            placeholder="••••••••••••"
                            fullWidth
                            // Deep Recess Override
                            className="bg-rs-bg-surface-3 border border-rs-border-primary focus:ring-2 focus:ring-rs-action-primary/50 text-rs-text-primary rounded-[var(--rs-radius-element)]"
                        />
                        <div className="flex justify-end mt-1">
                            <a href="/forgot-password" className="text-[9px] font-bold uppercase tracking-widest text-[var(--rs-text-tertiary)] hover:text-[var(--rs-text-primary)] transition-colors flex items-center gap-1">
                                <span>+</span> FORGOT PASSPHRASE?
                            </a>
                        </div>
                    </div>
                </div>

                {/* Error Display - Industrial */}
                {errorMessage && (
                    <div className="bg-[var(--rs-bg-well)] border-l-2 border-[var(--rs-signal)] p-3 flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-[var(--rs-signal)] mt-0.5 shrink-0" />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold text-[var(--rs-signal)] uppercase tracking-wider">
                                Authentication_Failure
                            </span>
                            <span className="text-[10px] font-mono text-[var(--rs-text-secondary)]">
                                Error Code: {errorMessage}
                            </span>
                        </div>
                    </div>
                )}

                {/* Action Area */}
                <div className="pt-2">
                    <SubmitButton />
                </div>

                {/* Secondary Actions / Clearance */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--rs-border-primary)] border-dashed opacity-50">
                    <a href="/register" className="text-[9px] font-mono uppercase tracking-widest text-[var(--rs-text-secondary)] hover:text-[var(--rs-text-primary)] transition-colors cursor-pointer">
                        Request Access / Sign Up
                    </a>
                </div>
            </form>
        </div>
    );
}
