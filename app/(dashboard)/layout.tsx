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
        <RSBackground variant="microdot" className="h-screen w-full overflow-hidden">
            <div className="flex h-full w-full overflow-hidden">
                {/* Sidebar Navigation */}
                <RSSidebar className="z-50 shrink-0" />

                {/* Right Side: Navbar + Content */}
                <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
                    {/* Top Navigation */}
                    <RSNavbar />

                    {/* Main Content Area - Scrollable */}
                    <main className="flex-1 overflow-y-auto p-0">
                        {children}
                    </main>
                </div>
            </div>
        </RSBackground>
    );
}
