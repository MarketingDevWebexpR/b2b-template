'use client';

/**
 * CartEmpty Component
 *
 * Elegant empty cart state with:
 * - Visual illustration
 * - Helpful message
 * - Product suggestions
 * - CTA to browse catalog
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Clock,
  Tag,
  Package,
} from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import type { Product } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface CartEmptyProps {
  title?: string;
  message?: string;
  showSuggestions?: boolean;
}

// ============================================================================
// Mock Suggested Products
// ============================================================================

const mockSuggestedProducts: Product[] = [
  {
    id: 'suggestion-1',
    reference: 'BG-2024-001',
    name: 'Bague Solitaire Or 18K',
    nameEn: 'Solitaire Ring 18K Gold',
    slug: 'bague-solitaire-or-18k',
    description: 'Elegante bague solitaire en or 18 carats',
    shortDescription: 'Solitaire or 18K',
    price: 850,
    isPriceTTC: false,
    images: ['/images/products/ring-gold.jpg'],
    categoryId: 'bagues',
    collection: 'Classique',
    style: 'Elegant',
    materials: ['Or 18K'],
    weight: 4.5,
    weightUnit: 'g',
    brand: 'WebexpR Pro',
    origin: 'France',
    warranty: 24,
    stock: 15,
    isAvailable: true,
    featured: true,
    isNew: false,
    createdAt: '2024-01-01',
  },
  {
    id: 'suggestion-2',
    reference: 'CO-2024-002',
    name: 'Collier Perles de Culture',
    nameEn: 'Cultured Pearl Necklace',
    slug: 'collier-perles-culture',
    description: 'Magnifique collier en perles de culture',
    shortDescription: 'Perles de culture',
    price: 450,
    isPriceTTC: false,
    images: ['/images/products/pearl-necklace.jpg'],
    categoryId: 'colliers',
    collection: 'Printemps/Ete',
    style: 'Classique',
    materials: ['Perles de culture', 'Or 14K'],
    weight: 25,
    weightUnit: 'g',
    brand: 'WebexpR Pro',
    origin: 'Japon',
    warranty: 24,
    stock: 8,
    isAvailable: true,
    featured: true,
    isNew: true,
    createdAt: '2024-06-01',
  },
  {
    id: 'suggestion-3',
    reference: 'BR-2024-003',
    name: 'Bracelet Argent Massif',
    nameEn: 'Sterling Silver Bracelet',
    slug: 'bracelet-argent-massif',
    description: 'Bracelet en argent massif 925',
    shortDescription: 'Argent massif 925',
    price: 180,
    isPriceTTC: false,
    images: ['/images/products/silver-bracelet.jpg'],
    categoryId: 'bracelets',
    collection: 'Automne/Hiver',
    style: 'Moderne',
    materials: ['Argent 925'],
    weight: 18,
    weightUnit: 'g',
    brand: 'WebexpR Pro',
    origin: 'Italie',
    warranty: 12,
    stock: 25,
    isAvailable: true,
    featured: false,
    isNew: false,
    createdAt: '2024-03-01',
  },
];

// ============================================================================
// Product Suggestion Card
// ============================================================================

interface SuggestionCardProps {
  product: Product;
  index: number;
}

function SuggestionCard({ product, index }: SuggestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link
        href={`/produits/${product.slug}`}
        className="group block bg-white rounded-lg border border-neutral-200 overflow-hidden hover:border-accent hover:shadow-md transition-all duration-200"
      >
        {/* Product Image */}
        <div className="relative aspect-square bg-neutral-100">
          <Image
            src={product.images[0] || '/images/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {product.isNew && (
            <span className="absolute top-2 left-2 px-2 py-1 bg-accent text-white text-xs font-medium rounded">
              Nouveau
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-medium text-neutral-900 line-clamp-1 group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Ref: {product.reference}
          </p>
          <p className="text-sm font-medium text-neutral-900 mt-2">
            {formatPrice(product.price)} HT
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

// ============================================================================
// Quick Links
// ============================================================================

function QuickLinks() {
  const links = [
    {
      icon: Sparkles,
      label: 'Nouveautes',
      href: '/nouveautes',
      description: 'Derniers produits',
    },
    {
      icon: Tag,
      label: 'Promotions',
      href: '/promotions',
      description: 'Offres speciales B2B',
    },
    {
      icon: Clock,
      label: 'Best-sellers',
      href: '/best-sellers',
      description: 'Les plus vendus',
    },
    {
      icon: Package,
      label: 'Categories',
      href: '/categories',
      description: 'Tous nos produits',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
      {links.map((link, index) => {
        const Icon = link.icon;
        return (
          <motion.div
            key={link.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Link
              href={link.href}
              className={cn(
                'flex flex-col items-center p-4',
                'bg-neutral-100 rounded-lg border border-transparent',
                'hover:border-accent hover:bg-accent/5',
                'transition-all duration-200 group'
              )}
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <span className="text-sm font-medium text-neutral-900">
                {link.label}
              </span>
              <span className="text-xs text-neutral-500 mt-0.5">
                {link.description}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function CartEmpty({
  title = 'Votre panier est vide',
  message = 'Decouvrez notre catalogue et trouvez les pieces qui correspondent a vos besoins professionnels.',
  showSuggestions = true,
}: CartEmptyProps) {
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  useEffect(() => {
    // In production, this would fetch from API
    setSuggestions(mockSuggestedProducts);
  }, []);

  return (
    <div className="py-8">
      {/* Empty State */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center max-w-lg mx-auto"
      >
        {/* Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-neutral-100 flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-neutral-400" strokeWidth={1} />
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center"
          >
            <span className="text-accent font-medium text-sm">0</span>
          </motion.div>
        </div>

        {/* Title */}
        <h2 className="font-sans font-semibold text-xl text-neutral-900 mb-3">
          {title}
        </h2>

        {/* Message */}
        <p className="text-sm text-neutral-500 mb-8">
          {message}
        </p>

        {/* CTA */}
        <Link
          href="/catalogue"
          className={cn(
            'inline-flex items-center gap-2',
            'px-8 py-4 rounded-lg',
            'bg-accent text-white',
            'text-sm font-medium uppercase tracking-wider',
            'transition-all duration-200',
            'hover:bg-accent/90 hover:shadow-md',
            'group'
          )}
        >
          Voir le catalogue
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </Link>

        {/* Quick Links */}
        <QuickLinks />
      </motion.div>

      {/* Product Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-sans font-semibold text-lg text-neutral-900">
              Suggestions pour vous
            </h3>
            <Link
              href="/catalogue"
              className="text-sm text-accent hover:text-accent/80 flex items-center gap-1 group"
            >
              Voir tout
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {suggestions.map((product, index) => (
              <SuggestionCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </motion.div>
      )}

      {/* B2B Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-16 p-8 bg-neutral-50 rounded-lg"
      >
        <h3 className="font-sans font-semibold text-lg text-neutral-900 mb-4 text-center">
          Avantages de votre compte professionnel
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
              <Tag className="w-6 h-6 text-accent" />
            </div>
            <h4 className="font-medium text-neutral-900 mb-1">Prix professionnels</h4>
            <p className="text-xs text-neutral-500">
              Tarifs dedies et remises volume selon votre niveau
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-accent" />
            </div>
            <h4 className="font-medium text-neutral-900 mb-1">Livraison rapide</h4>
            <p className="text-xs text-neutral-500">
              Expedition sous 24-48h ouvrees
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-accent" />
            </div>
            <h4 className="font-medium text-neutral-900 mb-1">Paniers sauvegardes</h4>
            <p className="text-xs text-neutral-500">
              Enregistrez vos selections pour plus tard
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default CartEmpty;
