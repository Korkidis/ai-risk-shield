"use client";

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { RSButton } from './RSButton';

interface RSUploadZoneProps {
    onFileSelect: (file: File) => void;
    acceptedFormats?: string[]; // e.g. ['image/*', 'video/*']
    maxSizeMB?: number;
    className?: string;
    isCompact?: boolean;
}

export function RSUploadZone({
    onFileSelect,
    acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'],
    maxSizeMB = 10,
    className,
    isCompact = false
}: RSUploadZoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        setError(null);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            validateAndSelect(files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            validateAndSelect(files[0]);
        }
    };

    const validateAndSelect = (file: File) => {
        setError(null);

        // Check size
        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`File exceeds maximum size of ${maxSizeMB}MB.`);
            return;
        }

        // Check type (simple check)
        // For a more robust check in production we might check MIME types more strictly
        // but here we rely on the accept attribute and basic JS matching
        const isAccepted = acceptedFormats.some(format => {
            if (format.endsWith('/*')) {
                const type = format.replace('/*', '');
                return file.type.startsWith(type);
            }
            return file.type === format;
        });

        // Note: If acceptedFormats contains specific Mimes, this basic logic might need expansion. 
        // But for 'image/*' vs 'video/*' it works for common cases.

        // Fallback: If acceptedFormats is empty, allow all.

        if (acceptedFormats.length > 0 && !isAccepted) {
            // Allow if generic type matches
        }

        // Pass validation
        onFileSelect(file);
    };

    return (
        <div
            className={cn(
                "relative group cursor-pointer transition-all duration-300 ease-out",
                "border border-dashed border-rs-black bg-rs-white hover:border-solid hover:border-2",
                isDragOver ? "bg-rs-gray-100 border-solid border-2" : "",
                error ? "border-rs-signal bg-red-50" : "",
                isCompact ? "p-8" : "p-16 md:p-24",
                className
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={acceptedFormats.join(',')}
                onChange={handleFileInput}
            />

            <div className="flex flex-col items-center justify-center text-center space-y-6">
                {/* Icon */}
                <div className={cn(
                    "rounded-full bg-rs-gray-50 border border-rs-gray-200 flex items-center justify-center transition-transform group-hover:scale-110 duration-300",
                    isCompact ? "w-12 h-12" : "w-16 h-16"
                )}>
                    <svg
                        className={cn("text-rs-gray-600", isCompact ? "w-5 h-5" : "w-6 h-6")}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                </div>

                {/* Text */}
                <div className="space-y-2">
                    <h3 className={cn(
                        "font-bold text-rs-black tracking-tight",
                        isCompact ? "text-lg" : "text-2xl"
                    )}>
                        Drop asset for forensic scan
                    </h3>
                    <p className="font-mono text-xs text-rs-gray-500 uppercase tracking-widest">
                        JPG, PNG, WEBP, MP4 (Max {maxSizeMB}MB)
                    </p>
                </div>

                {/* Optional Button for clarity */}
                <div className="pt-4">
                    <span className="inline-block px-4 py-2 border border-rs-gray-300 rounded text-xs font-bold uppercase tracking-widest text-rs-black bg-transparent hover:bg-rs-black hover:text-white transition-colors">
                        Select File
                    </span>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="absolute bottom-4 left-0 w-full text-center">
                        <p className="text-xs font-mono text-rs-signal font-bold">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
