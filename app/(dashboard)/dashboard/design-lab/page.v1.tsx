"use client";

import { RSButton } from '@/components/rs/RSButton';
import { RSInput } from '@/components/rs/RSInput';
import { RSRiskBadge } from '@/components/rs/RSRiskBadge';
import { RSToggle } from '@/components/rs/RSToggle';
import { RSPanel } from '@/components/rs/RSPanel';
import { RSRiskScore } from '@/components/rs/RSRiskScore';
import { RSMeter } from '@/components/rs/RSMeter';
import { RSScanner } from '@/components/rs/RSScanner';
import { RSSystemLog } from '@/components/rs/RSSystemLog';
import { RSRadialMeter } from '@/components/rs/RSRadialMeter';
import { RSKnob } from '@/components/rs/RSKnob';
import { RSSelect } from '@/components/rs/RSSelect';
import { RSTooltip } from '@/components/rs/RSTooltip';
import { RSCallout } from '@/components/rs/RSCallout';
import { RSFileUpload } from '@/components/rs/RSFileUpload';
import { RSModal } from '@/components/rs/RSModal';
import { RSProgressBar } from '@/components/rs/RSProgressBar';
import { RSCard } from '@/components/rs/RSCard';
import { RSNavbar } from '@/components/rs/RSNavbar';
import { RSAvatar } from '@/components/rs/RSAvatar';
import { RSBreadcrumb } from '@/components/rs/RSBreadcrumb';
import { RSTable } from '@/components/rs/RSTable';
import { RSTabs } from '@/components/rs/RSTabs';
import { RSEmptyState } from '@/components/rs/RSEmptyState';
import { RSReportCard } from '@/components/rs/RSReportCard';
import { RSCheckbox } from '@/components/rs/RSCheckbox';
import { RSTextarea } from '@/components/rs/RSTextarea';
import { RSToastItem } from '@/components/rs/RSToast';

export default function DesignLabPage() {
    return (
        <div className="min-h-screen bg-rs-white text-rs-black p-8 font-sans rs-texture-noise">
            <header className="mb-12 border-b-2 border-rs-black pb-4">
                <h1 className="text-4xl font-bold tracking-tighter mb-2">DESIGN LAB</h1>
                <p className="font-mono text-sm text-rs-gray-600">
                    SYSTEM STATUS: INITIALIZING... <br />
                    MODE: RAMS_BASS_STRICT
                </p>
            </header>

            {/* --- COLOR PALETTE --- */}
            <section className="mb-16">
                <h2 className="text-2xl font-bold tracking-tight mb-6 border-l-4 border-rs-signal pl-3 uppercase">01. Palette Logic</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Achromatic Base */}
                    <div className="space-y-2">
                        <div className="h-24 w-full bg-rs-black border border-rs-gray-200"></div>
                        <div className="font-mono text-xs">
                            <p className="font-bold">OFF-BLACK</p>
                            <p className="text-rs-gray-600">#1a1a1a (--rs-black)</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="h-24 w-full bg-rs-white border border-rs-gray-300"></div>
                        <div className="font-mono text-xs">
                            <p className="font-bold">WARM WHITE</p>
                            <p className="text-rs-gray-600">#faf9f7 (--rs-white)</p>
                        </div>
                    </div>

                    {/* Signals */}
                    <div className="space-y-2">
                        <div className="h-24 w-full bg-rs-signal"></div>
                        <div className="font-mono text-xs">
                            <p className="font-bold text-rs-signal">SIGNAL ORANGE</p>
                            <p className="text-rs-gray-600">#FF611A (--rs-signal)</p>
                            <p className="text-[10px] uppercase mt-1">Danger / Alarm Only</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="h-24 w-full bg-rs-safe"></div>
                        <div className="font-mono text-xs">
                            <p className="font-bold text-rs-safe">SAFE GREEN</p>
                            <p className="text-rs-gray-600">#006742 (--rs-safe)</p>
                            <p className="text-[10px] uppercase mt-1">Resolved / Verified</p>
                        </div>
                    </div>
                </div>

                {/* Grays */}
                <div className="mt-8 grid grid-cols-9 gap-2">
                    {[900, 800, 700, 600, 500, 400, 300, 200, 100].map((num) => (
                        <div key={num} className="space-y-1">
                            <div style={{ backgroundColor: `var(--rs-gray-${num})` }} className="h-12 w-full"></div>
                            <p className="font-mono text-[10px] text-center">{num}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- TYPOGRAPHY SCALE --- */}
            <section className="mb-16">
                <h2 className="text-2xl font-bold tracking-tight mb-6 border-l-4 border-rs-black pl-3 uppercase">02. Cinematic Hierarchy</h2>

                <div className="space-y-8 border-l border-rs-gray-200 pl-8">
                    <div>
                        <h1 className="text-6xl font-bold tracking-tighter leading-tight">System Failure<br />Imminent.</h1>
                        <p className="font-mono text-xs text-rs-gray-500 mt-2">Display / Headline (Tracking -0.04em)</p>
                    </div>

                    <div>
                        <h2 className="text-3xl font-semibold tracking-tight">Analysis Report #2291</h2>
                        <p className="font-mono text-xs text-rs-gray-500 mt-2">Section Header (Tracking -0.02em)</p>
                    </div>

                    <div className="max-w-prose">
                        <p className="text-base leading-normal text-rs-gray-900">
                            The automated risk assessment has identified three critical vulnerabilities in the supplied creative assets.
                            Provenance data suggests synthetic manipulation without registered credentials. Recommendation:
                            <span className="font-semibold text-rs-signal bg-rs-gray-100 px-1"> QUARANTINE IMMEDIATELY</span>.
                        </p>
                        <p className="font-mono text-xs text-rs-gray-500 mt-2">Body Copy (Inter / Normal)</p>
                    </div>

                    <div>
                        <p className="font-mono text-sm tracking-wide bg-rs-gray-100 p-2 border border-rs-gray-300 inline-block">
                            ID: SHA-256-AE91 • T: 140ms • V: 0.9.1
                        </p>
                        <p className="font-mono text-xs text-rs-gray-500 mt-2">Evidence Data (Monospace / System)</p>
                    </div>
                </div>
            </section>

            {/* --- SPACING GRID --- */}
            <section className="mb-16">
                <h2 className="text-2xl font-bold tracking-tight mb-6 border-l-4 border-rs-black pl-3 uppercase">03. 4px Grid System</h2>
                <div className="flex items-end gap-1 h-32 border-b border-rs-gray-300 pb-2">
                    {[4, 8, 12, 16, 20, 24, 32, 40, 48, 64].map((size) => (
                        <div key={size} className="group relative cursor-crosshair">
                            <div style={{ width: size, height: size * 2 }} className="bg-rs-gray-300 hover:bg-rs-signal transition-colors"></div>
                            <p className="font-mono text-[10px] text-center mt-1 group-hover:text-rs-signal">{size}px</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- COMPONENT PLAYGROUND --- */}
            <section>
                <h2 className="text-2xl font-bold tracking-tight mb-6 border-l-4 border-rs-black pl-3 uppercase">04. Component Fabrication</h2>
                <div className="p-12 border-2 border-dashed border-rs-gray-300 bg-rs-gray-100 rounded-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 items-start">

                        {/* Buttons */}
                        <div className="space-y-4">
                            <h3 className="font-mono text-xs text-rs-gray-500 uppercase mb-4 border-b border-rs-gray-300 pb-2">Interaction Controls</h3>
                            <div className="flex flex-col gap-3">
                                <RSButton variant="primary">Init Analysis</RSButton>
                                <RSButton variant="secondary">View Raw Log</RSButton>
                                <RSButton variant="danger">Terminate Process</RSButton>
                                <RSButton variant="primary" size="sm">Quick Export</RSButton>

                                <div className="flex items-center justify-between bg-rs-gray-100 p-2 rounded border border-rs-gray-200 shadow-[var(--rs-shadow-track)]">
                                    <span className="text-xs font-mono text-rs-gray-600">AUTO-LOCK</span>
                                    <RSToggle size="md" />
                                </div>
                            </div>
                        </div>

                        {/* Inputs */}
                        <div className="space-y-4">
                            <h3 className="font-mono text-xs text-rs-gray-500 uppercase mb-4 border-b border-rs-gray-300 pb-2">Data Entry</h3>
                            <div className="flex flex-col gap-4">
                                <RSInput label="Case ID" placeholder="ex: 2991-X" />
                                <RSInput label="Target URL" placeholder="https://" fullWidth />
                                <RSInput label="Authorization Code" placeholder="Enter logic..." error="Invalid checksum" />
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="space-y-4">
                            <h3 className="font-mono text-xs text-rs-gray-500 uppercase mb-4 border-b border-rs-gray-300 pb-2">Status Indicators</h3>
                            <div className="flex flex-col gap-2 items-start">
                                <RSRiskBadge level="critical" />
                                <RSRiskBadge level="high" value="98%" />
                                <RSRiskBadge level="medium" label="Suspicious" />
                                <RSRiskBadge level="low" />
                                <RSRiskBadge level="safe" value="Verified" />
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* --- RISK INSTRUMENT CLUSTER --- */}
            <section>
                <h2 className="text-2xl font-bold tracking-tight mb-6 border-l-4 border-rs-black pl-3 uppercase">05. Risk Instrument Cluster</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Panel 1: Critical Risk */}
                    <RSPanel
                        title="High Risk Detected"
                        metadata={[
                            { label: 'CASE', value: '881-A' },
                            { label: 'UTC', value: '14:02:11' }
                        ]}
                        action={<RSRiskBadge level="critical" value="ACTION REQ" />}
                    >
                        <div className="flex items-center gap-8">
                            <RSRiskScore score={88} level="critical" trend="up" />
                            <div className="flex-1 space-y-4">
                                <p className="text-sm text-rs-gray-600">
                                    Likelihood of synthetic manipulation exceeds safety thresholds.
                                </p>
                                <RSMeter value={88} level="critical" />
                            </div>
                        </div>
                    </RSPanel>

                    {/* Panel 2: Verified Safe */}
                    <RSPanel
                        title="Verification Report"
                        metadata={[
                            { label: 'ID', value: 'C2PA-V1' },
                            { label: 'SRC', value: 'ADOBE' }
                        ]}
                        action={<RSRiskBadge level="safe" />}
                    >
                        <div className="flex items-center gap-8">
                            <RSRiskScore score={12} level="safe" trend="stable" />
                            <div className="flex-1 space-y-4">
                                <p className="text-sm text-rs-gray-600">
                                    Content credentials verified. Digital signature valid.
                                </p>
                                <RSMeter value={12} level="safe" />
                            </div>
                        </div>
                    </RSPanel>

                </div>
            </section>

            {/* --- SCANNER KIT --- */}
            <section className="pb-24">
                <h2 className="text-2xl font-bold tracking-tight mb-6 border-l-4 border-rs-black pl-3 uppercase">06. The Scanner Kit</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Active Scan Demo */}
                    <div className="space-y-4">
                        <h3 className="font-mono text-xs text-rs-gray-500 uppercase">Active State (Simulated)</h3>
                        <div className="border border-rs-gray-300 p-4 rounded-md bg-rs-gray-100">
                            <RSPanel title="Forensic Engine V2">
                                <RSScanner
                                    active={true}
                                    status="scanning"
                                    className="mb-4"
                                    // Placeholder image for demo
                                    imageUrl="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
                                />
                                <RSSystemLog
                                    logs={[
                                        { id: 1, message: 'Initializing handshake...', status: 'done', timestamp: '00:01' },
                                        { id: 2, message: 'Acquiring signal...', status: 'done', timestamp: '00:04' },
                                        { id: 3, message: 'Analyzing spectrum...', status: 'active', timestamp: '00:12' },
                                        { id: 4, message: 'Awaiting tensor result...', status: 'pending' },
                                    ]}
                                />
                            </RSPanel>
                        </div>
                    </div>

                    {/* Idle / Error States */}
                    <div className="space-y-4">
                        <h3 className="font-mono text-xs text-rs-gray-500 uppercase">Idle / Error States</h3>
                        <div className="grid gap-4">
                            <RSScanner className="h-40" />
                            <RSSystemLog
                                maxHeight="100px"
                                logs={[
                                    { id: 1, message: 'Connection lost.', status: 'error', timestamp: 'ERR' },
                                    { id: 2, message: 'Retrying socket...', status: 'active' },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* --- RADIAL INSTRUMENTS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12 pt-12 border-t border-rs-gray-200">
                    <div className="flex flex-col items-center gap-4">
                        <span className="font-mono text-xs text-rs-gray-500 uppercase tracking-widest">Composite Index</span>
                        <RSRadialMeter value={88} level="critical" size={160} />
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <span className="font-mono text-xs text-rs-gray-500 uppercase tracking-widest">Brand Safety</span>
                        <RSRadialMeter value={42} level="medium" size={120} />
                    </div>
                    <div className="flex flex-col items-center justify-center gap-8 border-l border-rs-gray-200 pl-8 col-span-2">
                        <div className="flex gap-12">
                            <RSKnob label="Sensitivity" value={75} />
                            <RSKnob label="Threshold" value={40} min={0} max={100} />
                            <RSKnob label="Depth" value={92} size={60} />
                        </div>
                        <p className="text-xs text-rs-gray-500 font-mono text-center max-w-sm">
                            ADJUST DETECTION PARAMETERS VIA ANALOGUE INPUT
                        </p>
                    </div>
                </div>

                {/* --- UTILITY KIT --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-12 border-t border-rs-gray-200">
                    <div className="space-y-6">
                        <h3 className="font-mono text-xs text-rs-gray-500 uppercase tracking-widest">Forms & Interactions</h3>
                        <div className="space-y-4 max-w-xs">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium">Risk Policy</label>
                                <RSTooltip content="Strict policies automatically flag content over 85% probability." />
                            </div>

                            <RSSelect
                                placeholder="Select Jurisdiction..."
                                options={[
                                    { value: 'us', label: 'United States (C2PA)' },
                                    { value: 'eu', label: 'European Union (AI Act)' },
                                    { value: 'global', label: 'Global Standard' },
                                ]}
                                fullWidth
                            />

                            <div className="flex items-center justify-between text-sm text-rs-gray-600 border border-rs-gray-300 p-2 rounded-[4px]">
                                <span>Export Report?</span>
                                <RSTooltip content="Download PDF with cryptographic proof." side="bottom">
                                    <span className="text-xs font-mono underline cursor-help decoration-dashed decoration-rs-gray-400">Why?</span>
                                </RSTooltip>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="font-mono text-xs text-rs-gray-500 uppercase tracking-widest">Prominent Callouts</h3>
                        <div className="space-y-4">
                            <RSCallout title="System Update" variant="info">
                                New detection model (v2.1) deployed. Re-scan assets uploaded prior to 12/01.
                            </RSCallout>
                            <RSCallout title="Critical Exposure" variant="warning">
                                3 assets in your library have been flagged for DMCA review.
                            </RSCallout>
                        </div>
                    </div>
                </div>

                {/* --- ESSENTIAL SAAS COMPONENTS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-12 border-t border-rs-gray-200">
                    <div className="space-y-6">
                        <h3 className="font-mono text-xs text-rs-gray-500 uppercase tracking-widest">Upload & Progress</h3>
                        <div className="space-y-6">
                            <RSFileUpload
                                onFileSelect={(file) => console.log('Selected:', file.name)}
                                maxSizeMB={5}
                            />

                            <div className="space-y-4">
                                <RSProgressBar value={45} label="Uploading..." variant="default" />
                                <RSProgressBar value={88} label="Analyzing..." variant="signal" size="lg" />
                                <RSProgressBar label="Processing..." variant="safe" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="font-mono text-xs text-rs-gray-500 uppercase tracking-widest">Cards & Containers</h3>
                        <div className="space-y-4">
                            <RSCard header="Scan Report #2291" variant="default">
                                <p className="text-sm text-rs-gray-600">
                                    Analysis complete. Risk score: <span className="font-bold text-rs-signal">88%</span>
                                </p>
                            </RSCard>

                            <RSCard
                                header="Quick Stats"
                                footer={<span className="text-xs text-rs-gray-500 font-mono">Last updated: 2m ago</span>}
                                variant="elevated"
                            >
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-bold">12</p>
                                        <p className="text-xs text-rs-gray-500">Scans</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-rs-signal">3</p>
                                        <p className="text-xs text-rs-gray-500">High Risk</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-rs-safe">9</p>
                                        <p className="text-xs text-rs-gray-500">Verified</p>
                                    </div>
                                </div>
                            </RSCard>
                        </div>
                    </div>
                </div>

                {/* --- DEMO: EXTENDED SUITE --- */}
                <div className="mt-12 pt-12 border-t border-rs-gray-200">
                    <h2 className="text-2xl font-bold tracking-tight mb-6 border-l-4 border-rs-black pl-3 uppercase">07. Extended Suite</h2>

                    {/* Shell Components */}
                    <div className="space-y-8 mb-12">
                        <h3 className="font-mono text-xs text-rs-gray-500 uppercase tracking-widest">Application Shell</h3>
                        <div className="border border-rs-gray-200 rounded-[4px] bg-rs-gray-50 overflow-hidden relative" style={{ height: '300px' }}>
                            <RSNavbar className="absolute top-0 w-full">
                                <RSBreadcrumb items={[{ label: 'Dashboard' }, { label: 'Scans' }, { label: '#2291', href: '#' }]} />
                            </RSNavbar>
                            <div className="mt-16 h-full flex">
                                <div className="w-16 h-full bg-rs-gray-100 border-r border-rs-gray-200 flex flex-col items-center py-4 gap-4">
                                    <div className="w-8 h-8 rounded bg-rs-black/10" />
                                    <div className="w-8 h-8 rounded bg-rs-black/5" />
                                    <div className="w-8 h-8 rounded bg-rs-black/5" />
                                </div>
                                <div className="p-8">
                                    <h4 className="font-bold text-rs-black mb-2">Shell Context</h4>
                                    <p className="text-sm text-rs-gray-600 max-w-sm">
                                        Navbar and Sidebar components compose the application frame.
                                        Breadcrumbs provide location context.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Views */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        <div className="space-y-6">
                            <h3 className="font-mono text-xs text-rs-gray-500 uppercase tracking-widest">Data Tables & Lists</h3>
                            <RSTable
                                columns={[
                                    { key: 'id', header: 'ID', width: '80px' },
                                    { key: 'name', header: 'Asset Name', sortable: true },
                                    { key: 'status', header: 'Status' }
                                ]}
                                data={[
                                    { id: '001', name: 'campaign_v1.jpg', status: <RSRiskBadge level="safe" size="sm" /> },
                                    { id: '002', name: 'hero_banner.png', status: <RSRiskBadge level="critical" size="sm" /> },
                                    { id: '003', name: 'logo_mark.svg', status: <RSRiskBadge level="low" size="sm" /> },
                                ]}
                            />

                            <RSTabs
                                tabs={[
                                    { id: 'all', label: 'All Scans' },
                                    { id: 'flagged', label: 'Flagged (3)' },
                                    { id: 'archived', label: 'Archived' },
                                ]}
                            />
                        </div>

                        <div className="space-y-6">
                            <h3 className="font-mono text-xs text-rs-gray-500 uppercase tracking-widest">Cards & Empty States</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <RSReportCard
                                    id="001-ALPHA"
                                    filename="marketing_q1.jpg"
                                    date="Today, 10:23 AM"
                                    score={12}
                                    level="safe"
                                    imageUrl="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
                                />

                                <RSEmptyState
                                    title="No Flags Found"
                                    description="Great news! Your recent library scan returned zero critical risks."
                                    className="py-8"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-6">
                        <h3 className="font-mono text-xs text-rs-gray-500 uppercase tracking-widest">Extended Inputs</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <RSTextarea label="Scan Notes" placeholder="Add commentary to this analysis..." />
                                <div className="flex flex-col gap-2">
                                    <RSCheckbox label="Flag for manual review" />
                                    <RSCheckbox label="Notify team via Slack" checked />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-rs-gray-400">Notifications</h4>
                                <RSToastItem title="Analysis Complete" description="Report #2291 is ready for download." variant="success" />
                                <RSToastItem title="Upload Failed" description="Connection interrupted." variant="error" />
                            </div>
                        </div>
                    </div>

                </div>

            </section>
        </div>
    );
}
