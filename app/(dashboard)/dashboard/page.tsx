/**
 * Dashboard Page (Protected)
 * SaaS-Noir Esthetic
 */

import { getCurrentUser, getCurrentProfile, getTenant, getTenantId } from '@/lib/supabase/auth'
import { logout } from '@/app/(auth)/actions'
import { getMonthlyUsage } from './actions'
import { UploadContainer } from '@/components/upload/UploadContainer'
import { ScanResults } from '@/components/dashboard/ScanResults'

export default async function DashboardPage() {
  // Get authenticated user (middleware ensures this exists)
  const user = await getCurrentUser()
  const profile = await getCurrentProfile()
  const tenant = await getTenant()
  const tenantId = await getTenantId()
  const monthlyUsage = await getMonthlyUsage()

  return (
    <div className="min-h-screen bg-deep-space text-white font-sans selection:bg-indigo-500/30">

      {/* Top Navigation Bar - Glassmorphism */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase text-white leading-none">Command Center</h1>
              <p className="text-[10px] text-indigo-300 uppercase tracking-widest font-bold">
                {(tenant as any).name} • {(profile as any).full_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Plan Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">System Online</span>
            </div>

            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                Disconnect
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        {/* Stats Grid - Dark Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Organization */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:border-indigo-500/30 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-16 h-16 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Organization</p>
            <p className="text-2xl font-black text-white truncate">{(tenant as any).name}</p>
          </div>

          {/* Plan */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:border-purple-500/30 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-16 h-16 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-1">Current Plan</p>
            <p className="text-2xl font-black text-white capitalize">{(tenant as any).plan}</p>
          </div>

          {/* Monthly Scans */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-16 h-16 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest mb-1">Usage Cycle</p>
            <p className="text-2xl font-black text-white">
              {monthlyUsage.used} <span className="text-base text-slate-500 font-medium">/ {(tenant as any).monthly_scan_limit}</span>
            </p>
            {/* Tiny Progress Bar */}
            <div className="w-full h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (monthlyUsage.used / ((tenant as any).monthly_scan_limit || 1)) * 100)}%` }}></div>
            </div>
          </div>

          {/* Role */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:border-pink-500/30 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-16 h-16 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-pink-300 uppercase tracking-widest mb-1">Security Clearance</p>
            <p className="text-2xl font-black text-white capitalize">{(profile as any).role}</p>
          </div>
        </div>

        {/* Upload Section - Needs to be checked for Dark Mode compatibility */}
        <div className="glass-panel rounded-3xl p-8 border border-indigo-500/20 shadow-2xl shadow-indigo-900/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Initiate New Scan</h2>
              <p className="text-sm text-slate-400">Upload assets for immediate forensic analysis.</p>
            </div>
          </div>
          <UploadContainer userId={(user as any).id} monthlyUsage={monthlyUsage} />
        </div>

        {/* Recent Scans */}
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
            Recent Operations
          </h2>
          <ScanResults tenantId={tenantId} />
        </div>
      </main>
    </div>
  )
}
