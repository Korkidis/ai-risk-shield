"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { RSRiskScore, RiskLevel } from './RSRiskScore';
import { RSRiskBadge } from './RSRiskBadge';

interface RSReportCardProps {
    id: string;
    filename: string;
    date: string;
    score: number;
    level: RiskLevel;
    imageUrl?: string;
}

export function RSReportCard({
    id,
    filename,
    date,
    score,
    level,
    imageUrl,
}: RSReportCardProps) {
    return (
        <div className="group relative bg-rs-white border border-rs-gray-200 rounded-[4px] shadow-sm hover:shadow-[var(--rs-shadow-bevel)] hover:border-rs-black transition-all duration-200 overflow-hidden cursor-pointer">

            {/* Preview Section */}
            <div className="h-32 bg-rs-gray-100 relative border-b border-rs-gray-200 group-hover:border-rs-black/20 transition-colors">
                {imageUrl ? (
                    <img src={imageUrl} alt={filename} className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-rs-gray-300 font-mono text-xs">
                        NO PREVIEW
                    </div>
                )}

                <div className="absolute top-2 right-2">
                    <RSRiskBadge level={level} size="sm" />
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4">

                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h4 className="font-semibold text-sm text-rs-black truncate max-w-[120px]" title={filename}>
                            {filename}
                        </h4>
                        <p className="font-mono text-[10px] text-rs-gray-500 mt-1">
                            {date} • ID: {id}
                        </p>
                    </div>
                    <div className="scale-75 origin-top-right">
                        <RSRiskScore score={score} level={level} size="sm" minimal />
                    </div>
                </div>

                {/* Mini Footer / Action line could go here */}
                <div className="w-full h-1 bg-rs-gray-100 rounded-full overflow-hidden">
                    <div
                        className={cn("h-full", level === 'critical' ? 'bg-rs-signal' : level === 'high' ? 'bg-orange-500' : 'bg-rs-safe')}
                        style={{ width: `${score}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
