"use client";

import { RSRiskPanel } from '@/components/rs/RSRiskPanel';

import { RSBackground } from '@/components/rs/RSBackground';

export default function ComponentTestingPage() {
    return (
        <RSBackground variant="technical" className="min-h-screen p-12">
            <div className="max-w-7xl mx-auto space-y-24">

                <header>
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Component Testing Lab</h1>
                    <p className="font-mono text-xs opacity-50 uppercase tracking-widest">Active Component Standard</p>
                </header>

                <div className="space-y-16">
                    {/* CURRENT STANDARD: RISK PANEL */}
                    <section>
                        <div className="mb-8 font-mono text-[10px] uppercase opacity-50 flex items-center gap-2">
                            <span className="w-2 h-2 bg-[var(--rs-text-primary)] rounded-full" />
                            Production Candidate: RSRiskPanel
                        </div>
                        <RSRiskPanel
                            status="completed"
                            id="SYS-STD-01"
                            score={88}
                            level="critical"
                            ipScore={92}
                            safetyScore={45}
                            provenanceScore={12}
                        />
                    </section>
                </div>

            </div>

        </RSBackground>
    );
}
