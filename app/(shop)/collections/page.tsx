import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getCategories } from '@/lib/api';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { HeaderSpacer } from '@/components/layout/Header';
import { CollectionsGrid } from './CollectionsGrid';

export const metadata: Metadata = {
  title: 'Nos Collections | Maison Joaillerie',
  description:
    'Découvrez toutes nos collections de haute joaillerie. Bagues, colliers, bracelets et boucles d\'oreilles d\'exception, créés par nos maîtres artisans.',
  openGraph: {
    title: 'Nos Collections | Maison Joaillerie',
    description:
      'Découvrez toutes nos collections de haute joaillerie. Pièces uniques créées par nos maîtres artisans.',
    type: 'website',
  },
};

/**
 * CollectionsIndexPage - Server Component listing all collections
 *
 * Features:
 * - Elegant Hermès-inspired card design (no images)
 * - Dynamic data from Sage API
 * - Animated grid with staggered reveal
 * - Product count per collection
 */
export default async function CollectionsIndexPage() {
  const categories = await getCategories();

  return (
    <main className="min-h-screen bg-background-cream">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-warm">
        <HeaderSpacer />
        <div className="absolute inset-0 bg-vignette" />
        <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-hermes-500/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light to-transparent" />

        <Container className="py-16 lg:py-20">
          <div className="text-center">
            <span className="mb-4 inline-block font-sans text-overline uppercase tracking-luxe text-hermes-500">
              Explorez
            </span>

            <h1 className="font-serif text-heading-1 text-text-primary md:text-display-2 lg:text-display-1">
              Nos Collections
            </h1>

            <div className="mx-auto my-6 h-px w-24 bg-hermes-500" />

            <p className="mx-auto max-w-2xl font-sans text-body-lg leading-elegant text-text-muted">
              Chaque collection raconte une histoire unique, façonnée par le savoir-faire
              de nos artisans et l'excellence de nos matériaux.
            </p>
          </div>
        </Container>
      </section>

      {/* Collections Grid */}
      <section className="py-16 lg:py-24">
        <Container>
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[{ label: 'Collections' }]}
            className="mb-12"
          />

          {/* Grid */}
          <CollectionsGrid categories={categories} />

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-2 gap-8 border-t border-border-light pt-12 md:grid-cols-4">
            <div className="text-center">
              <span className="block font-serif text-display-2 text-hermes-500">
                {categories.length}
              </span>
              <span className="mt-2 block font-sans text-caption uppercase tracking-luxe text-text-muted">
                Collections
              </span>
            </div>
            <div className="text-center">
              <span className="block font-serif text-display-2 text-hermes-500">
                {categories.reduce((acc, cat) => acc + cat.productCount, 0)}
              </span>
              <span className="mt-2 block font-sans text-caption uppercase tracking-luxe text-text-muted">
                Pièces
              </span>
            </div>
            <div className="text-center">
              <span className="block font-serif text-display-2 text-hermes-500">
                1987
              </span>
              <span className="mt-2 block font-sans text-caption uppercase tracking-luxe text-text-muted">
                Depuis
              </span>
            </div>
            <div className="text-center">
              <span className="block font-serif text-display-2 text-hermes-500">
                100%
              </span>
              <span className="mt-2 block font-sans text-caption uppercase tracking-luxe text-text-muted">
                Artisanal
              </span>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
