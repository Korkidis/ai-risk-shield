"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const statusBadgeVariants = cva(
    "inline-flex items-center justify-center rounded-[2px] px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest uppercase border",
    {
        variants: {
            variant: {
                neutral: "border-rs-gray-200 bg-rs-gray-50 text-rs-gray-600",
                info: "border-rs-info/30 bg-rs-info/10 text-rs-info",
                success: "border-rs-safe/30 bg-rs-safe/10 text-rs-safe shadow-[0_0_8px_rgba(0,103,66,0.1)]",
                warning: "border-[#D97706]/30 bg-[#D97706]/10 text-[#D97706] shadow-[0_0_8px_rgba(217,119,6,0.1)]",
                error: "border-rs-signal/30 bg-rs-signal/10 text-rs-signal shadow-[0_0_8px_rgba(255,79,0,0.1)]",
            },
        },
        defaultVariants: {
            variant: "neutral",
        },
    }
);

interface RSStatusBadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
    children: React.ReactNode;
}

export function RSStatusBadge({ className, variant, children, ...props }: RSStatusBadgeProps) {
    return (
        <span className={cn(statusBadgeVariants({ variant }), className)} {...props}>
            {children}
        </span>
    );
}

export { statusBadgeVariants };
