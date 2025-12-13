'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  /** Display label for the breadcrumb */
  label: string;
  /** URL path - if not provided, item is considered current/active */
  href?: string;
}

interface BreadcrumbsProps {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];
  /** Additional CSS classes */
  className?: string;
  /** Show home icon instead of "Accueil" text */
  showHomeIcon?: boolean;
  /** Variant style */
  variant?: 'default' | 'minimal';
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

/**
 * Breadcrumbs - Elegant navigation breadcrumbs with Hermes-inspired styling
 *
 * Features:
 * - Animated appearance on mount
 * - Home icon option
 * - Accessible with proper ARIA attributes
 * - Minimal variant for simpler layouts
 */
export function Breadcrumbs({
  items,
  className,
  showHomeIcon = false,
  variant = 'default',
}: BreadcrumbsProps) {
  // Prepend home if not already first item
  const allItems: BreadcrumbItem[] = [
    { label: 'Accueil', href: '/' },
    ...items,
  ];

  return (
    <nav
      aria-label="Fil d'Ariane"
      className={cn(
        variant === 'minimal' ? 'py-2' : 'py-4',
        className
      )}
    >
      <motion.ol
        className="flex flex-wrap items-center gap-1"
        initial="hidden"
        animate="visible"
        role="list"
      >
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isHome = index === 0;

          return (
            <motion.li
              key={item.href || item.label}
              className="flex items-center"
              variants={itemVariants}
              custom={index}
            >
              {/* Separator */}
              {index > 0 && (
                <ChevronRight
                  className="mx-2 h-3.5 w-3.5 flex-shrink-0 text-border-dark"
                  aria-hidden="true"
                  strokeWidth={1.5}
                />
              )}

              {/* Breadcrumb Item */}
              {isLast || !item.href ? (
                <span
                  className={cn(
                    'font-sans text-xs uppercase tracking-elegant',
                    variant === 'default'
                      ? 'text-hermes-500'
                      : 'text-text-primary'
                  )}
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'group inline-flex items-center font-sans text-xs uppercase tracking-elegant',
                    'text-text-muted transition-colors duration-250 ease-luxe',
                    'hover:text-hermes-500'
                  )}
                >
                  {isHome && showHomeIcon ? (
                    <Home className="h-3.5 w-3.5" strokeWidth={1.5} />
                  ) : (
                    <span className="relative">
                      {item.label}
                      {/* Underline animation */}
                      <span
                        className={cn(
                          'absolute -bottom-0.5 left-0 h-px w-0 bg-hermes-500',
                          'transition-all duration-350 ease-luxe-out',
                          'group-hover:w-full'
                        )}
                        aria-hidden="true"
                      />
                    </span>
                  )}
                </Link>
              )}
            </motion.li>
          );
        })}
      </motion.ol>
    </nav>
  );
}

export default Breadcrumbs;
