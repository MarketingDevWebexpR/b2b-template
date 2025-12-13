import type { Metadata } from 'next';
import {
  HeroSection,
  FeaturedProductsServer,
  CategoriesShowcase,
  AboutSection,
  Newsletter,
} from '@/components/home';
import { getCategories } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Maison Bijoux | Haute Joaillerie - Bijoux de Luxe Paris',
  description:
    'Decouvrez Maison Bijoux, createur de haute joaillerie depuis 1987. Bagues, colliers, bracelets et boucles d\'oreilles d\'exception. Pieces uniques creees par nos maitres artisans a Paris.',
  keywords: [
    'bijoux de luxe',
    'haute joaillerie',
    'bijoux Paris',
    'joaillerie francaise',
    'bagues diamants',
    'colliers or',
    'bracelets precieux',
    'bijoux artisanaux',
  ],
  openGraph: {
    title: 'Maison Bijoux | Haute Joaillerie',
    description:
      'Decouvrez notre collection exclusive de haute joaillerie. Pieces uniques creees par nos maitres artisans depuis 1987.',
    type: 'website',
    locale: 'fr_FR',
    url: 'https://maisonbijoux.fr',
    siteName: 'Maison Bijoux',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Maison Bijoux - Collection de Haute Joaillerie',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maison Bijoux | Haute Joaillerie',
    description:
      'Decouvrez notre collection exclusive de haute joaillerie. Pieces uniques creees par nos maitres artisans depuis 1987.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://maisonbijoux.fr',
  },
};

export const dynamic = 'force-dynamic';

/**
 * Home Page
 *
 * The main landing page showcasing:
 * - Hero section with brand statement
 * - Featured products selection
 * - Categories showcase (bento grid)
 * - About section with brand story
 * - Newsletter subscription
 *
 * This is a Server Component that fetches data from the API.
 */
export default async function HomePage() {
  // Fetch categories for the showcase
  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    categories = await getCategories();
  } catch (error) {
    console.error('Failed to fetch categories for HomePage:', error);
  }

  return (
    <>
      {/* Hero - Full-screen brand introduction */}
      <HeroSection />

      {/* Featured Products - Curated selection (fetches its own data) */}
      <FeaturedProductsServer maxProducts={8} filterFeatured />

      {/* Categories - Bento grid showcase */}
      <CategoriesShowcase categories={categories} />

      {/* About - Brand story and values */}
      <AboutSection />

      {/* Newsletter - Email subscription */}
      <Newsletter />
    </>
  );
}
