"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { ArrowLeft, ArrowRight, MailCheck } from "lucide-react";
import { requestPasswordReset } from "../actions";
import { RSButton } from "@/components/rs/RSButton";
import { RSCallout } from "@/components/rs/RSCallout";
import { RSInput } from "@/components/rs/RSInput";

const initialState = {
    error: "",
    success: false,
};

function SubmitButton({ submitted }: { submitted: boolean }) {
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
                    <>Sending Reset Link...</>
                ) : submitted ? (
                    <>
                        SEND ANOTHER LINK
                        <ArrowRight className="w-4 h-4" />
                    </>
                ) : (
                    <>
                        EMAIL RESET LINK
                        <ArrowRight className="w-4 h-4" />
                    </>
                )}
            </span>
        </RSButton>
    );
}

export default function ForgotPasswordPage() {
    const [state, formAction] = useActionState(requestPasswordReset, initialState);

    return (
        <div className="flex w-full flex-col gap-6">
            <div className="flex flex-col gap-3 border-b border-[var(--rs-border-primary)]/40 pb-6">
                <h1 className="text-3xl font-black italic tracking-tighter text-[var(--rs-black)] transform -skew-x-12 leading-[0.85] origin-left">
                    RESET<br />PASSWORD
                </h1>
                <p className="text-[10px] font-mono text-[var(--rs-text-secondary)] uppercase tracking-widest">
                    Recover access to your workspace
                </p>
                <p className="text-sm leading-relaxed text-[var(--rs-text-secondary)] max-w-md">
                    Enter the work email tied to your account. If it matches an account,
                    we&apos;ll send a secure reset link.
                </p>
            </div>

            <form action={formAction} className="flex flex-col gap-6">
                {state?.success && (
                    <RSCallout variant="success" title="Check your inbox">
                        If that email is in our system, a reset link is on the way. It can
                        take a minute to arrive. If you don&apos;t see it, check spam and try
                        again.
                    </RSCallout>
                )}

                {state?.error && (
                    <RSCallout variant="danger" title="Reset link not sent">
                        {state.error}
                    </RSCallout>
                )}

                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--rs-text-secondary)] pl-1 mb-1 block">
                        WORK EMAIL
                    </label>
                    <RSInput
                        name="email"
                        type="email"
                        placeholder="user@organization.com"
                        autoComplete="email"
                        fullWidth
                        className="bg-rs-bg-surface-3 border border-rs-border-primary focus:ring-2 focus:ring-rs-action-primary/50 text-rs-text-primary rounded-[var(--rs-radius-element)]"
                    />
                </div>

                <div className="rounded-[var(--rs-radius-element)] border border-dashed border-[var(--rs-border-primary)] bg-[var(--rs-bg-secondary)]/60 p-4">
                    <div className="flex items-start gap-3">
                        <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--rs-text-secondary)]" />
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--rs-text-primary)]">
                                What happens next
                            </p>
                            <p className="text-sm leading-relaxed text-[var(--rs-text-secondary)]">
                                Open the email, follow the link, then choose a new password.
                                For security, we show the same success message whether or not
                                an account exists for that address.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <SubmitButton submitted={Boolean(state?.success)} />
                </div>

                <div className="flex items-center justify-center pt-4 border-t border-[var(--rs-border-primary)] border-dashed">
                    <Link
                        href="/login"
                        className="text-[10px] font-mono uppercase tracking-widest text-[var(--rs-text-secondary)] hover:text-[var(--rs-text-primary)] transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Return to Login
                    </Link>
                </div>
            </form>
        </div>
    );
}
