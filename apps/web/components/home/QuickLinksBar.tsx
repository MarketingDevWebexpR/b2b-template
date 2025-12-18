'use client';

import { memo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CategoryIcon } from '@/components/navigation/MegaMenu/CategoryIcon';
import { Tag, Gift } from 'lucide-react';

/**
 * Category from API for QuickLinksBar
 */
export interface QuickLinkCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  productCount?: number;
}

export interface QuickLinksBarProps {
  /** Categories from API (Level 1) */
  categories?: QuickLinkCategory[];
  /** Show promo link */
  showPromo?: boolean;
  /** Show nouveautes link */
  showNouveautes?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * QuickLinksBar Component
 *
 * Displays Level 1 categories as quick access links below the hero.
 * Categories are fetched from the API and passed as props.
 * Optionally includes Promos and Nouveautes links at the end.
 */
export const QuickLinksBar = memo(function QuickLinksBar({
  categories = [],
  showPromo = false,
  showNouveautes = false,
  className,
}: QuickLinksBarProps) {
  // Don't render if no categories
  if (categories.length === 0 && !showPromo && !showNouveautes) {
    return null;
  }

  return (
    <section className={cn('pt-3 pb-6 bg-white border-b border-stroke-light', className)}>
      <div className="container-ecom">
        <nav aria-label="Acces rapide aux categories">
          <ul className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 lg:mx-0 lg:px-0 lg:justify-center lg:flex-wrap">
            {/* Dynamic categories from API */}
            {categories.map((category) => (
              <li key={category.id} className="flex-shrink-0">
                <Link
                  href={`/categorie/${category.slug}`}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full',
                    'text-body-sm font-medium whitespace-nowrap',
                    'border border-stroke transition-all duration-200',
                    'text-content-secondary hover:bg-primary-50 hover:text-primary'
                  )}
                >
                  <CategoryIcon
                    name={category.icon || 'folder'}
                    size="sm"
                    className="w-4 h-4"
                  />
                  <span>{category.name}</span>
                </Link>
              </li>
            ))}

            {/* Promo link (optional) */}
            {showPromo && (
              <li className="flex-shrink-0">
                <Link
                  href="/promotions"
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full',
                    'text-body-sm font-medium whitespace-nowrap',
                    'border border-stroke transition-all duration-200',
                    'text-accent hover:bg-accent-50 hover:text-accent-700'
                  )}
                >
                  <Tag className="w-4 h-4" />
                  <span>Promos</span>
                </Link>
              </li>
            )}

            {/* Nouveautes link (optional) */}
            {showNouveautes && (
              <li className="flex-shrink-0">
                <Link
                  href="/nouveautes"
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full',
                    'text-body-sm font-medium whitespace-nowrap',
                    'border border-stroke transition-all duration-200',
                    'text-success hover:bg-success-50 hover:text-success-700'
                  )}
                >
                  <Gift className="w-4 h-4" />
                  <span>Nouveau</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </section>
  );
});

QuickLinksBar.displayName = 'QuickLinksBar';

export default QuickLinksBar;
