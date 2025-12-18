import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FolderTree, Package, Layers, ChevronRight } from 'lucide-react';
import { Container, Skeleton, Badge } from '@/components/ui';
import { CategoryTree, SubcategoriesGrid } from '@/components/categories';
import type { CategoryResponse } from '@/types/category';

/**
 * Categories Listing Page
 *
 * Main entry point for browsing all categories.
 * Displays:
 * - Hero section with stats
 * - Interactive category tree
 * - Grid of level 1 categories
 * - Quick navigation by level
 *
 * URL: /categorie
 */

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'Categories | WebexpR Pro B2B',
  description:
    'Parcourez notre catalogue complet de categories de bijoux professionnels. Plus de 5 niveaux de navigation pour trouver exactement ce que vous cherchez.',
  openGraph: {
    title: 'Toutes les categories | WebexpR Pro B2B',
    description: 'Catalogue complet de categories de bijoux professionnels B2B.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ============================================================================
// Data Fetching
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function getCategoriesData(): Promise<CategoryResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(`[Categories Page] API error: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('[Categories Page] Error fetching categories:', error);
    return null;
  }
}

// ============================================================================
// Loading Component
// ============================================================================

function CategoriesLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <Container>
        {/* Hero skeleton */}
        <div className="bg-white rounded-xl p-8 mb-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-5 w-full max-w-xl mb-6" />
          <div className="flex gap-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-xl" />
          ))}
        </div>
      </Container>
    </div>
  );
}

// ============================================================================
// Hero Section
// ============================================================================

interface HeroSectionProps {
  totalCategories: number;
  totalProducts: number;
  maxDepth: number;
}

function HeroSection({ totalCategories, totalProducts, maxDepth }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 rounded-2xl mb-8">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      <div className="relative p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
          Toutes les categories
        </h1>
        <p className="text-lg text-white/80 max-w-2xl mb-8">
          Explorez notre catalogue complet organise en categories hierarchiques.
          Naviguez facilement jusqu'a {maxDepth + 1} niveaux de profondeur pour
          trouver exactement ce que vous recherchez.
        </p>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-6 md:gap-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-lg">
              <FolderTree className="w-6 h-6 text-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {totalCategories.toLocaleString('fr-FR')}
              </div>
              <div className="text-sm text-white/60">Categories</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-lg">
              <Package className="w-6 h-6 text-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {totalProducts.toLocaleString('fr-FR')}
              </div>
              <div className="text-sm text-white/60">Produits</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-lg">
              <Layers className="w-6 h-6 text-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{maxDepth + 1}</div>
              <div className="text-sm text-white/60">Niveaux</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Quick Navigation by Level
// ============================================================================

interface QuickNavProps {
  categoriesByDepth: Map<number, number>;
  maxDepth: number;
}

function QuickNav({ categoriesByDepth, maxDepth }: QuickNavProps) {
  const depthNames: Record<number, string> = {
    0: 'Categories principales',
    1: 'Sous-categories',
    2: 'Niveau 3',
    3: 'Niveau 4',
    4: 'Niveau 5',
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-8">
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">
        Navigation rapide par niveau
      </h2>
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: maxDepth + 1 }).map((_, depth) => {
          const count = categoriesByDepth.get(depth) || 0;
          return (
            <Badge
              key={depth}
              variant={depth === 0 ? 'primary' : 'light'}
              size="lg"
              className="cursor-default"
            >
              {depthNames[depth] || `Niveau ${depth + 1}`}
              <span className="ml-2 opacity-70">({count})</span>
            </Badge>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Main Content Component
// ============================================================================

async function CategoriesContent() {
  const data = await getCategoriesData();

  if (!data || data.tree.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <Container>
          <div className="bg-white rounded-xl p-12 text-center">
            <FolderTree className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Aucune categorie disponible
            </h2>
            <p className="text-neutral-600 mb-6">
              Le catalogue de categories n'est pas encore disponible.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-accent hover:underline"
            >
              Retour a l'accueil
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  // Calculate stats
  const totalProducts = data.flat.reduce((sum, cat) => sum + (cat.product_count || 0), 0);

  // Group by depth
  const categoriesByDepth = new Map<number, number>();
  for (const cat of data.flat) {
    const current = categoriesByDepth.get(cat.depth) || 0;
    categoriesByDepth.set(cat.depth, current + 1);
  }

  // Get root categories for grid
  const rootCategories = data.flat.filter((cat) => cat.depth === 0);

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <Container>
        {/* Hero Section */}
        <HeroSection
          totalCategories={data.total}
          totalProducts={totalProducts}
          maxDepth={data.maxDepth}
        />

        {/* Quick Navigation */}
        <QuickNav categoriesByDepth={categoriesByDepth} maxDepth={data.maxDepth} />

        {/* Main Grid + Tree Layout */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar with Tree */}
          <aside className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-xl border border-neutral-200 p-4 sticky top-24">
              <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-accent" />
                Arborescence
              </h3>
              <CategoryTree
                tree={data.tree}
                showCounts
                maxDepth={3}
                compact
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-900">
                  Categories principales
                </h2>
                <span className="text-sm text-neutral-500">
                  {rootCategories.length} categorie{rootCategories.length !== 1 ? 's' : ''}
                </span>
              </div>

              <SubcategoriesGrid
                subcategories={rootCategories}
                columns={3}
                size="md"
                showCounts
                showViewAll
              />
            </div>

            {/* Structured Data */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'CollectionPage',
                  name: 'Toutes les categories',
                  description: 'Catalogue complet des categories de bijoux professionnels B2B',
                  numberOfItems: data.total,
                  hasPart: rootCategories.map((cat) => ({
                    '@type': 'CollectionPage',
                    name: cat.name,
                    url: `/categorie/${cat.handle}`,
                  })),
                }),
              }}
            />
          </main>
        </div>
      </Container>
    </div>
  );
}

// ============================================================================
// Page Component
// ============================================================================

export default function CategoriesPage() {
  return (
    <>
      {/* Header spacer for fixed header */}
      <div className="h-20" />

      <Suspense fallback={<CategoriesLoading />}>
        <CategoriesContent />
      </Suspense>
    </>
  );
}
