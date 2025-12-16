'use client';

/**
 * AddToListModal Component
 *
 * Modal for adding a product to one or more wishlists.
 * Allows selecting existing lists or creating a new one inline.
 */

import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import { useWishlist } from '@/contexts/WishlistContext';
import type { Product } from '@/types';
import type { WishlistSummary } from '@maison/types';

// ============================================================================
// Icons
// ============================================================================

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg
    className="w-5 h-5"
    fill={filled ? 'currentColor' : 'none'}
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

// ============================================================================
// Types
// ============================================================================

interface AddToListModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Handler to close the modal */
  onClose: () => void;
  /** Product to add */
  product: Product;
  /** Callback after successful add */
  onSuccess?: (listId: string) => void;
}

// ============================================================================
// Component
// ============================================================================

export const AddToListModal = memo(function AddToListModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: AddToListModalProps) {
  const {
    wishlistSummaries,
    isInList,
    addToList,
    createWishlist,
    isLoading,
  } = useWishlist();

  const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set());
  const [suggestedQuantity, setSuggestedQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedLists(new Set());
      setSuggestedQuantity(1);
      setNotes('');
      setIsCreatingNew(false);
      setNewListName('');
      setShowSuccess(false);
    }
  }, [isOpen]);

  // Focus input when creating new list
  useEffect(() => {
    if (isCreatingNew && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreatingNew]);

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const toggleList = useCallback((listId: string) => {
    setSelectedLists((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(listId)) {
        newSet.delete(listId);
      } else {
        newSet.add(listId);
      }
      return newSet;
    });
  }, []);

  const handleCreateNewList = useCallback(async () => {
    if (!newListName.trim()) return;

    try {
      const newList = await createWishlist({ name: newListName.trim() });
      setSelectedLists((prev) => new Set([...Array.from(prev), newList.id]));
      setIsCreatingNew(false);
      setNewListName('');
    } catch (error) {
      console.error('Failed to create list:', error);
    }
  }, [newListName, createWishlist]);

  const handleSubmit = useCallback(async () => {
    if (selectedLists.size === 0) return;

    setIsSaving(true);
    try {
      const listIds = Array.from(selectedLists);
      for (const listId of listIds) {
        await addToList(listId, product, suggestedQuantity, notes || undefined);
      }
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
        onSuccess?.(listIds[0]);
      }, 1500);
    } catch (error) {
      console.error('Failed to add to lists:', error);
    } finally {
      setIsSaving(false);
    }
  }, [selectedLists, product, suggestedQuantity, notes, addToList, onClose, onSuccess]);

  const sortedLists = [...wishlistSummaries].sort((a, b) => {
    // Default favorites first
    if (a.isDefault && a.template === 'favorites') return -1;
    if (b.isDefault && b.template === 'favorites') return 1;
    // Then by name
    return a.name.localeCompare(b.name);
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-to-list-title"
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden"
          >
            {/* Success Overlay */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                    className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4"
                  >
                    <CheckIcon />
                  </motion.div>
                  <p className="font-sans text-body font-medium text-neutral-900">
                    Ajoute a {selectedLists.size} liste{selectedLists.size > 1 ? 's' : ''}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <h2 id="add-to-list-title" className="font-sans text-body font-semibold text-neutral-900">
                Ajouter a une liste
              </h2>
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'p-1 rounded text-neutral-500',
                  'hover:text-neutral-900 hover:bg-neutral-100 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
                )}
                aria-label="Fermer"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Product Preview */}
            <div className="flex items-center gap-4 px-6 py-4 bg-neutral-50 border-b border-neutral-200">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white shrink-0">
                <Image
                  src={product.images[0] || '/images/placeholder.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="min-w-0">
                <p className="font-sans text-body-sm font-medium text-neutral-900 line-clamp-1">
                  {product.name}
                </p>
                <p className="text-caption text-neutral-500">
                  Ref: {product.reference}
                </p>
                <p className="font-sans text-body-sm font-semibold text-neutral-900">
                  {formatCurrency(product.price)}
                </p>
              </div>
            </div>

            {/* Lists Selection */}
            <div className="px-6 py-4 max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {sortedLists.map((list) => {
                  const isInThisList = isInList(list.id, product.id);
                  const isSelected = selectedLists.has(list.id);

                  return (
                    <button
                      key={list.id}
                      type="button"
                      onClick={() => toggleList(list.id)}
                      disabled={isInThisList}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all',
                        isSelected
                          ? 'border-accent bg-accent/5'
                          : 'border-neutral-200 hover:border-accent/30',
                        isInThisList && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                          isSelected || isInThisList
                            ? 'bg-accent border-accent text-white'
                            : 'border-neutral-300'
                        )}
                      >
                        {(isSelected || isInThisList) && <CheckIcon />}
                      </div>

                      <div className={cn(
                        'shrink-0',
                        list.isDefault && list.template === 'favorites'
                          ? 'text-red-500'
                          : 'text-neutral-500'
                      )}>
                        {list.isDefault && list.template === 'favorites' ? (
                          <HeartIcon filled />
                        ) : (
                          <FolderIcon />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-body-sm font-medium text-neutral-900 line-clamp-1">
                          {list.name}
                        </p>
                        <p className="text-caption text-neutral-500">
                          {list.itemCount} article{list.itemCount !== 1 ? 's' : ''}
                          {isInThisList && ' - Deja dans cette liste'}
                        </p>
                      </div>
                    </button>
                  );
                })}

                {/* Create New List */}
                {isCreatingNew ? (
                  <div className="p-3 rounded-lg border-2 border-accent/30 bg-accent/5">
                    <div className="flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateNewList();
                          if (e.key === 'Escape') setIsCreatingNew(false);
                        }}
                        placeholder="Nom de la nouvelle liste"
                        className={cn(
                          'flex-1 px-3 py-2 text-body-sm rounded border border-neutral-300',
                          'focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent'
                        )}
                      />
                      <button
                        type="button"
                        onClick={handleCreateNewList}
                        disabled={!newListName.trim()}
                        className={cn(
                          'px-4 py-2 rounded font-sans text-body-sm font-medium',
                          'bg-accent text-white',
                          'hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed',
                          'transition-colors'
                        )}
                      >
                        Creer
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(true)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-neutral-300',
                      'hover:border-accent/50 hover:bg-accent/5 transition-all'
                    )}
                  >
                    <div className="w-5 h-5 flex items-center justify-center text-accent">
                      <PlusIcon />
                    </div>
                    <span className="font-sans text-body-sm font-medium text-accent">
                      Creer une nouvelle liste
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Quantity & Notes */}
            <div className="px-6 py-4 border-t border-neutral-200 space-y-4">
              {/* Suggested Quantity */}
              <div className="flex items-center justify-between">
                <label htmlFor="quantity" className="text-body-sm text-neutral-600">
                  Quantite suggeree
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSuggestedQuantity((q) => Math.max(1, q - 1))}
                    disabled={suggestedQuantity <= 1}
                    className={cn(
                      'p-1.5 rounded border border-neutral-300',
                      'hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed',
                      'transition-colors'
                    )}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    value={suggestedQuantity}
                    onChange={(e) => setSuggestedQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className={cn(
                      'w-16 px-2 py-1.5 text-center text-body-sm font-medium',
                      'border border-neutral-300 rounded',
                      'focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setSuggestedQuantity((q) => q + 1)}
                    className={cn(
                      'p-1.5 rounded border border-neutral-300',
                      'hover:bg-neutral-100 transition-colors'
                    )}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-body-sm text-neutral-600 mb-1">
                  Notes (optionnel)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ajouter une note pour ce produit..."
                  rows={2}
                  className={cn(
                    'w-full px-3 py-2 text-body-sm rounded border border-neutral-300',
                    'focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent',
                    'resize-none'
                  )}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 bg-neutral-50">
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'px-4 py-2 rounded-lg font-sans text-body-sm font-medium',
                  'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100',
                  'transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
                )}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={selectedLists.size === 0 || isSaving}
                className={cn(
                  'px-6 py-2 rounded-lg font-sans text-body-sm font-medium',
                  'bg-accent text-white',
                  'hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50'
                )}
              >
                {isSaving ? 'Ajout en cours...' : `Ajouter a ${selectedLists.size || 0} liste${selectedLists.size > 1 ? 's' : ''}`}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default AddToListModal;
