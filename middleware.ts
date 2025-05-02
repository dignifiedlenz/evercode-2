import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Create a simple in-memory store to track redirect attempts
// This will be reset on server restart
const redirectAttempts = new Map<string, { count: number, lastAttempt: number }>();
const MAX_REDIRECTS = 3; // Maximum redirects allowed within the time window
const REDIRECT_WINDOW_MS = 10000; // 10 second window

// System-wide emergency loop breaker
let totalRedirectsInLastMinute = 0; 
let lastRedirectResetTime = Date.now();
const REDIRECT_DISABLE_THRESHOLD = 10; // Disable after 10 redirects in a minute
const REDIRECT_DISABLE_DURATION_MS = 60000; // 1 minute
let redirectsDisabledUntil = 0;

export async function middleware(request: NextRequest) {
  // Debug log for middleware
  console.log(`[Middleware] Processing ${request.nextUrl.pathname}`);
  
  // Reset system-wide counter if it's been a minute
  const now = Date.now();
  if (now - lastRedirectResetTime > 60000) {
    totalRedirectsInLastMinute = 0;
    lastRedirectResetTime = now;
  }
  
  // Check if redirects are currently disabled (emergency loop breaker)
  if (now < redirectsDisabledUntil) {
    console.log(`[Middleware] EMERGENCY REDIRECT DISABLED MODE until ${new Date(redirectsDisabledUntil).toISOString()}`);
    return NextResponse.next();
  }
  
  // Generate a unique key for this user/session/request path
  const requestID = request.headers.get('x-forwarded-for') || 
                   request.headers.get('cf-connecting-ip') || 
                   'unknown';
  const requestPath = request.nextUrl.pathname;
  const redirectKey = `${requestID}:${requestPath}`;
  
  // Track redirect attempts to prevent loops
  const trackingData = redirectAttempts.get(redirectKey) || { count: 0, lastAttempt: 0 };
  
  // Reset count if outside the time window
  if (now - trackingData.lastAttempt > REDIRECT_WINDOW_MS) {
    trackingData.count = 0;
  }
  
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

  // Create a basic Supabase client
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Wait a moment to ensure auth state is properly established
  await new Promise(resolve => setTimeout(resolve, 100));

  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  console.log(`[Middleware] Auth result for ${request.nextUrl.pathname}:`, { 
    hasSession: !!session, 
    userId: session?.user?.id 
  });

  // If user is not signed in and the current path is not / or /auth/signin or /auth/signup
  if (!session && 
      ![
        '/', 
        '/auth/signin', 
        '/auth/signup'
      ].includes(request.nextUrl.pathname)) {
    
    // Check if we're in a redirect loop
    trackingData.count++;
    trackingData.lastAttempt = now;
    redirectAttempts.set(redirectKey, trackingData);
    
    // If too many redirects, allow the request through to break the loop
    if (trackingData.count > MAX_REDIRECTS) {
      console.log(`[Middleware] BREAKING REDIRECT LOOP for ${requestPath}. Too many redirects: ${trackingData.count}`);
      return NextResponse.next();
    }
    
    // Increment system-wide redirect counter
    totalRedirectsInLastMinute++;
    
    // If system has too many redirects, disable all redirects for a while
    if (totalRedirectsInLastMinute > REDIRECT_DISABLE_THRESHOLD) {
      redirectsDisabledUntil = now + REDIRECT_DISABLE_DURATION_MS;
      console.log(`[Middleware] TOO MANY REDIRECTS SYSTEM-WIDE. Disabling all redirects until ${new Date(redirectsDisabledUntil).toISOString()}`);
      return NextResponse.next();
    }
    
    console.log(`[Middleware] Redirecting unauthenticated user from ${request.nextUrl.pathname} to /auth/signin (attempt ${trackingData.count})`);
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/signin'
    redirectUrl.searchParams.set(`redirectedFrom`, request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is signed in and the current path is /auth/signin or /auth/signup
  // redirect the user to /course
  if (session && ['/auth/signin', '/auth/signup', '/'].includes(request.nextUrl.pathname)) {
    // If we're coming from /course/semester-1 to /auth/signin to /course,
    // this is likely a redirect loop - break it by allowing the auth page to render
    const referrer = request.headers.get('referer') || '';
    if (referrer.includes('/course/semester-') && trackingData.count > 1) {
      console.log(`[Middleware] POTENTIAL LOOP DETECTED: Auth page with referrer from course page. Breaking loop.`);
      return NextResponse.next();
    }
    
    // Increment system-wide redirect counter
    totalRedirectsInLastMinute++;
    
    // If system has too many redirects, disable all redirects for a while
    if (totalRedirectsInLastMinute > REDIRECT_DISABLE_THRESHOLD) {
      redirectsDisabledUntil = now + REDIRECT_DISABLE_DURATION_MS;
      console.log(`[Middleware] TOO MANY REDIRECTS SYSTEM-WIDE. Disabling all redirects until ${new Date(redirectsDisabledUntil).toISOString()}`);
      return NextResponse.next();
    }
    
    console.log(`[Middleware] Redirecting authenticated user from ${request.nextUrl.pathname} to /course`);
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/course'
    return NextResponse.redirect(redirectUrl)
  }

  // Clear tracking data for successful requests
  redirectAttempts.delete(redirectKey);
  
  console.log(`[Middleware] Allowing access to ${request.nextUrl.pathname}`);
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