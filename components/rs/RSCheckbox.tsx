"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface RSCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    label?: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

export function RSCheckbox({
    className,
    label,
    checked,
    onCheckedChange,
    ...props
}: RSCheckboxProps) {
    const [internalChecked, setInternalChecked] = useState(false);
    const isChecked = checked !== undefined ? checked : internalChecked;

    const handleChange = () => {
        const next = !isChecked;
        setInternalChecked(next);
        onCheckedChange?.(next);
    };

    return (
        <label className={cn("inline-flex items-start gap-3 cursor-pointer group select-none", className)}>
            <div className="relative flex items-center">
                <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={isChecked}
                    onChange={handleChange}
                    {...props}
                />
                <div className={cn(
                    "w-5 h-5 border border-rs-gray-400 bg-rs-white rounded-[4px] shadow-sm transition-all duration-200",
                    "peer-focus:ring-2 peer-focus:ring-rs-black/20",
                    isChecked ? "bg-rs-black border-rs-black" : "group-hover:border-rs-gray-500"
                )}>
                    <Check
                        className={cn(
                            "w-3.5 h-3.5 text-rs-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200",
                            isChecked ? "opacity-100 scale-100" : "opacity-0 scale-50"
                        )}
                        strokeWidth={3}
                    />
                </div>
            </div>

            {label && (
                <span className={cn(
                    "text-sm",
                    isChecked ? "text-rs-black font-medium" : "text-rs-gray-700"
                )}>
                    {label}
                </span>
            )}
        </label>
    );
}
