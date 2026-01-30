import { RSButton } from "@/components/rs/RSButton";
import { RSInput } from "@/components/rs/RSInput";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col gap-2 border-b border-[var(--rs-border-primary)]/40 pb-6">
                <h1 className="text-3xl font-black italic tracking-tighter text-[var(--rs-black)] transform -skew-x-12 leading-[0.85] origin-left">
                    RESET<br />CREDENTIALS
                </h1>
                <p className="text-[10px] font-mono text-[var(--rs-text-secondary)] uppercase tracking-widest">
                    Identity Verification Required
                </p>
            </div>

            <form className="flex flex-col gap-6">
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[var(--rs-text-secondary)] pl-1 mb-1 block opacity-60">
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

                <div className="pt-2">
                    <RSButton
                        type="submit"
                        fullWidth
                        variant="primary"
                        className="h-14 text-sm tracking-[0.2em] font-black italic uppercase"
                    >
                        SEND RESET LINK
                    </RSButton>
                </div>

                <div className="flex items-center justify-center pt-4 border-t border-[var(--rs-border-primary)] border-dashed opacity-50">
                    <Link href="/login" className="text-[9px] font-mono uppercase tracking-widest text-[var(--rs-text-tertiary)] hover:text-[var(--rs-text-primary)] transition-colors flex items-center gap-2">
                        <ArrowLeft className="w-3 h-3" />
                        Return to Login
                    </Link>
                </div>
            </form>
        </div>
    );
}
