import { Metadata } from 'next';
import { getCategories } from '@/lib/api';
import { Container } from '@/components/ui/Container';
import { HeaderSpacer } from '@/components/layout/Header';
import { CategoryCard } from '@/components/categories/CategoryCard';

export const metadata: Metadata = {
  title: 'Nos Collections | Maison Joaillerie',
  description:
    'Decouvrez nos collections de bijoux d\'exception : bagues, colliers, bracelets, boucles d\'oreilles et montres de luxe. Chaque piece est une oeuvre unique creee par nos artisans joailliers.',
  openGraph: {
    title: 'Nos Collections | Maison Joaillerie',
    description:
      'Explorez nos collections de haute joaillerie. Des pieces d\'exception alliant savoir-faire artisanal et design contemporain.',
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  // Charger les catégories depuis l'API Sage (données live)
  const categories = await getCategories();

  return (
    <main className="min-h-screen bg-luxury-black">
      {/* Hero Header */}
      <section className="relative overflow-hidden">
        <HeaderSpacer />
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <Container className="relative z-10 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            {/* Decorative Line */}
            <div className="w-16 h-[2px] bg-gold-500 mx-auto mb-8" />

            {/* Title */}
            <h1 className="font-serif text-display-2 md:text-display-1 text-white mb-6">
              Nos Collections
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-luxury-silver leading-relaxed">
              Explorez nos collections de haute joaillerie, ou chaque piece raconte une histoire
              d&apos;elegance et de raffinement. Des creations uniques faconnees par nos maitres
              artisans.
            </p>

            {/* Decorative Line */}
            <div className="w-16 h-[2px] bg-gold-500 mx-auto mt-8" />
          </div>
        </Container>
      </section>

      {/* Categories Grid */}
      <section className="pb-20 md:pb-32">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
          <div className="mt-16 text-center">
            <p className="text-luxury-silver mb-4">
              Vous ne trouvez pas ce que vous cherchez ?
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 text-gold-500 hover:text-gold-400 transition-colors text-sm uppercase tracking-wider"
            >
              Contactez nos conseillers
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
