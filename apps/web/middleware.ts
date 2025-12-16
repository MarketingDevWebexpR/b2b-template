import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * Auth middleware for protecting routes
 * Redirects unauthenticated users to login page
 *
 * Protected routes:
 * - /compte/* - User account pages
 * - /checkout/* - Checkout flow
 * - B2B routes (tableau-de-bord, commandes, devis, entreprise, etc.)
 */
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Shop protected routes
  const isShopProtectedRoute =
    pathname.startsWith('/compte') || pathname.startsWith('/checkout');

  // B2B protected routes - all professional features
  const isB2BProtectedRoute =
    pathname.startsWith('/tableau-de-bord') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/commandes') ||
    pathname.startsWith('/devis') ||
    pathname.startsWith('/entreprise') ||
    pathname.startsWith('/panier-b2b') ||
    pathname.startsWith('/listes') ||
    pathname.startsWith('/commande-rapide') ||
    pathname.startsWith('/comparer') ||
    pathname.startsWith('/approbations') ||
    pathname.startsWith('/rapports');

  const isProtectedRoute = isShopProtectedRoute || isB2BProtectedRoute;

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
  matcher: [
    // Shop protected routes
    '/compte/:path*',
    '/checkout/:path*',
    // B2B protected routes
    '/tableau-de-bord/:path*',
    '/dashboard/:path*',
    '/commandes/:path*',
    '/devis/:path*',
    '/entreprise/:path*',
    '/panier-b2b/:path*',
    '/listes/:path*',
    '/commande-rapide/:path*',
    '/comparer/:path*',
    '/approbations/:path*',
    '/rapports/:path*',
  ],
};
