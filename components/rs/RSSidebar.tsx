"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    FileSearch,
    ShieldAlert,
    BookOpen,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TenantSwitcher } from '@/components/dashboard/TenantSwitcher';
import { TenantPlanBadge } from '@/components/dashboard/TenantPlanBadge';

interface NavItem {
    label: string;
    icon: React.ReactNode;
    href: string;
}

const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", icon: <LayoutDashboard />, href: "/dashboard" },
    { label: "Scans & Reports", icon: <FileSearch />, href: "/dashboard/scans-reports" },
    { label: "Guidelines & Policies", icon: <ShieldAlert />, href: "/dashboard/brand-guidelines" },
    { label: "Help & Documentation", icon: <BookOpen />, href: "/dashboard/help" },
    { label: "Design Lab", icon: <BookOpen />, href: "/dashboard/design-lab" },
];

interface RSSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    // 
}

export function RSSidebar({
    className,
    ...props
}: RSSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "h-screen bg-rs-gray-50 border-r border-rs-gray-200 sticky top-0 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] z-[100]",
                isCollapsed ? "w-16" : "w-64",
                className
            )}
            {...props}
        >
            {/* Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-6 w-6 h-6 bg-rs-white border border-rs-gray-300 rounded-full flex items-center justify-center text-rs-gray-600 hover:text-rs-black hover:border-rs-black shadow-sm z-50"
            >
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>

            {/* Nav Container */}
            <div className="flex-1 py-6 px-3 space-y-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-[4px] transition-all group overflow-hidden whitespace-nowrap",
                                isActive
                                    ? "bg-rs-black text-rs-white shadow-md font-medium"
                                    : "text-rs-gray-600 hover:bg-rs-white hover:text-rs-black hover:shadow-sm"
                            )}
                        >
                            <span className={cn(
                                "flex-shrink-0 transition-colors",
                                isActive ? "text-rs-signal" : "text-rs-gray-500 group-hover:text-rs-black"
                            )}>
                                {React.cloneElement(item.icon as React.ReactElement<any>, { size: 20 })}
                            </span>

                            <span className={cn(
                                "transition-opacity duration-300 text-sm",
                                isCollapsed ? "opacity-0 w-0" : "opacity-100"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>

            {/* Footer */}
            <div className={cn(
                "p-4 border-t border-rs-gray-200 transition-opacity duration-300 space-y-4",
                isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
            )}>
                <div className="w-full">
                    <label className="text-[10px] font-bold text-rs-gray-400 uppercase tracking-wider mb-2 block">Workspace</label>
                    <TenantSwitcher />
                </div>

                <TenantPlanBadge />
            </div>
        </aside>
    );
}
