/**
 * Robots.txt Configuration
 *
 * Configures search engine crawler access rules:
 * - Allows indexing of public content
 * - Blocks private/checkout/account pages
 * - References sitemap location
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 * @packageDocumentation
 */

import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sage-portal.webexpr.dev';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Main rule for all crawlers
        userAgent: '*',
        allow: '/',
        disallow: [
          // Private user areas
          '/compte/',
          '/compte/*',

          // Shopping flow (should not be indexed)
          '/panier',
          '/panier/',
          '/panier-b2b',
          '/panier-b2b/',
          '/checkout/',
          '/checkout/*',

          // B2B private areas
          '/dashboard/',
          '/dashboard/*',
          '/tableau-de-bord/',
          '/tableau-de-bord/*',
          '/commandes/',
          '/commandes/*',
          '/devis/',
          '/devis/*',
          '/entreprise/',
          '/entreprise/*',
          '/listes/',
          '/listes/*',
          '/approbations/',
          '/approbations/*',
          '/rapports/',
          '/rapports/*',
          '/comparer',
          '/comparer/',
          '/commande-rapide',
          '/commande-rapide/',

          // Authentication pages
          '/login',
          '/register',
          '/auth/',
          '/auth/*',

          // API routes (should never be indexed)
          '/api/',
          '/api/*',

          // Internal/system paths
          '/_next/',
          '/_next/*',
          '/static/',

          // Search with parameters (avoid duplicate content)
          '/recherche?*',

          // Filter/sort parameters (handled via canonical URLs)
          '/*?page=*',
          '/*?sort=*',
          '/*?filter=*',
          '/*?tri=*',
          '/*?filtre=*',
        ],
      },
      {
        // Specific rules for Googlebot
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/compte/',
          '/panier',
          '/panier-b2b',
          '/checkout/',
          '/dashboard/',
          '/tableau-de-bord/',
          '/commandes/',
          '/devis/',
          '/entreprise/',
          '/listes/',
          '/approbations/',
          '/rapports/',
          '/api/',
          '/_next/',
        ],
      },
      {
        // Specific rules for Googlebot-Image (allow image indexing)
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: [
          '/compte/',
          '/api/',
          '/_next/',
        ],
      },
      {
        // Allow Bingbot similar access
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/compte/',
          '/panier',
          '/panier-b2b',
          '/checkout/',
          '/dashboard/',
          '/tableau-de-bord/',
          '/commandes/',
          '/devis/',
          '/entreprise/',
          '/api/',
          '/_next/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
