import { cn } from '@/lib/utils';

interface RSButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    icon?: React.ReactNode;
}

export function RSButton({
    className,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    icon,
    children,
    ...props
}: RSButtonProps) {
    const baseStyles = cn(
        "inline-flex items-center justify-center font-medium font-sans relative overflow-hidden",
        "transition-all duration-150 ease-out active:scale-[0.98]", // Tactile press scale
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rs-black",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
    );

    const variants = {
        // Primary: Signal Orange (Molded L2)
        primary: "bg-[#FF4F00] text-white shadow-[var(--rs-shadow-l2)] hover:brightness-105 active:shadow-[var(--rs-shadow-pressed)]",

        // Secondary: Semantic Grey (Molded L1/L2 mix)
        secondary: "bg-[var(--rs-gray-50)] text-[var(--rs-text-primary)] border border-[var(--rs-border-primary)] shadow-[var(--rs-shadow-l2)] hover:bg-[var(--rs-gray-100)] active:shadow-[var(--rs-shadow-pressed)]",

        // Danger: Inverse (Molded L3) - Matches "SYSTEM PURGE" aesthetic
        danger: "bg-[var(--rs-bg-inverse)] text-[#FF4F00] shadow-[var(--rs-shadow-l2)] hover:brightness-110 active:shadow-[var(--rs-shadow-pressed)]",

        // Ghost: Flat (L0)
        ghost: "bg-transparent text-[var(--rs-text-tertiary)] hover:bg-[var(--rs-bg-element)]/50 active:bg-[var(--rs-bg-well)]",
    };

    const sizes = {
        sm: "h-8 px-3 text-[9px] uppercase tracking-widest rounded-[var(--rs-radius-element)]",
        md: "h-11 px-6 text-[10px] uppercase tracking-widest rounded-[var(--rs-radius-element)] font-bold", // Trimmed height
        lg: "h-13 px-8 text-[11px] uppercase tracking-widest rounded-[var(--rs-radius-element)] font-bold",
    };

    return (
        <button
            className={cn(
                baseStyles,
                "transition-all duration-300 ease-[var(--rs-ease-spring)]", // Spring Physics
                variants[variant],
                sizes[size],
                fullWidth ? "w-full" : "",
                className
            )}
            {...props}
        >
            {/* Parting Line (High-Gloss Detail) */}
            <div className="absolute inset-0 rounded-[inherit] border-t border-l border-white/20 pointer-events-none" />
            <div className="absolute inset-0 rounded-[inherit] border-b border-r border-black/10 pointer-events-none" />

            <span className="relative z-10 flex items-center gap-2">
                {icon && <span className="flex-shrink-0">{icon}</span>}
                {children}
            </span>
        </button>
    );
}
