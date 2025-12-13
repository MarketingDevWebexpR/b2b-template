'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * EmptyCart - Empty cart state component
 *
 * Features:
 * - Elegant empty state illustration
 * - Helpful message
 * - CTA to browse collections
 * - Smooth animations
 */
export function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="py-16 md:py-24 text-center"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mx-auto mb-8"
      >
        <div
          className={cn(
            'relative inline-flex items-center justify-center',
            'w-24 h-24 md:w-32 md:h-32',
            'rounded-full',
            'bg-background-warm',
            'border border-border-light'
          )}
        >
          <ShoppingBag
            className="w-10 h-10 md:w-12 md:h-12 text-text-light"
            strokeWidth={1}
          />

          {/* Decorative ring */}
          <div
            className={cn(
              'absolute inset-0',
              'rounded-full',
              'border border-dashed border-border-medium',
              'animate-[spin_20s_linear_infinite]'
            )}
          />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="font-serif text-heading-2 md:text-display-2 text-text-primary mb-4"
      >
        Votre panier est vide
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mx-auto max-w-md font-sans text-body-lg text-text-muted leading-elegant mb-10"
      >
        Decouvrez nos collections de haute joaillerie et laissez-vous seduire
        par des pieces d'exception, creees par nos maitres artisans.
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Link
          href="/collections"
          className={cn(
            'group inline-flex items-center gap-3',
            'px-8 py-4',
            'bg-luxe-charcoal !text-white',
            'font-sans text-body-sm uppercase tracking-luxe font-medium',
            'transition-all duration-350 ease-luxe',
            'hover:bg-hermes-500',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2'
          )}
        >
          <span>Decouvrir nos collections</span>
          <ArrowRight
            className={cn(
              'w-4 h-4',
              'transition-transform duration-300 ease-luxe',
              'group-hover:translate-x-1'
            )}
            strokeWidth={1.5}
          />
        </Link>
      </motion.div>

      {/* Decorative Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-16 flex items-center justify-center gap-8"
      >
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-border-light" />
        <span className="font-serif text-caption text-text-light italic">
          L'excellence artisanale depuis 1987
        </span>
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-border-light" />
      </motion.div>
    </motion.div>
  );
}
