"use client";

import { RSButton } from "@/components/rs/RSButton";
import { RSInput } from "@/components/rs/RSInput";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { login } from "../actions";
import { cn } from "@/lib/utils";

const initialState = {
    error: "",
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <RSButton
            type="submit"
            fullWidth
            disabled={pending}
            className={cn(
                "h-14 text-sm tracking-[0.2em] font-black italic uppercase relative overflow-hidden",
                "bg-[#FF4F00] hover:bg-[#FF4F00] text-white", // High-Tactility Orange
                "shadow-[0_4px_0_#CC3F00,0_8px_16px_rgba(255,79,0,0.4)]", // Elevated physical button
                "active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] active:translate-y-[4px] transition-all duration-100", // Mechanical press
                "border-none rounded-[4px]"
            )}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {pending ? (
                    <>Processing_Request<span className="animate-pulse">_</span></>
                ) : (
                    <>
                        <ArrowRight className="w-4 h-4" />
                        Initiate_Session
                    </>
                )}
            </span>
        </RSButton>
    );
}

export default function LoginPage() {
    const searchParams = useSearchParams();
    const errorParam = searchParams.get('error');
    // @ts-ignore - useActionState types might need generic adjustment depending on react version
    const [state, formAction] = useActionState(login, initialState);

    const errorMessage = state?.error || errorParam;

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Header Area */}
            <div className="flex items-end justify-between border-b border-[var(--rs-border-primary)] pb-4">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-black italic tracking-tighter text-[var(--rs-black)] transform -skew-x-12">
                        ACCESS_CONTROL
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest">
                            TERMINAL ID: AUTH-01 // SECURITY LEVEL: MAX
                        </span>
                    </div>
                </div>
                {/* Status Indicator */}
                <div className="pb-1">
                    <div className="flex items-center gap-1.5 bg-[var(--rs-bg-well)]/50 px-2 py-1 rounded-[2px] border border-[var(--rs-border-primary)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--rs-signal-success)] animate-pulse shadow-[0_0_4px_var(--rs-signal-success)]" />
                        <span className="text-[9px] font-bold text-[var(--rs-signal-success)] tracking-wider">
                            SYSTEM_READY
                        </span>
                    </div>
                </div>
            </div>

            <form action={formAction} className="flex flex-col gap-6">
                {/* Recessed Input Bays */}
                <div className="space-y-6">
                    <div className="space-y-1 group">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[var(--rs-text-secondary)] pl-1 mb-1 block opacity-60 group-focus-within:opacity-100 transition-opacity">
                            Identity_Key (Email)
                        </label>
                        <RSInput
                            name="email"
                            type="email"
                            placeholder="user@organization.com"
                            fullWidth
                            // Deep Recess Override
                            className="bg-[#E6E2DB] shadow-[inset_2px_2px_6px_rgba(0,0,0,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.5)] border-none focus:ring-0 rounded-[var(--rs-radius-element)]"
                        />
                    </div>

                    <div className="space-y-1 group">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[var(--rs-text-secondary)] pl-1 mb-1 block opacity-60 group-focus-within:opacity-100 transition-opacity">
                            Secure_Passphrase
                        </label>
                        <RSInput
                            name="password"
                            type="password"
                            placeholder="••••••••••••"
                            fullWidth
                            // Deep Recess Override
                            className="bg-[#E6E2DB] shadow-[inset_2px_2px_6px_rgba(0,0,0,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.5)] border-none focus:ring-0 rounded-[var(--rs-radius-element)]"
                        />
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
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--rs-text-tertiary)]">
                        Clearance Required
                    </span>
                    <button type="button" className="text-[9px] font-bold uppercase tracking-widest text-[var(--rs-text-primary)] hover:text-[#FF4F00] transition-colors">
                        Request_Access (Sign_Up)
                    </button>
                </div>
            </form>
        </div>
    );
}
