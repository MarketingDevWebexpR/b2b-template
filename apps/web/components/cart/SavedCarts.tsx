'use client';

/**
 * SavedCarts Component - B2B Feature
 *
 * Manages saved carts with:
 * - List of saved carts
 * - Load/restore cart functionality
 * - Delete saved carts
 * - Share cart via link
 * - Empty state
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Trash2,
  RefreshCw,
  Share2,
  Copy,
  Check,
  Clock,
  ShoppingBag,
  MoreVertical,
  ExternalLink,
  AlertCircle,
  Bookmark,
} from 'lucide-react';
import { useCart, type SavedCart } from '@/contexts/CartContext';
import { formatPrice, cn, formatDate } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface SavedCartsProps {
  compact?: boolean;
}

// ============================================================================
// Confirmation Modal
// ============================================================================

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel,
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-md p-6 bg-white rounded-lg shadow-2xl mx-4"
      >
        <h3 className="font-sans font-semibold text-lg text-neutral-900 mb-2">
          {title}
        </h3>
        <p className="text-sm text-neutral-500 mb-6">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className={cn(
              'flex-1 px-4 py-3 rounded-lg',
              'border border-neutral-200',
              'text-sm font-medium text-neutral-900',
              'hover:bg-neutral-100 transition-colors'
            )}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'flex-1 px-4 py-3 rounded-lg',
              'text-sm font-medium text-white',
              'transition-colors',
              confirmVariant === 'danger'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-accent hover:bg-accent/90'
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// Share Modal
// ============================================================================

interface ShareModalProps {
  isOpen: boolean;
  shareLink: string;
  onClose: () => void;
}

function ShareModal({ isOpen, shareLink, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-md p-6 bg-white rounded-lg shadow-2xl mx-4"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-accent" />
          </div>
          <h3 className="font-sans font-semibold text-lg text-neutral-900">
            Partager le panier
          </h3>
        </div>

        <p className="text-sm text-neutral-500 mb-4">
          Utilisez ce lien pour partager ce panier avec un collegue ou le transferer
          sur un autre appareil.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={shareLink}
            readOnly
            className={cn(
              'flex-1 px-3 py-2 rounded-lg border border-neutral-200',
              'text-sm text-neutral-900 bg-neutral-100',
              'focus:outline-none'
            )}
          />
          <button
            onClick={handleCopy}
            className={cn(
              'px-4 py-2 rounded-lg',
              'bg-accent text-white',
              'text-sm font-medium',
              'hover:bg-accent/90 transition-colors',
              'flex items-center gap-2'
            )}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copie
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copier
              </>
            )}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 text-sm text-neutral-500 hover:text-accent transition-colors"
        >
          Fermer
        </button>
      </motion.div>
    </div>
  );
}

// ============================================================================
// Saved Cart Card
// ============================================================================

interface SavedCartCardProps {
  cart: SavedCart;
  onLoad: () => void;
  onDelete: () => void;
  onShare: () => void;
}

function SavedCartCard({ cart, onLoad, onDelete, onShare }: SavedCartCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative p-4 bg-white rounded-lg border border-neutral-200 hover:border-accent/50 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Cart Name */}
          <h3 className="font-medium text-neutral-900">{cart.name}</h3>

          {/* Meta info */}
          <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              {cart.itemCount} article{cart.itemCount > 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(cart.createdAt)}
            </span>
          </div>

          {/* Total */}
          <p className="mt-2 text-sm font-medium text-neutral-900">
            {formatPrice(cart.totalHT)} HT
          </p>

          {/* Shared badge */}
          {cart.sharedLink && (
            <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-accent/5 text-accent rounded text-xs">
              <ExternalLink className="w-3 h-3" />
              Partage
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-2xl border border-neutral-200 overflow-hidden z-20"
                >
                  <button
                    onClick={() => {
                      onLoad();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-neutral-900 hover:bg-neutral-100 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Restaurer
                  </button>
                  <button
                    onClick={() => {
                      onShare();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-neutral-900 hover:bg-neutral-100 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Partager
                  </button>
                  <button
                    onClick={() => {
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quick Load Button */}
      <button
        onClick={onLoad}
        className={cn(
          'w-full mt-4 py-2 rounded-lg',
          'border border-neutral-200',
          'text-sm font-medium text-neutral-900',
          'hover:border-accent hover:text-accent transition-colors',
          'flex items-center justify-center gap-2'
        )}
      >
        <RefreshCw className="w-4 h-4" />
        Charger ce panier
      </button>
    </motion.div>
  );
}

// ============================================================================
// Empty State
// ============================================================================

function SavedCartsEmpty() {
  return (
    <div className="flex flex-col items-center text-center py-12">
      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
        <Bookmark className="w-8 h-8 text-neutral-400" strokeWidth={1} />
      </div>
      <h3 className="font-sans font-semibold text-lg text-neutral-900 mb-2">
        Aucun panier sauvegarde
      </h3>
      <p className="text-sm text-neutral-500 max-w-md">
        Sauvegardez vos paniers pour les retrouver facilement plus tard.
        Ideal pour preparer vos commandes recurrentes ou partager une selection
        avec un collegue.
      </p>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function SavedCarts({ compact = false }: SavedCartsProps) {
  const { savedCarts, loadSavedCart, deleteSavedCart, shareSavedCart, cart } = useCart();

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmLoad, setConfirmLoad] = useState<string | null>(null);
  const [shareModal, setShareModal] = useState<{ isOpen: boolean; link: string }>({
    isOpen: false,
    link: '',
  });

  const handleLoad = useCallback(
    (cartId: string) => {
      // If current cart has items, confirm before loading
      if (cart.items.length > 0) {
        setConfirmLoad(cartId);
      } else {
        loadSavedCart(cartId);
      }
    },
    [cart.items.length, loadSavedCart]
  );

  const handleConfirmLoad = useCallback(() => {
    if (confirmLoad) {
      loadSavedCart(confirmLoad);
      setConfirmLoad(null);
    }
  }, [confirmLoad, loadSavedCart]);

  const handleDelete = useCallback((cartId: string) => {
    setConfirmDelete(cartId);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (confirmDelete) {
      deleteSavedCart(confirmDelete);
      setConfirmDelete(null);
    }
  }, [confirmDelete, deleteSavedCart]);

  const handleShare = useCallback(
    (cartId: string) => {
      const link = shareSavedCart(cartId);
      setShareModal({ isOpen: true, link });
    },
    [shareSavedCart]
  );

  if (savedCarts.length === 0) {
    return <SavedCartsEmpty />;
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {savedCarts.slice(0, 3).map((savedCart) => (
          <button
            key={savedCart.id}
            onClick={() => handleLoad(savedCart.id)}
            className={cn(
              'w-full flex items-center justify-between p-3',
              'bg-neutral-100 rounded-lg',
              'hover:bg-accent/5 transition-colors'
            )}
          >
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4 text-neutral-500" />
              <span className="text-sm text-neutral-900">{savedCart.name}</span>
            </div>
            <span className="text-xs text-neutral-500">
              {savedCart.itemCount} art.
            </span>
          </button>
        ))}
        {savedCarts.length > 3 && (
          <p className="text-xs text-neutral-500 text-center pt-2">
            +{savedCarts.length - 3} autre{savedCarts.length - 3 > 1 ? 's' : ''} panier{savedCarts.length - 3 > 1 ? 's' : ''}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-sans font-semibold text-lg text-neutral-900">
            Paniers sauvegardes
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            {savedCarts.length} panier{savedCarts.length > 1 ? 's' : ''} sauvegarde{savedCarts.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-accent/5 border border-accent/10 rounded-lg mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div className="text-sm text-accent">
            <p className="font-medium mb-1">A propos des paniers sauvegardes</p>
            <p className="text-accent/80">
              Charger un panier sauvegarde remplacera votre panier actuel. Pensez a
              sauvegarder votre panier en cours si necessaire.
            </p>
          </div>
        </div>
      </div>

      {/* Saved Carts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {savedCarts.map((savedCart) => (
            <SavedCartCard
              key={savedCart.id}
              cart={savedCart}
              onLoad={() => handleLoad(savedCart.id)}
              onDelete={() => handleDelete(savedCart.id)}
              onShare={() => handleShare(savedCart.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <ConfirmModal
            isOpen={!!confirmDelete}
            title="Supprimer ce panier ?"
            message="Cette action est irreversible. Le panier sauvegarde sera definitivement supprime."
            confirmLabel="Supprimer"
            confirmVariant="danger"
            onConfirm={handleConfirmDelete}
            onCancel={() => setConfirmDelete(null)}
          />
        )}
      </AnimatePresence>

      {/* Confirm Load Modal */}
      <AnimatePresence>
        {confirmLoad && (
          <ConfirmModal
            isOpen={!!confirmLoad}
            title="Remplacer votre panier actuel ?"
            message="Votre panier actuel contient des articles. Charger ce panier sauvegarde le remplacera."
            confirmLabel="Charger"
            confirmVariant="primary"
            onConfirm={handleConfirmLoad}
            onCancel={() => setConfirmLoad(null)}
          />
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {shareModal.isOpen && (
          <ShareModal
            isOpen={shareModal.isOpen}
            shareLink={shareModal.link}
            onClose={() => setShareModal({ isOpen: false, link: '' })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default SavedCarts;
