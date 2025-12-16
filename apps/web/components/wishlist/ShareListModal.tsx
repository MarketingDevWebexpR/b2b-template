'use client';

/**
 * ShareListModal Component
 *
 * Modal for sharing a wishlist with collaborators.
 * Supports email invitations, public links, and permission management.
 */

import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useWishlistSharing, useWishlist } from '@/contexts/WishlistContext';
import type { WishlistB2B, WishlistCollaborator, WishlistPermission } from '@maison/types';

// ============================================================================
// Icons
// ============================================================================

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const UserPlusIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

// ============================================================================
// Types
// ============================================================================

interface ShareListModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Handler to close the modal */
  onClose: () => void;
  /** Wishlist to share */
  wishlist: WishlistB2B;
}

// ============================================================================
// Helper Components
// ============================================================================

interface CollaboratorRowProps {
  collaborator: WishlistCollaborator;
  onRemove: (id: string) => void;
  onPermissionChange: (id: string, permission: WishlistPermission) => void;
}

const CollaboratorRow = memo(function CollaboratorRow({
  collaborator,
  onRemove,
  onPermissionChange,
}: CollaboratorRowProps) {
  const initials = collaborator.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center justify-between py-3 border-b border-neutral-200 last:border-0">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-medium text-sm">
          {initials}
        </div>

        {/* Info */}
        <div>
          <p className="font-sans text-body-sm font-medium text-neutral-900">
            {collaborator.name}
          </p>
          <p className="text-caption text-neutral-500">{collaborator.email}</p>
        </div>

        {/* Pending Badge */}
        {collaborator.isPending && (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
            En attente
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <select
          value={collaborator.permission}
          onChange={(e) => onPermissionChange(collaborator.id, e.target.value as WishlistPermission)}
          className={cn(
            'px-2 py-1 text-caption rounded border border-neutral-300',
            'focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent'
          )}
        >
          <option value="view">Peut voir</option>
          <option value="edit">Peut modifier</option>
        </select>

        <button
          type="button"
          onClick={() => onRemove(collaborator.id)}
          className={cn(
            'p-2 rounded text-neutral-500',
            'hover:text-red-600 hover:bg-red-50 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500'
          )}
          aria-label={`Retirer ${collaborator.name}`}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
});

// ============================================================================
// Main Component
// ============================================================================

export const ShareListModal = memo(function ShareListModal({
  isOpen,
  onClose,
  wishlist,
}: ShareListModalProps) {
  const { getWishlist } = useWishlist();
  const {
    shareList,
    removeCollaborator,
    updateCollaboratorPermission,
    generatePublicLink,
    revokePublicLink,
  } = useWishlistSharing();

  // Get latest wishlist data
  const currentWishlist = getWishlist(wishlist.id) || wishlist;

  const [emails, setEmails] = useState('');
  const [permission, setPermission] = useState<WishlistPermission>('view');
  const [message, setMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'people' | 'link'>('people');

  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside
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

  const handleShare = useCallback(async () => {
    const emailList = emails
      .split(/[,;\s]+/)
      .map((e) => e.trim())
      .filter((e) => e.includes('@'));

    if (emailList.length === 0) return;

    setIsSharing(true);
    try {
      await shareList(currentWishlist.id, {
        emails: emailList,
        permission,
        message: message || undefined,
      });
      setEmails('');
      setMessage('');
    } catch (error) {
      console.error('Failed to share:', error);
    } finally {
      setIsSharing(false);
    }
  }, [emails, permission, message, currentWishlist.id, shareList]);

  const handleRemoveCollaborator = useCallback(
    async (collaboratorId: string) => {
      try {
        await removeCollaborator(currentWishlist.id, collaboratorId);
      } catch (error) {
        console.error('Failed to remove collaborator:', error);
      }
    },
    [currentWishlist.id, removeCollaborator]
  );

  const handlePermissionChange = useCallback(
    async (collaboratorId: string, newPermission: WishlistPermission) => {
      try {
        await updateCollaboratorPermission(currentWishlist.id, collaboratorId, newPermission);
      } catch (error) {
        console.error('Failed to update permission:', error);
      }
    },
    [currentWishlist.id, updateCollaboratorPermission]
  );

  const handleGeneratePublicLink = useCallback(async () => {
    setIsGeneratingLink(true);
    try {
      await generatePublicLink(currentWishlist.id);
    } catch (error) {
      console.error('Failed to generate link:', error);
    } finally {
      setIsGeneratingLink(false);
    }
  }, [currentWishlist.id, generatePublicLink]);

  const handleRevokePublicLink = useCallback(async () => {
    try {
      await revokePublicLink(currentWishlist.id);
    } catch (error) {
      console.error('Failed to revoke link:', error);
    }
  }, [currentWishlist.id, revokePublicLink]);

  const handleCopyLink = useCallback(async () => {
    if (currentWishlist.publicShareLink) {
      try {
        await navigator.clipboard.writeText(currentWishlist.publicShareLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  }, [currentWishlist.publicShareLink]);

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
          aria-labelledby="share-list-title"
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <h2 id="share-list-title" className="font-sans text-body font-semibold text-neutral-900">
                Partager "{currentWishlist.name}"
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

            {/* Tabs */}
            <div className="flex border-b border-neutral-200">
              <button
                type="button"
                onClick={() => setActiveTab('people')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3',
                  'font-sans text-body-sm font-medium transition-colors',
                  activeTab === 'people'
                    ? 'text-accent border-b-2 border-accent'
                    : 'text-neutral-500 hover:text-neutral-900'
                )}
              >
                <UserPlusIcon />
                Personnes
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('link')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3',
                  'font-sans text-body-sm font-medium transition-colors',
                  activeTab === 'link'
                    ? 'text-accent border-b-2 border-accent'
                    : 'text-neutral-500 hover:text-neutral-900'
                )}
              >
                <LinkIcon />
                Lien public
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === 'people' ? (
                <div className="space-y-6">
                  {/* Add People Form */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="emails" className="block text-body-sm font-medium text-neutral-900 mb-1">
                        Ajouter des personnes
                      </label>
                      <div className="relative">
                        <MailIcon />
                        <input
                          id="emails"
                          type="text"
                          value={emails}
                          onChange={(e) => setEmails(e.target.value)}
                          placeholder="email@exemple.com, autre@exemple.com"
                          className={cn(
                            'w-full pl-10 pr-4 py-2 text-body-sm rounded border border-neutral-300',
                            'focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent'
                          )}
                          style={{ paddingLeft: '2.5rem' }}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                          <MailIcon />
                        </div>
                      </div>
                      <p className="mt-1 text-caption text-neutral-500">
                        Separez les emails par des virgules
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label htmlFor="permission" className="block text-caption text-neutral-500 mb-1">
                          Permission
                        </label>
                        <select
                          id="permission"
                          value={permission}
                          onChange={(e) => setPermission(e.target.value as WishlistPermission)}
                          className={cn(
                            'w-full px-3 py-2 text-body-sm rounded border border-neutral-300',
                            'focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent'
                          )}
                        >
                          <option value="view">Peut voir</option>
                          <option value="edit">Peut modifier</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={handleShare}
                        disabled={!emails.includes('@') || isSharing}
                        className={cn(
                          'mt-5 px-4 py-2 rounded font-sans text-body-sm font-medium',
                          'bg-accent text-white',
                          'hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed',
                          'transition-colors'
                        )}
                      >
                        {isSharing ? 'Envoi...' : 'Inviter'}
                      </button>
                    </div>

                    {/* Optional Message */}
                    <div>
                      <label htmlFor="message" className="block text-caption text-neutral-500 mb-1">
                        Message (optionnel)
                      </label>
                      <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ajouter un message personnel..."
                        rows={2}
                        className={cn(
                          'w-full px-3 py-2 text-body-sm rounded border border-neutral-300',
                          'focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent',
                          'resize-none'
                        )}
                      />
                    </div>
                  </div>

                  {/* Collaborators List */}
                  {currentWishlist.collaborators.length > 0 && (
                    <div>
                      <h3 className="font-sans text-body-sm font-medium text-neutral-900 mb-3">
                        Personnes ayant acces ({currentWishlist.collaborators.length})
                      </h3>
                      <div className="max-h-48 overflow-y-auto">
                        {currentWishlist.collaborators.map((collaborator) => (
                          <CollaboratorRow
                            key={collaborator.id}
                            collaborator={collaborator}
                            onRemove={handleRemoveCollaborator}
                            onPermissionChange={handlePermissionChange}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Public Link Section */}
                  <div>
                    <h3 className="font-sans text-body-sm font-medium text-neutral-900 mb-2">
                      Lien public
                    </h3>
                    <p className="text-caption text-neutral-500 mb-4">
                      Toute personne ayant ce lien peut voir la liste (lecture seule).
                    </p>

                    {currentWishlist.publicShareLink ? (
                      <div className="space-y-3">
                        {/* Link Display */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={currentWishlist.publicShareLink}
                            readOnly
                            className={cn(
                              'flex-1 px-3 py-2 text-body-sm rounded border border-neutral-300',
                              'bg-neutral-100 text-neutral-600'
                            )}
                          />
                          <button
                            type="button"
                            onClick={handleCopyLink}
                            className={cn(
                              'p-2 rounded border border-neutral-300',
                              'hover:bg-neutral-100 transition-colors',
                              isCopied && 'bg-green-50 border-green-500 text-green-600'
                            )}
                            aria-label="Copier le lien"
                          >
                            {isCopied ? <CheckIcon /> : <CopyIcon />}
                          </button>
                        </div>

                        {isCopied && (
                          <p className="text-caption text-green-600">Lien copie dans le presse-papier</p>
                        )}

                        {/* Revoke Button */}
                        <button
                          type="button"
                          onClick={handleRevokePublicLink}
                          className={cn(
                            'text-body-sm text-red-600 hover:text-red-700',
                            'transition-colors'
                          )}
                        >
                          Revoquer le lien public
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGeneratePublicLink}
                        disabled={isGeneratingLink}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2 rounded',
                          'border-2 border-dashed border-neutral-300',
                          'hover:border-accent/50 hover:bg-accent/5',
                          'transition-all'
                        )}
                      >
                        <LinkIcon />
                        <span className="font-sans text-body-sm font-medium text-neutral-600">
                          {isGeneratingLink ? 'Generation...' : 'Generer un lien public'}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Info Box */}
                  <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="text-caption text-amber-800">
                      <strong>Attention:</strong> Le lien public permet a n'importe qui de voir votre liste.
                      Les prix et informations produits seront visibles.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-neutral-200 bg-neutral-50">
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'px-4 py-2 rounded-lg font-sans text-body-sm font-medium',
                  'bg-accent text-white',
                  'hover:bg-accent/90 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50'
                )}
              >
                Terminer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default ShareListModal;
