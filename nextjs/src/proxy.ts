import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return url.length > 0 && !url.includes('placeholder') && url.includes('.supabase.')
}

// Force the canonical domain: any other host (e.g. the *.vercel.app URL) is
// 308-redirected to CANONICAL_HOST, same path preserved. Inert until
// CANONICAL_HOST is set, so preview/testing on *.vercel.app is unaffected.
function enforceCanonicalHost(request: NextRequest) {
  const canonical = process.env.CANONICAL_HOST
  if (!canonical) return null

  const host = request.headers.get('host') || ''
  if (host === canonical || host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
    return null
  }

  const url = new URL(request.url)
  url.protocol = 'https:'
  url.host = canonical
  return NextResponse.redirect(url, 308)
}

export async function proxy(request: NextRequest) {
  const hostRedirect = enforceCanonicalHost(request)
  if (hostRedirect) return hostRedirect

  const pathname = request.nextUrl.pathname
  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginPage = pathname === '/login'

  // Only the admin area and login page need a session check.
  if (!isAdminRoute && !isLoginPage) {
    return NextResponse.next({ request })
  }

  // DEV BYPASS — when Supabase isn't configured, skip all auth checks
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (isAdminRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isLoginPage && user) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return supabaseResponse
}

export const config = {
  // Run on all routes so host enforcement applies site-wide, excluding
  // Next.js internals and static files (anything with a file extension).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.\\w+$).*)'],
}
