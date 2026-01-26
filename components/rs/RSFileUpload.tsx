"use client";

import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Upload, File, X } from 'lucide-react';

interface RSFileUploadProps {
    onFileSelect?: (file: File) => void;
    onDragChange?: (isDragging: boolean) => void;
    accept?: string;
    maxSizeMB?: number;
    className?: string;
    id?: string;
}

export function RSFileUpload({
    onFileSelect,
    onDragChange,
    accept = "image/*",
    maxSizeMB = 10,
    className,
    id,
}: RSFileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        const maxBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxBytes) {
            return `File exceeds ${maxSizeMB}MB limit`;
        }
        return null;
    };

    const handleFile = (file: File) => {
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            setSelectedFile(null);
            return;
        }

        setError(null);
        setSelectedFile(file);
        onFileSelect?.(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!isDragging) {
            setIsDragging(true);
            onDragChange?.(true);
        }
    };

    const handleDragLeave = () => {
        setIsDragging(false);
        onDragChange?.(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        onDragChange?.(false);

        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleClear = () => {
        setSelectedFile(null);
        setError(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className={cn("w-full", className)}>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                    "relative border-2 border-dashed rounded-[4px] p-8 transition-all cursor-pointer",
                    "bg-rs-white hover:bg-rs-gray-100",
                    isDragging
                        ? "border-rs-black bg-rs-gray-100 shadow-[var(--rs-shadow-bevel)]"
                        : "border-rs-gray-300",
                    error && "border-rs-signal bg-red-50"
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={handleInputChange}
                    className="hidden"
                    id={id}
                />

                {!selectedFile ? (
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                            isDragging ? "bg-rs-black" : "bg-rs-gray-200"
                        )}>
                            <Upload className={cn(
                                "w-8 h-8 transition-colors",
                                isDragging ? "text-rs-white" : "text-rs-gray-600"
                            )} />
                        </div>

                        <div>
                            <p className="font-semibold text-sm text-rs-black mb-1">
                                Drop file here or click to browse
                            </p>
                            <p className="text-xs text-rs-gray-500 font-mono">
                                Max {maxSizeMB}MB • {accept.includes('video') ? 'IMAGE & VIDEO' : accept.replace('image/', '').toUpperCase()}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded bg-rs-gray-200 flex items-center justify-center flex-shrink-0">
                            <File className="w-6 h-6 text-rs-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-rs-black truncate">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-rs-gray-500 font-mono">
                                {(selectedFile.size / 1024).toFixed(1)} KB
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                            className="w-8 h-8 rounded-full bg-rs-gray-200 hover:bg-rs-signal hover:text-rs-white flex items-center justify-center transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-2 text-xs text-rs-signal font-mono">
                    ⚠ {error}
                </p>
            )}
        </div>
    );
}
