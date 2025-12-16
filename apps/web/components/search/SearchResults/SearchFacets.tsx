'use client';

/**
 * SearchFacets Component
 *
 * Sidebar filters with faceted navigation for search results.
 * Supports hierarchical categories, checkboxes, range sliders, and radio buttons.
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
import { ChevronRight, Search } from 'lucide-react';

// ============================================================================
// Category Tree Component
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
              'text-b2b-text-muted hover:text-b2b-text-primary',
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
              <span className="text-xs text-b2b-text-muted">
                ({node.count.toLocaleString('fr-FR')})
              </span>
            </span>
          }
        />
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="border-l border-b2b-border-light ml-2">
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-b2b-text-muted" />
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
                <span className="text-xs text-b2b-text-muted ml-2">
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
            'text-b2b-primary hover:text-b2b-primary-600',
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
        <p className="text-sm text-b2b-text-muted italic">
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
          'bg-b2b-primary text-white',
          'rounded-lg',
          'transition-colors duration-200',
          'hover:bg-b2b-primary-600',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-b2b-primary focus-visible:ring-offset-2'
        )}
      >
        Appliquer
      </button>

      {/* Quick presets */}
      <div className="pt-2 border-t border-b2b-border-light">
        <p className="text-xs font-medium text-b2b-text-muted uppercase tracking-wide mb-2">
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
                'hover:bg-b2b-bg-tertiary',
                value?.min === preset.min && value?.max === preset.max
                  ? 'text-b2b-primary font-medium bg-b2b-primary/5'
                  : 'text-b2b-text-secondary'
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
}

/**
 * SearchFacets provides faceted filtering for search results
 */
export function SearchFacets({
  className,
  collapsible = true,
  defaultExpanded = ['categories', 'brand', 'price'],
}: SearchFacetsProps) {
  const {
    filters,
    facets,
    categoryTree,
    toggleCategoryFilter,
    toggleBrandFilter,
    setPriceRange,
    setStockFilter,
    toggleAttributeFilter,
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

  const facetSections = [
    {
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
    },
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
          <div className="mb-4 pb-4 border-b border-b2b-border-light">
            <button
              type="button"
              onClick={clearFilters}
              className={cn(
                'w-full py-2',
                'text-sm font-medium',
                'text-b2b-danger hover:text-b2b-danger-600',
                'bg-b2b-danger/5 hover:bg-b2b-danger/10',
                'rounded-lg',
                'transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-b2b-danger focus-visible:ring-offset-2'
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
              className="border-b border-b2b-border-light last:border-b-0"
            >
              <AccordionTrigger className="text-sm font-semibold uppercase tracking-wide text-b2b-text-primary">
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
            'text-b2b-danger',
            'border border-b2b-danger/30',
            'rounded-lg',
            'hover:bg-b2b-danger/5',
            'transition-colors duration-200'
          )}
        >
          Effacer tous les filtres
        </button>
      )}

      {facetSections.map((section) => (
        <div key={section.id} className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-b2b-text-primary">
            {section.title}
          </h3>
          {section.content}
        </div>
      ))}
    </aside>
  );
}

export default SearchFacets;
