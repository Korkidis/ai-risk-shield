import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FullForensicReport } from '@/components/report/FullForensicReport'
import { Entitlements } from '@/lib/entitlements'

export default async function ReportPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const scanId = params.id
    const supabase = await createClient()

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser()

    // 2. Get Scan Data (Deep Fetch)
    const { data: scan, error } = await supabase
        .from('scans')
        .select(`
      *,
      assets (*),
      scan_findings (*)
    `)
        .eq('id', scanId)
        .single()

    if (error || !scan) {
        return <div className="p-12 text-center">Scan not found</div>
    }

    // 3. Get User Profile for Entitlement Check (Tenant ID)
    let userContext = null
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, tenant_id, email, tenants(name)')
            .eq('id', user.id)
            .single()
        userContext = profile
    }

    // 4. Entitlement Check
    const canView = Entitlements.canViewFullReport(
        userContext ? {
            id: (userContext as any).id,
            tenant_id: (userContext as any).tenant_id,
            email: (userContext as any).email
        } : null,
        scan
    )

    if (!canView) {
        // Redirect to upgrade/purchase modal flow in dashboard?
        // Or just show a 'Access Denied' screen with purchase button
        // For now, redirect to the teaser page with upgrade query param
        redirect(`/dashboard/scans/${scanId}?upgrade=true`)
    }

    // 5. Render Report
    // Supabase types for joined tables often come back as arrays or slightly different shapes
    // Casting for MVP safety
    const asset = (scan as any).assets
    const findings = (scan as any).scan_findings || []

    return (
        <div className="bg-slate-100 min-h-screen py-12 print:bg-white print:py-0">
            <div className="print:hidden mb-8 text-center">
                <div className="inline-block bg-white px-4 py-2 rounded-lg shadow text-sm text-slate-500">
                    Press <strong>Cmd+P</strong> to save as PDF
                </div>
            </div>
            <FullForensicReport
                scan={scan}
                asset={asset}
                findings={findings}
                tenantName={(userContext as any)?.tenants?.name || 'Anonymous Client'}
                userName={userContext?.email || 'N/A'}
            />
        </div>
    )
}
