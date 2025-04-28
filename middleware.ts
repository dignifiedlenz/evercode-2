import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Check if the request is for a public file
  if (request.nextUrl.pathname.startsWith('/logo.svg') ||
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/public/') ||
      request.nextUrl.pathname.startsWith('/public/sm') ||
      request.nextUrl.pathname.startsWith('/public') ||
      request.nextUrl.pathname.startsWith('/_components/_media') ||
      request.nextUrl.pathname.startsWith('/favicon.ico') ||
      request.nextUrl.pathname.startsWith('/EvermodeArrow.svg') ||
      request.nextUrl.pathname.startsWith('/503698ldsdl.jpg') ||
      request.nextUrl.pathname.startsWith('/540598ldsdl.jpg') ||
      request.nextUrl.pathname.startsWith('/532328ldsdl.jpg') ||
      request.nextUrl.pathname.startsWith('/sm/')) {
    return NextResponse.next()
  }

  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not signed in and the current path is not / or /auth/signin or /auth/signup
  if (!session && 
      ![
        '/', 
        '/auth/signin', 
        '/auth/signup'
      ].includes(request.nextUrl.pathname)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/signin'
    redirectUrl.searchParams.set(`redirectedFrom`, request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is signed in and the current path is /auth/signin or /auth/signup
  // redirect the user to /course
  if (session && ['/auth/signin', '/auth/signup', '/'].includes(request.nextUrl.pathname)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/course'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 