import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { RSSidebar } from '@/components/rs/RSSidebar';
import { RSNavbar } from '@/components/rs/RSNavbar';
import { RSBackground } from '@/components/rs/RSBackground';
import { AnonymousScanNavbar } from '@/components/dashboard/AnonymousScanNavbar';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Check auth state server-side to decide layout variant
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isAuthenticated = !!user;

    // Anonymous scan viewer: minimal chrome (no sidebar, simplified navbar)
    if (!isAuthenticated) {
        return (
            <div className="flex h-screen w-full bg-[var(--rs-bg-surface)] overflow-hidden">
                <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
                    <AnonymousScanNavbar />
                    <main className="flex-1 overflow-hidden relative">
                        <RSBackground variant="technical" className="h-full w-full overflow-auto scrollbar-hide">
                            {children}
                        </RSBackground>
                    </main>
                </div>
            </div>
        );
    }

    // Authenticated: full dashboard with sidebar + navbar
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
