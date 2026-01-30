'use client'

/**
 * Scan Results Display
 *
 * Shows recent scans with their risk scores and findings
 * Auto-refreshes to show updated scan statuses
 */

import { useEffect, useState } from 'react'

type ScanResult = {
  id: string
  status: 'processing' | 'complete' | 'failed'
  risk_level?: string
  composite_score?: number
  ip_risk_score?: number
  safety_risk_score?: number
  created_at: string
  completed_at?: string
  assets?: {
    filename: string
    file_type: string
  }
  scan_findings?: Array<{
    id: string
    finding_type: string
    severity: string
    title: string
    description: string
    confidence_score: number
  }>
}

type Props = {
  tenantId: string
}

export function ScanResults({ tenantId: _tenantId }: Props) {
  const [scans, setScans] = useState<ScanResult[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch scans
  const fetchScans = async () => {
    try {
      const response = await fetch('/api/scans/list')
      if (response.ok) {
        const data = await response.json()
        setScans(data.scans || [])
      }
    } catch (error) {
      console.error('Failed to fetch scans:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchScans()
  }, [])

  // Auto-refresh every 5 seconds if there are processing scans
  useEffect(() => {
    const hasProcessing = scans.some(s => s.status === 'processing')
    if (!hasProcessing) return

    const interval = setInterval(fetchScans, 5000)
    return () => clearInterval(interval)
  }, [scans])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto shadow-lg shadow-indigo-500/50"></div>
        <p className="mt-4 text-sm text-indigo-300 uppercase tracking-widest font-bold">Scanning Neural Network...</p>
      </div>
    )
  }

  if (scans.length === 0) {
    return (
      <div className="text-center text-slate-500 py-16 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
        <svg className="mx-auto h-16 w-16 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-4 text-sm uppercase tracking-wider font-bold">No Operations Logged</p>
        <p className="text-xs text-slate-600 mt-1">Initialize a new scan to begin forensic analysis.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {scans.map((scan) => (
        <ScanCard key={scan.id} scan={scan} />
      ))}
    </div>
  )
}

function ScanCard({ scan }: { scan: ScanResult }) {
  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'safe': return 'text-rs-safe border-rs-safe/30 bg-rs-safe/10'
      case 'caution': return 'text-rs-risk-caution border-rs-risk-caution/30 bg-rs-risk-caution/10'
      case 'review': return 'text-rs-risk-review border-rs-risk-review/30 bg-rs-risk-review/10'
      case 'high': return 'text-rs-risk-high border-rs-risk-high/30 bg-rs-risk-high/10'
      case 'critical': return 'text-rs-signal border-rs-signal/50 bg-rs-signal/20 shadow-[0_0_15px_rgba(255,79,0,0.3)]'
      default: return 'text-rs-gray-400 border-rs-gray-500 bg-rs-gray-600/50'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing
          </span>
        )
      case 'complete':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rs-safe/10 text-rs-safe border border-rs-safe/20">
            Completed
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rs-signal/10 text-rs-signal border border-rs-signal/20">
            Failed
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800/60 hover:border-indigo-500/30 transition-all group hover:bg-slate-800/40">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-2">
            <h3 className="text-lg font-bold text-white group-hover:text-indigo-200 transition-colors">
              {scan.assets?.filename || 'Unknown asset'}
            </h3>
            {getStatusBadge(scan.status)}
          </div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            Detected: {new Date(scan.created_at).toLocaleString()}
          </p>
        </div>

        {scan.status === 'complete' && scan.risk_level && (
          <div className={`px-5 py-3 rounded-xl border ${getRiskColor(scan.risk_level)} flex flex-col items-center min-w-[100px]`}>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">{scan.risk_level}</div>
            <div className="text-3xl font-black leading-none">{scan.composite_score}</div>
          </div>
        )}
      </div>

      {/* Scores */}
      {scan.status === 'complete' && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">IP Exposure</div>
            <div className="text-xl font-bold text-white">{scan.ip_risk_score || 0}%</div>
            <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-indigo-500" style={{ width: `${scan.ip_risk_score || 0}%` }}></div>
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Brand Safety</div>
            <div className="text-xl font-bold text-white">{scan.safety_risk_score || 0}%</div>
            <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-purple-500" style={{ width: `${scan.safety_risk_score || 0}%` }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Findings */}
      {scan.scan_findings && scan.scan_findings.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Threat Intelligence</h4>
          {scan.scan_findings.map((finding) => (
            <div
              key={finding.id}
              className="bg-slate-900/30 rounded-xl p-4 border-l-[4px] border border-slate-800/50 hover:bg-slate-900/60 transition-colors"
              style={{
                borderLeftColor:
                  finding.severity === 'critical' ? 'var(--rs-signal)' :
                    finding.severity === 'high' ? 'var(--rs-risk-high)' :
                      finding.severity === 'medium' ? 'var(--rs-risk-review)' : 'var(--rs-gray-500)'
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {finding.severity}
                    </span>
                    <span className="text-sm font-bold text-white">{finding.title}</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{finding.description}</p>
                </div>
                <span className="ml-4 text-xs font-bold text-slate-500 isolate bg-slate-900 px-2 py-1 rounded">{finding.confidence_score}% Conf.</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {scan.status === 'complete' && (!scan.scan_findings || scan.scan_findings.length === 0) && (
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex items-center gap-3">
          <div className="p-1 bg-emerald-500/20 rounded-full text-emerald-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <span className="text-sm font-bold text-emerald-400">Analysis Clean - No Anomalies Detected</span>
        </div>
      )}

      {scan.status === 'failed' && (
        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 text-sm font-bold text-red-400">
          Analysis Failed - System Error
        </div>
      )}
    </div>
  )
}
