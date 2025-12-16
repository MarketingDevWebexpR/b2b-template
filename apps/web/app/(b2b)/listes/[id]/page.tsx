'use client';

/**
 * Wishlist Detail Page
 *
 * Displays a single wishlist with all products, actions,
 * and management options.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatCurrency, formatRelativeDate } from '@/lib/formatters';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useListsFeatures } from '@/contexts/FeatureContext';
import { WishlistProductRow, ShareListModal } from '@/components/wishlist';
import {
  PageHeader,
  PageLoader,
  EmptyState,
  ActionButton,
} from '@/components/b2b';

// ============================================================================
// Icons
// ============================================================================

const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const CartIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ShareIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);

const DuplicateIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// ============================================================================
// Helper Functions
// ============================================================================

function getVisibilityInfo(visibility: string) {
  switch (visibility) {
    case 'private':
      return { icon: <LockIcon />, label: 'Prive', color: 'text-gray-600' };
    case 'shared':
      return { icon: <UsersIcon />, label: 'Partage', color: 'text-blue-600' };
    case 'public':
      return { icon: <GlobeIcon />, label: 'Public', color: 'text-green-600' };
    default:
      return { icon: <LockIcon />, label: 'Prive', color: 'text-gray-600' };
  }
}

// ============================================================================
// Edit Name Modal
// ============================================================================

interface EditNameModalProps {
  isOpen: boolean;
  currentName: string;
  currentDescription?: string;
  onClose: () => void;
  onSave: (name: string, description?: string) => void;
}

function EditNameModal({
  isOpen,
  currentName,
  currentDescription,
  onClose,
  onSave,
}: EditNameModalProps) {
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription || '');

  useEffect(() => {
    setName(currentName);
    setDescription(currentDescription || '');
  }, [currentName, currentDescription, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim(), description.trim() || undefined);
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b border-stroke-light">
            <h2 className="font-sans text-body font-semibold text-content-primary">
              Modifier la liste
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="editName" className="block text-body-sm font-medium text-content-primary mb-1">
                Nom de la liste
              </label>
              <input
                id="editName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
                className={cn(
                  'w-full px-4 py-2 text-body-sm rounded border border-stroke-medium',
                  'focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary'
                )}
              />
            </div>

            <div>
              <label htmlFor="editDescription" className="block text-body-sm font-medium text-content-primary mb-1">
                Description
              </label>
              <textarea
                id="editDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
            <button type="button" onClick={onClose} className="px-4 py-2 text-body-sm text-content-secondary hover:text-content-primary">
              Annuler
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className={cn(
                'px-6 py-2 rounded-lg font-sans text-body-sm font-medium',
                'bg-primary text-white hover:bg-primary-600',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              Enregistrer
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

export default function WishlistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;

  const {
    getWishlist,
    updateWishlist,
    deleteWishlist,
    duplicateWishlist,
    removeFromList,
    updateItem,
    clearList,
    isLoading,
  } = useWishlist();

  const { addToCart } = useCart();

  // Feature flags
  const { isEnabled: hasLists } = useListsFeatures();

  // Module disabled - show message
  if (!hasLists) {
    return (
      <EmptyState
        icon="folder"
        message="Module listes desactive"
        description="La fonctionnalite de gestion des listes n'est pas disponible pour votre compte."
        action={{ label: 'Retour', href: '/tableau-de-bord' }}
      />
    );
  }

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const wishlist = getWishlist(listId);

  // Reset selection when list changes
  useEffect(() => {
    setSelectedItems(new Set());
    setSelectionMode(false);
  }, [listId]);

  // Computed values
  const selectedTotal = useMemo(() => {
    if (!wishlist || selectedItems.size === 0) return 0;
    return wishlist.items
      .filter((item) => selectedItems.has(item.id))
      .reduce((sum, item) => sum + item.currentPrice * item.suggestedQuantity, 0);
  }, [wishlist, selectedItems]);

  const visibilityInfo = wishlist ? getVisibilityInfo(wishlist.visibility) : null;

  // Handlers
  const handleSelectItem = useCallback((itemId: string, selected: boolean) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (!wishlist) return;
    if (selectedItems.size === wishlist.items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(wishlist.items.map((item) => item.id)));
    }
  }, [wishlist, selectedItems.size]);

  const handleQuantityChange = useCallback(
    async (itemId: string, quantity: number) => {
      await updateItem(listId, itemId, quantity);
    },
    [listId, updateItem]
  );

  const handleNotesChange = useCallback(
    async (itemId: string, notes: string) => {
      await updateItem(listId, itemId, undefined, notes);
    },
    [listId, updateItem]
  );

  const handleRemoveItem = useCallback(
    async (itemId: string) => {
      await removeFromList(listId, itemId);
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    },
    [listId, removeFromList]
  );

  const handleAddToCart = useCallback(async () => {
    if (!wishlist) return;

    setIsAddingToCart(true);
    try {
      const itemsToAdd = selectionMode
        ? wishlist.items.filter((item) => selectedItems.has(item.id))
        : wishlist.items;

      // Add each item to cart
      for (const item of itemsToAdd) {
        if (item.isAvailable) {
          addToCart(
            {
              id: item.productId,
              name: item.productName,
              reference: item.productReference,
              price: item.currentPrice,
              images: [item.productImage],
              stock: item.stockAvailable,
              isAvailable: item.isAvailable,
            } as any,
            item.suggestedQuantity
          );
        }
      }

      // Reset selection
      setSelectedItems(new Set());
      setSelectionMode(false);
    } finally {
      setIsAddingToCart(false);
    }
  }, [wishlist, selectionMode, selectedItems, addToCart]);

  const handleUpdateList = useCallback(
    async (name: string, description?: string) => {
      await updateWishlist(listId, { name, description });
    },
    [listId, updateWishlist]
  );

  const handleDuplicate = useCallback(async () => {
    const duplicated = await duplicateWishlist(listId);
    router.push(`/listes/${duplicated.id}`);
  }, [listId, duplicateWishlist, router]);

  const handleDelete = useCallback(async () => {
    if (window.confirm('Etes-vous sur de vouloir supprimer cette liste ?')) {
      await deleteWishlist(listId);
      router.push('/listes');
    }
  }, [listId, deleteWishlist, router]);

  const handleClearList = useCallback(async () => {
    if (window.confirm('Etes-vous sur de vouloir vider cette liste ?')) {
      await clearList(listId);
    }
  }, [listId, clearList]);

  // Loading state
  if (isLoading) {
    return <PageLoader message="Chargement de la liste..." />;
  }

  // Not found
  if (!wishlist) {
    return (
      <div className="p-6 lg:p-8">
        <EmptyState
          icon="folder"
          message="Liste introuvable"
          action={{
            label: 'Retour aux listes',
            href: '/listes',
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Back Link */}
      <Link
        href="/listes"
        className={cn(
          'inline-flex items-center gap-2 text-body-sm text-content-muted',
          'hover:text-content-primary transition-colors'
        )}
      >
        <ArrowLeftIcon />
        Retour aux listes
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-sans text-h2 text-content-primary">
              {wishlist.name}
            </h1>
            {!wishlist.isDefault && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className={cn(
                  'p-1 rounded text-content-muted',
                  'hover:text-content-primary hover:bg-surface-secondary transition-colors'
                )}
                aria-label="Modifier le nom"
              >
                <EditIcon />
              </button>
            )}
          </div>

          {wishlist.description && (
            <p className="text-body text-content-secondary mb-2">
              {wishlist.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-caption text-content-muted">
            {/* Visibility */}
            <span className={cn('flex items-center gap-1', visibilityInfo?.color)}>
              {visibilityInfo?.icon}
              {visibilityInfo?.label}
            </span>

            {/* Collaborators */}
            {wishlist.collaborators.length > 0 && (
              <span className="flex items-center gap-1">
                <UsersIcon />
                {wishlist.collaborators.length} collaborateur{wishlist.collaborators.length > 1 ? 's' : ''}
              </span>
            )}

            {/* Last Update */}
            <span>
              Mis a jour {formatRelativeDate(wishlist.updatedAt)} par {wishlist.lastUpdatedByName}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <ActionButton
            variant="secondary"
            onClick={() => setIsShareModalOpen(true)}
            icon={<ShareIcon />}
          >
            Partager
          </ActionButton>

          <ActionButton
            variant="secondary"
            onClick={handleDuplicate}
            icon={<DuplicateIcon />}
          >
            Dupliquer
          </ActionButton>

          {!wishlist.isDefault && (
            <ActionButton
              variant="danger"
              onClick={handleDelete}
              icon={<TrashIcon />}
            >
              Supprimer
            </ActionButton>
          )}
        </div>
      </div>

      {/* Summary Bar */}
      {wishlist.items.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-surface-secondary rounded-lg">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-caption text-content-muted">Articles</p>
              <p className="font-sans text-body font-semibold text-content-primary">
                {wishlist.itemCount}
              </p>
            </div>
            <div>
              <p className="text-caption text-content-muted">Total estime</p>
              <p className="font-sans text-body font-semibold text-content-primary">
                {formatCurrency(wishlist.estimatedTotal, wishlist.currency)}
              </p>
            </div>
            {selectionMode && selectedItems.size > 0 && (
              <div>
                <p className="text-caption text-content-muted">Selection</p>
                <p className="font-sans text-body font-semibold text-primary">
                  {selectedItems.size} article{selectedItems.size > 1 ? 's' : ''} - {formatCurrency(selectedTotal)}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Selection Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                setSelectionMode(!selectionMode);
                setSelectedItems(new Set());
              }}
              className={cn(
                'px-3 py-2 text-body-sm rounded-lg border transition-colors',
                selectionMode
                  ? 'border-primary bg-primary-50 text-primary-600'
                  : 'border-stroke-medium text-content-secondary hover:bg-surface-secondary'
              )}
            >
              {selectionMode ? 'Annuler selection' : 'Selectionner'}
            </button>

            {selectionMode && (
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-3 py-2 text-body-sm text-content-secondary hover:text-content-primary"
              >
                {selectedItems.size === wishlist.items.length ? 'Tout deselectionner' : 'Tout selectionner'}
              </button>
            )}

            {/* Add to Cart */}
            <ActionButton
              variant="primary"
              onClick={handleAddToCart}
              disabled={isAddingToCart || (selectionMode && selectedItems.size === 0)}
              icon={<CartIcon />}
            >
              {isAddingToCart
                ? 'Ajout...'
                : selectionMode
                ? `Ajouter ${selectedItems.size} au panier`
                : 'Tout ajouter au panier'}
            </ActionButton>
          </div>
        </div>
      )}

      {/* Products List */}
      {wishlist.items.length === 0 ? (
        <EmptyState
          icon="box"
          message="Cette liste est vide"
          action={{
            label: 'Parcourir les produits',
            href: '/produits',
          }}
        />
      ) : (
        <section
          className="bg-white rounded-lg border border-stroke-light overflow-hidden"
          aria-labelledby="products-heading"
        >
          <h2 id="products-heading" className="sr-only">Produits de la liste</h2>
          <AnimatePresence mode="popLayout">
            {wishlist.items.map((item) => (
              <WishlistProductRow
                key={item.id}
                item={item}
                listId={listId}
                isSelected={selectedItems.has(item.id)}
                selectionMode={selectionMode}
                isEditable={wishlist.visibility !== 'public'}
                onSelect={handleSelectItem}
                onQuantityChange={handleQuantityChange}
                onNotesChange={handleNotesChange}
                onRemove={handleRemoveItem}
              />
            ))}
          </AnimatePresence>
        </section>
      )}

      {/* Quick Actions */}
      {wishlist.items.length > 0 && !wishlist.isDefault && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleClearList}
            className={cn(
              'text-body-sm text-red-600 hover:text-red-700',
              'transition-colors'
            )}
          >
            Vider la liste
          </button>
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <EditNameModal
            isOpen={isEditModalOpen}
            currentName={wishlist.name}
            currentDescription={wishlist.description}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleUpdateList}
          />
        )}
      </AnimatePresence>

      {/* Share Modal */}
      {isShareModalOpen && (
        <ShareListModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          wishlist={wishlist}
        />
      )}
    </div>
  );
}
