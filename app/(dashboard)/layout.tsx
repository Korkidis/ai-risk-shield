import React from 'react';
import { RSSidebar } from '@/components/rs/RSSidebar';
import { RSNavbar } from '@/components/rs/RSNavbar';
import { RSTechnicalDraftingSubstrate } from '@/components/rs/RSTechnicalDraftingSubstrate';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full bg-[var(--rs-bg-surface)] overflow-hidden">
            {/* Sidebar Navigation */}
            <RSSidebar className="z-50 shrink-0" />

            {/* Right Side: Navbar + Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
                {/* Top Navigation */}
                <RSNavbar />

                {/* Main Content Area - Technical Substrate */}
                <main className="flex-1 overflow-hidden relative">
                    <RSTechnicalDraftingSubstrate contentPadding="p-0">
                        {children}
                    </RSTechnicalDraftingSubstrate>
                </main>
            </div>
        </div>
    );
}
