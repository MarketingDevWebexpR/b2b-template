'use client';

/**
 * BrandHero Component
 *
 * Hero section for brand detail pages featuring:
 * - Large brand logo with fallback initials
 * - Brand name and description
 * - Country of origin and founded year
 * - Product count
 * - Premium/favorite badge
 * - Website link
 *
 * @packageDocumentation
 */

import { memo, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Award,
  Globe,
  MapPin,
  Calendar,
  Package,
  ExternalLink,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Brand } from '@/types/brand';

// ============================================================================
// Types
// ============================================================================

export interface BrandHeroProps {
  /** Brand data */
  brand: Brand & {
    website_url?: string | null;
    founded_year?: number | null;
  };
  /** Number of products */
  productCount: number;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const BRAND_COLORS = [
  { bg: '#fef3c7', text: '#92400e' },
  { bg: '#dbeafe', text: '#1e40af' },
  { bg: '#dcfce7', text: '#166534' },
  { bg: '#fce7f3', text: '#9d174d' },
  { bg: '#e0e7ff', text: '#3730a3' },
  { bg: '#ffedd5', text: '#c2410c' },
  { bg: '#f3e8ff', text: '#7c3aed' },
  { bg: '#ccfbf1', text: '#0f766e' },
  { bg: '#fef9c3', text: '#854d0e' },
  { bg: '#fee2e2', text: '#b91c1c' },
];

// ============================================================================
// Helper Functions
// ============================================================================

function getInitials(name: string): string {
  const words = name.split(' ').filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getBrandColor(name: string) {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return BRAND_COLORS[hash % BRAND_COLORS.length];
}

// ============================================================================
// Animation Variants
// ============================================================================

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// ============================================================================
// Sub-Components
// ============================================================================

interface InfoBadgeProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
}

const InfoBadge = memo(function InfoBadge({ icon: Icon, label, value }: InfoBadgeProps) {
  return (
    <div className="flex items-center gap-2 text-neutral-600">
      <Icon className="w-4 h-4 text-neutral-400" />
      <span className="text-sm">
        <span className="sr-only">{label}: </span>
        {value}
      </span>
    </div>
  );
});

InfoBadge.displayName = 'InfoBadge';

// ============================================================================
// Main Component
// ============================================================================

/**
 * BrandHero - Hero section for brand detail page
 *
 * @example
 * ```tsx
 * <BrandHero
 *   brand={{
 *     id: '1',
 *     name: 'Cartier',
 *     slug: 'cartier',
 *     logo_url: '/brands/cartier.png',
 *     country: 'France',
 *     description: 'Maison de haute joaillerie...',
 *     website_url: 'https://www.cartier.com',
 *     founded_year: 1847,
 *     product_count: 150,
 *     is_premium: true,
 *   }}
 *   productCount={150}
 * />
 * ```
 */
export const BrandHero = memo(function BrandHero({
  brand,
  productCount,
  className,
}: BrandHeroProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = useCallback(() => setImageError(true), []);
  const handleImageLoad = useCallback(() => setImageLoaded(true), []);

  const isPremium = brand.is_premium || brand.is_favorite;
  const initials = getInitials(brand.name);
  const color = getBrandColor(brand.name);

  return (
    <section
      className={cn(
        'relative bg-gradient-to-b from-neutral-50 to-white',
        'py-12 lg:py-16',
        'border-b border-neutral-200',
        className
      )}
      aria-labelledby="brand-hero-title"
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      <Container className="relative">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12"
        >
          {/* Brand Logo */}
          <motion.div variants={fadeInUp} className="flex-shrink-0">
            <div className="relative">
              {brand.logo_url && !imageError ? (
                <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-2xl overflow-hidden bg-white shadow-lg border border-neutral-200">
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-neutral-100 animate-pulse" />
                  )}
                  <Image
                    src={brand.logo_url}
                    alt={`Logo ${brand.name}`}
                    fill
                    sizes="(max-width: 1024px) 128px, 160px"
                    className={cn(
                      'object-contain p-4 transition-opacity duration-500',
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    )}
                    priority
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                  />
                </div>
              ) : (
                <div
                  className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl flex items-center justify-center text-4xl lg:text-5xl font-bold shadow-lg"
                  style={{ backgroundColor: color.bg, color: color.text }}
                >
                  {initials}
                </div>
              )}

              {/* Premium indicator */}
              {isPremium && (
                <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-2 rounded-full shadow-lg">
                  <Star className="w-4 h-4 fill-current" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Brand Info */}
          <motion.div variants={fadeInUp} className="flex-1 text-center lg:text-left">
            {/* Badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-4">
              {isPremium && (
                <Badge variant="primary" size="md" className="gap-1.5">
                  <Award className="w-4 h-4" />
                  Marque Premium
                </Badge>
              )}
              {brand.is_favorite && (
                <Badge variant="warning" size="md" className="gap-1.5">
                  <Star className="w-4 h-4 fill-current" />
                  Favoris
                </Badge>
              )}
            </div>

            {/* Brand Name */}
            <h1
              id="brand-hero-title"
              className="text-3xl lg:text-4xl xl:text-5xl font-bold text-neutral-900 mb-4"
            >
              {brand.name}
            </h1>

            {/* Description */}
            {brand.description && (
              <p className="text-lg text-neutral-600 max-w-2xl mb-6 leading-relaxed">
                {brand.description}
              </p>
            )}

            {/* Info Badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 lg:gap-6 mb-6">
              {brand.country && (
                <InfoBadge icon={MapPin} label="Pays" value={brand.country} />
              )}
              {brand.founded_year && (
                <InfoBadge
                  icon={Calendar}
                  label="Fondee en"
                  value={`Fondee en ${brand.founded_year}`}
                />
              )}
              <InfoBadge
                icon={Package}
                label="Produits"
                value={`${productCount} produit${productCount !== 1 ? 's' : ''}`}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              {/* Scroll to products */}
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  document.getElementById('brand-products')?.scrollIntoView({
                    behavior: 'smooth',
                  });
                }}
              >
                <Package className="w-4 h-4 mr-2" />
                Voir les produits ({productCount})
              </Button>

              {/* Website link */}
              {brand.website_url && (
                <a
                  href={brand.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'inline-flex items-center justify-center gap-2',
                    'h-13 px-8 text-lg',
                    'bg-transparent text-accent',
                    'border-2 border-accent rounded-lg',
                    'hover:bg-accent/5 transition-colors',
                    'font-medium'
                  )}
                >
                  <Globe className="w-4 h-4" />
                  Site officiel
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
});

BrandHero.displayName = 'BrandHero';

export default BrandHero;
