import { DashboardSidebar } from '@/components/dashboard/Sidebar'
import { DashboardTopBar } from '@/components/dashboard/TopBar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30">
            <DashboardSidebar />

            <div className="pl-64 flex flex-col min-h-screen">
                <DashboardTopBar />
                <main className="flex-1 p-8 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    )
}
