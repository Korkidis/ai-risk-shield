"use client";

import { RSButton } from "@/components/rs/RSButton";
import { RSInput } from "@/components/rs/RSInput";
import { ArrowLeft, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState, Suspense } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { signUp } from "../actions";

const initialState = {
    error: "",
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <RSButton
            type="submit"
            fullWidth
            variant="primary"
            disabled={pending}
            className="h-14 text-sm tracking-[0.2em] font-black italic uppercase"
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {pending ? (
                    <>Processing Request...</>
                ) : (
                    <>
                        SUBMIT REQUEST
                        <ArrowRight className="w-4 h-4" />
                    </>
                )}
            </span>
        </RSButton>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-rs-text-tertiary" />
            </div>
        }>
            <RegisterContent />
        </Suspense>
    );
}

function RegisterContent() {
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan');
    const [state, formAction] = useActionState(signUp, initialState);

    // Compute post-signup redirect based on pricing intent
    let nextUrl = null;
    if (plan === 'report' || searchParams.get('checkout') === 'report') {
        nextUrl = '/dashboard?checkout=report';
    } else if (plan || searchParams.get('persona')) {
        nextUrl = `/pricing?${searchParams.toString()}`;
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col gap-2 border-b border-[var(--rs-border-primary)]/40 pb-6">
                <h1 className="text-3xl font-black italic tracking-tighter text-[var(--rs-black)] transform -skew-x-12 leading-[0.85] origin-left">
                    REQUEST<br />CLEARANCE
                </h1>
                <p className="text-[10px] font-mono text-[var(--rs-text-secondary)] uppercase tracking-widest">
                    New User Registration
                </p>
            </div>

            <form action={formAction} className="flex flex-col gap-6">
                {nextUrl && <input type="hidden" name="next" value={nextUrl} />}
                <div className="space-y-4">
                    <div className="space-y-1 group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--rs-text-secondary)] pl-1 mb-1 block">
                            FULL NAME
                        </label>
                        <RSInput
                            name="fullName"
                            placeholder="John Doe"
                            fullWidth
                            className="bg-rs-bg-surface-3 border border-rs-border-primary focus:ring-2 focus:ring-rs-action-primary/50 text-rs-text-primary rounded-[var(--rs-radius-element)]"
                        />
                    </div>
                    <div className="space-y-1 group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--rs-text-secondary)] pl-1 mb-1 block">
                            ORGANIZATION
                        </label>
                        <RSInput
                            name="organizationName"
                            placeholder="Acme Corp"
                            fullWidth
                            className="bg-rs-bg-surface-3 border border-rs-border-primary focus:ring-2 focus:ring-rs-action-primary/50 text-rs-text-primary rounded-[var(--rs-radius-element)]"
                        />
                    </div>
                    <div className="space-y-1 group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--rs-text-secondary)] pl-1 mb-1 block">
                            EMAIL IDENTITY
                        </label>
                        <RSInput
                            name="email"
                            type="email"
                            placeholder="user@organization.com"
                            fullWidth
                            className="bg-rs-bg-surface-3 border border-rs-border-primary focus:ring-2 focus:ring-rs-action-primary/50 text-rs-text-primary rounded-[var(--rs-radius-element)]"
                        />
                    </div>
                    <div className="space-y-1 group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--rs-text-secondary)] pl-1 mb-1 block">
                            SECURE PASSPHRASE
                        </label>
                        <RSInput
                            name="password"
                            type="password"
                            placeholder="••••••••••••"
                            fullWidth
                            className="bg-rs-bg-surface-3 border border-rs-border-primary focus:ring-2 focus:ring-rs-action-primary/50 text-rs-text-primary rounded-[var(--rs-radius-element)]"
                        />
                        <p className="text-[10px] text-[var(--rs-text-secondary)] uppercase tracking-wider pl-1 pt-1">
                            Must contain 12+ chars, uppercase, lowercase, number.
                        </p>
                    </div>
                </div>

                {/* Error Display */}
                {state?.error && (
                    <div className="bg-[var(--rs-bg-well)] border-l-2 border-[var(--rs-signal)] p-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="w-4 h-4 text-[var(--rs-signal)] mt-0.5 shrink-0" />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold text-[var(--rs-signal)] uppercase tracking-wider">
                                Clearance_Denied
                            </span>
                            <span className="text-[10px] font-mono text-[var(--rs-text-secondary)]">
                                {state.error}
                            </span>
                        </div>
                    </div>
                )}

                <div className="pt-2">
                    <SubmitButton />
                </div>

                <div className="flex items-center justify-center pt-4 border-t border-[var(--rs-border-primary)] border-dashed">
                    <Link href={`/login${searchParams.toString() ? `?${searchParams.toString()}` : ''}`} className="text-[10px] font-mono uppercase tracking-widest text-[var(--rs-text-secondary)] hover:text-[var(--rs-text-primary)] transition-colors flex items-center gap-2">
                        <ArrowLeft className="w-3 h-3" />
                        Return to Login
                    </Link>
                </div>
            </form>
        </div>
    );
}
