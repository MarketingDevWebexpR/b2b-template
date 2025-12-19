'use client';

/**
 * SearchFacets Component
 *
 * Sidebar filters with faceted navigation for search results.
 * Supports hierarchical categories (v3 format), checkboxes, range sliders, and radio buttons.
 */

import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useSearch, useSearchFilters } from '@/contexts/SearchContext';
import type {
  CategoryNode,
  Facet,
  FacetValue,
  StockFilter,
  PriceRange,
  HierarchicalFacetValue,
  HierarchicalCategoryFacets,
  HierarchicalCategoryPath,
} from '@/contexts/SearchContext';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/Accordion';
import { Checkbox, Radio } from '@/components/ui/Checkbox';
import { RangeSlider } from '@/components/ui/Slider';
import { Input } from '@/components/ui/Input';
import { ChevronRight, ChevronLeft, Search, Home } from 'lucide-react';

// ============================================================================
// Hierarchical Category Breadcrumb Component (v3)
// ============================================================================

interface HierarchicalCategoryBreadcrumbProps {
  path: HierarchicalCategoryPath | undefined;
  onNavigateToLevel: (level: number) => void;
  onClear: () => void;
}

function HierarchicalCategoryBreadcrumb({
  path,
  onNavigateToLevel,
  onClear,
}: HierarchicalCategoryBreadcrumbProps) {
  if (!path || path.path.length === 0) {
    return null;
  }

  return (
    <nav
      className="flex items-center flex-wrap gap-1 mb-3 text-sm"
      aria-label="Chemin de categorie"
    >
      {/* Home/Root button */}
      <button
        type="button"
        onClick={onClear}
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded',
          'text-neutral-600 hover:text-accent hover:bg-orange-50',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
        )}
        aria-label="Retour a toutes les categories"
      >
        <Home className="w-3.5 h-3.5" />
      </button>

      {/* Breadcrumb segments */}
      {path.path.map((segment, index) => (
        <span key={index} className="flex items-center">
          <ChevronRight className="w-4 h-4 text-neutral-400 mx-0.5" aria-hidden="true" />
          {index < path.path.length - 1 ? (
            <button
              type="button"
              onClick={() => onNavigateToLevel(index)}
              className={cn(
                'px-2 py-1 rounded',
                'text-neutral-600 hover:text-accent hover:bg-orange-50',
                'transition-colors duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
              )}
            >
              {segment}
            </button>
          ) : (
            <span className="px-2 py-1 font-medium text-accent">
              {segment}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

// ============================================================================
// Hierarchical Category Facet Component (v3)
// ============================================================================

interface HierarchicalCategoryFacetProps {
  facets: HierarchicalCategoryFacets;
  currentPath: HierarchicalCategoryPath | undefined;
  onSelectCategory: (value: string, level: number) => void;
  onNavigateToLevel: (level: number) => void;
  onClear: () => void;
}

/**
 * HierarchicalCategoryFacet
 *
 * Drill-down category navigation using App Search v3 hierarchical facets.
 * Shows breadcrumb for current path and children at current level.
 */
function HierarchicalCategoryFacet({
  facets,
  currentPath,
  onSelectCategory,
  onNavigateToLevel,
  onClear,
}: HierarchicalCategoryFacetProps) {
  // Determine which level to show
  const currentLevel = currentPath?.level ?? -1;
  const nextLevel = currentLevel + 1;

  // Get the current path prefix for filtering children
  const currentPrefix = currentPath?.pathString ?? '';

  // Get facet values for the next level, filtered by current path
  const getVisibleCategories = (): HierarchicalFacetValue[] => {
    const levelKeys: (keyof HierarchicalCategoryFacets)[] = [
      'category_lvl0',
      'category_lvl1',
      'category_lvl2',
      'category_lvl3',
      'category_lvl4',
    ];

    if (nextLevel > 4) {
      // Max depth reached
      return [];
    }

    const levelKey = levelKeys[nextLevel];
    const levelFacets = facets[levelKey];

    if (currentLevel < 0) {
      // No selection - show root categories (lvl0)
      return levelFacets;
    }

    // Filter to show only children of current selection
    return levelFacets.filter((item) =>
      item.value.startsWith(currentPrefix + ' > ')
    );
  };

  const visibleCategories = getVisibleCategories();

  // Show "back" option if we're at a deeper level
  const showBackButton = currentLevel >= 0;

  return (
    <div className="space-y-2">
      {/* Breadcrumb navigation */}
      <HierarchicalCategoryBreadcrumb
        path={currentPath}
        onNavigateToLevel={onNavigateToLevel}
        onClear={onClear}
      />

      {/* Back button for mobile-friendly navigation */}
      {showBackButton && (
        <button
          type="button"
          onClick={() => onNavigateToLevel(currentLevel - 1)}
          className={cn(
            'flex items-center gap-2 w-full px-2 py-2 rounded-md',
            'text-sm text-neutral-600',
            'hover:bg-neutral-100 hover:text-neutral-900',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Retour</span>
        </button>
      )}

      {/* Category list */}
      {visibleCategories.length > 0 ? (
        <div className="space-y-1">
          {visibleCategories.map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => onSelectCategory(category.value, nextLevel)}
              className={cn(
                'flex items-center justify-between w-full px-2 py-2 rounded-md',
                'text-sm text-left',
                'hover:bg-neutral-100',
                'transition-colors duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                category.isSelected && 'bg-orange-50 text-accent font-medium'
              )}
              aria-current={category.isSelected ? 'true' : undefined}
            >
              <span className="flex items-center gap-2">
                <span>{category.label}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">
                  ({category.count.toLocaleString('fr-FR')})
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </span>
            </button>
          ))}
        </div>
      ) : currentLevel >= 0 ? (
        <p className="text-sm text-neutral-500 italic px-2 py-2">
          Pas de sous-categories
        </p>
      ) : null}
    </div>
  );
}

// ============================================================================
// Category Tree Component (Legacy)
// ============================================================================

interface CategoryTreeNodeProps {
  node: CategoryNode;
  selectedCategories: string[];
  onToggle: (categoryId: string) => void;
  onExpand: (categoryId: string) => void;
}

function CategoryTreeNode({
  node,
  selectedCategories,
  onToggle,
  onExpand,
}: CategoryTreeNodeProps) {
  const isSelected = selectedCategories.includes(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = node.isExpanded ?? false;

  return (
    <div className="w-full">
      <div
        className={cn(
          'flex items-center gap-2 py-1.5',
          node.level > 0 && 'ml-4'
        )}
      >
        {/* Expand/collapse button for parent categories */}
        {hasChildren && (
          <button
            type="button"
            onClick={() => onExpand(node.id)}
            className={cn(
              'flex-shrink-0 p-0.5',
              'text-neutral-400 hover:text-neutral-900',
              'transition-transform duration-200',
              isExpanded && 'rotate-90'
            )}
            aria-label={isExpanded ? `Reduire ${node.name}` : `Developper ${node.name}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Spacer if no children */}
        {!hasChildren && <div className="w-5 flex-shrink-0" />}

        {/* Checkbox */}
        <Checkbox
          size="sm"
          checked={isSelected}
          onChange={() => onToggle(node.id)}
          label={
            <span className="flex items-center gap-2">
              <span className="text-sm">{node.name}</span>
              <span className="text-xs text-neutral-500">
                ({node.count.toLocaleString('fr-FR')})
              </span>
            </span>
          }
        />
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="border-l border-neutral-200 ml-2">
          {node.children!.map((child) => (
            <CategoryTreeNode
              key={child.id}
              node={child}
              selectedCategories={selectedCategories}
              onToggle={onToggle}
              onExpand={onExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CategoryFacetProps {
  categories: CategoryNode[];
  selectedCategories: string[];
  onToggle: (categoryId: string) => void;
  onExpand: (categoryId: string) => void;
}

function CategoryFacet({
  categories,
  selectedCategories,
  onToggle,
  onExpand,
}: CategoryFacetProps) {
  return (
    <div className="space-y-1">
      {categories.map((category) => (
        <CategoryTreeNode
          key={category.id}
          node={category}
          selectedCategories={selectedCategories}
          onToggle={onToggle}
          onExpand={onExpand}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Checkbox Facet Component
// ============================================================================

interface CheckboxFacetProps {
  facet: Facet;
  onToggle: (value: string) => void;
  maxVisible?: number;
  searchable?: boolean;
}

function CheckboxFacet({
  facet,
  onToggle,
  maxVisible = 6,
  searchable = false,
}: CheckboxFacetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const filteredValues = useMemo(() => {
    if (!searchQuery.trim()) return facet.values;
    const query = searchQuery.toLowerCase();
    return facet.values.filter((v) =>
      v.label.toLowerCase().includes(query)
    );
  }, [facet.values, searchQuery]);

  const visibleValues = showAll
    ? filteredValues
    : filteredValues.slice(0, maxVisible);

  const hasMore = filteredValues.length > maxVisible;

  return (
    <div className="space-y-3">
      {/* Search input */}
      {searchable && facet.values.length > 5 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 py-1.5 text-sm"
            aria-label={`Rechercher dans ${facet.name}`}
          />
        </div>
      )}

      {/* Checkboxes */}
      <div className="space-y-2">
        {visibleValues.map((value) => (
          <Checkbox
            key={value.value}
            size="sm"
            checked={value.selected}
            onChange={() => onToggle(value.value)}
            label={
              <span className="flex items-center justify-between w-full">
                <span className="text-sm">{value.label}</span>
                <span className="text-xs text-neutral-500 ml-2">
                  ({value.count.toLocaleString('fr-FR')})
                </span>
              </span>
            }
          />
        ))}
      </div>

      {/* Show more/less button */}
      {hasMore && !searchQuery && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className={cn(
            'text-sm font-medium',
            'text-accent hover:text-orange-600',
            'transition-colors duration-200'
          )}
        >
          {showAll
            ? 'Voir moins'
            : `Voir tout (${filteredValues.length})`}
        </button>
      )}

      {/* No results message */}
      {searchQuery && filteredValues.length === 0 && (
        <p className="text-sm text-neutral-500 italic">
          Aucun resultat pour "{searchQuery}"
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Price Range Facet Component
// ============================================================================

interface PriceRangeFacetProps {
  value?: PriceRange;
  onChange: (range: PriceRange | undefined) => void;
  min?: number;
  max?: number;
  presets?: Array<{ label: string; min: number; max: number }>;
}

const defaultPricePresets = [
  { label: 'Moins de 500 EUR', min: 0, max: 500 },
  { label: '500 - 1 000 EUR', min: 500, max: 1000 },
  { label: '1 000 - 5 000 EUR', min: 1000, max: 5000 },
  { label: '5 000 - 10 000 EUR', min: 5000, max: 10000 },
  { label: 'Plus de 10 000 EUR', min: 10000, max: 100000 },
];

function PriceRangeFacet({
  value,
  onChange,
  min = 0,
  max = 100000,
  presets = defaultPricePresets,
}: PriceRangeFacetProps) {
  const [localRange, setLocalRange] = useState<[number, number]>(
    value ? [value.min, value.max] : [min, max]
  );

  const handleSliderChange = useCallback((newRange: [number, number]) => {
    setLocalRange(newRange);
  }, []);

  const handleSliderCommit = useCallback(() => {
    if (localRange[0] === min && localRange[1] === max) {
      onChange(undefined);
    } else {
      onChange({ min: localRange[0], max: localRange[1] });
    }
  }, [localRange, min, max, onChange]);

  const handlePresetClick = useCallback(
    (preset: { min: number; max: number }) => {
      setLocalRange([preset.min, preset.max]);
      onChange({ min: preset.min, max: preset.max });
    },
    [onChange]
  );

  const formatPrice = useCallback(
    (val: number) =>
      new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(val),
    []
  );

  return (
    <div className="space-y-4">
      {/* Range slider */}
      <RangeSlider
        min={min}
        max={max}
        step={100}
        value={localRange}
        onChange={handleSliderChange}
        formatValue={formatPrice}
        size="sm"
      />

      {/* Apply button */}
      <button
        type="button"
        onClick={handleSliderCommit}
        className={cn(
          'w-full py-2',
          'text-sm font-medium',
          'bg-accent text-white',
          'rounded-lg',
          'transition-colors duration-200',
          'hover:bg-orange-600',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
        )}
      >
        Appliquer
      </button>

      {/* Quick presets */}
      <div className="pt-2 border-t border-neutral-200">
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
          Preselections
        </p>
        <div className="space-y-1">
          {presets.map((preset, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className={cn(
                'w-full text-left px-2 py-1.5',
                'text-sm',
                'rounded',
                'transition-colors duration-200',
                'hover:bg-neutral-100',
                value?.min === preset.min && value?.max === preset.max
                  ? 'text-accent font-medium bg-orange-50'
                  : 'text-neutral-600'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Stock Filter Facet Component
// ============================================================================

interface StockFacetProps {
  value: StockFilter;
  onChange: (filter: StockFilter) => void;
}

const stockOptions: Array<{ value: StockFilter; label: string }> = [
  { value: 'all', label: 'Tous les produits' },
  { value: 'in_stock', label: 'En stock' },
  { value: 'available_24h', label: 'Livrable sous 24h' },
  { value: 'low_stock', label: 'Stock limite' },
  { value: 'on_order', label: 'Sur commande' },
];

function StockFacet({ value, onChange }: StockFacetProps) {
  return (
    <div className="space-y-2">
      {stockOptions.map((option) => (
        <Radio
          key={option.value}
          name="stock-filter"
          size="sm"
          checked={value === option.value}
          onChange={() => onChange(option.value)}
          label={option.label}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Main SearchFacets Component
// ============================================================================

export interface SearchFacetsProps {
  /** Custom class name */
  className?: string;
  /** Collapsible sections */
  collapsible?: boolean;
  /** Default expanded sections */
  defaultExpanded?: string[];
  /** Use hierarchical category facets (v3 format) instead of tree */
  useHierarchicalCategories?: boolean;
}

/**
 * SearchFacets provides faceted filtering for search results
 */
export function SearchFacets({
  className,
  collapsible = true,
  defaultExpanded = ['categories', 'brand', 'price'],
  useHierarchicalCategories = true,
}: SearchFacetsProps) {
  const {
    filters,
    facets,
    categoryTree,
    hierarchicalCategoryFacets,
    toggleCategoryFilter,
    toggleBrandFilter,
    setPriceRange,
    setStockFilter,
    toggleAttributeFilter,
    selectHierarchicalCategory,
    navigateToHierarchicalLevel,
    clearHierarchicalCategory,
    clearFilters,
    hasActiveFilters,
  } = useSearchFilters();
  const { toggleCategoryExpansion } = useSearch();

  // Get brand facet
  const brandFacet = facets.find((f) => f.id === 'brand');

  // Get attribute facets (excluding brand and price)
  const attributeFacets = facets.filter(
    (f) => f.id !== 'brand' && f.id !== 'price' && f.type === 'checkbox'
  );

  // Build category section based on mode
  const categorySection = useHierarchicalCategories
    ? {
        id: 'categories',
        title: 'Categories',
        content: (
          <HierarchicalCategoryFacet
            facets={hierarchicalCategoryFacets}
            currentPath={filters.hierarchicalCategory}
            onSelectCategory={selectHierarchicalCategory}
            onNavigateToLevel={navigateToHierarchicalLevel}
            onClear={clearHierarchicalCategory}
          />
        ),
      }
    : {
        id: 'categories',
        title: 'Categories',
        content: (
          <CategoryFacet
            categories={categoryTree}
            selectedCategories={filters.categories}
            onToggle={toggleCategoryFilter}
            onExpand={toggleCategoryExpansion}
          />
        ),
      };

  const facetSections = [
    categorySection,
    ...(brandFacet
      ? [
          {
            id: 'brand',
            title: brandFacet.name,
            content: (
              <CheckboxFacet
                facet={{
                  ...brandFacet,
                  values: brandFacet.values.map((v) => ({
                    ...v,
                    selected: filters.brands.includes(v.value),
                  })),
                }}
                onToggle={toggleBrandFilter}
                searchable
              />
            ),
          },
        ]
      : []),
    {
      id: 'price',
      title: 'Prix HT',
      content: (
        <PriceRangeFacet
          value={filters.priceRange}
          onChange={setPriceRange}
          min={0}
          max={50000}
        />
      ),
    },
    {
      id: 'stock',
      title: 'Disponibilite',
      content: (
        <StockFacet
          value={filters.stockFilter}
          onChange={setStockFilter}
        />
      ),
    },
    ...attributeFacets.map((facet) => ({
      id: facet.id,
      title: facet.name,
      content: (
        <CheckboxFacet
          facet={{
            ...facet,
            values: facet.values.map((v) => ({
              ...v,
              selected:
                filters.attributes[facet.id]?.includes(v.value) ?? false,
            })),
          }}
          onToggle={(value) => toggleAttributeFilter(facet.id, value)}
        />
      ),
    })),
  ];

  if (collapsible) {
    return (
      <aside
        className={cn('w-full', className)}
        aria-label="Filtres de recherche"
      >
        {/* Clear all button */}
        {hasActiveFilters && (
          <div className="mb-4 pb-4 border-b border-neutral-200">
            <button
              type="button"
              onClick={clearFilters}
              className={cn(
                'w-full py-2',
                'text-sm font-medium',
                'text-red-600 hover:text-red-700',
                'bg-red-50 hover:bg-red-100',
                'rounded-lg',
                'transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2'
              )}
            >
              Effacer tous les filtres
            </button>
          </div>
        )}

        <Accordion
          type="multiple"
          defaultValue={defaultExpanded}
          className="space-y-0"
        >
          {facetSections.map((section) => (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="border-b border-neutral-200 last:border-b-0"
            >
              <AccordionTrigger className="text-sm font-semibold uppercase tracking-wide text-neutral-900">
                {section.title}
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                {section.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </aside>
    );
  }

  // Non-collapsible variant
  return (
    <aside
      className={cn('w-full space-y-6', className)}
      aria-label="Filtres de recherche"
    >
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className={cn(
            'w-full py-2',
            'text-sm font-medium',
            'text-red-600',
            'border border-red-200',
            'rounded-lg',
            'hover:bg-red-50',
            'transition-colors duration-200'
          )}
        >
          Effacer tous les filtres
        </button>
      )}

      {facetSections.map((section) => (
        <div key={section.id} className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-900">
            {section.title}
          </h3>
          {section.content}
        </div>
      ))}
    </aside>
  );
}

export default SearchFacets;
