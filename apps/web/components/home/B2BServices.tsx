'use client';

/**
 * B2BServices Component
 *
 * Displays B2B service offerings in a professional grid layout.
 * Highlights key business advantages for professional customers.
 *
 * Services include:
 * - Fast delivery (24h express)
 * - Dedicated support
 * - Business credit
 * - Bulk ordering
 * - Returns policy
 * - Secure payments
 *
 * Design: Clean, professional B2B style with icons and descriptions
 */

import { memo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface Service {
  /** Service ID */
  id: string;
  /** Service icon (JSX) */
  icon: React.ReactNode;
  /** Service title */
  title: string;
  /** Short description */
  description: string;
  /** Optional link for more info */
  link?: string;
  /** Highlight color variant */
  variant?: 'primary' | 'accent' | 'success' | 'info';
}

export interface B2BServicesProps {
  /** Custom services (overrides defaults) */
  services?: Service[];
  /** Section title */
  title?: string;
  /** Show section in compact mode */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Default Services
// ============================================================================

const defaultServices: Service[] = [
  {
    id: 'delivery',
    title: 'Livraison express 24h',
    description: 'Livraison en 24h pour les commandes passees avant 14h. Suivi en temps reel.',
    variant: 'primary',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
  {
    id: 'support',
    title: 'Support dedie',
    description: 'Un conseiller attitré pour repondre a toutes vos questions. Disponible par tel ou email.',
    variant: 'accent',
    link: '/contact',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
  },
  {
    id: 'credit',
    title: 'Credit entreprise',
    description: 'Jusqu\'a 30 jours de credit sans frais. Gestion simplifiee de votre tresorerie.',
    variant: 'success',
    link: '/services/credit',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
  },
  {
    id: 'bulk',
    title: 'Commandes en gros',
    description: 'Tarifs degressifs selon les quantites. Import CSV pour les grosses commandes.',
    variant: 'info',
    link: '/commande-rapide',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    id: 'returns',
    title: 'Retours simplifies',
    description: 'Retours gratuits sous 30 jours. Processus simplifie avec bordereau pre-rempli.',
    variant: 'primary',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
      </svg>
    ),
  },
  {
    id: 'security',
    title: 'Paiements securises',
    description: 'Transactions cryptees SSL. Virement, CB, prelevement SEPA acceptes.',
    variant: 'success',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

// ============================================================================
// Variant Styles
// ============================================================================

const iconVariantStyles = {
  primary: 'bg-neutral-100 text-neutral-700 group-hover:bg-neutral-200',
  accent: 'bg-orange-50 text-orange-600 group-hover:bg-orange-100',
  success: 'bg-green-50 text-green-600 group-hover:bg-green-100',
  info: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
};

// ============================================================================
// Sub-components
// ============================================================================

interface ServiceCardProps {
  service: Service;
  compact?: boolean;
}

const ServiceCard = memo(function ServiceCard({ service, compact }: ServiceCardProps) {
  const Content = (
    <div
      className={cn(
        'group flex',
        compact ? 'items-center gap-4' : 'flex-col items-start',
        'p-6',
        'bg-white rounded-xl',
        'border border-neutral-200',
        service.link && 'hover:border-neutral-300 hover:shadow-md cursor-pointer',
        'transition-all duration-200'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center',
          compact ? 'w-12 h-12' : 'w-14 h-14 mb-4',
          'rounded-xl',
          'transition-colors duration-200',
          iconVariantStyles[service.variant || 'primary']
        )}
      >
        {service.icon}
      </div>

      {/* Content */}
      <div className={cn(compact && 'flex-1')}>
        <h3
          className={cn(
            'text-base text-neutral-900 font-semibold',
            !compact && 'mb-2'
          )}
        >
          {service.title}
        </h3>
        <p
          className={cn(
            'text-sm text-neutral-600',
            'leading-relaxed'
          )}
        >
          {service.description}
        </p>
      </div>

      {/* Link indicator */}
      {service.link && (
        <div
          className={cn(
            compact ? 'ml-auto' : 'mt-4',
            'flex items-center gap-1',
            'text-xs text-accent group-hover:text-orange-600',
            'font-medium',
            'transition-colors duration-200'
          )}
        >
          En savoir plus
          <svg
            className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      )}
    </div>
  );

  if (service.link) {
    return (
      <Link
        href={service.link}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-xl"
      >
        {Content}
      </Link>
    );
  }

  return Content;
});

ServiceCard.displayName = 'ServiceCard';

// ============================================================================
// Main Component
// ============================================================================

export const B2BServices = memo(function B2BServices({
  services,
  title = 'Nos services B2B',
  compact = false,
  className,
}: B2BServicesProps) {
  const displayServices = services && services.length > 0 ? services : defaultServices;

  return (
    <section
      className={cn('py-12 lg:py-16', className)}
      aria-labelledby="b2b-services-title"
    >
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section header */}
        <div className="text-center mb-10">
          <h2
            id="b2b-services-title"
            className="text-2xl font-bold text-neutral-900"
          >
            {title}
          </h2>
          <p className="mt-2 text-sm text-neutral-600 max-w-2xl mx-auto">
            Des services adaptes aux professionnels pour simplifier votre activite
            et optimiser vos achats.
          </p>
        </div>

        {/* Services grid */}
        <div
          className={cn(
            'grid gap-4 lg:gap-6',
            compact
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          )}
          role="list"
          aria-label="Liste des services B2B"
        >
          {displayServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              compact={compact}
            />
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-10 text-center">
          <p className="text-sm text-neutral-600 mb-4">
            Besoin d'informations supplementaires sur nos services ?
          </p>
          <Link
            href="/contact"
            className={cn(
              'inline-flex items-center gap-2',
              'px-6 py-3',
              'text-sm font-medium',
              'text-white bg-accent hover:bg-orange-600',
              'rounded-lg',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
            )}
          >
            Contactez-nous
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
});

B2BServices.displayName = 'B2BServices';

export default B2BServices;
