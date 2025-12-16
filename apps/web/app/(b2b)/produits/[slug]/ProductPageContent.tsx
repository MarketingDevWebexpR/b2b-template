'use client';

/**
 * ProductPageContent - Client-side Product Page Content
 *
 * Handles all interactive elements of the product page including:
 * - State management for variants and quantity
 * - Context integration (pricing, warehouse, cart)
 * - Event handlers for actions
 *
 * @packageDocumentation
 */

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Container } from '@/components/ui/Container';
import { Modal } from '@/components/ui/Modal';
import {
  ProductGallery,
  ProductInfo,
  ProductPricing,
  ProductVariants,
  ProductActions,
  ProductTabs,
  RelatedProducts,
  type GalleryMedia,
  type ProductVariant,
  type VariantAttribute,
  type ProductSpecification,
  type ProductDocument,
  type ProductReview,
  type ProductQuestion,
  type RelatedProduct,
} from '@/components/products/ProductDetail';
import { usePricing } from '@/contexts/PricingContext';
import { useWarehouse } from '@/contexts/WarehouseContext';
import { useCart } from '@/contexts/CartContext';
import type { Product, ProductStock } from '@maison/types';

// ============================================================================
// Types
// ============================================================================

interface ProductPageContentProps {
  product: Product;
  galleryMedia: GalleryMedia[];
  variants: ProductVariant[];
  variantAttributes: VariantAttribute[];
  productStock: ProductStock;
  specifications: ProductSpecification[];
  documents: ProductDocument[];
  reviews: ProductReview[];
  questions: ProductQuestion[];
  relatedProducts: {
    similar: RelatedProduct[];
    complementary: RelatedProduct[];
  };
  initialVariantId?: string;
}

// ============================================================================
// Animation Variants
// ============================================================================

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// ============================================================================
// Component
// ============================================================================

export function ProductPageContent({
  product,
  galleryMedia,
  variants,
  variantAttributes,
  productStock,
  specifications,
  documents,
  reviews,
  questions,
  relatedProducts,
  initialVariantId,
}: ProductPageContentProps) {
  // Contexts
  const { formatPrice, settings: pricingSettings } = usePricing();
  const { selectedWarehouse } = useWarehouse();
  const { addToCart, openDrawer } = useCart();

  // State
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    () => variants.find((v) => v.id === initialVariantId || v.isDefault) || variants[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Computed values
  const currentPrice = selectedVariant?.price ?? product.price;
  const compareAtPrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice;

  // Variant images for gallery
  const variantImages = useMemo(() => {
    const mapping: Record<string, string[]> = {};
    variants.forEach((v) => {
      if (v.images && v.images.length > 0) {
        mapping[v.id] = v.images;
      }
    });
    return mapping;
  }, [variants]);

  // Handle variant selection
  const handleVariantSelect = useCallback((variant: ProductVariant) => {
    setSelectedVariant(variant);
    // Reset quantity if needed based on stock
    if (variant.stockQuantity < quantity) {
      setQuantity(Math.max(1, variant.stockQuantity));
    }
  }, [quantity]);

  // Handle quantity change
  const handleQuantityChange = useCallback((newQuantity: number) => {
    setQuantity(newQuantity);
  }, []);

  // Handle add to cart
  const handleAddToCart = useCallback(async (qty: number) => {
    // In production, this would use proper cart management with variants
    const cartProduct = {
      ...product,
      price: currentPrice,
      reference: selectedVariant?.sku || product.reference,
    };

    addToCart(cartProduct, qty);
    openDrawer();

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));
  }, [product, currentPrice, selectedVariant, addToCart, openDrawer]);

  // Handle wishlist toggle
  const handleWishlistToggle = useCallback(() => {
    setIsInWishlist((prev) => !prev);
    // In production, this would call an API
  }, []);

  // Handle quote request
  const handleRequestQuote = useCallback((qty: number) => {
    setIsQuoteModalOpen(true);
  }, []);

  // Handle add related product to cart
  const handleAddRelatedToCart = useCallback(async (relatedProduct: RelatedProduct) => {
    const cartProduct = {
      id: relatedProduct.id,
      reference: relatedProduct.reference,
      name: relatedProduct.name,
      slug: relatedProduct.slug,
      description: '',
      shortDescription: '',
      price: relatedProduct.price,
      compareAtPrice: relatedProduct.compareAtPrice,
      isPriceTTC: false,
      images: relatedProduct.images || [],
      categoryId: '',
      materials: [],
      weightUnit: 'g' as const,
      stock: 10,
      isAvailable: relatedProduct.isAvailable ?? true,
      featured: false,
      isNew: relatedProduct.isNew ?? false,
      createdAt: new Date().toISOString(),
    };

    addToCart(cartProduct, 1);
    openDrawer();

    await new Promise((resolve) => setTimeout(resolve, 300));
  }, [addToCart, openDrawer]);

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-white"
    >
      <Container className="py-6 md:py-8">
        {/* Main Product Section */}
        <motion.section variants={sectionVariants} className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Gallery */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ProductGallery
                media={galleryMedia}
                productName={product.name}
                productRef={product.reference}
                selectedVariantId={selectedVariant?.id}
                variantImages={variantImages}
                enableLightbox
                showZoomIndicator
              />
            </div>

            {/* Right Column - Product Info */}
            <div className="space-y-8">
              {/* Product Info */}
              <ProductInfo
                product={product}
                showDetailedInfo
                showCollectionInfo
              />

              {/* Pricing */}
              <div className="pt-4 border-t border-neutral-200">
                <ProductPricing
                  productId={product.id}
                  basePrice={currentPrice}
                  compareAtPrice={compareAtPrice}
                  quantity={quantity}
                  showVolumeTiers
                  showPriceSource
                  onTierClick={(tier) => {
                    if (tier.minQuantity) {
                      setQuantity(tier.minQuantity);
                    }
                  }}
                />
              </div>

              {/* Variants */}
              {variants.length > 1 && (
                <div className="pt-4 border-t border-neutral-200">
                  <ProductVariants
                    variants={variants}
                    attributes={variantAttributes}
                    selectedVariantId={selectedVariant?.id}
                    onVariantSelect={handleVariantSelect}
                    showStock
                    showSizeGuide={variantAttributes.some((a) => a.type === 'size')}
                    onSizeGuideClick={() => setIsSizeGuideOpen(true)}
                    formatPrice={(price) => formatPrice(price, { format: 'ht' })}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-neutral-200">
                <ProductActions
                  productId={product.id}
                  productName={product.name}
                  unitPrice={currentPrice}
                  formatPrice={(price) => formatPrice(price, { format: pricingSettings.displayFormat })}
                  stock={productStock}
                  minQuantity={1}
                  maxQuantity={100}
                  quantityStep={1}
                  isInWishlist={isInWishlist}
                  selectedWarehouse={selectedWarehouse}
                  onQuantityChange={handleQuantityChange}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleWishlistToggle}
                  onRequestQuote={handleRequestQuote}
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Product Tabs Section */}
        <motion.section variants={sectionVariants} className="mb-12">
          <ProductTabs
            description={product.description}
            specifications={specifications}
            documents={documents}
            reviews={reviews}
            questions={questions}
            defaultTab="description"
          />
        </motion.section>

        {/* Related Products - Similar */}
        {relatedProducts.similar.length > 0 && (
          <motion.section variants={sectionVariants}>
            <RelatedProducts
              type="similar"
              products={relatedProducts.similar}
              formatPrice={(price) => formatPrice(price, { format: 'ht' })}
              onAddToCart={handleAddRelatedToCart}
              showQuickAdd
            />
          </motion.section>
        )}

        {/* Related Products - Complementary */}
        {relatedProducts.complementary.length > 0 && (
          <motion.section variants={sectionVariants}>
            <RelatedProducts
              type="complementary"
              products={relatedProducts.complementary}
              formatPrice={(price) => formatPrice(price, { format: 'ht' })}
              onAddToCart={handleAddRelatedToCart}
              showQuickAdd
            />
          </motion.section>
        )}
      </Container>

      {/* Size Guide Modal */}
      <Modal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        title="Guide des tailles"
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-neutral-600">
            Retrouvez ci-dessous les longueurs disponibles pour ce collier et nos conseils pour choisir la taille ideale.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="py-3 px-4 text-left font-medium text-neutral-900">Longueur</th>
                  <th className="py-3 px-4 text-left font-medium text-neutral-900">Style</th>
                  <th className="py-3 px-4 text-left font-medium text-neutral-900">Recommande pour</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-neutral-200">
                  <td className="py-3 px-4 text-neutral-900">42 cm</td>
                  <td className="py-3 px-4 text-neutral-600">Ras de cou</td>
                  <td className="py-3 px-4 text-neutral-600">Decollete V ou rond</td>
                </tr>
                <tr className="border-b border-neutral-200">
                  <td className="py-3 px-4 text-neutral-900">45 cm</td>
                  <td className="py-3 px-4 text-neutral-600">Princesse</td>
                  <td className="py-3 px-4 text-neutral-600">Tous types de decollete</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-neutral-900">50 cm</td>
                  <td className="py-3 px-4 text-neutral-600">Matinee</td>
                  <td className="py-3 px-4 text-neutral-600">Tenues habillees</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-neutral-50 p-4 rounded-lg">
            <h4 className="font-medium text-neutral-900 mb-2">Conseil de professionnel</h4>
            <p className="text-sm text-neutral-600">
              Pour un collier de perles classique, la longueur "Princesse" (45 cm) est la plus polyvalente.
              Elle convient a la majorite des morphologies et s'adapte a toutes les occasions.
            </p>
          </div>
        </div>
      </Modal>

      {/* Quote Request Modal */}
      <Modal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        title="Demander un devis"
        description="Remplissez le formulaire pour recevoir un devis personnalise."
        size="md"
      >
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsQuoteModalOpen(false); }}>
          <div className="bg-neutral-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-600">Produit</span>
              <span className="text-sm font-medium text-neutral-900">{product.name}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-600">Reference</span>
              <span className="text-sm font-mono text-neutral-900">{selectedVariant?.sku || product.reference}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">Quantite</span>
              <span className="text-sm font-medium text-neutral-900">{quantity} unites</span>
            </div>
          </div>

          <div>
            <label htmlFor="quote-quantity" className="block text-sm font-medium text-neutral-900 mb-1">
              Quantite souhaitee
            </label>
            <input
              id="quote-quantity"
              type="number"
              min="1"
              defaultValue={quantity}
              className={cn(
                'w-full px-4 py-2 rounded-lg border border-neutral-200',
                'bg-white text-neutral-900',
                'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent'
              )}
            />
          </div>

          <div>
            <label htmlFor="quote-notes" className="block text-sm font-medium text-neutral-900 mb-1">
              Notes / Demandes specifiques
            </label>
            <textarea
              id="quote-notes"
              rows={3}
              placeholder="Personnalisation, delai souhaite, etc."
              className={cn(
                'w-full px-4 py-2 rounded-lg border border-neutral-200',
                'bg-white text-neutral-900',
                'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
                'resize-none'
              )}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsQuoteModalOpen(false)}
              className={cn(
                'px-4 py-2 rounded-lg border border-neutral-200',
                'text-neutral-600 hover:bg-neutral-50',
                'transition-colors duration-200'
              )}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={cn(
                'px-6 py-2 rounded-lg',
                'bg-accent text-white',
                'hover:bg-orange-600 transition-colors duration-200'
              )}
            >
              Envoyer la demande
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}

export default ProductPageContent;
