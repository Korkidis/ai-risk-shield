'use client'

/**
 * Sign Up Page
 * SaaS-Noir Esthetic
 */

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { signUp } from '../actions'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative flex w-full justify-center rounded-2xl bg-indigo-600 px-8 py-4 text-base font-black uppercase tracking-[0.1em] text-white hover:bg-indigo-500 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          ESTABLISHING UPLINK...
        </>
      ) : (
        'CREATE SECURE ACCOUNT'
      )}
    </button>
  )
}

export default function SignUpPage() {
  const [state, formAction] = useActionState(signUp, null)

  return (
    <div className="flex min-h-screen items-center justify-center bg-deep-space px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-8 relative z-10 glass-panel p-10 rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in duration-500">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase">
            New Agent Registration
          </h2>
          <p className="mt-2 text-sm text-indigo-200 uppercase tracking-widest font-semibold">
            Clearance Level 1
          </p>
        </div>

        {/* Form */}
        <form action={formAction} className="mt-8 space-y-6">
          <input type="hidden" name="next" value={new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('next') || ''} />
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
                Operative Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="block w-full rounded-xl border border-indigo-900/50 bg-slate-900/50 px-5 py-4 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm font-medium transition-all"
                placeholder="John Doe"
              />
            </div>

            {/* Organization Name */}
            <div>
              <label htmlFor="organizationName" className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
                Agency / Org
              </label>
              <input
                id="organizationName"
                name="organizationName"
                type="text"
                required
                className="block w-full rounded-xl border border-indigo-900/50 bg-slate-900/50 px-5 py-4 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm font-medium transition-all"
                placeholder="Acme Inc."
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
                Email Identity
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-xl border border-indigo-900/50 bg-slate-900/50 px-5 py-4 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm font-medium transition-all"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
                Access Code
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="block w-full rounded-xl border border-indigo-900/50 bg-slate-900/50 px-5 py-4 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm font-medium transition-all"
                placeholder="••••••••••••"
              />
              <p className="mt-2 text-[10px] text-slate-400 uppercase tracking-wider">
                Minimum 12 chars • Mixed Case • Numeric
              </p>
            </div>
          </div>

          {/* Error Message */}
          {state?.error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-bold text-red-300">{state.error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <SubmitButton />
          </div>

          {/* Login Link */}
          <div className="text-center text-sm mt-8 border-t border-indigo-900/30 pt-6">
            <span className="text-slate-400">Already Authorized? </span>
            <Link href="/login" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider">
              Secure Login
            </Link>
          </div>
        </form>

        {/* Free Trial Notice */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">
            3 Free Scans/Month • No Credit Card Required
          </p>
        </div>
      </div>
    </div>
  )
}
