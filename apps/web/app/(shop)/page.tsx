import type { Metadata } from 'next';
import {
  HeroCarousel,
  QuickLinksBar,
  CategoryShowcaseEcom,
  ProductCarouselSection,
  ServicesHighlights,
  PromoBanner,
  Newsletter,
  type CarouselProduct,
  type CategoryCard,
} from '@/components/home';
import { getCategories, getProducts } from '@/lib/api';

export const metadata: Metadata = {
  title: 'WebexpR Pro | Grossiste en Bijoux B2B - Fournisseur Professionnel',
  description:
    'WebexpR Pro, votre grossiste en bijoux B2B depuis 1987. Large catalogue de bagues, colliers, bracelets et montres. Livraison express 24h, paiement differe, prix professionnels.',
  keywords: [
    'grossiste bijoux',
    'fournisseur bijoux B2B',
    'bijoux en gros',
    'bijoux professionnels',
    'bagues grossiste',
    'colliers en gros',
    'bracelets professionnels',
    'montres B2B',
  ],
  openGraph: {
    title: 'WebexpR Pro | Grossiste en Bijoux B2B',
    description:
      'Votre fournisseur de confiance pour les bijoux en gros. Catalogue de +10 000 references, livraison express, paiement differe.',
    type: 'website',
    locale: 'fr_FR',
    url: 'https://webexprpro.fr',
    siteName: 'WebexpR Pro',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'WebexpR Pro - Grossiste en Bijoux B2B',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WebexpR Pro | Grossiste en Bijoux B2B',
    description:
      'Votre fournisseur de confiance pour les bijoux en gros. Catalogue de +10 000 references.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://webexprpro.fr',
  },
};

export const dynamic = 'force-dynamic';

/**
 * Transform API products to CarouselProduct format
 */
function transformToCarouselProducts(products: Awaited<ReturnType<typeof getProducts>>): CarouselProduct[] {
  return products.slice(0, 12).map((product) => ({
    id: product.id,
    name: product.name,
    brand: product.brand || 'WebexpR Pro',
    sku: product.reference || `REF-${product.id.slice(0, 6)}`,
    price: product.price,
    originalPrice: product.compareAtPrice || undefined,
    image: product.images[0] || '/images/placeholder-product.svg',
    href: `/produits/${product.slug || product.id}`,
    badge: product.isNew
      ? { label: 'Nouveau', variant: 'new' as const }
      : product.compareAtPrice && product.compareAtPrice > product.price
      ? { label: 'Promo', variant: 'promo' as const }
      : undefined,
    stock: {
      level: product.stock > 20 ? 'high' : product.stock > 5 ? 'medium' : product.stock > 0 ? 'low' : 'out',
      label: product.stock > 20
        ? 'En stock'
        : product.stock > 5
        ? 'Stock limite'
        : product.stock > 0
        ? `Plus que ${product.stock}`
        : 'Rupture',
    } as CarouselProduct['stock'],
  }));
}

/**
 * Transform API categories to CategoryCard format
 */
function transformToCategoryCards(categories: Awaited<ReturnType<typeof getCategories>>): CategoryCard[] {
  return categories.slice(0, 6).map((category, index) => ({
    id: category.id,
    name: category.name,
    description: category.description || undefined,
    href: `/categories/${category.slug || category.id}`,
    productCount: category.productCount || Math.floor(Math.random() * 500) + 100,
    featured: index < 2, // First 2 categories are featured
  }));
}

/**
 * Home Page - E-commerce B2B Style (Leroy Merlin inspired)
 *
 * Structure:
 * - Hero Carousel with promotional slides
 * - Quick links bar for fast category access
 * - Services highlights (shipping, payment, support)
 * - Category showcase with featured categories
 * - Product carousels (trending, new arrivals, promotions)
 * - Promotional banner with countdown
 * - Newsletter subscription
 */
export default async function HomePage() {
  // Fetch data in parallel
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let products: Awaited<ReturnType<typeof getProducts>> = [];

  try {
    const [categoriesResult, productsResult] = await Promise.all([
      getCategories(),
      getProducts(),
    ]);
    categories = categoriesResult;
    products = productsResult;
  } catch (error) {
    console.error('Failed to fetch data for HomePage:', error);
  }

  // Transform data for components
  const categoryCards = transformToCategoryCards(categories);
  const trendingProducts = transformToCarouselProducts(products.slice(0, 12));
  const newArrivals = transformToCarouselProducts(
    products.filter((p) => p.isNew).slice(0, 12)
  );
  const promoProducts = transformToCarouselProducts(
    products.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price).slice(0, 12)
  );

  // Promo banner end date (7 days from now)
  const promoEndDate = new Date();
  promoEndDate.setDate(promoEndDate.getDate() + 7);

  return (
    <>
      {/* Hero Carousel - Promotional slides */}
      <HeroCarousel />

      {/* Quick Links - Fast category access */}
      <QuickLinksBar />

      {/* Services - Shipping, payment, support highlights */}
      <ServicesHighlights />

      {/* Categories Showcase - Featured categories grid */}
      <CategoryShowcaseEcom
        title="Nos categories"
        subtitle="Parcourez notre catalogue de plus de 10 000 references"
        categories={categoryCards}
      />

      {/* Trending Products Carousel */}
      {trendingProducts.length > 0 && (
        <ProductCarouselSection
          title="Tendances du moment"
          subtitle="Les produits les plus demandes par nos clients"
          products={trendingProducts}
          viewAllHref="/produits?sort=popular"
          viewAllLabel="Voir toutes les tendances"
          variant="highlight"
        />
      )}

      {/* Promo Banner */}
      <PromoBanner
        title="Offre Pro: -20% sur les commandes"
        description="Profitez de remises exceptionnelles sur tout le catalogue avec le code PRO20. Valable pour toute commande superieure a 300€ HT."
        badge="-20%"
        ctaText="En profiter maintenant"
        ctaLink="/promotions"
        endDate={promoEndDate}
        variant="gradient"
      />

      {/* New Arrivals Carousel */}
      {newArrivals.length > 0 && (
        <ProductCarouselSection
          title="Nouveautes"
          subtitle="Les dernieres pieces ajoutees a notre catalogue"
          products={newArrivals}
          viewAllHref="/nouveautes"
          viewAllLabel="Voir toutes les nouveautes"
        />
      )}

      {/* Promo Products Carousel */}
      {promoProducts.length > 0 && (
        <ProductCarouselSection
          title="Promotions"
          subtitle="Des prix exceptionnels sur une selection de bijoux"
          products={promoProducts}
          viewAllHref="/promotions"
          viewAllLabel="Voir toutes les promos"
          variant="highlight"
        />
      )}

      {/* Newsletter */}
      <Newsletter />
    </>
  );
}
