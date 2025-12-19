/**
 * CategoriesSection Component
 *
 * "Nos Categories" showcase section for the homepage.
 * Server Component that fetches root categories and displays them
 * in a beautiful responsive grid.
 *
 * Features:
 * - Async Server Component for SSR
 * - Fetches root categories (depth=0) sorted by rank
 * - Responsive grid (1 col mobile, 3 col tablet, 5 col desktop)
 * - Section header with title and subtitle
 * - Category cards with images, icons, and hover effects
 *
 * V3 API Integration:
 * - Uses /api/categories endpoint with hierarchical category data
 * - Categories have category_lvl0-4 fields for faceting
 * - Supports all_category_handles for filtering
 */

import { cn } from '@/lib/utils';
import { SectionHeader } from './SectionHeader';
import { CategoryCard, type CategoryCardData } from './CategoryCard';

// ============================================================================
// Types
// ============================================================================

export interface CategoriesSectionProps {
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Categories to display (overrides default fetch) */
  categories?: CategoryCardData[];
  /** Maximum number of categories to show */
  maxCategories?: number;
  /** Show "View all" action link */
  showViewAll?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Default Categories (Fallback data)
// ============================================================================

const defaultCategories: CategoryCardData[] = [
  {
    id: 'electricite',
    name: 'Electricite',
    handle: 'electricite',
    icon: 'electricite',
    image_url: '/images/categories/electricite.jpg',
    childCount: 12,
    productCount: 0, // Will be updated from API
    rank: 1,
  },
  {
    id: 'plomberie',
    name: 'Plomberie',
    handle: 'plomberie',
    icon: 'plomberie',
    image_url: '/images/categories/plomberie.jpg',
    childCount: 8,
    productCount: 0, // Will be updated from API
    rank: 2,
  },
  {
    id: 'outillage',
    name: 'Outillage',
    handle: 'outillage',
    icon: 'outillage',
    image_url: '/images/categories/outillage.jpg',
    childCount: 15,
    productCount: 0, // Will be updated from API
    rank: 3,
  },
  {
    id: 'chauffage-climatisation',
    name: 'Chauffage-Climatisation',
    handle: 'chauffage-climatisation',
    icon: 'chauffage',
    image_url: '/images/categories/chauffage.jpg',
    childCount: 10,
    productCount: 0, // Will be updated from API
    rank: 4,
  },
  {
    id: 'quincaillerie',
    name: 'Quincaillerie',
    handle: 'quincaillerie',
    icon: 'quincaillerie',
    image_url: '/images/categories/quincaillerie.jpg',
    childCount: 18,
    productCount: 0, // Will be updated from API
    rank: 5,
  },
];

// ============================================================================
// Data Fetching
// ============================================================================

/**
 * V3 Category Response Type
 */
interface V3CategoryTreeNode {
  id: string;
  name: string;
  handle: string;
  description?: string | null;
  icon?: string | null;
  image_url?: string | null;
  depth: number;
  rank: number;
  product_count: number;
  is_active: boolean;
  children: V3CategoryTreeNode[];
  // V3 hierarchical fields
  path?: string;
  ancestor_names?: string[];
  ancestor_handles?: string[];
}

interface V3CategoryResponse {
  tree: V3CategoryTreeNode[];
  flat: Array<{
    id: string;
    name: string;
    handle: string;
    depth: number;
    rank: number;
    product_count: number;
    is_active: boolean;
  }>;
  total: number;
  maxDepth: number;
}

/**
 * Fetch root categories from v3 API
 * Returns categories at depth 0, sorted by rank
 */
async function fetchRootCategories(): Promise<CategoryCardData[]> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      console.warn('[CategoriesSection] API error, using defaults');
      return defaultCategories;
    }

    const data: V3CategoryResponse = await response.json();
    const rootCategories = data.tree || [];

    if (rootCategories.length === 0) {
      return defaultCategories;
    }

    // Transform v3 API categories to CategoryCardData format
    return rootCategories
      .filter((cat) => cat.is_active)
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        handle: cat.handle,
        icon: cat.icon || undefined,
        image_url: cat.image_url || undefined,
        childCount: cat.children?.length || 0,
        productCount: cat.product_count || 0,
        rank: cat.rank || 0,
      }))
      .sort((a, b) => (a.rank || 0) - (b.rank || 0));
  } catch (error) {
    console.error('[CategoriesSection] Error fetching categories:', error);
    return defaultCategories;
  }
}

// ============================================================================
// Component
// ============================================================================

export async function CategoriesSection({
  title = 'Nos Catégories',
  subtitle = 'Parcourez notre catalogue par univers produit',
  categories: propCategories,
  maxCategories = 5,
  showViewAll = true,
  className,
}: CategoriesSectionProps) {
  // Use provided categories or fetch from API
  const categories = propCategories || await fetchRootCategories();

  // Limit to maxCategories
  const displayCategories = categories.slice(0, maxCategories);

  if (displayCategories.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        'py-10 lg:py-16 bg-white',
        className
      )}
      aria-labelledby="categories-section-title"
    >
      <div className="container-ecom">
        {/* Section Header */}
        <SectionHeader
          title={title}
          subtitle={subtitle}
          align="center"
          showUnderline={true}
          action={
            showViewAll
              ? {
                  label: 'Voir toutes les catégories',
                  href: '/categorie',
                }
              : undefined
          }
        />

        {/* Categories Grid */}
        <div
          className={cn(
            'grid gap-4 lg:gap-6',
            // Responsive grid columns
            'grid-cols-1',           // Mobile: 1 column
            'sm:grid-cols-2',        // Small: 2 columns
            'md:grid-cols-3',        // Medium: 3 columns
            'lg:grid-cols-5',        // Large: 5 columns
          )}
          role="list"
          aria-label="Liste des catégories principales"
        >
          {displayCategories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              // Preload first 3 images for better LCP
              priority={index < 3}
            />
          ))}
        </div>

        {/* Mobile "View All" link */}
        {showViewAll && (
          <div className="mt-6 text-center lg:hidden">
            <a
              href="/categorie"
              className={cn(
                'inline-flex items-center gap-2',
                'px-6 py-3',
                'text-body font-medium text-accent',
                'bg-accent-50 hover:bg-accent-100',
                'rounded-lg',
                'transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
              )}
            >
              Voir toutes les catégories
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export default CategoriesSection;
