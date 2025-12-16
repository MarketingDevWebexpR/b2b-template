'use client';

import { memo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Gem,
  Watch,
  Link as ChainIcon,
  CircleDot,
  Sparkles,
  Crown,
  Gift,
  Tag,
} from 'lucide-react';

export interface QuickLink {
  id: string;
  label: string;
  href: string;
  icon: keyof typeof iconMap;
  color?: string;
}

const iconMap = {
  gem: Gem,
  watch: Watch,
  chain: ChainIcon,
  ring: CircleDot,
  sparkles: Sparkles,
  crown: Crown,
  gift: Gift,
  tag: Tag,
};

export interface QuickLinksBarProps {
  /** Links to display */
  links?: QuickLink[];
  /** Additional CSS classes */
  className?: string;
}

const defaultLinks: QuickLink[] = [
  { id: 'bagues', label: 'Bagues', href: '/categories/bagues', icon: 'ring' },
  { id: 'colliers', label: 'Colliers', href: '/categories/colliers', icon: 'chain' },
  { id: 'bracelets', label: 'Bracelets', href: '/categories/bracelets', icon: 'sparkles' },
  { id: 'boucles', label: 'Boucles', href: '/categories/boucles-oreilles', icon: 'gem' },
  { id: 'montres', label: 'Montres', href: '/categories/montres', icon: 'watch' },
  { id: 'pierres', label: 'Pierres', href: '/categories/pierres', icon: 'crown' },
  { id: 'promos', label: 'Promos', href: '/promotions', icon: 'tag', color: 'accent' },
  { id: 'nouveautes', label: 'Nouveau', href: '/nouveautes', icon: 'gift', color: 'success' },
];

export const QuickLinksBar = memo(function QuickLinksBar({
  links = defaultLinks,
  className,
}: QuickLinksBarProps) {
  return (
    <section className={cn('py-4 bg-white border-b border-stroke-light', className)}>
      <div className="container-ecom">
        <nav aria-label="Acces rapide aux categories">
          <ul className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 lg:mx-0 lg:px-0 lg:justify-center lg:flex-wrap">
            {links.map((link) => {
              const Icon = iconMap[link.icon];
              const colorClass = link.color === 'accent'
                ? 'text-accent hover:bg-accent-50 hover:text-accent-700'
                : link.color === 'success'
                ? 'text-success hover:bg-success-50 hover:text-success-700'
                : 'text-content-secondary hover:bg-primary-50 hover:text-primary';

              return (
                <li key={link.id} className="flex-shrink-0">
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-full',
                      'text-body-sm font-medium whitespace-nowrap',
                      'border border-stroke transition-all duration-200',
                      colorClass
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </section>
  );
});

QuickLinksBar.displayName = 'QuickLinksBar';

export default QuickLinksBar;
