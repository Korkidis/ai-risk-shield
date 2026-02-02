"use client";

import { useState, useEffect } from 'react';
import {
    Shield,
    Layers,
    Cpu,
    Move,
    Sun,
    Moon,
    Megaphone,
    Aperture,
    Grid as GridIcon,
    AlertTriangle,
    FlaskConical
} from 'lucide-react';

import { RSChassisCard } from '@/components/rs/RSChassisCard';
import { RSScannerViewport } from '@/components/rs/RSScannerViewport';
import { RSMetricCard } from '@/components/rs/RSMetricCard';
import { RSSectionHeader } from '@/components/rs/RSSectionHeader';

import { RSButton } from '@/components/rs/RSButton';
import { RSRiskBadge } from '@/components/rs/RSRiskBadge';
import { RSKnob } from '@/components/rs/RSKnob';
import { RSPanel } from '@/components/rs/RSPanel';
import { RSMeter } from '@/components/rs/RSMeter';
import { RSScanner } from '@/components/rs/RSScanner';
import { RSSystemLog } from '@/components/rs/RSSystemLog';
import { RSAnalogNeedle } from '@/components/rs/RSAnalogNeedle';
import { RSLED } from '@/components/rs/RSLED';
import { RSLever } from '@/components/rs/RSLever';
import { RSKey } from '@/components/rs/RSKey';
import { RSTelemetryStream } from '@/components/rs/RSTelemetryStream';
import { ProvenanceTelemetryStream } from '@/components/rs/ProvenanceTelemetryStream';
import { RSTelemetryPanel } from '@/components/rs/RSTelemetryPanel';
import { RSCard } from '@/components/rs/RSCard';
import { RSModal } from '@/components/rs/RSModal';
import { cn } from '@/lib/utils';
import { FreeForensicReport } from '@/components/landing/FreeForensicReport';
import { RSAvatar } from '@/components/rs/RSAvatar';
import { RSReportCard } from '@/components/rs/RSReportCard';

// Input Controls
import { RSCheckbox } from '@/components/rs/RSCheckbox';
import { RSSelect } from '@/components/rs/RSSelect';
import { RSTextarea } from '@/components/rs/RSTextarea';
import { RSFileUpload } from '@/components/rs/RSFileUpload';
import { RSUploadZone } from '@/components/rs/RSUploadZone';
import { RSBackground } from '@/components/rs/RSBackground';



// Data Visualization
import { RSRadialMeter } from '@/components/rs/RSRadialMeter';
import { RSRiskScore } from '@/components/rs/RSRiskScore';
import { RSC2PAWidget } from '@/components/rs/RSC2PAWidget';

// Structural Elements
import { RSTable } from '@/components/rs/RSTable';
import { RSEmptyState } from '@/components/rs/RSEmptyState';
import { RSBreadcrumb } from '@/components/rs/RSBreadcrumb';
import { RSTabs } from '@/components/rs/RSTabs';
import { RSNavbar } from '@/components/rs/RSNavbar';
import { RSSidebar } from '@/components/rs/RSSidebar';

// Feedback & Utilities
import { RSCallout } from '@/components/rs/RSCallout';
import { RSToastItem } from '@/components/rs/RSToast';
import { RSTooltip } from '@/components/rs/RSTooltip';
import { UpgradeModal } from '@/components/landing/UpgradeModal';


export default function DesignLabPage() {
    const [activeTab, setActiveTab] = useState<'palette' | 'components' | 'physics' | 'marketing' | 'substrates' | 'testing'>('components');

    // Braun Mechanical Deck States
    const [masterLever, setMasterLever] = useState(true);
    const [apertureLever, setApertureLever] = useState(false);
    const [activeKey, setActiveKey] = useState<'scan' | 'grid' | 'alert'>('scan');

    // System Data Generation Logic (Simplified for lab)
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
        <div className="min-h-screen bg-[var(--rs-bg-surface)] text-[var(--rs-text-primary)] font-sans selection:bg-[var(--rs-signal)] selection:text-white relative overflow-x-hidden transition-colors duration-500">

            {/* Main Container */}
            <div className="max-w-7xl mx-auto px-12 py-12 relative z-10">

                {/* --- HEADER SYSTEM --- */}
                <header className="mb-12 border-b border-[var(--rs-border-primary)] pb-8">
                    <div className="flex justify-between items-end">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-rs-signal rounded-[var(--rs-radius-element)] shadow-[var(--rs-shadow-l2)] flex items-center justify-center">
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
                                <TabButton id="physics" label="Physics" icon={Move} />
                                <TabButton id="marketing" label="Marketing" icon={Megaphone} />
                                <TabButton id="substrates" label="Substrates" icon={GridIcon} />
                                <a
                                    href="/dashboard/design-lab/component-testing"
                                    className="flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-[var(--rs-radius-element)] text-[var(--rs-text-secondary)] hover:text-[var(--rs-text-primary)] hover:bg-[var(--rs-bg-element)]/50 ml-2 border border-[var(--rs-border-primary)] border-dashed"
                                >
                                    <FlaskConical size={14} />
                                    LAB_TESTING
                                </a>
                            </div>
                        </div>
                    </div>
                </header>

                {/* --- CONTENT AREA --- */}
                <main className="min-h-[600px]">

                    {/* VIEW: SUBSTRATES */}
                    {activeTab === 'substrates' && (
                        <div className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* 01. RSBackground System */}
                            <section>
                                <RSSectionHeader sectionNumber="01.0" title="Unified Substrate System (RSBackground)" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                    <div className="h-64 relative rounded-[var(--rs-radius-container)] overflow-hidden border border-[var(--rs-border-primary)] shadow-sm">
                                        <RSBackground variant="standard" className="absolute inset-0" />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="rs-etched bg-white/50 px-2 py-1 backdrop-blur-sm rounded">Variant: Standard</span>
                                        </div>
                                    </div>


                                    <div className="h-64 relative rounded-[var(--rs-radius-container)] overflow-hidden border border-[var(--rs-border-primary)] shadow-sm bg-[url('/img/demo-bg.jpg')] bg-cover">
                                        <RSBackground variant="glass" className="absolute inset-0" />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="rs-etched text-white bg-black/50 px-2 py-1 backdrop-blur-sm rounded">Variant: Glass</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 02. Technical Drafting Substrate */}
                            <section>
                                <RSSectionHeader sectionNumber="02.0" title="Drafting Substrate (MOMA_SPEC)" />
                                <div className="h-[500px] relative rounded-[var(--rs-radius-container)] overflow-hidden border border-[var(--rs-border-primary)] shadow-inner mt-8">
                                    <RSBackground variant="technical" className="h-full w-full">
                                        <div className="h-full w-full flex items-center justify-center">
                                            <div className="p-8 border border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)] shadow-[var(--rs-shadow-l2)]">
                                                <span className="rs-etched">Content Layer // Z-Index: 10</span>
                                            </div>
                                        </div>
                                    </RSBackground>
                                </div>
                            </section>

                            {/* 03. CSS Textures & Utilities */}
                            <section>
                                <RSSectionHeader sectionNumber="03.0" title="CSS Textures & Utilities" />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">

                                    {/* Texture Molded */}
                                    <div className="relative h-48 bg-[var(--rs-gray-100)] rounded-xl overflow-hidden shadow-inner border border-white/20">
                                        <div className="absolute inset-0 rs-texture-molded opacity-50" />
                                        <div className="absolute bottom-4 left-4 rs-etched text-[10px]">.rs-texture-molded</div>
                                    </div>

                                    {/* Texture Noise */}
                                    <div className="relative h-48 bg-[var(--rs-gray-800)] rounded-xl overflow-hidden shadow-inner border border-white/10">
                                        <div className="absolute inset-0 rs-texture-noise opacity-20" />
                                        <div className="absolute bottom-4 left-4 rs-etched text-[10px] text-white">.rs-texture-noise</div>
                                    </div>

                                    {/* CRT Overlay */}
                                    <div className="relative h-48 bg-black rounded-xl overflow-hidden shadow-inner border border-white/10">
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-900/20" />
                                        <div className="absolute inset-0 rs-crt-overlay opacity-50" />
                                        <div className="absolute bottom-4 left-4 rs-etched text-[10px] text-[var(--rs-signal)]">.rs-crt-overlay</div>
                                    </div>

                                    {/* Analyzed Glass */}
                                    <div className="relative h-48 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop')] bg-cover rounded-xl overflow-hidden shadow-xl">
                                        <div className="absolute inset-0 rs-glass-analyzed" />
                                        <div className="absolute bottom-4 left-4 rs-etched text-[10px] text-white">.rs-glass-analyzed</div>
                                    </div>



                                </div>
                            </section>

                            {/* 07.1 SUBSTRATE SYSTEM */}
                            <section>
                                <RSSectionHeader sectionNumber="07.1" title="Substrate System (RSBackground)" />

                                <div className="grid grid-cols-1 gap-12">
                                    {/* Standard Chassis (Molded Texture) */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--rs-text-secondary)]">01. Molded_Chassis</h3>
                                            <span className="px-2 py-0.5 bg-[var(--rs-bg-element)] border border-[var(--rs-border-primary)] text-[8px] font-mono text-[var(--rs-text-tertiary)] rounded-sm">ABS_FINISH</span>
                                        </div>
                                        <div className="relative aspect-[4/1] md:aspect-[6/1] rounded-[var(--rs-radius-container)] border border-[var(--rs-border-primary)] overflow-hidden">
                                            {/* Parting Lines */}
                                            <div className="absolute inset-0 border-t border-l border-white/20 z-20 pointer-events-none" />
                                            <div className="absolute inset-0 border-b border-r border-black/10 z-20 pointer-events-none" />

                                            <RSBackground variant="standard" className="h-full w-full">
                                                <div className="flex items-center justify-center h-full w-full">
                                                    <span className="text-[10px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-[0.3em]">Pure_Structural_Polymer</span>
                                                </div>
                                            </RSBackground>
                                        </div>
                                    </div>

                                    {/* Powered Well Substrate */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--rs-text-secondary)]">02. Powered_Well</h3>
                                            <span className="px-2 py-0.5 bg-[var(--rs-bg-element)] border border-[var(--rs-border-primary)] text-[8px] font-mono text-[var(--rs-text-tertiary)] rounded-sm">ACTIVE_WELL</span>
                                        </div>
                                        <div className="aspect-[4/1] md:aspect-[6/1] rounded-[var(--rs-radius-container)] border border-[var(--rs-border-primary)] bg-[var(--rs-bg-well)] shadow-[var(--rs-shadow-l1)] relative overflow-hidden flex items-center justify-center">
                                            <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />
                                            <div className="flex items-center gap-6">
                                                <div className="w-2 h-2 rounded-full bg-[var(--rs-signal)] shadow-[0_0_10px_var(--rs-signal)] animate-pulse" />
                                                <span className="text-[10px] font-mono text-[var(--rs-signal)] uppercase tracking-[0.3em] font-bold">SYSTEM_ENERGIZED</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Forensic Glass (Composite) */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--rs-text-secondary)]">03. Composite_Optic</h3>
                                            <span className="px-2 py-0.5 bg-[var(--rs-bg-element)] border border-[var(--rs-border-primary)] text-[8px] font-mono text-[var(--rs-text-tertiary)] rounded-sm">OPTIC_STACK</span>
                                        </div>
                                        <div className="relative aspect-[4/1] md:aspect-[6/1] rounded-[var(--rs-radius-container)] border border-[var(--rs-border-primary)] flex items-center justify-center overflow-hidden">
                                            <div className="absolute inset-0 border-t border-l border-white/20 z-30 pointer-events-none" />
                                            <div className="absolute inset-0 border-b border-r border-black/10 z-30 pointer-events-none" />


                                            <RSBackground variant="glass" className="absolute inset-0">
                                                <div className="flex items-center justify-center h-full w-full">
                                                    <span className="text-[10px] font-mono text-white/80 uppercase tracking-[0.3em] z-20">Filtered_Drafting_Substrate</span>
                                                </div>
                                            </RSBackground>
                                        </div>
                                    </div>


                                </div>
                            </section>

                        </div>
                    )}
                    {activeTab === 'palette' && (
                        <div className="space-y-24 animate-in fade-in duration-500">
                            {/* 01.0 PALETTE */}
                            <section>
                                <RSSectionHeader sectionNumber="01.0" title="Industrial Palette" />

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
                                <RSSectionHeader sectionNumber="02.0" title="Cinematic Typography" />
                                <div className="space-y-12 pl-10 border-l border-rs-signal">
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
                                            <span className="text-rs-signal">LONGER</span><br />
                                            <span className="text-rs-signal">HUMAN.</span>
                                        </h1>
                                        <p className="font-mono text-[10px] text-[var(--rs-text-secondary)] uppercase">Display / Headline (Tracking -0.04em)</p>
                                    </div>

                                    {/* Type Spec List */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-rs-border-primary pt-12">
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
                            {/* 04. Colors */}
                            <section>
                                <RSSectionHeader sectionNumber="04.0" title="System Colors (Tailwind)" />
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
                                    {[
                                        'bg-rs-white', 'bg-rs-gray-50', 'bg-rs-gray-100', 'bg-rs-gray-200', 'bg-rs-gray-300',
                                        'bg-rs-gray-400', 'bg-rs-gray-500', 'bg-rs-gray-600', 'bg-rs-gray-700', 'bg-rs-gray-800', 'bg-rs-gray-900',
                                        'bg-rs-signal', 'bg-rs-safe', 'bg-rs-info', 'bg-rs-indicator', 'bg-rs-function'
                                    ].map(bgClass => (
                                        <div key={bgClass} className="space-y-2">
                                            <div className={`h-16 w-full ${bgClass} rounded-lg shadow-sm border border-black/5`}></div>
                                            <div className="text-[10px] font-mono opacity-50">{bgClass.replace('bg-', '')}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {/* VIEW: COMPONENTS */}
                    {activeTab === 'components' && (
                        <div className="space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* 04.1 CONTROL INPUTS */}
                            <section>
                                <RSSectionHeader sectionNumber="04.1" title="Control Inputs" />

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                    {/* Binary Controls */}
                                    <div className="bg-[var(--rs-bg-surface)] p-8 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] space-y-8">
                                        <div className="flex items-center gap-2 mb-8 opacity-40">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] rs-etched">BINARY STATES</span>
                                        </div>
                                        <div className="space-y-6">
                                            <RSCheckbox label="Enable Safe Mode" checked={true} />
                                            <RSCheckbox label="Allow External Signals" checked={false} />
                                            <div className="flex items-center justify-between pt-2">
                                                <span className="text-sm font-medium text-[var(--rs-text-primary)]">System Power</span>
                                                <RSLever orientation="horizontal" checked={true} className="!gap-0" />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-[var(--rs-text-primary)]">Silent Mode</span>
                                                <RSLever orientation="horizontal" checked={false} className="!gap-0" />
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
                                    <RSChassisCard className="p-8 space-y-8">
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
                                    </RSChassisCard>
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
                                <RSSectionHeader sectionNumber="05.1" title="Analog Instruments" />

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
                                        <div className="flex flex-nowrap gap-10 items-center justify-start overflow-x-auto pb-4 scrollbar-hide">
                                            <RSAnalogNeedle value={0} label="IP Risk" powered={false} size={140} />
                                            <RSAnalogNeedle value={50} label="Brand Safety" isScanning={true} size={140} />
                                            <RSAnalogNeedle value={92} label="Provenance" level="critical" size={140} />
                                        </div>
                                        <p className="text-[9px] text-[var(--rs-text-tertiary)] italic mt-8 opacity-60">
                                            Real-time analog feedback monitoring core bias and signal variance.
                                        </p>
                                    </div>

                                    {/* Status Indicator Deck */}
                                    <div className="lg:col-span-1 bg-[var(--rs-bg-surface)] p-10 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] border border-[var(--rs-border-primary)]/20 relative overflow-hidden flex flex-col">
                                        <div className="absolute top-4 right-4 text-[10px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest opacity-40">
                                            Indicator_Panel_V4
                                        </div>
                                        <div className="mb-8">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] rs-etched mb-6 block opacity-50">Master Warning Deck</span>
                                            <div className="grid grid-cols-2 gap-y-5 gap-x-8">
                                                <RSLED level="safe" label="System Power" labelPosition="right" />
                                                <RSLED level="active" label="Logic Processor" labelPosition="right" isBlinking={true} />
                                                <RSLED level="info" label="Network Bus" labelPosition="right" isBlinking={true} />
                                                <RSLED level="warning" label="Thermal Fault" labelPosition="right" />
                                                <RSLED level="critical" label="Structural Breach" labelPosition="right" isBlinking={true} />
                                                <RSLED level="off" label="Spare Port / 01" labelPosition="right" />
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-6 border-t border-[var(--rs-border-primary)]/10">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <RSLED level="safe" size="xs" isBlinking={true} />
                                                    <span className="text-[9px] font-mono text-[var(--rs-text-secondary)] uppercase tracking-widest">Telemetry Stream: ACTIVE</span>
                                                </div>
                                                <div className="flex gap-1.5">
                                                    <RSLED level="off" size="xs" />
                                                    <RSLED level="off" size="xs" />
                                                    <RSLED level="off" size="xs" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Manual Override Deck (Knobs) */}
                                    <div className="lg:col-span-1 bg-[var(--rs-bg-surface)] p-10 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] border border-[var(--rs-border-primary)]/20 relative overflow-hidden">
                                        <div className="absolute top-4 right-4 text-[10px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest opacity-40">
                                            Manual_Override_Deck
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest rs-etched mb-4 block opacity-50">Control Surface</span>
                                        <div className="flex justify-center mt-6">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full items-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <RSKnob value={0} size={80} />
                                                    <div className="flex items-center gap-2">
                                                        <RSLED level="off" size="xs" />
                                                        <span className="text-[10px] font-bold text-[var(--rs-text-secondary)] uppercase tracking-widest">Sensitivity</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center gap-4">
                                                    <RSKnob value={42} size={80} />
                                                    <div className="flex items-center gap-2">
                                                        <RSLED level="safe" size="xs" />
                                                        <span className="text-[10px] font-bold text-[var(--rs-text-secondary)] uppercase tracking-widest">Depth</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center gap-4">
                                                    <RSKnob value={88} size={80} />
                                                    <div className="flex items-center gap-2">
                                                        <RSLED level="active" size="xs" isBlinking={true} />
                                                        <span className="text-[10px] font-bold text-[var(--rs-text-secondary)] uppercase tracking-widest">Threshold</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Braun Mechanical Interface Deck */}
                                    <div className="lg:col-span-1 bg-[var(--rs-bg-surface)] p-10 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] border border-[var(--rs-border-primary)]/20 relative overflow-hidden">
                                        <div className="absolute top-4 right-4 text-[10px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest opacity-40">
                                            Braun_Mechanical_Deck
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest rs-etched mb-4 block opacity-50">Mechanical Interface</span>
                                        <div className="flex flex-col gap-10 mt-8">
                                            {/* Lever Row */}
                                            <div className="flex gap-12 items-center justify-center border-b border-[var(--rs-border-primary)]/5 pb-8">
                                                <RSLever
                                                    label="MASTER"
                                                    orientation="horizontal"
                                                    checked={masterLever}
                                                    onCheckedChange={setMasterLever}
                                                />
                                                <RSLever
                                                    label="APERTURE"
                                                    orientation="horizontal"
                                                    checked={apertureLever}
                                                    onCheckedChange={setApertureLever}
                                                />
                                            </div>

                                            {/* Key Array */}
                                            <div className="flex gap-6 items-center justify-center">
                                                <RSKey
                                                    label="Scan"
                                                    active={activeKey === 'scan'}
                                                    onClick={() => setActiveKey('scan')}
                                                    icon={Aperture}
                                                />
                                                <RSKey
                                                    label="Grid"
                                                    active={activeKey === 'grid'}
                                                    onClick={() => setActiveKey('grid')}
                                                    icon={GridIcon}
                                                    color="#00FF94"
                                                />
                                                <RSKey
                                                    label="Alert"
                                                    active={activeKey === 'alert'}
                                                    onClick={() => setActiveKey('alert')}
                                                    icon={AlertTriangle}
                                                    color="#3B82F6"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 06.1 ANALYTICAL MONITORING */}
                            <section>
                                <RSSectionHeader sectionNumber="06.1" title="Analytical Monitoring" />

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-12">
                                    {/* COMPOSITE RISK ANALYSIS (Unified View) */}
                                    <div className="lg:col-span-7 bg-[var(--rs-bg-surface)] p-10 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] border border-[var(--rs-border-primary)]/20 relative overflow-hidden flex flex-col">
                                        <div className="absolute top-4 right-4 text-[10px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest opacity-40">
                                            Predictive_Analysis_Deck
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest rs-etched mb-10 block opacity-50">Composite Risk Analysis</span>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mb-16">
                                            <RSRiskScore score={92} level="critical" trend="up" label="Global Threat" />
                                            <RSRiskScore score={12} level="safe" trend="stable" label="Safety Index" size="sm" />
                                        </div>

                                        <div className="mt-auto pt-10 border-t border-[var(--rs-border-primary)]/10">
                                            <div className="flex flex-wrap items-center justify-between gap-6">
                                                <div className="flex flex-col items-center gap-4 flex-1 min-w-[120px]">
                                                    <RSRadialMeter value={82} level="critical" label="IP_RISK" size={100} />
                                                    <div className="text-center">
                                                        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-rs-signal opacity-80">CRITICAL_THREAT</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center gap-4 flex-1 min-w-[120px]">
                                                    <RSRadialMeter value={24} level="safe" label="BRAND_SAFETY" size={100} />
                                                    <div className="text-center">
                                                        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-rs-safe opacity-80">STABLE_SIGNAL</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center gap-4 flex-1 min-w-[120px]">
                                                    <RSRadialMeter value={61} level="warning" label="PROVENANCE" size={100} />
                                                    <div className="text-center">
                                                        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-rs-warning opacity-80">UNVERIFIED</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Telemetry Pipeline (Relocated Right) */}
                                    <div className="lg:col-span-5 flex flex-col gap-10">
                                        <div className="bg-[var(--rs-bg-surface)] p-8 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] border border-[var(--rs-border-primary)]/20 flex-1 flex flex-col">
                                            <div className="flex justify-between items-center mb-8">
                                                <span className="text-[10px] font-bold uppercase tracking-widest rs-etched opacity-50">Telemetry Pipeline</span>
                                                <div className="flex items-center gap-2">
                                                    <RSLED level="safe" size="xs" isBlinking={true} />
                                                    <span className="text-[8px] font-mono text-[var(--rs-text-secondary)] uppercase">Live</span>
                                                </div>
                                            </div>
                                            <div className="shadow-inner bg-black/5 p-4 rounded-3xl flex-1 flex items-center justify-center">
                                                <RSTelemetryStream />
                                            </div>

                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="bg-[var(--rs-bg-surface)] p-6 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l1)]">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Latency</span>
                                                    <span className="text-[10px] font-mono text-rs-signal">22ms</span>
                                                </div>
                                                <RSMeter value={22} level="safe" />
                                            </div>
                                            <div className="bg-[var(--rs-bg-surface)] p-6 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l1)]">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Buffer</span>
                                                    <span className="text-[10px] font-mono text-rs-info">88%</span>
                                                </div>
                                                <RSMeter value={88} level="info" />
                                            </div>
                                            <RSMetricCard label="Standardized Latency" value={22} unit="ms" level="safe" />
                                            <RSMetricCard label="Standardized Buffer" value={88} unit="%" level="info" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 07.1 SCANNER ARCHITECTURE */}
                            <section>
                                <RSSectionHeader sectionNumber="07.1" title="Scanner Architecture" />

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    {/* Active Viewport */}
                                    <div className="space-y-6">
                                        <div className="bg-rs-bg-surface border-[10px] border-[var(--rs-border-primary)] rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] relative overflow-hidden h-[450px] flex flex-col">
                                            <div className="absolute inset-0 rs-glass-analyzed z-20 pointer-events-none" />
                                            <div className="p-6 bg-rs-black border-b border-rs-gray-800 flex justify-between items-center z-10 relative">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-rs-signal animate-pulse" />
                                                    <span className="text-[10px] font-mono text-rs-signal font-bold tracking-widest uppercase">Scanner_Beam_Active</span>
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
                                        {/* Standardized Component Verification */}
                                        <div className="opacity-50 hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] font-bold uppercase tracking-widest rs-etched mb-2 block">Standardized Component Verification</span>
                                            <RSScannerViewport />
                                        </div>
                                    </div>

                                    {/* FREEMIUM SCANNER PIPELINE (States) */}
                                    <div className="space-y-6">
                                        {/* STATE 1: READY */}
                                        <RSChassisCard className="p-8 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] border border-[var(--rs-border-primary)]/20">
                                            <div className="flex items-center justify-between mb-8">
                                                <span className="text-[10px] font-bold uppercase tracking-widest rs-etched opacity-50">State 01: READY_FOR_INPUT</span>
                                            </div>
                                            <div className="max-w-sm mx-auto">
                                                <div className="bg-black p-4 rounded-3xl shadow-inner relative overflow-hidden h-[240px] flex flex-col items-center justify-center">
                                                    <div className="relative mb-6">
                                                        <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-sm animate-pulse">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M12 17V3" /><path d="m6 9 6-6 6 6" /><path d="M5 21h14" /></svg>
                                                        </div>
                                                        <div className="absolute inset-0 animate-spin-slow">
                                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-1 h-1 bg-[var(--rs-signal)] rounded-full shadow-[0_0_8px_var(--rs-signal)]" />
                                                        </div>
                                                    </div>
                                                    <span className="rs-type-mono text-[8px] text-[var(--rs-signal)] tracking-[0.3em] font-bold uppercase opacity-80">UPLOAD_ASSET</span>
                                                </div>
                                            </div>
                                        </RSChassisCard>

                                        {/* STATE 2: SCANNING */}
                                        <div className="bg-[var(--rs-bg-surface)] p-8 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] border border-[var(--rs-border-primary)]/20">
                                            <div className="flex items-center justify-between mb-8">
                                                <span className="text-[10px] font-bold uppercase tracking-widest rs-etched opacity-50">State 02: SYSTEM_LOG_SCANNING</span>
                                            </div>
                                            <div className="max-w-sm mx-auto">
                                                <div className="bg-black p-6 rounded-3xl shadow-inner h-[240px] flex flex-col justify-center">
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between text-[7px] font-mono text-white/40 uppercase mb-1">
                                                            <span>Acquisition_Pulse</span>
                                                            <span className="text-[var(--rs-signal)]">84%</span>
                                                        </div>
                                                        <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
                                                            <div className="h-full bg-[var(--rs-signal)] shadow-[0_0_10px_var(--rs-signal)]" style={{ width: '84%' }} />
                                                        </div>
                                                        <RSSystemLog logs={[
                                                            { id: 1, message: 'Spectrum extraction...', status: 'done', timestamp: '0.2s' },
                                                            { id: 2, message: 'Heuristic alignment...', status: 'active', timestamp: '0.8s' },
                                                            { id: 3, message: 'Dossier compilation...', status: 'pending' },
                                                        ]} maxHeight="80px" className="opacity-80" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* STATE 3: RESULTS */}
                                        <div className="bg-[var(--rs-bg-surface)] p-8 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] border border-[var(--rs-border-primary)]/20">
                                            <div className="flex items-center justify-between mb-8">
                                            </div>
                                        </div>

                                        {/* External Integration (Full Width in Grid) */}

                                        {/* External Integration (Full Width in Grid) */}
                                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-4">
                                                <span className="text-[10px] font-bold uppercase tracking-widest rs-etched opacity-50">Standard Verified</span>
                                                <RSC2PAWidget className="h-[320px]" />
                                            </div>
                                            <div className="space-y-4">
                                                <span className="text-[10px] font-bold uppercase tracking-widest rs-etched opacity-50">Deficiency Overlay (Preserved)</span>
                                                <RSC2PAWidget className="h-[320px]" status="missing" showOverlay={true} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 08.1 STRUCTURAL DECK */}
                            <section>
                                <RSSectionHeader sectionNumber="08.1" title="Structural Deck" />

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
                                                    <div className="flex justify-between text-[10px] font-bold uppercase text-rs-text-tertiary">
                                                        <span>Likelihood</span>
                                                        <span className="text-rs-signal">Critical</span>
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
                                <RSSectionHeader sectionNumber="09.1" title="Interface Utilities" />

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
                                <RSSectionHeader sectionNumber="10.1" title="Signal Feedback" />

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

                            {/* 11.1 PROVENANCE STATES */}
                            <section className="mb-24">
                                <RSSectionHeader sectionNumber="11.1" title="Provenance States" />

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest rs-etched block opacity-50">State: Verified (Full C2PA)</span>
                                        <div className="shadow-inner bg-black/5 p-4 rounded-3xl flex items-center justify-center">
                                            <ProvenanceTelemetryStream
                                                scanStatus="completed"
                                                customRows={[
                                                    { id: '0xMNFST', label: 'MANIFEST_STORE', value: 'DETECTED', barWidth: 92, status: 'success' },
                                                    { id: '0xSIG_V', label: 'CLAIM_SIGNATURE', value: 'VALID', barWidth: 98, status: 'success' },
                                                    { id: '0xSIG_ALG', label: 'SIGNATURE_ALGORITHM', value: 'SHA256', barWidth: 100, status: 'info' },
                                                    { id: '0xCERT', label: 'CERT_AUTHORITY', value: 'ADOBE_INC', barWidth: 100, status: 'info' },
                                                    { id: '0xC2PA_V', label: 'C2PA_VERSION', value: '1.3', barWidth: 100, status: 'info' },
                                                    { id: '0xIDENT', label: 'CREATOR_IDENTITY', value: 'VERIFIED', barWidth: 85, status: 'success' },
                                                    { id: '0xTOOL', label: 'GENERATION_TOOL', value: 'ADOBE_FIREFLY', barWidth: 90, status: 'success' },
                                                    { id: '0xMODEL', label: 'MODEL_VERSION', value: '1.0.0', barWidth: 100, status: 'info' },
                                                    { id: '0xTIME', label: 'TIMESTAMP', value: '2026-01-26T04:39', barWidth: 100, status: 'info' },
                                                    { id: '0xEDITS', label: 'EDIT_HISTORY', value: '2_ACTIONS', barWidth: 80, status: 'info' },
                                                    { id: '0xAI_MK', label: 'AI_GENERATED', value: 'CONFIRMED', barWidth: 90, status: 'info' },
                                                    { id: '0xTRAIN', label: 'AI_TRAINING_ALLOWED', value: 'NO', barWidth: 100, status: 'info' },
                                                    { id: '0xCHAIN', label: 'CHAIN_CUSTODY', value: 'FULL', barWidth: 95, status: 'success' },
                                                ]}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest rs-etched block opacity-50">State: No Provenance</span>
                                        <div className="shadow-inner bg-black/5 p-4 rounded-3xl flex items-center justify-center">
                                            <ProvenanceTelemetryStream
                                                scanStatus="completed"
                                                details={{
                                                    id: 'mock-2',
                                                    scan_id: 'scan-y',
                                                    tenant_id: 'mock-tenant',
                                                    signature_status: 'invalid',
                                                    hashing_algorithm: 'sha256',
                                                    edit_history: [],
                                                    raw_manifest: null,
                                                    certificate_issuer: null,
                                                    certificate_serial: null,
                                                    creator_name: null,
                                                    creator_link: null,
                                                    creation_tool: null,
                                                    creation_tool_version: null,
                                                    creation_timestamp: null,
                                                    created_at: new Date().toISOString()
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 11.2 TELEMETRY (RAMS VARIANT) */}
                            <section className="mb-24">
                                <RSSectionHeader sectionNumber="11.2" title="Telemetry Analysis Console" />

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    {/* STATE 1: STANDBY */}
                                    <div className="space-y-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest rs-etched block opacity-50">State: Standby</span>
                                        <RSTelemetryPanel
                                            state="idle"
                                            rows={[]}
                                            hideButton={true}
                                        />
                                    </div>

                                    {/* STATE 2: ACTIVE SCANNING (TELEMETRY) */}
                                    <div className="space-y-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest rs-etched block opacity-50">State: SCAN_IN_PROGRESS</span>
                                        <RSTelemetryPanel
                                            state="scanning"
                                            rows={[]}
                                            logEntries={[
                                                { id: 1, message: 'Initializing Vision Model (ViT-H/14)...', status: 'done', timestamp: '00.12' },
                                                { id: 2, message: 'Extracting High-Dim Features...', status: 'done', timestamp: '00.24' },
                                                { id: 3, message: 'Computing Perceptual Hash (pHash)...', status: 'done', timestamp: '00.38' },
                                                { id: 4, message: 'Querying Global IP Database...', status: 'active', timestamp: '00.55' },
                                                { id: 5, message: 'Matching Commercial Assets...', status: 'pending' },
                                                { id: 6, message: 'Analyzing Brand Safety Risks...', status: 'pending' },
                                                { id: 7, message: 'Verifying C2PA/JUMBF Manifest...', status: 'pending' },
                                                { id: 8, message: 'Validating Cryptographic Signatures...', status: 'pending' },
                                                { id: 9, message: 'Calculating Composite Risk Score...', status: 'pending' },
                                                { id: 10, message: 'Finalizing Forensic Dossier...', status: 'pending' }
                                            ]}
                                            hideButton={true}
                                        />
                                    </div>

                                    {/* STATE 3: VERIFIED (EXISTING SUCCESS) */}
                                    <div className="space-y-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest rs-etched block opacity-50">State: Verified (Full C2PA)</span>
                                        <RSTelemetryPanel
                                            state="complete"
                                            statusLabel="VERIFIED_PROVENANCE"
                                            footerText="Cryptographic seal verified. Chain of custody remains unbroken."
                                            rows={[
                                                { id: '0xMNFST', label: 'MANIFEST_STORE', value: 'DETECTED', barWidth: 92, status: 'success' },
                                                { id: '0xSIG_V', label: 'CLAIM_SIGNATURE', value: 'VALID', barWidth: 98, status: 'success' },
                                                { id: '0xSIG_ALG', label: 'SIGNATURE_ALGORITHM', value: 'SHA256', barWidth: 100, status: 'info' },
                                                { id: '0xCERT', label: 'CERT_AUTHORITY', value: 'ADOBE_INC', barWidth: 100, status: 'info' },
                                                { id: '0xC2PA_V', label: 'C2PA_VERSION', value: '1.3', barWidth: 100, status: 'info' },
                                                { id: '0xIDENT', label: 'CREATOR_IDENTITY', value: 'VERIFIED', barWidth: 85, status: 'success' },
                                                { id: '0xTOOL', label: 'GENERATION_TOOL', value: 'ADOBE_FIREFLY', barWidth: 90, status: 'success' },
                                                { id: '0xMODEL', label: 'MODEL_VERSION', value: '1.0.0', barWidth: 100, status: 'info' },
                                                { id: '0xTIME', label: 'TIMESTAMP', value: '2026-01-26T04:39', barWidth: 100, status: 'info' },
                                                { id: '0xEDITS', label: 'EDIT_HISTORY', value: '2_ACTIONS', barWidth: 80, status: 'info' },
                                                { id: '0xAI_MK', label: 'AI_GENERATED', value: 'CONFIRMED', barWidth: 90, status: 'info' },
                                                { id: '0xTRAIN', label: 'AI_TRAINING_ALLOWED', value: 'NO', barWidth: 100, status: 'info' },
                                                { id: '0xCHAIN', label: 'CHAIN_CUSTODY', value: 'FULL', barWidth: 95, status: 'success' },
                                            ]}
                                        />
                                    </div>

                                    {/* STATE 4: MISSING/BROKEN (FAILURE) */}
                                    <div className="space-y-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest rs-etched block opacity-50">State: Missing / Broken</span>
                                        <RSTelemetryPanel
                                            state="error"
                                            statusLabel="MISSING / NOT FOUND"
                                            buttonText="GET C2PA"
                                            footerText="No cryptographic signature found. Asset provenance cannot be verified."
                                            rows={[
                                                { id: '0xMNFST', label: 'MANIFEST_STORE', value: 'MISSING', barWidth: 0, status: 'error' },
                                                { id: '0xSIG_V', label: 'CLAIM_SIGNATURE', value: 'NOT_FOUND', barWidth: 0, status: 'error' },
                                                { id: '0xSIG_ALG', label: 'SIGNATURE_ALGORITHM', value: 'UNKNOWN', barWidth: 0, status: 'warning' },
                                                { id: '0xCERT', label: 'CERT_AUTHORITY', value: 'UNKNOWN', barWidth: 0, status: 'warning' },
                                                { id: '0xIDENT', label: 'CREATOR_IDENTITY', value: 'UNVERIFIED', barWidth: 0, status: 'error' },
                                                { id: '0xTOOL', label: 'GENERATION_TOOL', value: 'UNKNOWN', barWidth: 0, status: 'warning' },
                                                { id: '0xAI_MK', label: 'AI_GENERATED', value: 'SUSPECTED', barWidth: 70, status: 'warning' },
                                                { id: '0xCHAIN', label: 'CHAIN_CUSTODY', value: 'BROKEN', barWidth: 20, status: 'error' },
                                            ]}
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
                                            <div className="w-12 h-12 border-2 border-rs-signal rounded-full animate-ping" />
                                            <span className="rs-type-mono text-[10px] text-rs-signal uppercase tracking-widest">Scanning_Identity...</span>
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
                                    <span className="font-mono text-xs text-rs-text-tertiary">08.0</span>
                                    <h2 className="text-2xl font-black tracking-tight uppercase">Marketing Patterns</h2>
                                    <div className="h-[1px] bg-rs-border-primary flex-grow" />
                                </div>

                                <div className="space-y-12">
                                    {/* Upgrade Logic */}
                                    <div className="bg-[var(--rs-bg-surface)] p-8 rounded-[var(--rs-radius-chassis)] border border-[var(--rs-border-primary)] shadow-[var(--rs-shadow-l1)]">
                                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Upgrade Conversion Logic</h3>
                                        <div className="flex items-center gap-4">
                                            <RSButton onClick={() => setShowUpgradeModal(true)}>Trigger Upgrade Modal</RSButton>
                                            <span className="text-[10px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest">Test the conversion flow modal (A/B)</span>
                                        </div>
                                    </div>

                                    {/* Forensic Report Template (Restored) */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Forensic Report Template</h3>
                                        <div className="border border-[var(--rs-border-primary)] rounded-[var(--rs-radius-chassis)] overflow-hidden">
                                            <FreeForensicReport
                                                assetName="Restored_Evidence_001.jpg"
                                                scanDate="2024-05-19"
                                                riskProfile={{
                                                    composite_score: 88,
                                                    verdict: 'Critical Risk',
                                                    ip_report: {
                                                        score: 92,
                                                        teaser: "High-confidence partial match found in commercial database.",
                                                        reasoning: "Detected visual elements matching registered commercial assets with >90% confidence."
                                                    },
                                                    provenance_report: {
                                                        score: 75,
                                                        teaser: "Screenshot indicators detected.",
                                                        reasoning: "Metadata analysis suggests source material was captured via screen recording software."
                                                    },
                                                    safety_report: {
                                                        score: 95,
                                                        teaser: "Unsafe content categorization.",
                                                        reasoning: "Content flagged for potential brand safety violations under policy section 4.2."
                                                    },
                                                    c2pa_report: { status: 'missing' },
                                                    chief_officer_strategy: "Immediate take-down recommended pending manual review."
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
                                    <span className="font-mono text-xs text-rs-text-tertiary">07.0</span>
                                    <h2 className="text-2xl font-black tracking-tight uppercase">Elevation Physics (Z-Logic)</h2>
                                    <div className="h-[1px] bg-rs-border-primary flex-grow" />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                    <div className="space-y-4">
                                        <div className="aspect-[4/5] md:aspect-square w-full bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)] rounded-[var(--rs-radius-container)] flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-0 border-t border-l border-white/20 pointer-events-none" />
                                            <div className="absolute inset-0 border-b border-r border-black/5 pointer-events-none" />
                                            <span className="text-[10px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest">L0_Base</span>
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-tighter text-[var(--rs-text-secondary)]">Chassis Surface</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="aspect-[4/5] md:aspect-square w-full bg-[var(--rs-bg-well)] rounded-[var(--rs-radius-container)] shadow-[var(--rs-shadow-l1)] flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />
                                            <span className="text-[10px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest">L1_Well</span>
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-tighter text-[var(--rs-text-secondary)]">Recessed Input</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="aspect-[4/5] md:aspect-square w-full bg-[var(--rs-bg-surface)] rounded-[var(--rs-radius-container)] shadow-[var(--rs-shadow-l2)] flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-0 border-t border-l border-white/30 pointer-events-none" />
                                            <div className="absolute inset-0 border-b border-r border-black/10 pointer-events-none" />
                                            <span className="text-[10px] font-mono text-[var(--rs-text-secondary)] uppercase tracking-widest text-rs-signal">L2_Panel</span>
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-tighter text-[var(--rs-text-secondary)]">Floating Shield</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="aspect-[4/5] md:aspect-square w-full bg-[var(--rs-bg-surface)] rounded-[var(--rs-radius-container)] shadow-[var(--rs-shadow-l3)] flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-0 border-t border-l border-white/40 pointer-events-none" />
                                            <div className="absolute inset-0 border-b border-r border-black/20 pointer-events-none" />
                                            <span className="text-[10px] font-black text-[var(--rs-text-primary)] uppercase tracking-tighter">L3_Action</span>
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-tighter text-[var(--rs-text-secondary)]">Primary Control</p>
                                    </div>
                                </div>
                            </section>


                        </div>
                    )}

                </main>

                <footer className="mt-40 pt-10 border-t border-rs-border-primary flex justify-between items-center opacity-30 grayscale hover:grayscale-0 transition-all">
                    <div className="flex items-center gap-4">
                        <Shield size={20} />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-rs-text-primary">Ref. Scientific © 2024</span>
                    </div>
                    <div className="flex gap-6 text-[10px] uppercase font-bold tracking-widest">
                        <span className="text-rs-text-tertiary">MOMA_SPEC_V3</span>
                    </div>
                </footer>
            </div >

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
        </div >
    );
}
