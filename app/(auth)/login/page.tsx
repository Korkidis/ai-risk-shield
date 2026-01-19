"use client";

import { useTransition, useState } from 'react';
import { login } from '@/app/(auth)/actions';
import { RSInput } from '@/components/rs/RSInput';
import { RSButton } from '@/components/rs/RSButton';
import { LogIn, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setError(null);
        startTransition(async () => {
            const result = await login(null, formData);
            // @ts-ignore - Types for actions can be loose with simple returns
            if (result?.error) {
                setError(result.error);
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-black uppercase tracking-tight text-[var(--rs-text-primary)]">
                    Access_Control
                </h1>
                <p className="text-xs font-mono text-[var(--rs-text-secondary)]">
                    Enter credentials to unlock dashboard.
                </p>
            </div>

            <form action={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <RSInput
                        name="email"
                        type="email"
                        label="Identity_Key (Email)"
                        placeholder="user@organization.com"
                        required
                        fullWidth
                    />
                    <RSInput
                        name="password"
                        type="password"
                        label="Secure_Passphrase"
                        placeholder="••••••••••••"
                        required
                        fullWidth
                    />
                </div>

                {error && (
                    <div className="p-3 bg-rs-alert/10 border border-rs-alert/20 rounded-[4px] flex items-center gap-3 text-rs-alert">
                        <AlertCircle size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-wide">{error}</span>
                    </div>
                )}

                <div className="pt-2">
                    <RSButton
                        type="submit"
                        fullWidth
                        disabled={isPending}
                        icon={isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogIn size={16} />}
                    >
                        {isPending ? 'Authenticating...' : 'Confirm_Access'}
                    </RSButton>
                </div>
            </form>

            <div className="text-center pt-4 border-t border-[var(--rs-border-primary)]/50">
                <p className="text-[10px] font-mono text-[var(--rs-text-secondary)]">
                    No Clearance Level? <Link href="/signup" className="text-rs-signal hover:underline font-bold uppercase ml-1">Request_Access (Sign Up)</Link>
                </p>
            </div>
        </div>
    );
}
