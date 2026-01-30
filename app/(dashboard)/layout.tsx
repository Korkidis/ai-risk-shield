import React from 'react';
import { RSSidebar } from '@/components/rs/RSSidebar';
import { RSNavbar } from '@/components/rs/RSNavbar';
import { RSBackground } from '@/components/rs/RSBackground';

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
                    <RSBackground variant="technical" className="h-full w-full overflow-auto scrollbar-hide">
                        {children}
                    </RSBackground>
                </main>
            </div>
        </div>
    );
}
