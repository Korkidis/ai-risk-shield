import React from "react";
import { cn } from "@/lib/utils";

interface RSFloatingShieldProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function RSFloatingShield({
    children,
    className,
    ...props
}: RSFloatingShieldProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden",
                "bg-[var(--rs-bg-surface)]", // Clean Surface
                "rounded-[24px]", // Medium-Large radius (lighter than the hefty 32/40px)
                "border border-[var(--rs-border-primary)]/40", // Subtle definition
                // L2 Floating Physics: Significant lift but defined shadow
                "shadow-[var(--rs-shadow-l2)]",
                className
            )}
            {...props}
        >
            {/* Subtle top highlight for 'plastic' feel */}
            <div className="absolute inset-x-0 top-0 h-px bg-white/40 pointer-events-none" />

            {children}
        </div>
    );
}
