import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

/**
 * GET /api/auth/verify?token=xxx
 * 
 * Verify magic link token and create authenticated session
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const token = searchParams.get('token')

        if (!token) {
            return NextResponse.redirect(new URL('/?error=invalid-link', request.url))
        }

        const supabase = await createServiceRoleClient()

        // Find valid magic link
        const { data: magicLink, error: linkError } = await (supabase
            .from('magic_links') as any)
            .select('*')
            .eq('token', token)
            .is('used_at', null)
            .gt('expires_at', new Date().toISOString())
            .single()

        if (linkError || !magicLink) {
            return NextResponse.redirect(
                new URL('/?error=expired-link&message=Link expired or already used', request.url)
            )
        }

        // Mark as used
        await (supabase
            .from('magic_links') as any)
            .update({ used_at: new Date().toISOString() })
            .eq('id', magicLink.id)

        // Create session cookie with email
        const cookieStore = await cookies()
        cookieStore.set('magic_auth_email', magicLink.email, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        })

        // Redirect to scan results
        if (magicLink.scan_id) {
            return NextResponse.redirect(
                new URL(`/scan/${magicLink.scan_id}?verified=true`, request.url)
            )
        }

        // Fallback to dashboard
        return NextResponse.redirect(new URL('/dashboard?verified=true', request.url))
    } catch (error) {
        console.error('Magic link verification error:', error)
        return NextResponse.redirect(
            new URL('/?error=verification-failed', request.url)
        )
    }
}
