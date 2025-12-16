'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * EmptyState size configurations - B2B Jewelry Design System
 */
const emptyStateSizes = {
  sm: {
    container: 'py-8 px-4',
    icon: 'w-12 h-12',
    title: 'text-base',
    description: 'text-sm',
  },
  md: {
    container: 'py-12 px-6',
    icon: 'w-16 h-16',
    title: 'text-lg',
    description: 'text-sm',
  },
  lg: {
    container: 'py-16 px-8',
    icon: 'w-20 h-20',
    title: 'text-xl',
    description: 'text-base',
  },
};

export interface EmptyStateProps {
  /** Empty state title */
  title: string;
  /** Description text */
  description?: string;
  /** Icon to display */
  icon?: ReactNode;
  /** Action button or content */
  action?: ReactNode;
  /** Size variant */
  size?: keyof typeof emptyStateSizes;
  /** Variant style */
  variant?: 'default' | 'card' | 'inline';
  /** Additional CSS classes */
  className?: string;
}

/**
 * EmptyState component for displaying when content is empty.
 *
 * B2B Jewelry Design:
 * - Clean, informative design
 * - Clear call-to-action
 * - Professional appearance
 * - Multiple contexts (tables, lists, search results)
 *
 * @example
 * // Basic empty state
 * <EmptyState
 *   title="Aucune commande"
 *   description="Vous n'avez pas encore passe de commande."
 *   action={<Button>Parcourir le catalogue</Button>}
 * />
 *
 * // With custom icon
 * <EmptyState
 *   icon={<SearchIcon />}
 *   title="Aucun resultat"
 *   description="Essayez avec d'autres mots-cles."
 * />
 */
const EmptyState = ({
  title,
  description,
  icon,
  action,
  size = 'md',
  variant = 'default',
  className,
}: EmptyStateProps) => {
  const sizeConfig = emptyStateSizes[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizeConfig.container,
        variant === 'card' && 'bg-white border border-neutral-200 rounded-lg shadow-sm',
        variant === 'inline' && 'bg-neutral-50 rounded-lg',
        className
      )}
    >
      {/* Icon */}
      {icon ? (
        <div
          className={cn(
            'flex items-center justify-center',
            'text-neutral-400 mb-4',
            sizeConfig.icon
          )}
        >
          {icon}
        </div>
      ) : (
        <DefaultEmptyIcon className={cn(sizeConfig.icon, 'text-neutral-300 mb-4')} />
      )}

      {/* Title */}
      <h3
        className={cn(
          'font-sans font-semibold text-neutral-900',
          sizeConfig.title
        )}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={cn(
            'font-sans text-neutral-500 mt-2 max-w-sm',
            sizeConfig.description
          )}
        >
          {description}
        </p>
      )}

      {/* Action */}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';

/**
 * Default empty state icon
 */
function DefaultEmptyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  );
}

/**
 * Preset empty states for common use cases
 */

// No search results
export interface NoResultsProps {
  query?: string;
  onClear?: () => void;
  className?: string;
}

export const NoResults = ({ query, onClear, className }: NoResultsProps) => (
  <EmptyState
    icon={<SearchIcon />}
    title={query ? `Aucun resultat pour "${query}"` : 'Aucun resultat'}
    description="Essayez avec d'autres termes de recherche ou filtres."
    action={
      onClear && (
        <button
          onClick={onClear}
          className="text-sm font-medium text-accent hover:text-accent/80 transition-colors"
        >
          Effacer la recherche
        </button>
      )
    }
    className={className}
  />
);

// Empty cart
export const EmptyCart = ({ className }: { className?: string }) => (
  <EmptyState
    icon={<CartIcon />}
    title="Votre panier est vide"
    description="Parcourez notre catalogue pour trouver les bijoux parfaits."
    className={className}
  />
);

// No orders
export const NoOrders = ({ className }: { className?: string }) => (
  <EmptyState
    icon={<OrdersIcon />}
    title="Aucune commande"
    description="Vous n'avez pas encore passe de commande."
    className={className}
  />
);

// No favorites
export const NoFavorites = ({ className }: { className?: string }) => (
  <EmptyState
    icon={<HeartIcon />}
    title="Aucun favori"
    description="Ajoutez des produits a vos favoris pour les retrouver facilement."
    className={className}
  />
);

// No products (admin/catalog)
export const NoProducts = ({ className }: { className?: string }) => (
  <EmptyState
    icon={<BoxIcon />}
    title="Aucun produit"
    description="Aucun produit ne correspond a vos criteres de recherche."
    className={className}
  />
);

// Error state
export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState = ({
  title = 'Une erreur est survenue',
  description = 'Nous n\'avons pas pu charger les donnees. Veuillez reessayer.',
  onRetry,
  className,
}: ErrorStateProps) => (
  <EmptyState
    icon={<ErrorIcon />}
    title={title}
    description={description}
    action={
      onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors"
        >
          <RefreshIcon className="w-4 h-4" />
          Reessayer
        </button>
      )
    }
    className={className}
  />
);

// Offline state
export const OfflineState = ({ className }: { className?: string }) => (
  <EmptyState
    icon={<OfflineIcon />}
    title="Vous etes hors ligne"
    description="Verifiez votre connexion internet et reessayez."
    className={className}
  />
);

// Coming soon
export const ComingSoon = ({
  title = 'Bientot disponible',
  className,
}: {
  title?: string;
  className?: string;
}) => (
  <EmptyState
    icon={<SparklesIcon />}
    title={title}
    description="Cette fonctionnalite sera disponible prochainement."
    className={className}
  />
);

/**
 * Icon components
 */
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-full h-full', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-full h-full', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  );
}

function OrdersIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-full h-full', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-full h-full', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-full h-full', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-full h-full', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-full h-full', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function OfflineIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-full h-full', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.5 7.5c1.864-.4 3.824-.278 5.55.326m2.88 2.078a9.003 9.003 0 011.59 2.025M4.93 9.93a9.003 9.003 0 014.64-2.874M6.36 12.36a6.003 6.003 0 012.556-1.706M8.79 14.79a3.003 3.003 0 012.882-1.203M12 18v.01" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-full h-full', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

export {
  EmptyState,
  emptyStateSizes,
};
