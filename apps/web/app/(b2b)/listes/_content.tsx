'use client';


/**
 * Wishlists Page
 *
 * Displays all wishlists with filtering, search, and quick actions.
 * Supports creating new lists and managing existing ones.
 */

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/contexts/WishlistContext';
import { useB2BPermissions } from '@/contexts/B2BContext';
import { useListsFeatures } from '@/contexts/FeatureContext';
import { WishlistCard, ShareListModal } from '@/components/wishlist';
import {
  PageHeader,
  PageLoader,
  EmptyState,
  FilterTabs,
  ActionButton,
} from '@/components/b2b';
import type { WishlistTemplate, WishlistB2B } from '@maison/types';

// ============================================================================
// Icons
// ============================================================================

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const GridIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

// ============================================================================
// Filter Options
// ============================================================================

type OwnershipFilter = 'all' | 'mine' | 'shared';

const ownershipFilters: { value: OwnershipFilter; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'mine', label: 'Mes listes' },
  { value: 'shared', label: 'Partagees avec moi' },
];

const templateFilters: { value: WishlistTemplate | 'all'; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'favorites', label: 'Favoris' },
  { value: 'seasonal_spring', label: 'Printemps' },
  { value: 'seasonal_summer', label: 'Ete' },
  { value: 'seasonal_autumn', label: 'Automne' },
  { value: 'seasonal_winter', label: 'Hiver' },
  { value: 'bestsellers', label: 'Meilleures ventes' },
  { value: 'new_arrivals', label: 'Nouveautes' },
  { value: 'reorder', label: 'Reapprovisionnement' },
  { value: 'custom', label: 'Personnalise' },
];

// ============================================================================
// Create List Modal
// ============================================================================

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, template: WishlistTemplate, description?: string) => void;
}

function CreateListModal({ isOpen, onClose, onCreate }: CreateListModalProps) {
  const [name, setName] = useState('');
  const [template, setTemplate] = useState<WishlistTemplate>('custom');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), template, description.trim() || undefined);
      setName('');
      setTemplate('custom');
      setDescription('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-white rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b border-stroke-light">
            <h2 className="font-sans text-body font-semibold text-content-primary">
              Nouvelle liste
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="listName" className="block text-body-sm font-medium text-content-primary mb-1">
                Nom de la liste *
              </label>
              <input
                id="listName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ma nouvelle liste"
                autoFocus
                required
                className={cn(
                  'w-full px-4 py-2 text-body-sm rounded border border-stroke-medium',
                  'focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary'
                )}
              />
            </div>

            <div>
              <label htmlFor="template" className="block text-body-sm font-medium text-content-primary mb-1">
                Type de liste
              </label>
              <select
                id="template"
                value={template}
                onChange={(e) => setTemplate(e.target.value as WishlistTemplate)}
                className={cn(
                  'w-full px-4 py-2 text-body-sm rounded border border-stroke-medium',
                  'focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary'
                )}
              >
                {templateFilters.slice(1).map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-body-sm font-medium text-content-primary mb-1">
                Description (optionnelle)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Decrivez cette liste..."
                rows={3}
                className={cn(
                  'w-full px-4 py-2 text-body-sm rounded border border-stroke-medium',
                  'focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary',
                  'resize-none'
                )}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-stroke-light bg-surface-secondary/50">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'px-4 py-2 rounded-lg font-sans text-body-sm font-medium',
                'text-content-secondary hover:text-content-primary hover:bg-surface-secondary',
                'transition-colors'
              )}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className={cn(
                'px-6 py-2 rounded-lg font-sans text-body-sm font-medium',
                'bg-primary text-white',
                'hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors'
              )}
            >
              Creer la liste
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function ListesPage() {
  const {
    wishlistSummaries,
    wishlists,
    isLoading,
    createWishlist,
    duplicateWishlist,
    deleteWishlist,
    getWishlist,
  } = useWishlist();

  const { canCreateQuote } = useB2BPermissions();

  // Feature flags
  const { isEnabled: hasLists, hasWishlist, hasSharedLists } = useListsFeatures();

  // Module disabled - show message
  if (!hasLists) {
    return (
      <EmptyState
        icon="folder"
        message="Module listes desactive"
        description="La fonctionnalite de gestion des listes n'est pas disponible pour votre compte."
      />
    );
  }

  const [ownershipFilter, setOwnershipFilter] = useState<OwnershipFilter>('all');
  const [templateFilter, setTemplateFilter] = useState<WishlistTemplate | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [shareModalList, setShareModalList] = useState<WishlistB2B | null>(null);

  // Filter wishlists
  const filteredWishlists = useMemo(() => {
    return wishlistSummaries.filter((list) => {
      // Ownership filter
      if (ownershipFilter === 'mine' && !list.isOwner) return false;
      if (ownershipFilter === 'shared' && !list.isSharedWithMe) return false;

      // Template filter
      if (templateFilter !== 'all' && list.template !== templateFilter) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          list.name.toLowerCase().includes(query) ||
          list.description?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [wishlistSummaries, ownershipFilter, templateFilter, searchQuery]);

  // Handlers
  const handleCreate = useCallback(
    async (name: string, template: WishlistTemplate, description?: string) => {
      await createWishlist({ name, template, description });
    },
    [createWishlist]
  );

  const handleDuplicate = useCallback(
    async (id: string) => {
      await duplicateWishlist(id);
    },
    [duplicateWishlist]
  );

  const handleShare = useCallback(
    (id: string) => {
      const list = getWishlist(id);
      if (list) {
        setShareModalList(list);
      }
    },
    [getWishlist]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (window.confirm('Etes-vous sur de vouloir supprimer cette liste ?')) {
        await deleteWishlist(id);
      }
    },
    [deleteWishlist]
  );

  // Loading state
  if (isLoading) {
    return <PageLoader message="Chargement des listes..." />;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <PageHeader
        title="Mes Listes"
        description={`${wishlistSummaries.length} liste${wishlistSummaries.length > 1 ? 's' : ''} - Gerez vos selections de produits`}
        actions={
          <ActionButton
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            icon={<PlusIcon />}
          >
            Nouvelle liste
          </ActionButton>
        }
      />

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted">
            <SearchIcon />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une liste..."
            className={cn(
              'w-full pl-10 pr-4 py-2 text-body-sm rounded-lg border border-stroke-medium',
              'focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary',
              'placeholder:text-content-muted'
            )}
          />
        </div>

        {/* Template Filter */}
        <select
          value={templateFilter}
          onChange={(e) => setTemplateFilter(e.target.value as WishlistTemplate | 'all')}
          className={cn(
            'px-4 py-2 text-body-sm rounded-lg border border-stroke-medium',
            'focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary'
          )}
        >
          {templateFilters.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        {/* View Toggle */}
        <div className="flex items-center rounded-lg border border-stroke-medium overflow-hidden">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 transition-colors',
              viewMode === 'grid'
                ? 'bg-primary text-white'
                : 'bg-white text-content-muted hover:text-content-primary'
            )}
            aria-label="Vue grille"
          >
            <GridIcon />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 transition-colors',
              viewMode === 'list'
                ? 'bg-primary text-white'
                : 'bg-white text-content-muted hover:text-content-primary'
            )}
            aria-label="Vue liste"
          >
            <ListIcon />
          </button>
        </div>
      </div>

      {/* Ownership Filter Tabs - Gate 'shared' option by lists.sharedLists */}
      <FilterTabs
        options={hasSharedLists ? ownershipFilters : ownershipFilters.filter(f => f.value !== 'shared')}
        value={ownershipFilter}
        onChange={setOwnershipFilter}
      />

      {/* Lists Grid/List */}
      {filteredWishlists.length === 0 ? (
        <EmptyState
          icon="folder"
          message={
            searchQuery || ownershipFilter !== 'all' || templateFilter !== 'all'
              ? 'Aucune liste correspondante'
              : 'Aucune liste pour le moment'
          }
          action={
            !searchQuery && ownershipFilter === 'all' && templateFilter === 'all'
              ? {
                  label: 'Creer votre premiere liste',
                  onClick: () => setIsCreateModalOpen(true),
                }
              : undefined
          }
        />
      ) : (
        <motion.div
          layout
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          )}
        >
          <AnimatePresence mode="popLayout">
            {filteredWishlists.map((list) => (
              <WishlistCard
                key={list.id}
                wishlist={list}
                onDuplicate={handleDuplicate}
                onShare={handleShare}
                onDelete={list.isDefault ? undefined : handleDelete}
                className={viewMode === 'list' ? 'flex-row items-center' : undefined}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Template Suggestions */}
      {wishlistSummaries.length > 0 && wishlistSummaries.length < 5 && (
        <section className="mt-12 p-6 bg-surface-secondary rounded-lg">
          <h2 className="font-sans text-body font-semibold text-content-primary mb-4">
            Suggestions de listes
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { template: 'seasonal_spring', label: 'Collection Printemps', icon: '🌸' },
              { template: 'bestsellers', label: 'Meilleures ventes', icon: '⭐' },
              { template: 'new_arrivals', label: 'Nouveautes a suivre', icon: '✨' },
              { template: 'reorder', label: 'A reapprovisionner', icon: '📦' },
            ].map((suggestion) => (
              <button
                key={suggestion.template}
                type="button"
                onClick={() => {
                  setTemplateFilter(suggestion.template as WishlistTemplate);
                  setIsCreateModalOpen(true);
                }}
                className={cn(
                  'p-4 rounded-lg border-2 border-dashed border-stroke-medium',
                  'hover:border-primary/20 hover:bg-white transition-all',
                  'text-left'
                )}
              >
                <span className="text-2xl mb-2 block">{suggestion.icon}</span>
                <span className="font-sans text-body-sm font-medium text-content-secondary">
                  {suggestion.label}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateListModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={handleCreate}
          />
        )}
      </AnimatePresence>

      {/* Share Modal */}
      {shareModalList && (
        <ShareListModal
          isOpen={!!shareModalList}
          onClose={() => setShareModalList(null)}
          wishlist={shareModalList}
        />
      )}
    </div>
  );
}
