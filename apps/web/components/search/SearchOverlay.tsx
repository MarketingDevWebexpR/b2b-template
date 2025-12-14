'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { cn, formatPrice, debounce } from '@/lib/utils';
import type { Product, Category } from '@/types';

// ============================================
// Types
// ============================================

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  products: Product[];
  categories: Category[];
  totalProducts: number;
}

interface RecentSearch {
  query: string;
  timestamp: number;
}

// ============================================
// Constants
// ============================================

const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg';
const MAX_RECENT_SEARCHES = 5;
const DEBOUNCE_DELAY = 300;

// Suggestions populaires (pourrait venir d'une API)
const POPULAR_SEARCHES = [
  'Bagues diamant',
  'Colliers or',
  'Bracelets',
  'Boucles d\'oreilles',
  'Montres',
];

// ============================================
// Animation Variants
// ============================================

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const contentVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
      delay: 0.1
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const staggerContainer = {
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

// ============================================
// Component
// ============================================

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  // State
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('recentSearches');
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch {
          setRecentSearches([]);
        }
      }
    }
  }, []);

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Slight delay for animation
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults(null);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim() || searchQuery.trim().length < 2) {
        setResults(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // API call to our internal search endpoint
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}&limit=6`
        );

        if (response.ok) {
          const data = await response.json();
          setResults({
            products: data.products || [],
            categories: [],
            totalProducts: data.total || 0
          });
        } else {
          setResults({ products: [], categories: [], totalProducts: 0 });
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults({ products: [], categories: [], totalProducts: 0 });
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_DELAY),
    []
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    performSearch(value);
  };

  // Save search to recent
  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    const newSearch: RecentSearch = {
      query: searchQuery.trim(),
      timestamp: Date.now()
    };

    const updated = [
      newSearch,
      ...recentSearches.filter(s => s.query !== searchQuery.trim())
    ].slice(0, MAX_RECENT_SEARCHES);

    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query);
      // Navigate to search results page
      window.location.href = `/recherche?q=${encodeURIComponent(query.trim())}`;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    saveRecentSearch(suggestion);
    window.location.href = `/recherche?q=${encodeURIComponent(suggestion)}`;
  };

  // Handle product click
  const handleProductClick = (product: Product) => {
    saveRecentSearch(query);
    onClose();
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const totalItems = (results?.products.length || 0) +
      (query ? 0 : POPULAR_SEARCHES.length + recentSearches.length);

    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < totalItems - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : totalItems - 1
        );
        break;
      case 'Enter':
        if (selectedIndex >= 0 && results?.products[selectedIndex]) {
          const product = results.products[selectedIndex];
          window.location.href = `/products/${product.id}`;
        }
        break;
    }
  };

  // Determine if showing suggestions or results
  const showSuggestions = !query.trim() && !isLoading;
  const showResults = query.trim() && results && !isLoading;
  const showNoResults = query.trim() && results && results.products.length === 0 && !isLoading;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'fixed inset-0 z-[100]',
              'bg-luxe-charcoal/60 backdrop-blur-sm'
            )}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Search Container */}
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'fixed top-0 left-0 right-0 z-[101]',
              'bg-luxe-cream',
              'shadow-elegant-lg'
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Recherche"
          >
            {/* Search Header */}
            <div className="container mx-auto px-6 lg:px-12">
              <form onSubmit={handleSubmit} className="py-6 md:py-8">
                <div className="relative flex items-center gap-4">
                  {/* Search Icon */}
                  <div className="flex-shrink-0">
                    {isLoading ? (
                      <Loader2
                        className="w-5 h-5 text-hermes-500 animate-spin"
                        strokeWidth={1.5}
                      />
                    ) : (
                      <Search
                        className="w-5 h-5 text-text-muted"
                        strokeWidth={1.5}
                      />
                    )}
                  </div>

                  {/* Input Field */}
                  <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Rechercher un bijou, une collection..."
                    className={cn(
                      'flex-1',
                      'bg-transparent',
                      'font-serif text-xl md:text-2xl lg:text-3xl',
                      'text-text-primary placeholder:text-text-light',
                      'border-none outline-none',
                      'transition-colors duration-300'
                    )}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    aria-label="Rechercher"
                    aria-autocomplete="list"
                    aria-controls="search-results"
                    aria-expanded={showResults || showSuggestions}
                  />

                  {/* Clear/Close Button */}
                  <button
                    type="button"
                    onClick={query ? () => setQuery('') : onClose}
                    className={cn(
                      'flex-shrink-0',
                      'w-10 h-10 flex items-center justify-center',
                      'rounded-full',
                      'text-text-muted hover:text-text-primary',
                      'hover:bg-background-warm',
                      'transition-all duration-300 ease-luxe',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-luxe-charcoal/20'
                    )}
                    aria-label={query ? 'Effacer la recherche' : 'Fermer'}
                  >
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Elegant underline */}
                <div className="mt-4 h-px bg-gradient-to-r from-transparent via-border-medium to-transparent" />
              </form>
            </div>

            {/* Search Content */}
            <div
              ref={resultsRef}
              id="search-results"
              className={cn(
                'container mx-auto px-6 lg:px-12',
                'pb-8 md:pb-12',
                'max-h-[60vh] overflow-y-auto',
                'scrollbar-thin scrollbar-thumb-border-medium scrollbar-track-transparent'
              )}
              role="listbox"
              aria-label="Résultats de recherche"
            >
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-hermes-500 animate-spin" />
                    <span className="text-sm text-text-muted">Recherche en cours...</span>
                  </div>
                </div>
              )}

              {/* Suggestions (when no query) */}
              {showSuggestions && (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
                >
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <motion.div variants={itemVariants}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-luxe text-text-muted">
                          <Clock className="w-4 h-4" strokeWidth={1.5} />
                          Recherches récentes
                        </h3>
                        <button
                          onClick={clearRecentSearches}
                          className={cn(
                            'text-xs text-text-light hover:text-hermes-500',
                            'transition-colors duration-300'
                          )}
                        >
                          Effacer
                        </button>
                      </div>
                      <ul className="space-y-1">
                        {recentSearches.map((search, index) => (
                          <li key={search.timestamp}>
                            <button
                              onClick={() => handleSuggestionClick(search.query)}
                              className={cn(
                                'w-full text-left',
                                'py-2.5 px-3 -mx-3',
                                'font-sans text-sm text-text-secondary',
                                'hover:text-text-primary hover:bg-background-warm',
                                'rounded-soft',
                                'transition-all duration-300 ease-luxe',
                                'focus:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500/30',
                                selectedIndex === index && 'bg-background-warm text-text-primary'
                              )}
                              role="option"
                              aria-selected={selectedIndex === index}
                            >
                              {search.query}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* Popular Searches */}
                  <motion.div variants={itemVariants}>
                    <h3 className="flex items-center gap-2 mb-4 text-xs font-medium uppercase tracking-luxe text-text-muted">
                      <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
                      Recherches populaires
                    </h3>
                    <ul className="space-y-1">
                      {POPULAR_SEARCHES.map((suggestion, index) => (
                        <li key={suggestion}>
                          <button
                            onClick={() => handleSuggestionClick(suggestion)}
                            className={cn(
                              'w-full text-left',
                              'py-2.5 px-3 -mx-3',
                              'font-sans text-sm text-text-secondary',
                              'hover:text-text-primary hover:bg-background-warm',
                              'rounded-soft',
                              'transition-all duration-300 ease-luxe',
                              'focus:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500/30',
                              selectedIndex === recentSearches.length + index &&
                                'bg-background-warm text-text-primary'
                            )}
                            role="option"
                            aria-selected={selectedIndex === recentSearches.length + index}
                          >
                            {suggestion}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </motion.div>
              )}

              {/* No Results */}
              {showNoResults && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <p className="font-serif text-lg text-text-primary mb-2">
                    Aucun résultat pour "{query}"
                  </p>
                  <p className="text-sm text-text-muted mb-6">
                    Essayez avec d'autres termes ou explorez nos suggestions
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {POPULAR_SEARCHES.slice(0, 3).map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={cn(
                          'px-4 py-2',
                          'text-xs font-medium uppercase tracking-elegant',
                          'text-text-secondary',
                          'border border-border-light',
                          'rounded-full',
                          'hover:border-hermes-500 hover:text-hermes-500',
                          'transition-all duration-300 ease-luxe'
                        )}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Search Results */}
              {showResults && results.products.length > 0 && (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {/* Results Header */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-medium uppercase tracking-luxe text-text-muted">
                      {results.totalProducts} résultat{results.totalProducts > 1 ? 's' : ''}
                    </span>
                    <Link
                      href={`/recherche?q=${encodeURIComponent(query)}`}
                      className={cn(
                        'flex items-center gap-1.5',
                        'text-xs font-medium uppercase tracking-luxe',
                        'text-hermes-500 hover:text-hermes-600',
                        'transition-colors duration-300',
                        'group'
                      )}
                      onClick={() => saveRecentSearch(query)}
                    >
                      Voir tout
                      <ArrowRight
                        className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                        strokeWidth={1.5}
                      />
                    </Link>
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                    {results.products.slice(0, 6).map((product, index) => (
                      <motion.div key={product.id} variants={itemVariants}>
                        <SearchProductCard
                          product={product}
                          isSelected={selectedIndex === index}
                          onClick={() => handleProductClick(product)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Bottom Gradient Fade */}
            <div
              className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-luxe-cream to-transparent pointer-events-none"
              aria-hidden="true"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================
// Search Product Card Component
// ============================================

interface SearchProductCardProps {
  product: Product;
  isSelected: boolean;
  onClick: () => void;
}

function SearchProductCard({ product, isSelected, onClick }: SearchProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const imageSrc = imageError || !product.images[0] ? PLACEHOLDER_IMAGE : product.images[0];

  return (
    <Link
      href={`/products/${product.id}`}
      onClick={onClick}
      className={cn(
        'group block',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500/30 focus-visible:ring-offset-2',
        'rounded-soft',
        isSelected && 'ring-2 ring-hermes-500/30 ring-offset-2'
      )}
      role="option"
      aria-selected={isSelected}
    >
      {/* Image */}
      <div className={cn(
        'relative aspect-square overflow-hidden',
        'bg-white rounded-soft',
        'shadow-card',
        'transition-all duration-300 ease-luxe',
        'group-hover:shadow-card-hover'
      )}>
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          className={cn(
            'object-contain p-2',
            'transition-transform duration-500 ease-luxe-out',
            'group-hover:scale-105'
          )}
          onError={() => setImageError(true)}
        />
      </div>

      {/* Product Info */}
      <div className="mt-3">
        <h4 className={cn(
          'font-serif text-sm text-text-primary',
          'line-clamp-2 leading-snug',
          'transition-colors duration-300',
          'group-hover:text-hermes-500'
        )}>
          {product.name}
        </h4>
        <p className="mt-1 font-sans text-xs text-text-muted">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}

export default SearchOverlay;
