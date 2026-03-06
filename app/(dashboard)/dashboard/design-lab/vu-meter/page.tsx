import { RSVUMeterRiskPanel } from "@/components/rs/RSVUMeterRiskPanel";
import { RSRiskPanel } from "@/components/rs/RSRiskPanel";

export default function VUMeterDesignLabPage() {
    return (
        <div className="min-h-screen bg-[var(--rs-bg-base)] text-[var(--rs-text-primary)] p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-16">

                {/* Header */}
                <header className="border-b border-[var(--rs-border-primary)] pb-8">
                    <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Design Lab: V2 Instrument Panel</h1>
                    <p className="text-[var(--rs-gray-400)] text-sm max-w-2xl">
                        Exploring the transition from circular analog dials to vertical LED VU meters.
                        This optimization reclaims horizontal real estate for high-density truth metrics (Findings)
                        while maintaining the tactile, physical "Forensic Instrument" aesthetic. Tooltips have been added to clarify methodology.
                    </p>
                </header>

                <main className="space-y-24">

                    {/* NEW DESIGN */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between border-b border-[var(--rs-border-primary)]/50 pb-2">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--rs-signal)] flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[var(--rs-signal)] animate-pulse" />
                                Proposed V2: LED VU Meters
                            </h2>
                            <span className="text-[10px] uppercase font-mono text-[var(--rs-gray-500)]">Optimized Layout</span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Critical State */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-mono text-[var(--rs-gray-400)]">STATE: CRITICAL_THREAT</h3>
                                <RSVUMeterRiskPanel
                                    id="REF_MKY091"
                                    score={98}
                                    level="critical"
                                    status="completed"
                                    ipScore={98}
                                    safetyScore={15}
                                    provenanceScore={80}
                                />
                            </div>

                            {/* Safe State */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-mono text-[var(--rs-gray-400)]">STATE: SYSTEM_SECURE</h3>
                                <RSVUMeterRiskPanel
                                    id="REF_SFE002"
                                    score={12}
                                    level="safe"
                                    status="completed"
                                    ipScore={10}
                                    safetyScore={5}
                                    provenanceScore={95}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
                            {/* Scanning State */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-mono text-[var(--rs-gray-400)]">STATE: PROCESSING</h3>
                                <RSVUMeterRiskPanel
                                    id="REF_SCN888"
                                    score={50}
                                    level="info"
                                    status="scanning"
                                    ipScore={50}
                                    safetyScore={50}
                                    provenanceScore={50}
                                />
                            </div>
                        </div>
                    </section>

                    {/* OLD DESIGN (For Comparison) */}
                    <section className="space-y-6 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 pb-24">
                        <div className="flex items-center justify-between border-b border-[var(--rs-border-primary)]/50 pb-2">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--rs-gray-500)] flex items-center gap-2">
                                Current V1: Analog Dials
                            </h2>
                            <span className="text-[10px] uppercase font-mono text-[var(--rs-gray-600)]">Legacy Layout</span>
                        </div>

                        <div className="max-w-3xl">
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-mono text-[var(--rs-gray-500)]">STATE: CRITICAL_THREAT</h3>
                                <RSRiskPanel
                                    id="REF_MKY091"
                                    score={98}
                                    level="critical"
                                    status="completed"
                                    ipScore={98}
                                    safetyScore={15}
                                    provenanceScore={80}
                                />
                            </div>
                        </div>
                    </section>

                </main>
            </div>
        </div>
    );
}
