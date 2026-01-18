"use client";
import { useState, useEffect } from 'react';
import {
    Shield,
    Zap,
    Activity,
    Terminal,
    Layers,
    Cpu,
    Move,
    Sun,
    Moon
} from 'lucide-react';

import { RSButton } from '@/components/rs/RSButton';
import { RSInput } from '@/components/rs/RSInput';
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

export default function DesignLabPage() {
    const [activeTab, setActiveTab] = useState<'palette' | 'components' | 'physics'>('components');
    const [scanActive, setScanActive] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

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

                            {/* 04.0 PHYSICAL CONTROLS */}
                            <section>
                                <div className="flex items-center gap-6 mb-12">
                                    <span className="font-mono text-xs text-[#9A9691]">04.0</span>
                                    <h2 className="text-2xl font-black tracking-tight uppercase">Physical Controls</h2>
                                    <div className="h-[1px] bg-[#DBD7D0] flex-grow" />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    {/* Input Deck */}
                                    <div className="lg:col-span-4 space-y-8">
                                        <div className="bg-[var(--rs-bg-surface)] p-8 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] relative">
                                            <div className="absolute top-0 left-0 w-full h-full border border-white/50 rounded-[inherit] pointer-events-none" />

                                            <div className="flex items-center gap-2 mb-8 opacity-40">
                                                <Terminal size={14} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest rs-etched">Console 04: Input Deck</span>
                                            </div>

                                            <div className="space-y-8">
                                                <RSInput label="Target Hash" defaultValue="SHA_256_VLT_992" readOnly fullWidth />

                                                <div className="flex items-center justify-between p-4 bg-[var(--rs-bg-element)] rounded-[var(--rs-radius-container)] shadow-[var(--rs-shadow-l1)]">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--rs-text-secondary)] rs-etched ml-1">Signal Lock</span>
                                                    <button
                                                        onClick={() => setScanActive(!scanActive)}
                                                        className={`w-12 h-6 rounded-full transition-all relative shadow-[var(--rs-shadow-l1)] ${scanActive ? 'bg-[#FF4F00]' : 'bg-[#B4B0AB]'}`}
                                                    >
                                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${scanActive ? 'left-7' : 'left-1'}`} />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <RSButton variant="secondary" fullWidth>Diagnostic</RSButton>
                                                    <RSButton variant="secondary" fullWidth>Metadata</RSButton>
                                                    <div className="col-span-2">
                                                        <RSButton variant="danger" fullWidth>Emergency Stop</RSButton>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-[var(--rs-bg-surface)] p-10 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] flex justify-around items-center border border-white/50">
                                            <RSKnob label="Threshold" value={75} size={80} />
                                            <div className="w-[1px] h-16 bg-[#DBD7D0] shadow-[1px_0_0_white]" />
                                            <RSKnob label="Sensitivity" value={42} size={80} />
                                        </div>
                                    </div>

                                    {/* CRT Display */}
                                    <div className="lg:col-span-8 space-y-10">
                                        <div className="bg-[#121212] border-[10px] border-[var(--rs-border-primary)] rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] relative overflow-hidden">
                                            {/* Forensic Glass Overlay */}
                                            <div className="absolute inset-0 rs-glass-analyzed z-20 pointer-events-none" />

                                            <div className="p-8 space-y-6 relative z-10">
                                                <div className="flex justify-between">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[10px] font-mono text-[#FF4F00] font-bold tracking-widest">SCANNER_V2.0</span>
                                                        <span className="text-[9px] font-mono text-[#FF4F00]/40">BUFFER_RDY</span>
                                                    </div>
                                                    <span className="text-[10px] font-mono text-[#FF4F00]">CH_01_INPUT</span>
                                                </div>

                                                <RSScanner active={scanActive} status={scanActive ? 'Scanning QUAD_04...' : 'Standby'} />

                                                <RSSystemLog logs={[
                                                    { id: '1', timestamp: '14:02:11', message: 'Initialize secure handshake...', status: 'done' },
                                                    { id: '2', timestamp: '14:02:14', message: 'Syncing with central node...', status: 'done' },
                                                    { id: '3', timestamp: '14:02:18', message: 'Analyzing pixel variance...', status: 'active' },
                                                    { id: '4', timestamp: '14:02:22', message: 'Anomalous pattern detected in Q4.', status: 'error' },
                                                ]} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 05.0 INSTRUMENT CLUSTER */}
                            <section>
                                <div className="flex items-center gap-6 mb-12">
                                    <span className="font-mono text-xs text-[#9A9691]">05.0</span>
                                    <h2 className="text-2xl font-black tracking-tight uppercase">Instrument Cluster</h2>
                                    <div className="h-[1px] bg-[#DBD7D0] flex-grow" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <RSPanel
                                        title="Risk Analysis"
                                        metadata={[{ label: 'ID', value: '44-X' }, { label: 'VER', value: '1.0' }]}
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

                                    <RSPanel
                                        title="Identity Check"
                                        metadata={[{ label: 'SRC', value: 'BLOCK' }, { label: 'CRT', value: 'C2PA' }]}
                                        action={<RSRiskBadge level="safe" />}
                                    >
                                        <div className="flex items-center gap-10">
                                            <div className="text-5xl font-black tracking-tighter rs-etched">12%</div>
                                            <div className="flex-1 space-y-3">
                                                <div className="flex justify-between text-[10px] font-bold uppercase text-[#9A9691]">
                                                    <span>Alteration</span>
                                                    <span className="text-[#006742]">Nominal</span>
                                                </div>
                                                <RSMeter value={12} level="safe" />
                                            </div>
                                        </div>
                                    </RSPanel>
                                </div>
                            </section>

                            {/* 06.0 TELEMETRY */}
                            <section>
                                <div className="flex items-center gap-6 mb-12">
                                    <span className="font-mono text-xs text-[#9A9691]">06.0</span>
                                    <h2 className="text-2xl font-black tracking-tight uppercase">Extended Telemetry</h2>
                                    <div className="h-[1px] bg-[#DBD7D0] flex-grow" />
                                </div>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 items-center">
                                    <div className="flex flex-col items-center gap-8 p-12 bg-[var(--rs-bg-surface)] rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] border border-white/50">
                                        <div className="flex items-center gap-2 opacity-50 mb-4">
                                            <Activity size={16} />
                                            <span className="text-xs font-bold uppercase tracking-widest rs-etched">System Load</span>
                                        </div>
                                        <RSAnalogNeedle value={68} label="CPU_LOAD" />
                                    </div>
                                    <div className="flex flex-col items-center gap-8">
                                        <div className="w-full shadow-[var(--rs-shadow-l2)] rounded-[3.5rem]">
                                            <RSTelemetryStream />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 07.0 STRUCTURAL PATTERNS */}
                            <section className="mb-24">
                                <div className="flex items-center gap-6 mb-12">
                                    <span className="font-mono text-xs text-[#9A9691]">07.0</span>
                                    <h2 className="text-2xl font-black tracking-tight uppercase">Structural Patterns</h2>
                                    <div className="h-[1px] bg-[#DBD7D0] flex-grow" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <RSCard
                                        header="System Override"
                                        footer={
                                            <div className="flex justify-between items-center text-[10px] font-mono uppercase text-[var(--rs-text-tertiary)]">
                                                <span>Status: Inactive</span>
                                                <span>ID: #9921</span>
                                            </div>
                                        }
                                        className="h-64 flex flex-col justify-between"
                                    >
                                        <div className="flex-1 flex flex-col justify-center">
                                            <p className="rs-type-body text-sm mb-6 max-w-xs text-[var(--rs-text-secondary)]">
                                                Manual override requires higher clearance. Please authenticate via the secure modal.
                                            </p>
                                            <div>
                                                <RSButton onClick={() => setShowModal(true)}>Open Secure Link</RSButton>
                                            </div>
                                        </div>
                                    </RSCard>

                                    <RSCard
                                        variant="elevated"
                                        header={<span className="text-[#FF4F00] flex items-center gap-2"><div className="w-2 h-2 bg-[#FF4F00] rounded-full animate-pulse" /> CRITICAL ALERT</span>}
                                        className="h-64"
                                    >
                                        <div className="h-full flex items-center justify-center">
                                            <span className="rs-type-display text-4xl text-[var(--rs-text-primary)]/10">EMPTY_STATE</span>
                                        </div>
                                    </RSCard>
                                </div>
                            </section>

                            <RSModal isOpen={showModal} onClose={() => setShowModal(false)} title="Secure Link Request">
                                <div className="space-y-6">
                                    <p className="rs-type-body text-[var(--rs-text-secondary)]">
                                        Initiating secure handshake protocol. Please confirm your biometrics.
                                    </p>
                                    <div className="h-32 bg-[var(--rs-bg-well)] rounded-[var(--rs-radius-element)] border border-[var(--rs-border-primary)]/10 flex items-center justify-center">
                                        <span className="rs-type-mono text-xs text-[var(--rs-text-secondary)] animate-pulse">Scanning...</span>
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <RSButton variant="ghost" onClick={() => setShowModal(false)}>Cancel</RSButton>
                                        <RSButton onClick={() => setShowModal(false)}>Authenticate</RSButton>
                                    </div>
                                </div>
                            </RSModal>
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

                                <div className="grid grid-cols-4 gap-12 text-center">
                                    <div className="space-y-4">
                                        <div className="h-32 w-full bg-[var(--rs-bg-surface)] border border-[var(--rs-border-secondary)]/20 rounded-[var(--rs-radius-container)] flex items-center justify-center">
                                            <span className="text-xs font-mono text-[var(--rs-text-secondary)]">L0 (Flat)</span>
                                        </div>
                                        <p className="text-[10px] font-mono text-[var(--rs-text-tertiary)]">Chassis Base</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-32 w-full bg-[var(--rs-bg-surface)] rounded-[var(--rs-radius-container)] shadow-[var(--rs-shadow-l1)] flex items-center justify-center">
                                            <span className="text-xs font-mono text-[var(--rs-text-secondary)]">L1 (Recessed)</span>
                                        </div>
                                        <p className="text-[10px] font-mono text-[var(--rs-text-tertiary)]">Wells / Inputs</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-32 w-full bg-[var(--rs-bg-surface)] rounded-[var(--rs-radius-container)] shadow-[var(--rs-shadow-l2)] flex items-center justify-center border border-white/10">
                                            <span className="text-xs font-mono text-[var(--rs-text-primary)]">L2 (Low)</span>
                                        </div>
                                        <p className="text-[10px] font-mono text-[var(--rs-text-tertiary)]">Panels / Secondary</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-32 w-full bg-[var(--rs-bg-surface)] rounded-[var(--rs-radius-container)] shadow-[var(--rs-shadow-l3)] flex items-center justify-center border-t border-l border-white/10">
                                            <span className="text-xs font-bold text-[var(--rs-text-primary)]">L3 (High)</span>
                                        </div>
                                        <p className="text-[10px] font-mono text-[var(--rs-text-tertiary)]">Primary Actions</p>
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
