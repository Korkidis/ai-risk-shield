"use client";

import React from 'react';

import { cn } from '@/lib/utils';
import { FolderSearch } from 'lucide-react'; // Default icon

interface RSEmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
    className?: string;
}

export function RSEmptyState({
    icon,
    title,
    description,
    action,
    className,
}: RSEmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-rs-gray-200 rounded-[4px] bg-rs-gray-50/50",
            className
        )}>
            <div className="w-16 h-16 bg-rs-gray-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                {icon || <FolderSearch className="w-8 h-8 text-rs-gray-400" />}
            </div>

            <h3 className="text-lg font-bold text-rs-black tracking-tight mb-2">
                {title}
            </h3>

            <p className="text-rs-gray-500 max-w-sm mb-8 leading-relaxed">
                {description}
            </p>

            {action && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {action}
                </div>
            )}
        </div>
    );
}
