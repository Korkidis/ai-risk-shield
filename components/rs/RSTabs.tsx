"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
    id: string;
    label: string;
}

interface RSTabsProps {
    tabs: Tab[];
    activeTab?: string;
    onChange?: (id: string) => void;
    className?: string;
}

export function RSTabs({
    tabs,
    activeTab,
    onChange,
    className,
}: RSTabsProps) {
    // Internal state for uncontrolled usage
    const [internalActive, setInternalActive] = useState(tabs[0]?.id);

    const current = activeTab || internalActive;

    const handleTabClick = (id: string) => {
        setInternalActive(id);
        onChange?.(id);
    };

    return (
        <div className={cn("inline-flex bg-rs-gray-100 p-1 rounded-[4px] border border-rs-gray-200", className)}>
            {tabs.map((tab) => {
                const isActive = current === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={cn(
                            "relative px-4 py-1.5 text-sm font-medium rounded-[3px] transition-all duration-200 z-10",
                            isActive ? "text-rs-black shadow-sm" : "text-rs-gray-500 hover:text-rs-gray-900"
                        )}
                    >
                        {isActive && (
                            <div className="absolute inset-0 bg-rs-white rounded-[3px] -z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)] animate-in fade-in zoom-in-95 duration-200" />
                        )}
                        {tab.label}
                    </button>
                )
            })}
        </div>
    );
}
