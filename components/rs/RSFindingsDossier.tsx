"use client";

import React from 'react';
import { AlertTriangle, CheckCircle2, FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RSFindingsDossierProps {
    isComplete: boolean;
    results: {
        ipRisk: number;
        brandSafety: number;
        provenance: number;
    };
}

export function RSFindingsDossier({ isComplete, results }: RSFindingsDossierProps) {
    if (!isComplete) return null;

    // Mock findings 
    const findings = [
        results.ipRisk > 50 ? {
            id: 1,
            type: 'critical',
            title: 'IP / Copyright',
            score: results.ipRisk,
            text: 'The asset displays a direct and unmistakable reproduction of protected intellectual property. This character is extensively protected by both copyright and trademark law globally. The specific depiction is a standard, widely recognized iteration of the character.'
        } : null,
        results.brandSafety > 0 ? {
            id: 2,
            type: 'safe',
            title: 'Brand Safety',
            score: results.brandSafety,
            text: 'The image features recognized family-friendly characters. Per brand guidelines, these are considered low safety risk. The visual contains no elements of violence, suggestive content, hate speech, illegal activities.'
        } : null,
        results.provenance > 0 ? {
            id: 3,
            type: 'critical',
            title: 'C2PA Signature',
            score: results.provenance,
            text: 'The C2PA signature is missing. This absence prevents the verification of the asset\'s origin and any modifications made since its creation, raising concerns about its trustworthiness.'
        } : {
            id: 3,
            type: 'safe',
            title: 'C2PA Signature',
            score: results.provenance,
            text: 'The C2PA signature is verified, confirming the asset\'s provenance and authenticity. Content origin is traceable.'
        }
    ].filter(Boolean);

    return (
        <div className="bg-[#EAE5D9] rounded-[24px] p-6 border border-[#D6CEC1] flex-1 flex flex-col shadow-inner overflow-hidden text-[#1A1A1A] animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Paper Header */}
            <div className="flex justify-between items-center mb-6 border-b-2 border-[#1A1A1A] pb-2">
                <div className="font-mono text-sm font-bold uppercase tracking-widest">Key Findings</div>
                <div className="font-mono text-xs opacity-50">REF: 842-Alpha</div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                {findings.length > 0 ? findings.map((f: any) => (
                    <div key={f.id} className="group">
                        <div className="flex justify-between items-baseline mb-2">
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-2 h-2 rounded-full ring-1 ring-offset-1 ring-offset-[#EAE5D9]",
                                    f.type === 'critical' ? "bg-red-600 ring-red-600" : "bg-emerald-600 ring-emerald-600"
                                )} />
                                <span className="font-bold text-base uppercase tracking-tight">{f.title}</span>
                            </div>
                            <span className="font-mono font-bold text-sm opacity-60">{f.score}/100</span>
                        </div>
                        <p className="font-mono text-xs leading-relaxed text-justify opacity-80 pl-4 border-l border-[#1A1A1A]/10">
                            {f.text}
                        </p>
                    </div>
                )) : (
                    <div className="text-center py-8 opacity-50 font-mono text-xs">No significant findings reported.</div>
                )}
            </div>

            {/* Footer / CTA */}
            <div className="mt-6 pt-4 border-t border-[#1A1A1A]/10">
                <button
                    className="w-full bg-[#1A1A1A] hover:bg-[#333] text-[#EAE5D9] font-mono text-xs font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors uppercase tracking-wider"
                >
                    <FileText size={14} />
                    Generate Mitigation Report
                </button>
            </div>
        </div>
    );
}
