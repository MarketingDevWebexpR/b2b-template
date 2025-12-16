import { Metadata } from 'next';
import { getCategories } from '@/lib/api';
import { Container } from '@/components/ui/Container';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { B2BHeaderEcomSpacer } from '@/components/layout/B2BHeaderEcom';

export const metadata: Metadata = {
  title: 'Nos Categories | WebexpR Pro B2B',
  description:
    'Parcourez notre catalogue professionnel de bijoux B2B : bagues, colliers, bracelets, boucles d\'oreilles et montres. Plus de 10 000 references disponibles pour les professionnels.',
  openGraph: {
    title: 'Nos Categories | WebexpR Pro B2B',
    description:
      'Catalogue complet de bijoux en gros. Solutions professionnelles pour les bijoutiers et revendeurs.',
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  // Charger les catégories depuis l'API Sage (données live)
  const categories = await getCategories();

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-neutral-50">
        <B2BHeaderEcomSpacer showPromoBanner={true} />

        <Container className="relative z-10 py-12 md:py-16">
          <div className="text-center max-w-3xl mx-auto">
            {/* Title */}
            <h1 className="font-sans text-section-title md:text-hero-title font-semibold text-neutral-900 mb-4">
              Nos Categories
            </h1>

            {/* Description */}
            <p className="text-body md:text-body-lg text-neutral-600 leading-relaxed max-w-2xl mx-auto">
              Parcourez notre catalogue professionnel de plus de 10 000 references.
              Trouvez rapidement les produits qui correspondent a vos besoins.
            </p>

            {/* Decorative Line */}
            <div className="w-12 h-[2px] bg-accent mx-auto mt-6" />
          </div>
        </Container>
      </section>

      {/* Categories Grid */}
      <section className="py-12 md:py-16">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                priority={index < 3}
                className={
                  // Make the first category span 2 columns on larger screens
                  index === 0 ? 'md:col-span-2 lg:col-span-1' : ''
                }
              />
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <p className="text-neutral-500 mb-3 text-body-sm">
              Vous ne trouvez pas ce que vous cherchez ?
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors text-body-sm font-medium"
            >
              Contactez notre equipe commerciale
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </div>
        </Container>
      </section>
    </main>
  );
}
