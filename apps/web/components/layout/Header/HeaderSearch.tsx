'use client';

/**
 * HeaderSearch Component
 *
 * Elegant search input for the B2B jewelry platform.
 * Features autocomplete suggestions and keyboard shortcuts.
 */

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMockData, type MockProduct } from '@/hooks/useMockData';

export interface HeaderSearchProps {
  /** Placeholder text */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
}

// Mock search suggestions
const trendingSearches = [
  'Bagues solitaires',
  'Colliers perles',
  'Bracelets or 18k',
  'Boucles diamant',
];

const recentSearches = [
  'Alliance or blanc',
  'Pendentif coeur',
  'Creoles argent',
];

export const HeaderSearch = memo(function HeaderSearch({
  placeholder = 'Rechercher par nom, SKU, reference...',
  className,
}: HeaderSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { catalog } = useMockData();

  // Filter products based on query
  const suggestions: MockProduct[] = query.length > 1
    ? catalog.products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  // Handle keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setShowSuggestions(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Delay hiding suggestions to allow click events
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/recherche?q=${encodeURIComponent(query.trim())}`);
        setShowSuggestions(false);
        inputRef.current?.blur();
      }
    },
    [query, router]
  );

  const handleSuggestionClick = useCallback(
    (searchTerm: string) => {
      setQuery(searchTerm);
      router.push(`/recherche?q=${encodeURIComponent(searchTerm)}`);
      setShowSuggestions(false);
    },
    [router]
  );

  const clearSearch = useCallback(() => {
    setQuery('');
    inputRef.current?.focus();
  }, []);

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            'relative flex items-center w-full',
            'bg-neutral-50 border rounded-xl',
            'transition-all duration-200',
            isFocused
              ? 'border-amber-500 ring-2 ring-amber-500/10 bg-white'
              : 'border-neutral-200 hover:border-neutral-300'
          )}
        >
          {/* Search icon */}
          <div className="flex items-center justify-center pl-4">
            <Search
              className={cn(
                'w-4.5 h-4.5 transition-colors duration-200',
                isFocused ? 'text-amber-600' : 'text-neutral-400'
              )}
              strokeWidth={1.5}
            />
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={cn(
              'flex-1 px-3 py-2.5',
              'text-sm text-neutral-900 placeholder:text-neutral-400',
              'bg-transparent border-none outline-none',
              'transition-colors duration-200'
            )}
            aria-label="Rechercher"
            autoComplete="off"
          />

          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className={cn(
                'flex items-center justify-center p-1.5 mr-1',
                'text-neutral-400 hover:text-neutral-600',
                'rounded-full hover:bg-neutral-100',
                'transition-colors duration-150'
              )}
              aria-label="Effacer la recherche"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          )}

          {/* Keyboard shortcut hint */}
          <div className="hidden md:flex items-center gap-1 pr-3">
            <kbd
              className={cn(
                'inline-flex items-center justify-center',
                'px-1.5 py-0.5 text-[10px] font-medium',
                'text-neutral-400 bg-neutral-100 border border-neutral-200 rounded'
              )}
            >
              Cmd
            </kbd>
            <kbd
              className={cn(
                'inline-flex items-center justify-center',
                'px-1.5 py-0.5 text-[10px] font-medium',
                'text-neutral-400 bg-neutral-100 border border-neutral-200 rounded'
              )}
            >
              K
            </kbd>
          </div>
        </div>
      </form>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && (isFocused || query) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute top-full left-0 right-0 mt-2 z-50',
              'bg-white rounded-xl shadow-xl border border-neutral-200',
              'overflow-hidden'
            )}
          >
            {/* Product suggestions when query exists */}
            {query.length > 1 && suggestions.length > 0 && (
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wide">
                  Produits
                </p>
                <ul>
                  {suggestions.map((product) => (
                    <li key={product.id}>
                      <button
                        type="button"
                        onClick={() => router.push(`/produit/${product.slug}`)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg',
                          'text-left text-sm text-neutral-700',
                          'hover:bg-neutral-50 transition-colors duration-150'
                        )}
                      >
                        <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Search className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-neutral-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {product.sku} - {product.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-400" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Default suggestions (no query) */}
            {!query && (
              <>
                {/* Recent searches */}
                {recentSearches.length > 0 && (
                  <div className="p-2 border-b border-neutral-100">
                    <p className="px-3 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Recherches recentes
                    </p>
                    <ul>
                      {recentSearches.map((term) => (
                        <li key={term}>
                          <button
                            type="button"
                            onClick={() => handleSuggestionClick(term)}
                            className={cn(
                              'w-full flex items-center gap-2 px-3 py-2 rounded-lg',
                              'text-left text-sm text-neutral-700',
                              'hover:bg-neutral-50 transition-colors duration-150'
                            )}
                          >
                            <Clock className="w-4 h-4 text-neutral-400" />
                            <span>{term}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Trending searches */}
                <div className="p-2">
                  <p className="px-3 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Tendances
                  </p>
                  <ul>
                    {trendingSearches.map((term) => (
                      <li key={term}>
                        <button
                          type="button"
                          onClick={() => handleSuggestionClick(term)}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 rounded-lg',
                            'text-left text-sm text-neutral-700',
                            'hover:bg-neutral-50 transition-colors duration-150'
                          )}
                        >
                          <TrendingUp className="w-4 h-4 text-amber-500" />
                          <span>{term}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* No results */}
            {query.length > 1 && suggestions.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-sm text-neutral-500">
                  Aucun resultat pour &quot;{query}&quot;
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  Essayez avec un autre terme de recherche
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

HeaderSearch.displayName = 'HeaderSearch';

export default HeaderSearch;
