import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { Providers } from '@/context/Providers';
import './globals.css';

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

export const metadata: Metadata = {
  title: {
    default: 'WebexpR Pro | Plateforme B2B',
    template: '%s | WebexpR Pro',
  },
  description:
    'Plateforme B2B professionnelle pour la gestion de vos commandes, devis et catalogues produits.',
  keywords: [
    'B2B',
    'plateforme professionnelle',
    'gestion commandes',
    'devis',
    'catalogue produits',
    'grossiste',
    'professionnel',
  ],
  authors: [{ name: 'WebexpR Pro' }],
  creator: 'WebexpR Pro',
  publisher: 'WebexpR Pro',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://webexpr.pro'),
  alternates: {
    canonical: '/',
    languages: {
      'fr-FR': '/fr',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://webexpr.pro',
    siteName: 'WebexpR Pro',
    title: 'WebexpR Pro | Plateforme B2B',
    description:
      'Plateforme B2B professionnelle pour la gestion de vos commandes, devis et catalogues produits.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'WebexpR Pro - Plateforme B2B',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WebexpR Pro | Plateforme B2B',
    description:
      'Plateforme B2B professionnelle pour la gestion de vos commandes, devis et catalogues produits.',
    images: ['/og-image.jpg'],
    creator: '@webexprpro',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0A0A0A' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="fr"
      className={`${playfairDisplay.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
