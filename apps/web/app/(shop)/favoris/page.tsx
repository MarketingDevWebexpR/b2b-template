'use client';

import { motion } from 'framer-motion';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ProductCard } from '@/components/products/ProductCard';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

/**
 * FavorisPage - User's wishlist/favorites page
 *
 * Features:
 * - Displays all wishlisted products in a grid layout
 * - Header with item count and clear all button
 * - Empty state with call to action
 * - Quick add to cart functionality
 * - Responsive design matching category pages
 */
export default function FavorisPage() {
  const { wishlist, clearWishlist, isLoading } = useWishlist();
  const { addToCart, openDrawer } = useCart();

  const handleQuickAdd = (product: Parameters<typeof addToCart>[0]) => {
    addToCart(product, 1);
    openDrawer();
  };

  const handleClearWishlist = () => {
    if (window.confirm('Voulez-vous vraiment vider votre liste de favoris ?')) {
      clearWishlist();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-background-cream">
        <Container>
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-hermes-500 border-t-transparent" />
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background-cream">
      {/* Page Header */}
      <section className="border-b border-border-light bg-white py-12 lg:py-16">
        <Container>
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[{ label: 'Mes Favoris' }]}
            className="mb-6"
          />

          {/* Title and Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Heart
                className="h-6 w-6 text-hermes-500"
                strokeWidth={1.5}
              />
              <h1 className="font-serif text-2xl tracking-tight text-text-primary lg:text-3xl">
                Mes Favoris
              </h1>
              {wishlist.totalItems > 0 && (
                <span className="rounded-full bg-hermes-50 px-3 py-1 font-sans text-xs font-medium text-hermes-600">
                  {wishlist.totalItems} {wishlist.totalItems > 1 ? 'articles' : 'article'}
                </span>
              )}
            </div>

            {/* Clear Button */}
            {wishlist.totalItems > 0 && (
              <button
                onClick={handleClearWishlist}
                className={cn(
                  'inline-flex items-center gap-2',
                  'font-sans text-xs font-medium uppercase tracking-luxe',
                  'text-text-muted transition-colors duration-250',
                  'hover:text-hermes-500',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2'
                )}
                aria-label="Vider la liste des favoris"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                <span>Tout supprimer</span>
              </button>
            )}
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-20">
        <Container>
          {wishlist.totalItems === 0 ? (
            /* Empty State */
            <motion.div
              className="flex flex-col items-center justify-center py-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-background-muted">
                <Heart
                  className="h-10 w-10 text-text-light"
                  strokeWidth={1}
                />
              </div>
              <h2 className="mb-2 font-serif text-xl text-text-primary">
                Votre liste de favoris est vide
              </h2>
              <p className="mb-8 max-w-md font-sans text-sm text-text-muted">
                Explorez nos collections et ajoutez vos pieces preferees en cliquant sur le coeur
                pour les retrouver facilement ici.
              </p>
              <Link
                href="/categories"
                className={cn(
                  'inline-flex items-center gap-3',
                  'bg-luxe-charcoal px-8 py-4',
                  'font-sans text-xs font-medium uppercase tracking-luxe text-text-inverse',
                  'transition-all duration-350 ease-luxe',
                  'hover:bg-luxe-noir',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-luxe-charcoal focus-visible:ring-offset-2'
                )}
              >
                <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
                <span>Decouvrir nos collections</span>
              </Link>
            </motion.div>
          ) : (
            /* Products Grid */
            <>
              {/* Results Header */}
              <div className="mb-8 flex items-center justify-between border-b border-border-light pb-4">
                <p className="font-sans text-sm text-text-muted">
                  <span className="font-medium text-text-primary">
                    {wishlist.totalItems}
                  </span>{' '}
                  {wishlist.totalItems > 1 ? 'pieces sauvegardees' : 'piece sauvegardee'}
                </p>
              </div>

              {/* Grid */}
              <motion.div
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                role="list"
                aria-label="Liste des favoris"
              >
                {wishlist.items.map((item, index) => (
                  <motion.div
                    key={item.product.id}
                    variants={itemVariants}
                    role="listitem"
                  >
                    <ProductCard
                      product={item.product}
                      onQuickAdd={handleQuickAdd}
                      priority={index < 5}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </Container>
      </section>

      {/* Continue Shopping CTA (when wishlist has items) */}
      {wishlist.totalItems > 0 && (
        <section className="border-t border-border-light bg-white py-12">
          <Container>
            <div className="flex flex-col items-center text-center">
              <p className="mb-4 font-sans text-sm text-text-muted">
                Envie de decouvrir d&apos;autres pieces ?
              </p>
              <Link
                href="/categories"
                className={cn(
                  'inline-flex items-center gap-2',
                  'font-sans text-xs font-medium uppercase tracking-luxe',
                  'text-hermes-500 transition-colors duration-250',
                  'hover:text-hermes-600',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2'
                )}
              >
                <span>Continuer mes achats</span>
                <span className="h-px w-8 bg-hermes-500 transition-all duration-350 hover:w-12" />
              </Link>
            </div>
          </Container>
        </section>
      )}
    </main>
  );
}
