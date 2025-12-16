'use client';

import { memo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Truck,
  CreditCard,
  Shield,
  HeadphonesIcon,
  Package,
  Clock,
} from 'lucide-react';

export interface ServiceItem {
  id: string;
  icon: keyof typeof iconMap;
  title: string;
  description: string;
  href?: string;
}

const iconMap = {
  truck: Truck,
  creditCard: CreditCard,
  shield: Shield,
  headphones: HeadphonesIcon,
  package: Package,
  clock: Clock,
};

export interface ServicesHighlightsProps {
  /** Services to display */
  services?: ServiceItem[];
  /** Background variant */
  variant?: 'default' | 'highlight';
  /** Additional CSS classes */
  className?: string;
}

const defaultServices: ServiceItem[] = [
  {
    id: 'livraison',
    icon: 'truck',
    title: 'Livraison Express 24h',
    description: 'Gratuite des 500€ HT',
    href: '/services/livraison',
  },
  {
    id: 'paiement',
    icon: 'creditCard',
    title: 'Paiement Differe',
    description: '30/60/90 jours sans frais',
    href: '/services/paiement',
  },
  {
    id: 'garantie',
    icon: 'shield',
    title: 'Garantie Pro',
    description: 'Echange sous 30 jours',
    href: '/services/garantie',
  },
  {
    id: 'support',
    icon: 'headphones',
    title: 'Support Dedie',
    description: 'Conseiller attitré 7j/7',
    href: '/services/support',
  },
];

export const ServicesHighlights = memo(function ServicesHighlights({
  services = defaultServices,
  variant = 'default',
  className,
}: ServicesHighlightsProps) {
  return (
    <section
      className={cn(
        'py-6 lg:py-8',
        variant === 'highlight' ? 'bg-primary-50' : 'bg-surface-secondary',
        className
      )}
    >
      <div className="container-ecom">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {services.map((service) => {
            const Icon = iconMap[service.icon];
            const content = (
              <div
                className={cn(
                  'flex flex-col items-center text-center p-4 lg:p-6 rounded-xl',
                  'bg-white border border-stroke-light',
                  'transition-all duration-200',
                  service.href && 'hover:border-primary hover:shadow-md cursor-pointer'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 mb-3',
                    'rounded-full bg-primary-50 text-primary'
                  )}
                >
                  <Icon className="w-6 h-6 lg:w-7 lg:h-7" />
                </div>
                <h3 className="text-body-sm lg:text-body font-semibold text-content-primary mb-1">
                  {service.title}
                </h3>
                <p className="text-caption lg:text-body-sm text-content-muted">
                  {service.description}
                </p>
              </div>
            );

            if (service.href) {
              return (
                <Link key={service.id} href={service.href} className="block">
                  {content}
                </Link>
              );
            }

            return <div key={service.id}>{content}</div>;
          })}
        </div>
      </div>
    </section>
  );
});

ServicesHighlights.displayName = 'ServicesHighlights';

export default ServicesHighlights;
