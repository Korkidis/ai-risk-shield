'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ResetPasswordPage() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [verifying, setVerifying] = useState(true)
    const [sessionValid, setSessionValid] = useState(false)

    // Verify the auth session from the magic link
    useEffect(() => {
        const verifySession = async () => {
            const supabase = createClient()

            // Check if we have a valid session (Supabase auto-handles the hash params)
            const { data: { session }, error: sessionError } = await supabase.auth.getSession()

            if (sessionError || !session) {
                setError('Invalid or expired reset link. Please request a new one.')
                setVerifying(false)
                return
            }

            // Session is valid, allow password reset
            setSessionValid(true)
            setVerifying(false)
        }

        verifySession()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (password.length < 12) {
            setError('Password must be at least 12 characters')
            setLoading(false)
            return
        }

        if (!/[A-Z]/.test(password)) {
            setError('Password must contain at least one uppercase letter')
            setLoading(false)
            return
        }

        if (!/[a-z]/.test(password)) {
            setError('Password must contain at least one lowercase letter')
            setLoading(false)
            return
        }

        if (!/[0-9]/.test(password)) {
            setError('Password must contain at least one number')
            setLoading(false)
            return
        }

        try {
            const supabase = createClient()

            const { error: updateError } = await supabase.auth.updateUser({
                password: password,
            })

            if (updateError) {
                throw updateError
            }

            setSuccess(true)
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        } catch (err: any) {
            console.error('Password reset error:', err)
            setError(err.message || 'Failed to reset password. Please try again or request a new reset link.')
        } finally {
            setLoading(false)
        }
    }

    if (verifying) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-deep-space px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="w-full max-w-md space-y-8 relative z-10 glass-panel p-10 rounded-[2.5rem] shadow-2xl">
                    <div className="text-center">
                        <svg className="animate-spin h-12 w-12 text-indigo-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-sm text-slate-400">Verifying reset link...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!sessionValid) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-deep-space px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="w-full max-w-md space-y-8 relative z-10 glass-panel p-10 rounded-[2.5rem] shadow-2xl">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-red-500/30 mb-6">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black tracking-tight text-white uppercase mb-4">
                            Invalid Reset Link
                        </h2>
                        <p className="text-sm text-slate-300 mb-6">
                            {error || 'This password reset link is invalid or has expired.'}
                        </p>
                        <Link
                            href="/forgot-password"
                            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
                        >
                            Request New Link
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-deep-space px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="w-full max-w-md space-y-8 relative z-10 glass-panel p-10 rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in duration-500">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-6">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-white uppercase">
                            Password Reset
                        </h2>
                        <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                            Your password has been successfully reset.
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                            Redirecting to login...
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-deep-space px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md space-y-8 relative z-10 glass-panel p-10 rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in duration-500">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-white uppercase">
                        New Password
                    </h2>
                    <p className="mt-2 text-sm text-indigo-200 uppercase tracking-widest font-semibold">
                        Set Your New Access Code
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-5">
                        <div>
                            <label htmlFor="password" className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
                                New Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-xl border border-indigo-900/50 bg-slate-900/50 px-5 py-4 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm font-medium transition-all"
                                placeholder="••••••••••••"
                            />
                            <p className="mt-2 text-xs text-slate-500">
                                Must be at least 12 characters with uppercase, lowercase, and numbers
                            </p>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full rounded-xl border border-indigo-900/50 bg-slate-900/50 px-5 py-4 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm font-medium transition-all"
                                placeholder="••••••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-bold text-red-300">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-2xl bg-indigo-600 px-8 py-4 text-base font-black uppercase tracking-[0.1em] text-white hover:bg-indigo-500 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    RESETTING...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </div>

                    <div className="text-center text-sm mt-8 border-t border-indigo-900/30 pt-6">
                        <Link href="/login" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider">
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
