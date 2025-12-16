import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy for protecting routes
 * Migrated from middleware.ts to proxy.ts
 *
 * Key differences from middleware:
 * - Runs on Node.js runtime (not Edge)
 * - Function exported as 'proxy' instead of 'middleware'
 * - Makes the app's network boundary explicit
 *
 * Protected routes:
 * - /compte/* - User account pages
 * - /checkout/* - Checkout flow
 * - B2B routes (tableau-de-bord, commandes, devis, entreprise, etc.)
 */

/**
 * Helper function to check if a path is a protected route
 */
function isProtectedRoute(pathname: string): boolean {
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

  return isShopProtectedRoute || isB2BProtectedRoute;
}

/**
 * Proxy function - exported as named 'proxy' for Next.js 16
 * Uses NextAuth v5's auth() wrapper for session handling
 */
export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  if (isProtectedRoute(pathname) && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url);
    // Add callback URL to redirect back after login
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

/**
 * Also export as default for compatibility
 */
export default proxy;

/**
 * Matcher configuration
 * Only run proxy on specified routes
 *
 * Note: In Next.js 16, the matcher config works the same way as in middleware
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
