import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * Auth middleware for protecting routes
 * Redirects unauthenticated users to login page
 */
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Protected routes that require authentication
  const isProtectedRoute =
    pathname.startsWith('/account') || pathname.startsWith('/checkout');

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url);
    // Add callback URL to redirect back after login
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

/**
 * Matcher configuration
 * Only run middleware on specified routes
 */
export const config = {
  matcher: ['/account/:path*', '/checkout/:path*'],
};
