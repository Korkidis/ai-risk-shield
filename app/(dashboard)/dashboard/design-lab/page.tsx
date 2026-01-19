"use client";

import { useState, useEffect } from 'react';
import {
    Shield,
    Layers,
    Cpu,
    Move,
    Sun,
    Moon,
    Megaphone
} from 'lucide-react';

import { RSButton } from '@/components/rs/RSButton';
import { RSRiskBadge } from '@/components/rs/RSRiskBadge';
import { RSKnob } from '@/components/rs/RSKnob';
import { RSPanel } from '@/components/rs/RSPanel';
import { RSMeter } from '@/components/rs/RSMeter';
import { RSScanner } from '@/components/rs/RSScanner';
import { RSSystemLog } from '@/components/rs/RSSystemLog';
import { RSAnalogNeedle } from '@/components/rs/RSAnalogNeedle';
import { RSTelemetryStream } from '@/components/rs/RSTelemetryStream';
import { RSCard } from '@/components/rs/RSCard';
import { RSModal } from '@/components/rs/RSModal';
import { cn } from '@/lib/utils';
import { FreeForensicReport } from '@/components/landing/FreeForensicReport';
import { UpgradeModal } from '@/components/landing/UpgradeModal';
// Missing Input Controls
import { RSCheckbox } from '@/components/rs/RSCheckbox';
import { RSToggle } from '@/components/rs/RSToggle';
import { RSSelect } from '@/components/rs/RSSelect';
import { RSTextarea } from '@/components/rs/RSTextarea';
import { RSFileUpload } from '@/components/rs/RSFileUpload';
import { RSUploadZone } from '@/components/rs/RSUploadZone';
import { RSBackground } from '@/components/rs/RSBackground';
// Missing Data Visualization
import { RSRadialMeter } from '@/components/rs/RSRadialMeter';
import { RSProgressBar } from '@/components/rs/RSProgressBar';
import { RSRiskScore } from '@/components/rs/RSRiskScore';
import { RSC2PAWidget } from '@/components/rs/RSC2PAWidget';
// Missing Structural Elements
import { RSTable } from '@/components/rs/RSTable';
import { RSEmptyState } from '@/components/rs/RSEmptyState';
import { RSBreadcrumb } from '@/components/rs/RSBreadcrumb';
// RSProcessingPanel is already imported
import { RSTabs } from '@/components/rs/RSTabs';
import { RSNavbar } from '@/components/rs/RSNavbar';
import { RSSidebar } from '@/components/rs/RSSidebar';
// Missing Feedback & Utilities
import { RSCallout } from '@/components/rs/RSCallout';
import { RSToastItem } from '@/components/rs/RSToast';
import { RSTooltip } from '@/components/rs/RSTooltip';
import { RSAvatar } from '@/components/rs/RSAvatar';
import { RSReportCard } from '@/components/rs/RSReportCard';

export default function DesignLabPage() {
    const [activeTab, setActiveTab] = useState<'palette' | 'components' | 'physics' | 'marketing'>('components');
    const [showModal, setShowModal] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={cn(
                "flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-[var(--rs-radius-element)]",
                activeTab === id
                    ? "bg-[var(--rs-bg-element)] text-[var(--rs-text-primary)] shadow-[var(--rs-shadow-l2)] translate-y-[-2px]" // Extruded Active
                    : "text-[var(--rs-text-secondary)] hover:text-[var(--rs-text-primary)] hover:bg-[var(--rs-bg-element)]/50"
            )}
        >
            <Icon size={14} />
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-[var(--rs-bg-surface)] text-[var(--rs-text-primary)] font-sans selection:bg-[#FF4F00] selection:text-white relative overflow-x-hidden rs-bg-microdot transition-colors duration-500">

            {/* Main Container */}
            <div className="max-w-7xl mx-auto px-12 py-12 relative z-10">

                {/* --- HEADER SYSTEM --- */}
                <header className="mb-12 border-b border-[var(--rs-border-primary)] pb-8">
                    <div className="flex justify-between items-end">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#FF4F00] rounded-[var(--rs-radius-element)] shadow-[var(--rs-shadow-l2)] flex items-center justify-center">
                                    <Shield size={24} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black tracking-tighter text-[var(--rs-text-primary)] uppercase mb-1">Interface Standards</h1>
                                    <p className="font-mono text-[10px] text-[var(--rs-text-secondary)] uppercase tracking-[0.2em]">
                                        Ref. Scientific • V3.0 • MOMA_SPEC
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleTheme}
                                className="w-10 h-10 rounded-full bg-[var(--rs-bg-element)] border border-[var(--rs-border-primary)] flex items-center justify-center shadow-[var(--rs-shadow-l1)] text-[var(--rs-text-primary)] hover:scale-105 transition-all"
                            >
                                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                            </button>

                            {/* Tab Switcher */}
                            <div className="flex gap-2 p-1 bg-[var(--rs-bg-element)] rounded-[var(--rs-radius-container)] shadow-[var(--rs-shadow-l1)]">
                                <TabButton id="palette" label="Palette & Type" icon={Layers} />
                                <TabButton id="components" label="Components" icon={Cpu} />
                                <TabButton id="physics" label="Physics Engine" icon={Move} />
                                <TabButton id="marketing" label="Marketing Patterns" icon={Megaphone} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* --- CONTENT AREA --- */}
                <main className="min-h-[600px]">

                    {/* VIEW: PALETTE */}
                    {activeTab === 'palette' && (
                        <div className="space-y-24 animate-in fade-in duration-500">
                            {/* 01.0 PALETTE */}
                            <section>
                                <div className="flex items-center gap-6 mb-12">
                                    <span className="font-mono text-xs text-[#9A9691]">01.0</span>
                                    <h2 className="text-2xl font-black tracking-tight uppercase">Industrial Palette</h2>
                                    <div className="h-[1px] bg-[#DBD7D0] flex-grow" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                    {[
                                        { name: 'Clay White', hex: '#EBE7E0', use: 'Structural Shell', border: true },
                                        { name: 'Lufthansa Grey', hex: '#B4B0AB', use: 'Secondary Deck' },
                                        { name: 'Carbon Matte', hex: '#1A1A1A', use: 'Control Text', shadow: true },
                                        { name: 'Vivid Signal', hex: '#FF4F00', use: 'Alert / Emergency', signal: true },
                                        { name: 'Safe Green', hex: '#006742', use: 'Verification / Safe', safe: true },
                                        { name: 'System Blue', hex: '#005F87', use: 'Data / Info', info: true },
                                    ].map((color) => (
                                        <div key={color.name} className="flex items-center gap-6 p-4 rounded-[var(--rs-radius-container)] shadow-[var(--rs-shadow-l2)] bg-[var(--rs-bg-surface)]">
                                            <div
                                                className="w-20 h-20 rounded-[var(--rs-radius-element)] shadow-[var(--rs-shadow-l1)]"
                                                style={{ backgroundColor: color.hex }}
                                            />
                                            <div className="font-mono text-[11px]">
                                                <p className="font-bold uppercase tracking-tight rs-etched">{color.name}</p>
                                                <p className="text-[var(--rs-text-secondary)] mt-1">{color.hex}</p>
                                                <p className="mt-2 text-[9px] text-[var(--rs-text-tertiary)] uppercase font-bold">{color.use}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* 02.0 TYPOGRAPHY */}
                            <section>
                                <div className="flex items-center gap-6 mb-12">
                                    <span className="font-mono text-xs text-[#9A9691]">02.0</span>
                                    <h2 className="text-2xl font-black tracking-tight uppercase">Cinematic Typography</h2>
                                    <div className="h-[1px] bg-[#DBD7D0] flex-grow" />
                                </div>
                                <div className="space-y-12 pl-10 border-l border-[#FF4F00]">
                                    {/* Type Scale Definition */}
                                    <div className="grid grid-cols-1 gap-8 mb-16 border-b border-[var(--rs-border-primary)] pb-16">
                                        <div className="flex items-baseline gap-8">
                                            <span className="w-8 text-[10px] font-mono text-[var(--rs-text-tertiary)]">H1</span>
                                            <div>
                                                <h1 className="text-6xl md:text-8xl rs-header-bold-italic text-[var(--rs-text-primary)]">HEADLINE 01</h1>
                                                <p className="text-[10px] font-mono text-[var(--rs-text-secondary)] mt-1">rs-header-bold-italic • 96px</p>
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-8">
                                            <span className="w-8 text-[10px] font-mono text-[var(--rs-text-tertiary)]">H2</span>
                                            <div>
                                                <h2 className="text-4xl md:text-5xl rs-type-display font-black text-[var(--rs-text-primary)] uppercase">Display Header 02</h2>
                                                <p className="text-[10px] font-mono text-[var(--rs-text-secondary)] mt-1">rs-type-display • 48px</p>
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-8">
                                            <span className="w-8 text-[10px] font-mono text-[var(--rs-text-tertiary)]">H3</span>
                                            <div>
                                                <h3 className="text-2xl rs-type-section font-bold text-[var(--rs-text-primary)] uppercase">Section Header 03</h3>
                                                <p className="text-[10px] font-mono text-[var(--rs-text-secondary)] mt-1">rs-type-section • 24px</p>
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-8">
                                            <span className="w-8 text-[10px] font-mono text-[var(--rs-text-tertiary)]">H4</span>
                                            <div>
                                                <h4 className="text-lg rs-type-label font-bold text-[var(--rs-text-secondary)] uppercase">Label 04</h4>
                                                <p className="text-[10px] font-mono text-[var(--rs-text-secondary)] mt-1">rs-type-label • 18px</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-16">
                                        <h1 className="text-8xl rs-header-bold-italic mb-4 text-[var(--rs-text-primary)]">
                                            TRUST IS<br />
                                            NO<br />
                                            <span className="text-[#FF4F00]">LONGER</span><br />
                                            <span className="text-[#FF4F00]">HUMAN.</span>
                                        </h1>
                                        <p className="font-mono text-[10px] text-[var(--rs-text-secondary)] uppercase">Display / Headline (Tracking -0.04em)</p>
                                    </div>

                                    {/* Type Spec List */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-[#DBD7D0] pt-12">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-mono text-[var(--rs-text-secondary)] uppercase">Section Header (Tracking -0.02em)</p>
                                            <h2 className="text-2xl rs-type-section text-[var(--rs-text-primary)]">
                                                Analysis Report #2291
                                            </h2>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-mono text-[var(--rs-text-secondary)] uppercase">Body Copy (Inter / Normal)</p>
                                            <p className="rs-type-body text-[var(--rs-text-tertiary)] max-w-xs leading-relaxed">
                                                Automated diagnostics indicate a probability of synthetic interference.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-mono text-[var(--rs-text-secondary)] uppercase">Evidence Data (Monospace)</p>
                                            <p className="rs-type-mono text-[var(--rs-text-primary)] text-xs">
                                                ID: SHA-256-AE91 • T: 140ms • V: 0.9.1
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-mono text-[var(--rs-text-secondary)] uppercase">Label / Control</p>
                                            <p className="rs-type-label text-[var(--rs-text-primary)]">
                                                SIGNAL LOCK
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-mono text-[var(--rs-text-secondary)] uppercase">Micro / Metadata</p>
                                            <p className="rs-type-micro text-[var(--rs-text-primary)]">
                                                (STATUS: 0x99)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* VIEW: COMPONENTS */}
                    {activeTab === 'components' && (
                        <div className="space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* 04.1 CONTROL INPUTS */}
                            <section>
                                <div className="flex items-center gap-6 mb-12">
                                    <span className="font-mono text-xs text-[#9A9691]">04.1</span>
                                    <h2 className="text-2xl font-black tracking-tight uppercase">Control Inputs</h2>
                                    <div className="h-[1px] bg-[#DBD7D0] flex-grow" />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                    {/* Binary Controls */}
                                    <div className="bg-[var(--rs-bg-surface)] p-8 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] space-y-8">
                                        <div className="flex items-center gap-2 mb-4 opacity-40">
                                            <span className="text-[10px] font-bold uppercase tracking-widest rs-etched">Binary States</span>
                                        </div>
                                        <div className="space-y-6">
                                            <RSCheckbox label="Enable Safe Mode" checked={true} />
                                            <RSCheckbox label="Allow External Signals" checked={false} />
                                            <div className="flex items-center justify-between pt-2">
                                                <span className="text-sm font-medium">System Power</span>
                                                <RSToggle checked={true} />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">Silent Mode</span>
                                                <RSToggle size="sm" checked={false} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selection & Entry */}
                                    <div className="bg-[var(--rs-bg-surface)] p-8 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] space-y-8">
                                        <div className="flex items-center gap-2 mb-4 opacity-40">
                                            <span className="text-[10px] font-bold uppercase tracking-widest rs-etched">Selection & Entry</span>
                                        </div>
                                        <div className="space-y-6">
                                            <RSSelect
                                                options={[
                                                    { value: 'v1', label: 'Protocol V1.0' },
                                                    { value: 'v2', label: 'Protocol V2.0 (Beta)' },
                                                ]}
                                                placeholder="Select Protocol"
                                                fullWidth
                                            />
                                            <RSTextarea label="Mission Log" placeholder="Enter session notes..." rows={3} />
                                        </div>
                                    </div>

                                    {/* Action Hardware */}
                                    <div className="bg-[var(--rs-bg-surface)] p-8 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] space-y-8">
                                        <div className="flex items-center gap-2 mb-4 opacity-40">
                                            <span className="text-[10px] font-bold uppercase tracking-widest rs-etched">Action Hardware</span>
                                        </div>
                                        <div className="space-y-4">
                                            <RSButton fullWidth>Execute Protocol</RSButton>
                                            <div className="flex gap-3">
                                                <RSButton variant="secondary" className="flex-1">Calibrate</RSButton>
                                                <RSButton variant="ghost" className="flex-1">Query</RSButton>
                                            </div>
                                            <RSButton variant="danger" fullWidth>System Purge</RSButton>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
                                    <div className="bg-[var(--rs-bg-surface)] p-8 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)]">
                                        <span className="text-[10px] font-bold uppercase tracking-widest rs-etched block mb-6">Ingest Mechanics</span>
                                        <RSFileUpload maxSizeMB={50} className="h-32" />
                                    </div>
                                    <RSUploadZone onFileSelect={() => { }} isCompact className="h-full" />
                                </div>
                            </section>

                            {/* 05.1 ANALOG INSTRUMENTS */}
                            <section>
                                <div className="flex items-center gap-6 mb-12">
                                    <span className="font-mono text-xs text-[#9A9691]">05.1</span>
                                    <h2 className="text-2xl font-black tracking-tight uppercase">Analog Instruments</h2>
                                    <div className="h-[1px] bg-[#DBD7D0] flex-grow" />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    {/* Dials Cluster (Radial Telemetry) */}
                                    <div className="bg-[var(--rs-bg-surface)] p-10 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] border border-[var(--rs-border-primary)]/20 relative overflow-hidden">
                                        <div className="absolute top-4 right-4 text-[10px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest opacity-40">
                                            Telemetry_Array_V3
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest rs-etched mb-8 block opacity-50">Radial telemetry</span>
                                        <div className="flex flex-wrap gap-8 items-center justify-around lg:justify-start">
                                            <RSRadialMeter value={88} level="critical" label="IP_RISK" size={120} />
                                            <RSRadialMeter value={42} level="safe" label="BRAND_SAFE" size={120} />
                                            <RSRadialMeter value={65} level="warning" label="PROVENANCE" size={120} />
                                        </div>
                                    </div>

                                    {/* Auxiliary Needle Deck */}
                                    <div className="bg-[var(--rs-bg-surface)] p-10 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] border border-[var(--rs-border-primary)]/20 relative overflow-hidden">
                                        <div className="absolute top-4 right-4 text-[10px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest opacity-40">
                                            Auxiliary_Needle_Deck
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest rs-etched mb-8 block opacity-50">Auxiliary Readout</span>
                                        <div className="flex flex-wrap gap-8 items-center justify-around lg:justify-start">
                                            <RSAnalogNeedle value={0} label="IP Risk" powered={false} size={140} />
                                            <RSAnalogNeedle value={50} label="Brand Safety" isScanning={true} size={140} />
                                            <RSAnalogNeedle value={92} label="Provenance" level="critical" size={140} />
                                        </div>
                                        <p className="text-[9px] text-[var(--rs-text-tertiary)] italic mt-8 opacity-60">
                                            Real-time analog feedback monitoring core bias and signal variance.
                                        </p>
                                    </div>

                                    {/* Manual Override Deck (Knobs) - Moved Below */}
                                    <div className="lg:col-span-2 bg-[var(--rs-bg-surface)] p-10 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] border border-[var(--rs-border-primary)]/20 relative overflow-hidden">
                                        <div className="absolute top-4 right-4 text-[10px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest opacity-40">
                                            Manual_Override_Deck
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest rs-etched mb-4 block opacity-50">Control Surface</span>
                                        <div className="flex justify-center mt-6">
                                            <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 w-full max-w-md">
                                                <RSKnob label="Sensitivity" value={75} size={90} />
                                                <div className="w-[1px] h-12 bg-[#DBD7D0] hidden md:block opacity-20" />
                                                <RSKnob label="Depth" value={42} size={90} />
                                                <div className="w-[1px] h-12 bg-[#DBD7D0] hidden md:block opacity-20" />
                                                <RSKnob label="Threshold" value={88} size={90} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 06.1 ANALYTICAL MONITORING */}
                            <section>
                                <div className="flex items-center gap-6 mb-12">
                                    <span className="font-mono text-xs text-[#9A9691]">06.1</span>
                                    <h2 className="text-2xl font-black tracking-tight uppercase">Analytical Monitoring</h2>
                                    <div className="h-[1px] bg-[#DBD7D0] flex-grow" />
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                                    {/* Core Risk Vectors */}
                                    <div className="bg-[var(--rs-bg-surface)] p-10 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] border border-[var(--rs-border-primary)]/20 relative overflow-hidden">
                                        <div className="absolute top-4 right-4 text-[10px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest opacity-40">
                                            Predictive_Analysis_Deck
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest rs-etched mb-12 block opacity-50">Core Risk Vectors</span>

                                        <div className="flex flex-wrap justify-center gap-10 lg:gap-16 pt-4">
                                            <div className="flex flex-col items-center gap-6">
                                                <RSRadialMeter value={82} level="critical" label="IP_RISK" size={120} />
                                                <div className="text-center space-y-1">
                                                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-rs-signal opacity-80">CRITICAL_THREAT</span>
                                                    <p className="text-[10px] text-[var(--rs-text-tertiary)] max-w-[120px] leading-tight">Potential copyright infringement detected.</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-center gap-6">
                                                <RSRadialMeter value={24} level="safe" label="BRAND_SAFETY" size={120} />
                                                <div className="text-center space-y-1">
                                                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-rs-safe opacity-80">STABLE_SIGNAL</span>
                                                    <p className="text-[10px] text-[var(--rs-text-tertiary)] max-w-[120px] leading-tight">Within acceptable safety parameters.</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-center gap-6">
                                                <RSRadialMeter value={61} level="warning" label="PROVENANCE" size={120} />
                                                <div className="text-center space-y-1">
                                                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-rs-warning opacity-80">UNVERIFIED_SOURCE</span>
                                                    <p className="text-[10px] text-[var(--rs-text-tertiary)] max-w-[120px] leading-tight">Missing or incomplete metadata chain.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Risk Assessment */}
                                    <div className="bg-[var(--rs-bg-surface)] p-10 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] space-y-12">
                                        <div className="space-y-8">
                                            <span className="text-[10px] font-bold uppercase tracking-widest rs-etched block opacity-50">Composite Risk Analysis</span>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                                <RSRiskScore score={92} level="critical" trend="up" label="Global Threat" />
                                                <RSRiskScore score={12} level="safe" trend="stable" label="Safety Index" size="sm" />
                                            </div>
                                        </div>

                                        <div className="space-y-6 pt-10 border-t border-[var(--rs-border-primary)]/10">
                                            <span className="text-[10px] font-bold uppercase tracking-widest rs-etched block opacity-50">Instrumentation Progress</span>
                                            <RSProgressBar value={75} label="Analysis Completion" variant="signal" />
                                            <RSProgressBar label="Buffering Signal..." />
                                        </div>
                                    </div>

                                    {/* Data Stream */}
                                    <div className="flex flex-col gap-10">
                                        <div className="bg-[var(--rs-bg-surface)] p-8 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] border border-[var(--rs-border-primary)]/20">
                                            <span className="text-[10px] font-bold uppercase tracking-widest rs-etched block mb-8 opacity-50">Telemetry Pipeline</span>
                                            <div className="shadow-inner bg-black/5 p-4 rounded-3xl">
                                                <RSTelemetryStream />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="bg-[var(--rs-bg-surface)] p-6 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l1)]">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">Latency</span>
                                                    <span className="text-[10px] font-mono text-rs-signal">22ms</span>
                                                </div>
                                                <RSMeter value={22} level="safe" />
                                            </div>
                                            <div className="bg-[var(--rs-bg-surface)] p-6 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l1)]">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">Buffer</span>
                                                    <span className="text-[10px] font-mono text-rs-info">88%</span>
                                                </div>
                                                <RSMeter value={88} level="info" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 07.1 SCANNER ARCHITECTURE */}
                            <section>
                                <div className="flex items-center gap-6 mb-12">
                                    <span className="font-mono text-xs text-[#9A9691]">07.1</span>
                                    <h2 className="text-2xl font-black tracking-tight uppercase">Scanner Architecture</h2>
                                    <div className="h-[1px] bg-[#DBD7D0] flex-grow" />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    {/* Active Viewport */}
                                    <div className="space-y-6">
                                        <div className="bg-[#121212] border-[10px] border-[var(--rs-border-primary)] rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] relative overflow-hidden h-[450px] flex flex-col">
                                            <div className="absolute inset-0 rs-glass-analyzed z-20 pointer-events-none" />
                                            <div className="p-6 bg-rs-black border-b border-rs-gray-800 flex justify-between items-center z-10 relative">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-[#FF4F00] animate-pulse" />
                                                    <span className="text-[10px] font-mono text-[#FF4F00] font-bold tracking-widest uppercase">Scanner_Beam_Active</span>
                                                </div>
                                                <span className="text-[9px] font-mono text-white/30 uppercase italic">Ref: 00-1-A</span>
                                            </div>
                                            <div className="p-10 flex-1 flex flex-col justify-center relative z-10">
                                                <RSScanner
                                                    active={true}
                                                    status="scanning"
                                                    imageUrl="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Logic Engine */}
                                    <div className="space-y-6">
                                        <div className="bg-[var(--rs-bg-surface)] p-8 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] border border-[var(--rs-border-primary)]/20">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-sm font-bold uppercase tracking-widest">System Log Stream</h3>
                                                <RSButton size="sm" variant="ghost">Export_Raw</RSButton>
                                            </div>
                                            <RSSystemLog logs={[
                                                { id: 1, message: 'Initializing handshake...', status: 'done', timestamp: '00:01' },
                                                { id: 2, message: 'Acquiring signal...', status: 'done', timestamp: '00:04' },
                                                { id: 3, message: 'Analyzing spectrum...', status: 'active', timestamp: '00:12' },
                                                { id: 4, message: 'Awaiting tensor result...', status: 'pending' },
                                            ]} maxHeight="220px" />
                                        </div>

                                        <div className="bg-[var(--rs-bg-surface)] p-8 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] border border-[var(--rs-border-primary)]/20 flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-bold uppercase tracking-widest mb-1">Diagnostics</h3>
                                                <p className="text-xs text-[var(--rs-text-secondary)]">Verification Cycle 0.9.1</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <RSButton variant="secondary" size="sm">Recalibrate</RSButton>
                                                <RSButton variant="danger" size="sm">Panic</RSButton>
                                            </div>
                                        </div>
                                    </div>

                                    {/* External Integration */}
                                    <div className="lg:col-span-2">
                                        <div className="bg-[var(--rs-bg-surface)] p-4 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] border border-[var(--rs-border-primary)]/20">
                                            <div className="flex items-center gap-4 mb-4 pl-4 pt-4">
                                                <span className="text-[10px] font-bold uppercase tracking-widest rs-etched opacity-50">C2PA Verification Protocol</span>
                                            </div>
                                            <RSC2PAWidget className="h-64" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 08.1 STRUCTURAL DECK */}
                            <section>
                                <div className="flex items-center gap-6 mb-12">
                                    <span className="font-mono text-xs text-[#9A9691]">08.1</span>
                                    <h2 className="text-2xl font-black tracking-tight uppercase">Structural Deck</h2>
                                    <div className="h-[1px] bg-[#DBD7D0] flex-grow" />
                                </div>

                                <div className="space-y-12">
                                    {/* Component Panels */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <RSPanel
                                            title="Risk Analysis Panel"
                                            metadata={[{ label: 'ID', value: '44-X' }]}
                                            action={<RSRiskBadge level="critical" />}
                                        >
                                            <div className="flex items-center gap-10">
                                                <div className="text-5xl font-black tracking-tighter rs-etched">88%</div>
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex justify-between text-[10px] font-bold uppercase text-[#9A9691]">
                                                        <span>Likelihood</span>
                                                        <span className="text-[#FF4F00]">Critical</span>
                                                    </div>
                                                    <RSMeter value={88} level="critical" />
                                                </div>
                                            </div>
                                        </RSPanel>

                                        <RSCard
                                            header="Override Card"
                                            footer={<span className="text-[9px] font-mono text-[var(--rs-text-tertiary)]">Ref: SECURITY_MOD</span>}
                                            className="h-full flex flex-col justify-between"
                                        >
                                            <div className="space-y-4">
                                                <p className="rs-type-body text-sm text-[var(--rs-text-secondary)]">
                                                    Manual override requires higher clearance.
                                                </p>
                                                <RSButton size="sm" onClick={() => setShowModal(true)}>Open Secure Link</RSButton>
                                            </div>
                                        </RSCard>
                                    </div>

                                    {/* Data Tables & States */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <span className="text-[10px] font-bold uppercase tracking-widest rs-etched block opacity-50">Log Records (RSTable)</span>
                                            <RSTable
                                                columns={[{ key: 'id', header: 'ID' }, { key: 'status', header: 'Status' }, { key: 'time', header: 'Timestamp' }]}
                                                data={[
                                                    { id: 'TX-99', status: 'Active', time: '12:01' },
                                                    { id: 'TX-98', status: 'Cached', time: '11:58' },
                                                    { id: 'TX-97', status: 'Done', time: '11:55' }
                                                ]}
                                            />
                                        </div>
                                        <div className="space-y-6">
                                            <span className="text-[10px] font-bold uppercase tracking-widest rs-etched block opacity-50">Empty State Null-Pattern</span>
                                            <RSEmptyState
                                                title="No Evidence Archives"
                                                description="Please initiate a scan to populate this deck."
                                                className="h-[180px] bg-rs-white border-solid"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 09.1 INTERFACE UTILITIES */}
                            <section>
                                <div className="flex items-center gap-6 mb-12">
                                    <span className="font-mono text-xs text-[#9A9691]">09.1</span>
                                    <h2 className="text-2xl font-black tracking-tight uppercase">Interface Utilities</h2>
                                    <div className="h-[1px] bg-[#DBD7D0] flex-grow" />
                                </div>

                                <div className="bg-[var(--rs-bg-surface)] p-10 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] space-y-10">
                                    <div className="space-y-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest rs-etched block opacity-50">Navigation Bar Standard</span>
                                        <RSNavbar className="rounded-[var(--rs-radius-container)] border shadow-sm static transform-none">
                                            <RSBreadcrumb items={[{ label: 'Dashboard', href: '#' }, { label: 'Evidence', href: '#' }, { label: 'Case #9921' }]} />
                                        </RSNavbar>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                        <div className="lg:col-span-1">
                                            <span className="text-[10px] font-bold uppercase tracking-widest rs-etched block mb-4 opacity-50">Sidebar Variant</span>
                                            <RSSidebar className="h-64 w-full static transform-none rounded-[var(--rs-radius-container)] border shadow-sm overflow-hidden" />
                                        </div>
                                        <div className="lg:col-span-2 space-y-6">
                                            <span className="text-[10px] font-bold uppercase tracking-widest rs-etched block opacity-50">Functional Tabs</span>
                                            <RSTabs
                                                tabs={[{ id: 'view', label: 'Telemetry' }, { id: 'edit', label: 'Config' }, { id: 'history', label: 'History' }]}
                                                activeTab="view"
                                            />
                                            <div className="p-12 border border-dashed border-rs-gray-300 rounded-[var(--rs-radius-container)] bg-rs-gray-50/50 flex items-center justify-center text-xs text-rs-gray-400">
                                                Tab Content Viewport
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 10.1 SIGNAL FEEDBACK */}
                            <section className="mb-24">
                                <div className="flex items-center gap-6 mb-12">
                                    <span className="font-mono text-xs text-[#9A9691]">10.1</span>
                                    <h2 className="text-2xl font-black tracking-tight uppercase">Signal Feedback</h2>
                                    <div className="h-[1px] bg-[#DBD7D0] flex-grow" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                    {/* Callouts */}
                                    <div className="space-y-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest rs-etched mb-4 block opacity-50">Callout Messaging</span>
                                        <RSCallout variant="info" title="System Note">Protocol V3.0 active.</RSCallout>
                                        <RSCallout variant="warning" title="Signal Interference">Source unverified.</RSCallout>
                                        <RSCallout variant="success">Verification complete.</RSCallout>
                                        <RSCallout variant="danger" title="Breach Detected">Unauthorized access attempt.</RSCallout>
                                    </div>

                                    {/* Overlays / Tooltips */}
                                    <div className="space-y-6">
                                        <span className="text-[10px] font-bold uppercase tracking-widest rs-etched mb-4 block opacity-50">Visual Badges</span>
                                        <div className="flex flex-wrap gap-3">
                                            <RSRiskBadge level="critical" />
                                            <RSRiskBadge level="warning" />
                                            <RSRiskBadge level="safe" />
                                            <RSRiskBadge level="unknown" />
                                        </div>

                                        <span className="text-[10px] font-bold uppercase tracking-widest rs-etched mt-10 mb-4 block opacity-50">Ephemeral Status</span>
                                        <div className="relative h-28 bg-rs-gray-100 rounded-[var(--rs-radius-container)] border border-rs-gray-200 flex items-center justify-center overflow-hidden">
                                            <RSToastItem title="Handshake Successful" description="Secure link established." variant="success" className="absolute shadow-sm w-72" />
                                        </div>

                                        <div className="flex items-center justify-center gap-4 p-4 border border-rs-gray-200 rounded-[var(--rs-radius-container)] bg-white shadow-sm">
                                            <span className="text-sm font-medium">Diagnostic Hover:</span>
                                            <RSTooltip content="Bit-depth verification active." side="top" />
                                        </div>
                                    </div>

                                    {/* Identity */}
                                    <div className="space-y-6">
                                        <span className="text-[10px] font-bold uppercase tracking-widest rs-etched mb-4 block opacity-50">Operator Identity</span>
                                        <div className="flex gap-4">
                                            <RSAvatar initials="JD" status="online" size="lg" />
                                            <RSAvatar initials="AX" status="busy" size="lg" />
                                            <RSAvatar initials="--" status="offline" size="lg" />
                                        </div>

                                        <span className="text-[10px] font-bold uppercase tracking-widest rs-etched mt-10 mb-4 block opacity-50">Report Summary</span>
                                        <RSReportCard
                                            id="SCAN-AE0"
                                            filename="evidence_log_9.arc"
                                            date="2024-05-19"
                                            score={91}
                                            level="critical"
                                        />
                                    </div>
                                </div>
                            </section>

                            <RSModal isOpen={showModal} onClose={() => setShowModal(false)} title="Security Handshake Required">
                                <div className="space-y-6">
                                    <p className="rs-type-body text-[var(--rs-text-secondary)]">
                                        Please confirm your biometrics to initiate system override.
                                    </p>
                                    <div className="h-40 bg-[var(--rs-bg-well)] rounded-[var(--rs-radius-element)] border border-[var(--rs-border-primary)]/10 flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-2 border-[#FF4F00] rounded-full animate-ping" />
                                            <span className="rs-type-mono text-[10px] text-[#FF4F00] uppercase tracking-widest">Scanning_Identity...</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <RSButton variant="ghost" onClick={() => setShowModal(false)}>Terminate</RSButton>
                                        <RSButton onClick={() => setShowModal(false)}>Confirm Match</RSButton>
                                    </div>
                                </div>
                            </RSModal>
                        </div>
                    )}

                    {/* VIEW: MARKETING */}
                    {activeTab === 'marketing' && (
                        <div className="space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <section>
                                <div className="flex items-center gap-6 mb-12">
                                    <span className="font-mono text-xs text-[#9A9691]">08.0</span>
                                    <h2 className="text-2xl font-black tracking-tight uppercase">Marketing Patterns</h2>
                                    <div className="h-[1px] bg-[#DBD7D0] flex-grow" />
                                </div>

                                <div className="space-y-12">
                                    {/* Upgrade Modal Trigger */}
                                    <div className="bg-[var(--rs-bg-surface)] p-8 rounded-[var(--rs-radius-chassis)] border border-[var(--rs-border-primary)] shadow-[var(--rs-shadow-l1)]">
                                        <h3 className="text-lg font-bold text-[var(--rs-text-primary)] mb-4">Upgrade Logic</h3>
                                        <div className="flex items-center gap-4">
                                            <RSButton onClick={() => setShowUpgradeModal(true)}>Trigger Upgrade Modal</RSButton>
                                            <span className="text-sm text-[var(--rs-text-secondary)]">Test the conversion flow modal</span>
                                        </div>
                                    </div>

                                    {/* Free Forensic Report */}
                                    <div className="bg-[var(--rs-bg-surface)] p-8 rounded-[var(--rs-radius-chassis)] border border-[var(--rs-border-primary)] shadow-[var(--rs-shadow-l1)] overflow-hidden">
                                        <h3 className="text-lg font-bold text-[var(--rs-text-primary)] mb-8">Forensic Document</h3>
                                        <div className="scale-90 origin-top-left">
                                            <FreeForensicReport
                                                assetName="Test_Evidence_File_99.jpg"
                                                scanDate={new Date().toISOString()}
                                                riskProfile={{
                                                    composite_score: 88,
                                                    verdict: 'High Risk',
                                                    ip_report: { score: 92, teaser: 'Copyrighted material detected in visual verify.', reasoning: 'Detected known protected IP assets.' },
                                                    provenance_report: { score: 45, teaser: 'Source indicators are ambiguous.', reasoning: 'Metadata chain is incomplete.' },
                                                    safety_report: { score: 12, teaser: 'Clean', reasoning: 'No safety violations found.' },
                                                    c2pa_report: { status: 'missing' },
                                                    chief_officer_strategy: "Manual review recommended. Asset lacks verifiable provenance chain."
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* VIEW: PHYSICS */}
                    {activeTab === 'physics' && (
                        <div className="space-y-24 animate-in fade-in duration-500">
                            <section>
                                <div className="flex items-center gap-6 mb-12">
                                    <span className="font-mono text-xs text-[#9A9691]">07.0</span>
                                    <h2 className="text-2xl font-black tracking-tight uppercase">Elevation Physics (Z-Logic)</h2>
                                    <div className="h-[1px] bg-[#DBD7D0] flex-grow" />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                    <div className="space-y-4">
                                        <div className="aspect-[4/5] md:aspect-square w-full bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)] rounded-[var(--rs-radius-container)] flex items-center justify-center">
                                            <span className="text-[10px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest">L0_Base</span>
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-tighter text-[var(--rs-text-secondary)]">Chassis Surface</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="aspect-[4/5] md:aspect-square w-full bg-[var(--rs-bg-well)] rounded-[var(--rs-radius-container)] shadow-[var(--rs-shadow-l1)] flex items-center justify-center">
                                            <span className="text-[10px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest">L1_Well</span>
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-tighter text-[var(--rs-text-secondary)]">Recessed Input</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="aspect-[4/5] md:aspect-square w-full bg-[var(--rs-bg-surface)] rounded-[var(--rs-radius-container)] shadow-[var(--rs-shadow-l2)] flex items-center justify-center border border-white/5">
                                            <span className="text-[10px] font-mono text-[var(--rs-text-secondary)] uppercase tracking-widest text-[#FF4F00]">L2_Panel</span>
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-tighter text-[var(--rs-text-secondary)]">Floating Shield</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="aspect-[4/5] md:aspect-square w-full bg-[var(--rs-bg-surface)] rounded-[var(--rs-radius-container)] shadow-[var(--rs-shadow-l3)] flex items-center justify-center border-t border-l border-white/10">
                                            <span className="text-[10px] font-black text-[var(--rs-text-primary)] uppercase tracking-tighter">L3_Action</span>
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-tighter text-[var(--rs-text-secondary)]">Primary Control</p>
                                    </div>
                                </div>
                            </section>

                            {/* 07.1 SUBSTRATE SYSTEM */}
                            <section>
                                <div className="flex items-center gap-6 mb-12">
                                    <span className="font-mono text-xs text-[#9A9691]">07.1</span>
                                    <h2 className="text-2xl font-black tracking-tight uppercase">Substrate System (RSBackground)</h2>
                                    <div className="h-[1px] bg-[#DBD7D0] flex-grow" />
                                </div>

                                <div className="grid grid-cols-1 gap-12">
                                    {/* Standard Chassis */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--rs-text-secondary)]">01. Standard_Chassis</h3>
                                            <span className="px-2 py-0.5 bg-[var(--rs-bg-element)] border border-[var(--rs-border-primary)] text-[8px] font-mono text-[var(--rs-text-tertiary)] rounded-sm">BASE_FINISH</span>
                                        </div>
                                        <RSBackground variant="standard" className="aspect-[4/1] md:aspect-[6/1] rounded-[var(--rs-radius-container)] border border-[var(--rs-border-primary)]">
                                            <div className="flex items-center justify-center h-full w-full">
                                                <span className="text-[10px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-[0.3em]">Pure_Structural_Polymer</span>
                                            </div>
                                        </RSBackground>
                                    </div>

                                    {/* Microdot Grid */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--rs-text-secondary)]">02. Precision_Grid</h3>
                                            <span className="px-2 py-0.5 bg-[var(--rs-bg-element)] border border-[var(--rs-border-primary)] text-[8px] font-mono text-[var(--rs-text-tertiary)] rounded-sm">DASH_LOGIC</span>
                                        </div>
                                        <RSBackground variant="microdot" className="aspect-[4/1] md:aspect-[6/1] rounded-[var(--rs-radius-container)] border border-[var(--rs-border-primary)]">
                                            <div className="flex items-center justify-center h-full w-full">
                                                <span className="text-[10px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-[0.3em]">Precision_Reference_24PX</span>
                                            </div>
                                        </RSBackground>
                                    </div>

                                    {/* Technical Drafting */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--rs-text-secondary)]">03. Engineering_Spec</h3>
                                            <span className="px-2 py-0.5 bg-[var(--rs-bg-element)] border border-[var(--rs-border-primary)] text-[8px] font-mono text-[var(--rs-text-tertiary)] rounded-sm">FORENSIC_DRAFT</span>
                                        </div>
                                        <RSBackground variant="technical" className="aspect-[4/1] md:aspect-[6/1] rounded-[var(--rs-radius-container)] border border-[var(--rs-border-primary)] overflow-hidden">
                                            <div className="flex items-center justify-center h-full w-full">
                                                <span className="text-[10px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-[0.3em] relative z-20 bg-[var(--rs-bg-surface)] px-4">Drafting_Substrate_V3</span>
                                            </div>
                                        </RSBackground>
                                    </div>

                                    {/* Forensic Glass */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--rs-text-secondary)]">04. Forensic_Glass</h3>
                                            <span className="px-2 py-0.5 bg-[var(--rs-bg-element)] border border-[var(--rs-border-primary)] text-[8px] font-mono text-[var(--rs-text-tertiary)] rounded-sm">OPTIC_FILTER</span>
                                        </div>
                                        <div className="relative aspect-[4/1] md:aspect-[6/1] rounded-[var(--rs-radius-container)] border border-[var(--rs-border-primary)] flex items-center justify-center overflow-hidden bg-white/5">
                                            <RSBackground variant="microdot" className="absolute inset-0" />
                                            <RSBackground variant="glass" className="absolute inset-0">
                                                <div className="flex items-center justify-center h-full w-full">
                                                    <span className="text-[10px] font-mono text-white uppercase tracking-[0.3em]">Filtered_Light_Transmission</span>
                                                </div>
                                            </RSBackground>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                </main>

                <footer className="mt-40 pt-10 border-t border-[#DBD7D0] flex justify-between items-center opacity-30 grayscale hover:grayscale-0 transition-all">
                    <div className="flex items-center gap-4">
                        <Shield size={20} />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Ref. Scientific © 2024</span>
                    </div>
                    <div className="flex gap-8 font-mono text-[9px] font-bold uppercase tracking-widest">
                        <span className="text-[#9A9691]">MOMA_SPEC_V3</span>
                    </div>
                </footer>
            </div>

            {/* Modals outside main flow */}
            {showUpgradeModal && <UpgradeModal scanId="test-scan-id" onClose={() => setShowUpgradeModal(false)} />}

            <style jsx global>{`
             @keyframes scan {
             0% { top: 0; opacity: 0; }
             10% { opacity: 1; }
             90% { opacity: 1; }
             100% { top: 100%; opacity: 0; }
             }
             .animate-scan {
             animation: scan 3s ease-in-out infinite;
             }
         `}</style>
        </div>
    );
}
