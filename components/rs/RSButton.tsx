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
        "transition-all duration-75", // Fast, snappy hardware tactile response
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rs-black",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:shadow-inherit"
    );

    const variants = {
        // Primary: Signal Orange, heavy mechanical edge
        primary: "bg-[var(--rs-signal)] text-white shadow-[0_4px_0_#9a2b00] border border-[var(--rs-signal)] hover:brightness-105 active:shadow-none active:translate-y-[4px]",

        // Secondary: Semantic Grey, heavy mechanical edge
        secondary: "bg-[var(--rs-gray-50)] text-[var(--rs-text-primary)] border border-black/10 shadow-[0_4px_0_rgba(0,0,0,0.15)] hover:bg-[var(--rs-bg-surface)] active:shadow-none active:translate-y-[4px] active:bg-[var(--rs-gray-100)]",

        // Danger: Inverse (Molded L3)
        danger: "bg-[var(--rs-bg-inverse)] text-[var(--rs-signal)] shadow-[0_4px_0_#000] border border-black hover:brightness-110 active:shadow-none active:translate-y-[4px]",

        // Ghost: Flat (L0)
        ghost: "bg-transparent text-[var(--rs-text-tertiary)] hover:bg-[var(--rs-bg-element)]/50 active:bg-[var(--rs-bg-well)] active:translate-y-[1px]",
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
            <span className="relative z-10 flex items-center gap-2">
                {icon && <span className="flex-shrink-0">{icon}</span>}
                {children}
            </span>
        </button>
    );
}
