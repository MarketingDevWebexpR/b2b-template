'use client';

/**
 * MegaMenuServices Component
 *
 * Services showcase section in the MegaMenu.
 * Displays B2B services and professional offerings.
 */

import { memo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Truck,
  CreditCard,
  Shield,
  Headphones,
  Package,
  FileText,
  Award,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MegaMenuServicesProps {
  /** Callback when link is clicked */
  onLinkClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

const services = [
  {
    id: 'service_1',
    icon: Truck,
    title: 'Livraison Express',
    description: 'Livraison 24/48h sur toute la France metropolitaine',
    href: '/services/livraison',
  },
  {
    id: 'service_2',
    icon: CreditCard,
    title: 'Paiement differe',
    description: 'Reglement a 30, 60 ou 90 jours selon votre profil',
    href: '/services/paiement',
  },
  {
    id: 'service_3',
    icon: Shield,
    title: 'Garantie Pro',
    description: 'Garantie etendue 2 ans sur tous nos produits',
    href: '/services/garantie',
  },
  {
    id: 'service_4',
    icon: Headphones,
    title: 'Support dedie',
    description: 'Un conseiller attitree pour vos besoins',
    href: '/services/support',
  },
];

const quickLinks = [
  { id: 'ql_1', icon: Package, label: 'Suivi de commandes', href: '/compte/commandes' },
  { id: 'ql_2', icon: FileText, label: 'Demande de devis', href: '/devis' },
  { id: 'ql_3', icon: Award, label: 'Programme fidelite', href: '/services/fidelite' },
  { id: 'ql_4', icon: Clock, label: 'Commande rapide', href: '/commande-rapide' },
];

export const MegaMenuServices = memo(function MegaMenuServices({
  onLinkClick,
  className,
}: MegaMenuServicesProps) {
  return (
    <div className={cn('grid grid-cols-12 gap-6', className)}>
      {/* Main services */}
      <div className="col-span-8">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
          Nos Services B2B
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <Link
                key={service.id}
                href={service.href}
                onClick={onLinkClick}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-xl',
                  'bg-neutral-50 border border-neutral-100',
                  'hover:bg-amber-50 hover:border-amber-200',
                  'transition-all duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20',
                  'group'
                )}
              >
                <div
                  className={cn(
                    'flex-shrink-0 w-10 h-10 rounded-lg',
                    'bg-white border border-neutral-200',
                    'flex items-center justify-center',
                    'group-hover:bg-amber-100 group-hover:border-amber-300',
                    'transition-colors duration-200'
                  )}
                >
                  <IconComponent className="w-5 h-5 text-neutral-500 group-hover:text-amber-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-amber-800">
                    {service.title}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1">
                    {service.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View all services */}
        <div className="mt-4 pt-4 border-t border-neutral-100">
          <Link
            href="/services"
            onClick={onLinkClick}
            className={cn(
              'flex items-center gap-2',
              'text-sm font-semibold text-amber-700',
              'hover:text-amber-800',
              'transition-colors duration-150'
            )}
          >
            <span>Voir tous nos services</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Quick links & Contact */}
      <div className="col-span-4">
        {/* Quick links */}
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
          Acces rapide
        </h3>
        <ul className="space-y-1">
          {quickLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <li key={link.id}>
                <Link
                  href={link.href}
                  onClick={onLinkClick}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                    'text-sm text-neutral-600',
                    'hover:bg-neutral-50 hover:text-neutral-900',
                    'transition-colors duration-150',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20'
                  )}
                >
                  <IconComponent className="w-4 h-4 text-neutral-400" />
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Contact card */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
          <h4 className="text-sm font-semibold text-amber-900">
            Besoin d&apos;aide ?
          </h4>
          <p className="text-xs text-amber-700 mt-1">
            Notre equipe commerciale est disponible du lundi au vendredi de 9h a 18h.
          </p>
          <div className="mt-3 space-y-2">
            <a
              href="tel:+33140123456"
              className={cn(
                'flex items-center gap-2',
                'text-sm font-medium text-amber-800',
                'hover:text-amber-900 transition-colors'
              )}
            >
              <Headphones className="w-4 h-4" />
              <span>01 40 12 34 56</span>
            </a>
            <a
              href="mailto:pro@maisonbijoux.fr"
              className={cn(
                'text-sm text-amber-700',
                'hover:text-amber-800 transition-colors'
              )}
            >
              pro@maisonbijoux.fr
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

MegaMenuServices.displayName = 'MegaMenuServices';

export default MegaMenuServices;
