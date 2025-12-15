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
    default: 'Maison Bijoux | Haute Joaillerie',
    template: '%s | Maison Bijoux',
  },
  description:
    'Decouvrez notre collection exclusive de haute joaillerie. Pieces uniques creees par nos maitres artisans depuis 1987. Bagues, colliers, bracelets et boucles d\'oreilles d\'exception.',
  keywords: [
    'bijoux',
    'joaillerie',
    'haute joaillerie',
    'bijoux de luxe',
    'bagues',
    'colliers',
    'bracelets',
    'boucles d\'oreilles',
    'or',
    'diamants',
    'pierres precieuses',
    'Paris',
    'France',
  ],
  authors: [{ name: 'Maison Bijoux' }],
  creator: 'Maison Bijoux',
  publisher: 'Maison Bijoux',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://maisonbijoux.fr'),
  alternates: {
    canonical: '/',
    languages: {
      'fr-FR': '/fr',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://maisonbijoux.fr',
    siteName: 'Maison Bijoux',
    title: 'Maison Bijoux | Haute Joaillerie',
    description:
      'Decouvrez notre collection exclusive de haute joaillerie. Pieces uniques creees par nos maitres artisans depuis 1987.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Maison Bijoux - Haute Joaillerie',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maison Bijoux | Haute Joaillerie',
    description:
      'Decouvrez notre collection exclusive de haute joaillerie. Pieces uniques creees par nos maitres artisans depuis 1987.',
    images: ['/og-image.jpg'],
    creator: '@maisonbijoux',
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
