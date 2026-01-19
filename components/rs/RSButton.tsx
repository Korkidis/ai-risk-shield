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
        // Primary: Signal Orange (Molded L3)
        primary: "bg-[#FF4F00] text-white shadow-[var(--rs-shadow-l3)] hover:brightness-110 active:shadow-[var(--rs-shadow-l1)] active:scale-[0.98]",

        // Secondary: Semantic Grey (Molded L2)
        secondary: "bg-[var(--rs-bg-element)] text-[var(--rs-text-primary)] border border-[var(--rs-border-primary)] shadow-[var(--rs-shadow-l2)] hover:brightness-105 active:shadow-[var(--rs-shadow-l1)] active:scale-[0.98]",

        // Danger: Inverse (Molded L3)
        // Light: Black Button/Orange Text. Dark: White Button/Orange Text (Emergency)
        danger: "bg-[var(--rs-bg-inverse)] text-[#FF4F00] shadow-[var(--rs-shadow-l3)] hover:brightness-110 active:shadow-[var(--rs-shadow-l1)] active:scale-[0.98]",

        // Ghost: Flat (L0)
        ghost: "bg-transparent text-[var(--rs-text-tertiary)] hover:bg-[var(--rs-bg-element)] active:bg-[var(--rs-bg-well)]",
    };

    const sizes = {
        sm: "h-8 px-3 text-[9px] uppercase tracking-widest rounded-[var(--rs-radius-element)]",
        md: "h-12 px-6 text-[11px] uppercase tracking-widest rounded-[var(--rs-radius-element)] font-bold", // Taller for 'Molded' feel
        lg: "h-14 px-8 text-xs uppercase tracking-widest rounded-[var(--rs-radius-element)] font-bold",
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
            {/* Parting Line (High-Gloss Edge) */}
            <div className="absolute inset-0 rounded-[inherit] border-t border-l border-white/40 pointer-events-none" />

            <span className="relative z-10 flex items-center gap-2">
                {icon && <span className="flex-shrink-0">{icon}</span>}
                {children}
            </span>
        </button>
    );
}
