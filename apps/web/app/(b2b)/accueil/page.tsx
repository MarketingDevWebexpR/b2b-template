import type { Metadata } from 'next';
import { B2BHomepageClient } from '@/components/b2b/B2BHomepageClient';

/**
 * B2B Homepage Metadata
 *
 * SEO optimized for professional customers searching for
 * B2B jewelry suppliers and wholesale opportunities.
 */
export const metadata: Metadata = {
  title: 'Espace Pro B2B | WebexpR Pro - Grossiste Bijoux Professionnels',
  description:
    'Plateforme B2B pour professionnels de la bijouterie. Acces au catalogue complet, tarifs preferentiels, livraison 24h, credit entreprise. Plus de 15 000 references disponibles.',
  keywords: [
    'grossiste bijoux',
    'bijoux B2B',
    'fournisseur bijoux professionnels',
    'bijoux en gros',
    'catalogue bijoux pro',
    'tarifs revendeurs',
    'bijoux entreprise',
    'distributeur bijoux France',
  ],
  openGraph: {
    title: 'Espace Pro B2B | WebexpR Pro',
    description:
      'Plateforme B2B pour professionnels. Catalogue complet, tarifs preferentiels, livraison express.',
    type: 'website',
    locale: 'fr_FR',
    url: 'https://pro.webexprpro.fr',
    siteName: 'WebexpR Pro',
    images: [
      {
        url: '/og-image-b2b.jpg',
        width: 1200,
        height: 630,
        alt: 'WebexpR Pro - Espace Professionnel B2B',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Espace Pro B2B | WebexpR Pro',
    description:
      'Plateforme B2B pour professionnels. Catalogue complet, tarifs preferentiels.',
    images: ['/og-image-b2b.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Revalidate data every 5 minutes
export const revalidate = 300;

/**
 * B2B Homepage
 *
 * Modern B2B homepage featuring:
 * - Personalized hero with company welcome message
 * - Quick actions (Quick Order, Quotes, Recommendations)
 * - Main categories grid with product counts
 * - Trending products / Best sellers carousel
 * - Current promotions (feature-gated)
 * - New arrivals section
 * - Quick statistics dashboard (feature-gated)
 *
 * This page uses a client component to leverage:
 * - Feature flags system (useFeatures hooks)
 * - Mock data system (useMockData hook)
 * - Interactive UI elements
 */
export default function B2BHomePage() {
  return <B2BHomepageClient />;
}
