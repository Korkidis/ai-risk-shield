import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
        return NextResponse.redirect(new URL('/login?error=missing_token', request.url))
    }

    try {
        const supabase = await createServiceRoleClient()

        // 1. Validate Token
        const { data: link, error } = await supabase
            .from('magic_links')
            .select('*')
            .eq('token', token)
            .single() as { data: any, error: any }

        if (error || !link) {
            return NextResponse.redirect(new URL('/login?error=invalid_token', request.url))
        }

        // 2. Check Expiry
        if (new Date(link.expires_at) < new Date()) {
            return NextResponse.redirect(new URL('/login?error=expired_token', request.url))
        }

        // 3. Set Cookie (Session-like persistence for "Verified" state)
        const cookieStore = await cookies()
        cookieStore.set('magic_auth_email', link.email, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        })

        // 4. Invalidate Token (Delete it)
        await supabase
            .from('magic_links')
            .delete()
            .eq('token', token)

        // 5. Redirect to Scan Result
        // We redirect to the /scan/[id] (Public View) not /dashboard/scans/[id] (Protected)
        return NextResponse.redirect(new URL(`/scan/${link.scan_id}?verified=true`, request.url))

    } catch (error) {
        console.error('Verification error:', error)
        return NextResponse.redirect(new URL('/login?error=server_error', request.url))
    }
}
