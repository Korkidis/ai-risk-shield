"use client";

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface RSSelectProps {
    value?: string;
    onChange?: (value: string) => void;
    options: Option[];
    placeholder?: string;
    className?: string;
    fullWidth?: boolean;
}

export function RSSelect({
    value,
    onChange,
    options,
    placeholder = "Select option...",
    className,
    fullWidth = false,
}: RSSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative inline-block font-sans text-sm",
                fullWidth ? "w-full" : "w-auto",
                className
            )}
        >
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-between gap-3 px-3 h-10 w-full rounded-[4px]",
                    "bg-rs-white border border-rs-gray-300 shadow-[var(--rs-shadow-bevel)]",
                    "hover:bg-rs-gray-100 hover:border-rs-black transition-colors duration-150",
                    "focus:outline-none focus:ring-2 focus:ring-rs-black focus:border-rs-black",
                    isOpen ? "border-rs-black bg-rs-gray-100" : ""
                )}
            >
                <span className={cn(selectedOption ? "text-rs-black" : "text-rs-gray-500")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-rs-gray-600" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-rs-gray-600" />
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 top-full left-0 mt-1 w-full min-w-[200px] bg-rs-white border border-rs-gray-200 rounded-[4px] shadow-lg animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-1 max-h-60 overflow-y-auto">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange?.(option.value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full text-left px-3 py-2 rounded-[2px] text-sm transition-colors",
                                    option.value === value
                                        ? "bg-rs-gray-900 text-rs-white font-medium shadow-sm"
                                        : "text-rs-gray-800 hover:bg-rs-gray-200"
                                )}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
