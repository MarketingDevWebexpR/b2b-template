/**
 * Root Layout
 *
 * Main layout component that wraps all pages.
 * Includes global styles, fonts, providers, and SEO structured data.
 *
 * @packageDocumentation
 */

import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { Providers } from '@/context/Providers';
import { OrganizationSchema, WebSiteSchema } from '@/components/seo';
import './globals.css';

// ============================================================================
// Configuration
// ============================================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sage-portal.webexpr.dev';
const SITE_NAME = 'WebexpR Pro';

// ============================================================================
// Fonts
// ============================================================================

// Primary serif font for headings
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
});

// Primary sans-serif font for body text
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
});

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Grossiste Bijoux B2B`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Plateforme B2B professionnelle pour grossistes en bijoux. Large selection de colliers, bagues, bracelets et montres de luxe. Prix professionnels, livraison rapide en France et Europe.',
  keywords: [
    'grossiste bijoux',
    'bijoux b2b',
    'bijoux professionnels',
    'fournisseur bijoux',
    'bijoux en gros',
    'bijoux de luxe',
    'colliers',
    'bagues',
    'bracelets',
    'montres',
    'joaillerie',
    'horlogerie',
    'bijoux france',
    'grossiste bijoux paris',
    'vente en gros bijoux',
    'bijouterie professionnelle',
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'fr-FR': SITE_URL,
      'x-default': SITE_URL,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Grossiste Bijoux B2B`,
    description:
      'Plateforme B2B professionnelle pour grossistes en bijoux. Large selection de bijoux de luxe, prix professionnels, livraison rapide.',
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Grossiste Bijoux B2B`,
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@webexprpro',
    creator: '@webexprpro',
    title: `${SITE_NAME} | Grossiste Bijoux B2B`,
    description:
      'Plateforme B2B professionnelle pour grossistes en bijoux. Prix professionnels, livraison rapide.',
    images: {
      url: `${SITE_URL}/og-image.jpg`,
      alt: `${SITE_NAME} - Grossiste Bijoux B2B`,
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon-16x16.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#C9A86C',
      },
    ],
  },
  manifest: '/site.webmanifest',
  category: 'ecommerce',
  classification: 'Business',
  referrer: 'origin-when-cross-origin',
  // Additional verification tags can be added here
  verification: {
    // google: 'your-google-site-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
  // App-specific metadata
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: 'black-translucent',
  },
  // Additional metadata for B2B
  other: {
    'application-name': SITE_NAME,
    'msapplication-TileColor': '#0A0A0A',
    'msapplication-config': '/browserconfig.xml',
    // Business type indicators
    'business:contact_data:locality': 'Paris',
    'business:contact_data:country_name': 'France',
    // Prevent phone number detection on iOS
    'format-detection': 'telephone=no',
  },
};

// ============================================================================
// Viewport
// ============================================================================

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0A0A0A' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
  ],
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

// ============================================================================
// Root Layout Component
// ============================================================================

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="fr"
      dir="ltr"
      className={`${playfairDisplay.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to important origins for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS prefetch for external services */}
        <link rel="dns-prefetch" href="https://va.vercel-scripts.com" />

        {/* Structured Data - Organization & WebSite schemas */}
        <OrganizationSchema
          name={SITE_NAME}
          legalName="WebexpR Pro SAS"
          description="Grossiste B2B specialise dans la distribution de bijoux de luxe pour les professionnels. Large selection de colliers, bagues, bracelets et montres des plus grandes marques."
          logoUrl={`${SITE_URL}/logo.png`}
          url={SITE_URL}
          email="contact@sage-portal.webexpr.dev"
          telephone="+33 1 23 45 67 89"
          address={{
            streetAddress: '123 Avenue des Champs-Elysees',
            addressLocality: 'Paris',
            addressRegion: 'Ile-de-France',
            postalCode: '75008',
            addressCountry: 'FR',
          }}
          areaServed={['FR', 'BE', 'CH', 'LU', 'MC']}
          foundingDate="2020"
        />
        <WebSiteSchema
          name={`${SITE_NAME} - Bijoux B2B`}
          alternateName={[SITE_NAME, 'Bijoux B2B Grossiste']}
          url={SITE_URL}
          description="Plateforme B2B professionnelle pour grossistes en bijoux. Catalogue complet de bijoux de luxe, commandes en gros, et gestion des devis."
          inLanguage="fr-FR"
          searchUrlTemplate={`${SITE_URL}/recherche?q={search_term_string}`}
          publisherId={`${SITE_URL}/#organization`}
        />
      </head>
      <body className="font-sans antialiased bg-white text-gray-900">
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-gray-900 focus:underline"
        >
          Aller au contenu principal
        </a>

        <Providers>
          <div id="main-content">{children}</div>
        </Providers>

        {/* Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
