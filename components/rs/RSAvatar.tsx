"use client";

import React from 'react';

import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface RSAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string;
    initials?: string;
    alt?: string;
    size?: 'sm' | 'md' | 'lg';
    status?: 'online' | 'busy' | 'offline' | 'none';
}

export function RSAvatar({
    className,
    src,
    initials,
    alt = "User Avatar",
    size = 'md',
    status = 'none',
    ...props
}: RSAvatarProps) {

    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base"
    };

    const statusColors = {
        online: "bg-rs-safe border-rs-white",
        busy: "bg-rs-signal border-rs-white",
        offline: "bg-rs-gray-400 border-rs-white",
        none: "hidden"
    };

    return (
        <div className="relative inline-block">
            <div
                className={cn(
                    "relative rounded-full overflow-hidden border border-rs-gray-300 shadow-sm flex items-center justify-center bg-rs-gray-100",
                    sizeClasses[size],
                    className
                )}
                {...props}
            >
                {src ? (
                    <img src={src} alt={alt} className="w-full h-full object-cover" />
                ) : (
                    <div className="font-mono font-bold text-rs-gray-600">
                        {initials ? initials.slice(0, 2).toUpperCase() : <User className="w-1/2 h-1/2" />}
                    </div>
                )}
            </div>

            {status !== 'none' && (
                <div
                    className={cn(
                        "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2",
                        statusColors[status]
                    )}
                />
            )}
        </div>
    );
}
