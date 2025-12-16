'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { CompanyAddress } from '@maison/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

/**
 * Props for AddressCard component
 */
export interface AddressCardProps {
  /** Address data */
  address: CompanyAddress;
  /** Whether this card is selected */
  isSelected?: boolean;
  /** Whether actions are disabled */
  disabled?: boolean;
  /** Callback when edit is clicked */
  onEdit?: (address: CompanyAddress) => void;
  /** Callback when delete is clicked */
  onDelete?: (address: CompanyAddress) => void;
  /** Callback when set as default is clicked */
  onSetDefault?: (address: CompanyAddress) => void;
  /** Callback when card is clicked */
  onClick?: (address: CompanyAddress) => void;
  /** Additional class names */
  className?: string;
}

/**
 * Address type configuration for display
 */
const addressTypeConfig: Record<
  string,
  { label: string; variant: 'info' | 'warning' | 'success' | 'primary-soft' }
> = {
  billing: { label: 'Facturation', variant: 'info' },
  shipping: { label: 'Livraison', variant: 'success' },
  headquarters: { label: 'Siege', variant: 'primary-soft' },
  warehouse: { label: 'Entrepot', variant: 'warning' },
};

/**
 * Country code to name mapping (common European countries)
 */
const countryNames: Record<string, string> = {
  FR: 'France',
  BE: 'Belgique',
  CH: 'Suisse',
  LU: 'Luxembourg',
  DE: 'Allemagne',
  IT: 'Italie',
  ES: 'Espagne',
  NL: 'Pays-Bas',
  GB: 'Royaume-Uni',
  PT: 'Portugal',
};

/**
 * AddressCard Component
 *
 * Displays a company address in a card format with badges for type
 * and default status. Includes a dropdown menu for actions.
 *
 * @example
 * ```tsx
 * <AddressCard
 *   address={address}
 *   onEdit={(addr) => openEditModal(addr)}
 *   onDelete={(addr) => confirmDelete(addr)}
 *   onSetDefault={(addr) => setAsDefault(addr)}
 * />
 * ```
 */
export function AddressCard({
  address,
  isSelected = false,
  disabled = false,
  onEdit,
  onDelete,
  onSetDefault,
  onClick,
  className,
}: AddressCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  const handleCardClick = useCallback(() => {
    if (onClick && !disabled) {
      onClick(address);
    }
  }, [onClick, address, disabled]);

  const handleMenuToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!disabled) {
        setIsMenuOpen((prev) => !prev);
      }
    },
    [disabled]
  );

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsMenuOpen(false);
      onEdit?.(address);
    },
    [onEdit, address]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsMenuOpen(false);
      onDelete?.(address);
    },
    [onDelete, address]
  );

  const handleSetDefault = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsMenuOpen(false);
      onSetDefault?.(address);
    },
    [onSetDefault, address]
  );

  const typeConfig = addressTypeConfig[address.type] || {
    label: address.type,
    variant: 'light' as const,
  };

  const countryName = countryNames[address.countryCode] || address.countryCode;
  const hasActions = onEdit || onDelete || onSetDefault;

  return (
    <article
      className={cn(
        'relative bg-white rounded-lg border',
        'transition-all duration-200',
        isSelected
          ? 'border-accent ring-2 ring-accent/20'
          : 'border-neutral-200 hover:border-neutral-300 hover:shadow-sm',
        onClick && !disabled && 'cursor-pointer',
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
      onClick={handleCardClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick && !disabled) {
          e.preventDefault();
          onClick(address);
        }
      }}
      aria-label={`Adresse: ${address.label}`}
    >
      {/* Header with badges and menu */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={typeConfig.variant} size="sm">
            {typeConfig.label}
          </Badge>
          {address.isDefault && (
            <Badge variant="primary" size="sm">
              Par defaut
            </Badge>
          )}
          {address.isVerified && (
            <Badge variant="success" size="xs">
              <svg
                className="w-3 h-3 mr-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Verifiee
            </Badge>
          )}
        </div>

        {/* Actions menu */}
        {hasActions && !disabled && (
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={handleMenuToggle}
              className={cn(
                'p-1.5 rounded-lg',
                'text-content-muted hover:text-content-primary',
                'hover:bg-surface-secondary',
                'transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
              )}
              aria-label="Actions"
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>

            {/* Dropdown menu */}
            {isMenuOpen && (
              <div
                ref={menuRef}
                className={cn(
                  'absolute right-0 top-full mt-1 z-10',
                  'min-w-[160px] py-1',
                  'bg-white rounded-lg border border-stroke-light shadow-lg',
                  'animate-in fade-in zoom-in-95 duration-150'
                )}
                role="menu"
              >
                {onEdit && (
                  <button
                    onClick={handleEdit}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2',
                      'font-sans text-body-sm text-content-primary',
                      'hover:bg-surface-secondary',
                      'transition-colors duration-150'
                    )}
                    role="menuitem"
                  >
                    <svg
                      className="w-4 h-4 text-content-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Modifier
                  </button>
                )}
                {onSetDefault && !address.isDefault && (
                  <button
                    onClick={handleSetDefault}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2',
                      'font-sans text-body-sm text-content-primary',
                      'hover:bg-surface-secondary',
                      'transition-colors duration-150'
                    )}
                    role="menuitem"
                  >
                    <svg
                      className="w-4 h-4 text-content-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                    Definir par defaut
                  </button>
                )}
                {onDelete && (
                  <>
                    <div className="my-1 border-t border-stroke-light" />
                    <button
                      onClick={handleDelete}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2',
                        'font-sans text-body-sm text-red-600',
                        'hover:bg-red-50',
                        'transition-colors duration-150'
                      )}
                      role="menuitem"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Supprimer
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Address content */}
      <div className="px-4 pb-4">
        {/* Label */}
        <h3 className="font-sans text-heading-5 text-content-primary mb-2">
          {address.label}
        </h3>

        {/* Company name */}
        <p className="font-sans text-body-sm font-medium text-content-secondary mb-1">
          {address.companyName}
        </p>

        {/* Contact / Attention */}
        {address.attention && (
          <p className="font-sans text-body-sm text-content-muted mb-1">
            A l'attention de: {address.attention}
          </p>
        )}

        {/* Address lines */}
        <address className="font-sans text-body-sm text-content-secondary not-italic space-y-0.5 mt-3">
          <p>{address.addressLine1}</p>
          {address.addressLine2 && <p>{address.addressLine2}</p>}
          <p>
            {address.postalCode} {address.city}
            {address.state && `, ${address.state}`}
          </p>
          <p>{countryName}</p>
        </address>

        {/* Phone */}
        {address.phone && (
          <p className="font-sans text-body-sm text-content-muted mt-2 flex items-center gap-1.5">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            {address.phone}
          </p>
        )}

        {/* Delivery instructions */}
        {address.deliveryInstructions && (
          <p className="font-sans text-caption text-content-muted mt-2 italic">
            Note: {address.deliveryInstructions}
          </p>
        )}
      </div>
    </article>
  );
}

export default AddressCard;
