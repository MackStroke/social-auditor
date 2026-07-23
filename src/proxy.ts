import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export default async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const currentPath = request.nextUrl.pathname
    const isAuthRoute = currentPath.startsWith('/auth')
    const isApiRoute = currentPath.startsWith('/api')
    const isStaticPublic = ['/release-notes', '/terms', '/help-center', '/donate', '/privacy', '/contact'].some(p => currentPath.startsWith(p))
    const isPublicRoute = isAuthRoute || isApiRoute || isStaticPublic || currentPath === '/'
    // /admin is NOT a public route — always requires authentication (admin email check done server-side in layout)


    if (!user && !isPublicRoute) {
        // If no user and trying to access a protected route, redirect to login
        const url = request.nextUrl.clone()
        url.pathname = '/auth'
        return NextResponse.redirect(url)
    }

    if (user && isAuthRoute) {
        // If user exists and trying to access auth page, redirect to dashboard
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
