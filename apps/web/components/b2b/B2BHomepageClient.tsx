'use client';

/**
 * B2BHomepageClient Component
 *
 * Client-side homepage component for B2B jewelry platform featuring:
 * - Personalized hero with company name
 * - Quick actions (Quick Order, Quotes, Recommendations)
 * - Category grid with images
 * - Trending products / New arrivals
 * - Current promotions (if module active)
 * - Quick statistics (pending orders, quotes)
 *
 * Uses feature gates to conditionally display modules.
 *
 * @packageDocumentation
 */

import { memo, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  FileText,
  Sparkles,
  TrendingUp,
  Package,
  Clock,
  ChevronRight,
  Star,
  Percent,
  ArrowRight,
  LayoutGrid,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMockData } from '@/hooks/useMockData';
import {
  useFeatures,
  useQuickOrderFeatures,
  useQuotesFeatures,
  useDashboardFeatures,
} from '@/contexts/FeatureContext';
import { ModuleGate } from '@/components/features/FeatureGate';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { CarouselProduct } from '@/components/home';

// ============================================================================
// Types
// ============================================================================

export interface B2BHomepageClientProps {
  /** Additional CSS classes */
  className?: string;
}

interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'accent';
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend?: string;
  href?: string;
}

interface CategoryCardProps {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  image?: string;
}

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Hero Section with personalized welcome message
 */
const HeroSection = memo(function HeroSection({
  companyName,
  userName,
}: {
  companyName: string;
  userName: string;
}) {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Bonjour' : currentHour < 18 ? 'Bon apres-midi' : 'Bonsoir';

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-12 lg:py-16">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {/* Decorative gradient orb */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        aria-hidden="true"
      />

      <div className="relative container mx-auto px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <Badge variant="primary-soft" size="md" className="mb-4">
            Espace Professionnel B2B
          </Badge>
          <h1 className="text-3xl lg:text-5xl font-bold text-white mb-3">
            {greeting}, {userName}
          </h1>
          <p className="text-lg lg:text-xl text-white/80 mb-2">
            Bienvenue sur l&apos;espace{' '}
            <span className="text-accent font-semibold">{companyName}</span>
          </p>
          <p className="text-base text-white/60 max-w-xl">
            Accedez a votre catalogue personnalise, gerez vos commandes et
            beneficiez de tarifs preferentiels.
          </p>
        </motion.div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

/**
 * Quick Action Card Component
 */
const QuickAction = memo(function QuickAction({
  icon,
  title,
  description,
  href,
  variant = 'secondary',
}: QuickActionProps) {
  const variants = {
    primary: 'bg-accent text-white hover:bg-accent/90',
    secondary: 'bg-white text-neutral-900 hover:bg-neutral-50 border border-neutral-200',
    accent: 'bg-gradient-to-br from-accent to-orange-600 text-white hover:opacity-90',
  };

  return (
    <Link href={href} className="block group">
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'relative overflow-hidden rounded-xl p-5 lg:p-6',
          'transition-all duration-200',
          'shadow-sm hover:shadow-md',
          variants[variant]
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center',
              variant === 'secondary'
                ? 'bg-accent/10 text-accent'
                : 'bg-white/20 text-white'
            )}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                'font-semibold text-lg mb-1',
                variant === 'secondary' ? 'text-neutral-900' : 'text-white'
              )}
            >
              {title}
            </h3>
            <p
              className={cn(
                'text-sm',
                variant === 'secondary' ? 'text-neutral-500' : 'text-white/80'
              )}
            >
              {description}
            </p>
          </div>
          <ChevronRight
            className={cn(
              'w-5 h-5 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity',
              variant === 'secondary' ? 'text-neutral-400' : 'text-white'
            )}
          />
        </div>
      </motion.div>
    </Link>
  );
});

QuickAction.displayName = 'QuickAction';

/**
 * Statistics Card Component
 */
const StatCard = memo(function StatCard({
  icon,
  label,
  value,
  trend,
  href,
}: StatCardProps) {
  const content = (
    <Card variant="outlined" size="md" className="h-full hover:border-accent/30 transition-colors">
      <CardContent className="flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-neutral-500 mb-0.5">{label}</p>
          <p className="text-2xl font-bold text-neutral-900">{value}</p>
          {trend && (
            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </p>
          )}
        </div>
        {href && (
          <ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0" />
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
});

StatCard.displayName = 'StatCard';

/**
 * Category Card Component
 */
const CategoryCard = memo(function CategoryCard({
  name,
  slug,
  productCount,
}: CategoryCardProps) {
  return (
    <Link href={`/categories/${slug}`} className="block group">
      <motion.div
        whileHover={{ y: -4 }}
        className={cn(
          'relative overflow-hidden rounded-xl',
          'bg-gradient-to-br from-neutral-100 to-neutral-200',
          'aspect-[4/3]',
          'transition-all duration-300',
          'hover:shadow-lg'
        )}
      >
        {/* Placeholder for image */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <LayoutGrid className="w-16 h-16 text-neutral-400" />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-semibold text-white text-lg mb-1 group-hover:text-accent transition-colors">
            {name}
          </h3>
          <p className="text-white/70 text-sm">
            {productCount.toLocaleString('fr-FR')} produits
          </p>
        </div>
      </motion.div>
    </Link>
  );
});

CategoryCard.displayName = 'CategoryCard';

/**
 * Product Card Component for trending/new products
 */
const ProductCard = memo(function ProductCard({
  product,
}: {
  product: CarouselProduct;
}) {
  return (
    <Link href={product.href} className="block group">
      <motion.div
        whileHover={{ y: -4 }}
        className={cn(
          'bg-white rounded-xl overflow-hidden',
          'border border-neutral-200',
          'transition-all duration-300',
          'hover:shadow-lg hover:border-accent/30'
        )}
      >
        {/* Image */}
        <div className="relative aspect-square bg-neutral-100">
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-12 h-12 text-neutral-300" />
          </div>

          {/* Badge */}
          {product.badge && (
            <span
              className={cn(
                'absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded',
                product.badge.variant === 'promo' && 'bg-red-500 text-white',
                product.badge.variant === 'new' && 'bg-emerald-500 text-white',
                product.badge.variant === 'premium' && 'bg-accent text-white'
              )}
            >
              {product.badge.label}
            </span>
          )}

          {/* Discount */}
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="absolute top-2 right-2 px-2 py-1 text-xs font-bold bg-red-500 text-white rounded">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs text-neutral-500 mb-1">{product.brand}</p>
          <h3 className="font-medium text-neutral-900 text-sm mb-1 line-clamp-2 group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-neutral-400 mb-2">Ref: {product.sku}</p>

          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                'font-bold',
                product.originalPrice ? 'text-red-600' : 'text-neutral-900'
              )}
            >
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              }).format(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-neutral-400 line-through">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                }).format(product.originalPrice)}
              </span>
            )}
          </div>

          {product.stock && (
            <p
              className={cn(
                'text-xs mt-2',
                product.stock.level === 'high' && 'text-emerald-600',
                product.stock.level === 'medium' && 'text-amber-600',
                product.stock.level === 'low' && 'text-amber-600',
                product.stock.level === 'out' && 'text-red-600'
              )}
            >
              {product.stock.label}
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';

/**
 * Promotion Banner Component
 */
const PromotionBanner = memo(function PromotionBanner({
  title,
  description,
  discount,
  href,
}: {
  title: string;
  description: string;
  discount: string;
  href: string;
}) {
  return (
    <Link href={href} className="block group">
      <motion.div
        whileHover={{ scale: 1.01 }}
        className={cn(
          'relative overflow-hidden rounded-2xl',
          'bg-gradient-to-r from-accent via-orange-500 to-amber-500',
          'p-6 lg:p-8'
        )}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-3">
              <Percent className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">{discount}</span>
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">{title}</h3>
            <p className="text-white/80 text-sm lg:text-base">{description}</p>
          </div>
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <ArrowRight className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
});

PromotionBanner.displayName = 'PromotionBanner';

// ============================================================================
// Main Component
// ============================================================================

export const B2BHomepageClient = memo(function B2BHomepageClient({
  className,
}: B2BHomepageClientProps) {
  // Hooks
  const { catalog, orders, quotes, company } = useMockData();
  const { isEnabled: isQuickOrderEnabled } = useQuickOrderFeatures();
  const { isEnabled: isQuotesEnabled } = useQuotesFeatures();
  const { isEnabled: isDashboardEnabled } = useDashboardFeatures();

  // Transform products to carousel format
  const trendingProducts: CarouselProduct[] = useMemo(() => {
    return catalog.bestSellers.slice(0, 8).map((product) => ({
      id: product.id,
      name: product.name,
      brand: product.material || 'WebexpR Pro',
      sku: product.sku,
      price: product.price,
      originalPrice: product.compareAtPrice,
      image: product.thumbnail,
      href: `/produit/${product.slug}`,
      badge: product.isBestSeller
        ? { label: 'Best-seller', variant: 'premium' as const }
        : undefined,
      stock: {
        level:
          product.stockQuantity > 10
            ? ('high' as const)
            : product.stockQuantity > 3
            ? ('medium' as const)
            : product.stockQuantity > 0
            ? ('low' as const)
            : ('out' as const),
        label:
          product.stockQuantity > 10
            ? 'En stock'
            : product.stockQuantity > 3
            ? 'Stock limite'
            : product.stockQuantity > 0
            ? `Plus que ${product.stockQuantity}`
            : 'Rupture',
      },
    }));
  }, [catalog.bestSellers]);

  const newArrivals: CarouselProduct[] = useMemo(() => {
    return catalog.newProducts.slice(0, 8).map((product) => ({
      id: product.id,
      name: product.name,
      brand: product.material || 'WebexpR Pro',
      sku: product.sku,
      price: product.price,
      originalPrice: product.compareAtPrice,
      image: product.thumbnail,
      href: `/produit/${product.slug}`,
      badge: { label: 'Nouveau', variant: 'new' as const },
      stock: {
        level:
          product.stockQuantity > 10
            ? ('high' as const)
            : product.stockQuantity > 3
            ? ('medium' as const)
            : product.stockQuantity > 0
            ? ('low' as const)
            : ('out' as const),
        label:
          product.stockQuantity > 10
            ? 'En stock'
            : product.stockQuantity > 3
            ? 'Stock limite'
            : product.stockQuantity > 0
            ? `Plus que ${product.stockQuantity}`
            : 'Rupture',
      },
    }));
  }, [catalog.newProducts]);

  const promoProducts: CarouselProduct[] = useMemo(() => {
    return catalog.onSaleProducts.slice(0, 8).map((product) => ({
      id: product.id,
      name: product.name,
      brand: product.material || 'WebexpR Pro',
      sku: product.sku,
      price: product.price,
      originalPrice: product.compareAtPrice,
      image: product.thumbnail,
      href: `/produit/${product.slug}`,
      badge: { label: 'Promo', variant: 'promo' as const },
      stock: {
        level:
          product.stockQuantity > 10
            ? ('high' as const)
            : product.stockQuantity > 3
            ? ('medium' as const)
            : product.stockQuantity > 0
            ? ('low' as const)
            : ('out' as const),
        label:
          product.stockQuantity > 10
            ? 'En stock'
            : product.stockQuantity > 3
            ? 'Stock limite'
            : product.stockQuantity > 0
            ? `Plus que ${product.stockQuantity}`
            : 'Rupture',
      },
    }));
  }, [catalog.onSaleProducts]);

  // Get parent categories only
  const mainCategories = useMemo(() => {
    return catalog.parentCategories.slice(0, 6);
  }, [catalog.parentCategories]);

  return (
    <div className={cn('min-h-screen bg-neutral-50', className)}>
      {/* Hero Section */}
      <HeroSection
        companyName={company.currentCompany.name}
        userName={company.currentUser.firstName}
      />

      {/* Quick Actions Section */}
      <section className="py-8 lg:py-12 bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Quick Order - conditionally shown */}
            <ModuleGate module="quickOrder">
              <QuickAction
                icon={<Zap className="w-6 h-6" />}
                title="Commande rapide"
                description="Commandez par reference ou importez votre liste"
                href="/commande-rapide"
                variant="accent"
              />
            </ModuleGate>

            {/* Quotes - conditionally shown */}
            <ModuleGate module="quotes">
              <QuickAction
                icon={<FileText className="w-6 h-6" />}
                title="Mes devis"
                description="Consultez et gerez vos demandes de devis"
                href="/devis"
                variant="secondary"
              />
            </ModuleGate>

            {/* Recommendations - always shown */}
            <QuickAction
              icon={<Sparkles className="w-6 h-6" />}
              title="Recommandations"
              description="Produits selectionnes pour vous"
              href="/recommandations"
              variant="secondary"
            />
          </div>
        </div>
      </section>

      {/* Statistics Section - conditionally shown */}
      <ModuleGate module="dashboard">
        <section className="py-8 lg:py-10 bg-white">
          <div className="container mx-auto px-4 lg:px-6">
            <h2 className="text-xl lg:text-2xl font-bold text-neutral-900 mb-6">
              Votre activite
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<ShoppingCart className="w-5 h-5" />}
                label="Commandes en cours"
                value={orders.stats.pending + orders.stats.processing}
                href="/commandes"
              />
              <ModuleGate module="quotes">
                <StatCard
                  icon={<FileText className="w-5 h-5" />}
                  label="Devis en attente"
                  value={quotes.stats.pending}
                  href="/devis"
                />
              </ModuleGate>
              <StatCard
                icon={<Package className="w-5 h-5" />}
                label="Livraisons a venir"
                value={orders.stats.shipped}
                href="/commandes?status=shipped"
              />
              <StatCard
                icon={<Clock className="w-5 h-5" />}
                label="Commandes ce mois"
                value={orders.orders.length}
                trend="+12% vs mois dernier"
              />
            </div>
          </div>
        </section>
      </ModuleGate>

      {/* Categories Grid */}
      <section className="py-10 lg:py-14 bg-neutral-50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900">
                Categories principales
              </h2>
              <p className="text-neutral-500 mt-1">
                Explorez notre catalogue par type de bijou
              </p>
            </div>
            <Link
              href="/categories"
              className="hidden sm:inline-flex items-center gap-2 text-accent font-medium hover:underline"
            >
              Toutes les categories
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {mainCategories.map((category) => (
              <CategoryCard
                key={category.id}
                id={category.id}
                name={category.name}
                slug={category.slug}
                productCount={category.productCount}
              />
            ))}
          </div>

          <div className="sm:hidden mt-6 text-center">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-medium"
            >
              Toutes les categories
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-10 lg:py-14 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-accent mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">
                  Tendances
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900">
                Produits populaires
              </h2>
              <p className="text-neutral-500 mt-1">
                Les best-sellers de nos clients professionnels
              </p>
            </div>
            <Link
              href="/produits?sort=popular"
              className="hidden sm:inline-flex items-center gap-2 text-accent font-medium hover:underline"
            >
              Voir tous les produits
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="sm:hidden mt-6 text-center">
            <Link
              href="/produits?sort=popular"
              className="inline-flex items-center gap-2 px-6 py-3 border border-accent text-accent rounded-lg font-medium hover:bg-accent hover:text-white transition-colors"
            >
              Voir tous les produits
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Promotions Section */}
      <ModuleGate module="catalog">
        {promoProducts.length > 0 && (
          <section className="py-10 lg:py-14 bg-neutral-50">
            <div className="container mx-auto px-4 lg:px-6">
              {/* Promo Banner */}
              <PromotionBanner
                title="Offres speciales professionnels"
                description="Profitez de remises exclusives sur une selection de bijoux. Offre limitee dans le temps."
                discount="Jusqu'a -30%"
                href="/promotions"
              />

              <div className="mt-8">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-neutral-900">
                      Selection en promotion
                    </h3>
                  </div>
                  <Link
                    href="/promotions"
                    className="hidden sm:inline-flex items-center gap-2 text-accent font-medium hover:underline"
                  >
                    Toutes les promos
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                  {promoProducts.slice(0, 4).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </ModuleGate>

      {/* New Arrivals */}
      <section className="py-10 lg:py-14 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-emerald-600 mb-2">
                <Star className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">
                  Nouveautes
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900">
                Dernieres arrivees
              </h2>
              <p className="text-neutral-500 mt-1">
                Decouvrez les nouveaux produits de notre catalogue
              </p>
            </div>
            <Link
              href="/nouveautes"
              className="hidden sm:inline-flex items-center gap-2 text-accent font-medium hover:underline"
            >
              Voir les nouveautes
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="sm:hidden mt-6 text-center">
            <Link
              href="/nouveautes"
              className="inline-flex items-center gap-2 px-6 py-3 border border-accent text-accent rounded-lg font-medium hover:bg-accent hover:text-white transition-colors"
            >
              Voir les nouveautes
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-16 bg-gradient-to-br from-neutral-900 to-neutral-800">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                Pret a passer commande ?
              </h2>
              <p className="text-white/70 max-w-lg">
                Accedez a votre panier ou utilisez notre outil de commande rapide pour
                gagner du temps.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <ModuleGate module="quickOrder">
                <Link href="/commande-rapide">
                  <Button variant="primary" size="lg" className="gap-2">
                    <Zap className="w-5 h-5" />
                    Commande rapide
                  </Button>
                </Link>
              </ModuleGate>
              <ModuleGate module="quotes">
                <Link href="/devis/nouveau">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="gap-2 border-white/30 text-white hover:bg-white/10"
                  >
                    <FileText className="w-5 h-5" />
                    Demander un devis
                  </Button>
                </Link>
              </ModuleGate>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

B2BHomepageClient.displayName = 'B2BHomepageClient';

export default B2BHomepageClient;
