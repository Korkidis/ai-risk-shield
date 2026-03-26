"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { resetPassword } from "../actions";
import { RSButton } from "@/components/rs/RSButton";
import { RSCallout } from "@/components/rs/RSCallout";
import { RSInput } from "@/components/rs/RSInput";

const initialState = {
    error: "",
    success: false,
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
                    <>Saving New Password...</>
                ) : (
                    <>
                        UPDATE PASSWORD
                        <ArrowRight className="w-4 h-4" />
                    </>
                )}
            </span>
        </RSButton>
    );
}

export default function ResetPasswordPage() {
    const router = useRouter();
    const [state, formAction] = useActionState(resetPassword, initialState);

    return (
        <div className="flex w-full flex-col gap-6">
            <div className="flex flex-col gap-3 border-b border-[var(--rs-border-primary)]/40 pb-6">
                <h1 className="text-3xl font-black italic tracking-tighter text-[var(--rs-black)] transform -skew-x-12 leading-[0.85] origin-left">
                    SET NEW<br />PASSWORD
                </h1>
                <p className="text-[10px] font-mono text-[var(--rs-text-secondary)] uppercase tracking-widest">
                    Finish account recovery
                </p>
                <p className="text-sm leading-relaxed text-[var(--rs-text-secondary)] max-w-md">
                    Choose a new password for your workspace account. Use at least 12
                    characters with uppercase, lowercase, and a number.
                </p>
            </div>

            {state?.success ? (
                <div className="flex flex-col gap-6">
                    <RSCallout variant="success" title="Password updated">
                        Your password has been changed. You can return to login and access
                        your workspace with the new password now.
                    </RSCallout>

                    <div className="rounded-[var(--rs-radius-element)] border border-dashed border-[var(--rs-border-primary)] bg-[var(--rs-bg-secondary)]/60 p-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--rs-safe)]" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--rs-text-primary)]">
                                    Next step
                                </p>
                                <p className="text-sm leading-relaxed text-[var(--rs-text-secondary)]">
                                    Return to login and sign in with the updated password.
                                </p>
                            </div>
                        </div>
                    </div>

                    <RSButton
                        fullWidth
                        variant="primary"
                        className="h-14 text-sm tracking-[0.2em] font-black italic uppercase"
                        icon={<ShieldCheck className="w-4 h-4" />}
                        onClick={() => router.push("/login")}
                    >
                        RETURN TO LOGIN
                    </RSButton>
                </div>
            ) : (
                <form action={formAction} className="flex flex-col gap-6">
                    {state?.error && (
                        <RSCallout variant="danger" title="Password not updated">
                            {state.error}
                        </RSCallout>
                    )}

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--rs-text-secondary)] pl-1 mb-1 block">
                            NEW PASSWORD
                        </label>
                        <RSInput
                            name="password"
                            type="password"
                            placeholder="••••••••••••"
                            autoComplete="new-password"
                            fullWidth
                            className="bg-rs-bg-surface-3 border border-rs-border-primary focus:ring-2 focus:ring-rs-action-primary/50 text-rs-text-primary rounded-[var(--rs-radius-element)]"
                        />
                        <p className="text-[10px] text-[var(--rs-text-secondary)] uppercase tracking-wider pl-1 pt-1">
                            12+ chars, uppercase, lowercase, and number.
                        </p>
                    </div>

                    <div className="pt-2">
                        <SubmitButton />
                    </div>

                    <div className="flex items-center justify-center pt-4 border-t border-[var(--rs-border-primary)] border-dashed">
                        <Link
                            href="/forgot-password"
                            className="text-[10px] font-mono uppercase tracking-widest text-[var(--rs-text-secondary)] hover:text-[var(--rs-text-primary)] transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft className="w-3 h-3" />
                            Request a New Reset Link
                        </Link>
                    </div>
                </form>
            )}
        </div>
    );
}
