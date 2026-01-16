import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Next.js Middleware
 *
 * Runs on EVERY request before it reaches your pages/API routes
 *
 * Purpose:
 * 1. Refresh Supabase auth session (keeps users logged in)
 * 2. Protect routes that require authentication
 * 3. Redirect authenticated users away from auth pages
 *
 * Performance:
 * - Runs at the edge (very fast)
 * - Minimal overhead (~5-10ms)
 */
export async function middleware(request: NextRequest) {
    return await updateSession(request)
}

/**
 * Matcher configuration
 *
 * This middleware runs on all routes EXCEPT:
 * - Static files (_next/static)
 * - Image optimization (_next/image)
 * - Favicon
 * - Public files
 *
 * This improves performance (no auth check needed for static assets)
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
