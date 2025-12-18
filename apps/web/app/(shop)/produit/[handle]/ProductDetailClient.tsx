'use client';

/**
 * ProductDetailClient - Client Component for Product Detail Page
 *
 * Handles all interactive functionality:
 * - Gallery with zoom and lightbox
 * - B2B Variant selection with options
 * - Product characteristics display
 * - Quantity selection
 * - Add to cart
 * - Wishlist
 * - Related products carousel
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { usePricing } from '@/contexts/PricingContext';
import { Container } from '@/components/ui';
import { ProductGallery } from '@/components/products/ProductDetail/ProductGallery';
import { ProductInfo } from '@/components/products/ProductDetail/ProductInfo';
import { ProductPricing } from '@/components/products/ProductDetail/ProductPricing';
import { ProductActionsPremium } from '@/components/products/ProductDetail/ProductActionsPremium';
import { useProductActionsVisibility } from '@/hooks/useProductActionsVisibility';
import { RelatedProducts } from '@/components/products/ProductDetail/RelatedProducts';
import { ProductCharacteristics } from '@/components/products/ProductDetail/ProductCharacteristics';
import { ProductVariantSelectorPremium, type OptionType, type ProductVariant as PremiumVariant } from '@/components/products/ProductDetail/ProductVariantSelectorPremium';
import { ProductTabs } from '@/components/products/ProductDetail/ProductTabs';
import type { Product } from '@/types';
import type { MedusaProduct, MedusaCategory } from '@/lib/medusa/client';
import type { GalleryMedia } from '@/components/products/ProductDetail/ProductGallery';
import type { B2BProduct, B2BProductVariant, ProductOption } from '@/types/product-b2b';
import {
  adaptMedusaProductB2B,
  extractProductOptions,
  adaptMedusaVariants,
  buildCategoryBreadcrumbsFromMedusa,
} from '@/lib/medusa/adapters';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Map characteristic keys to their display groups
 */
function getSpecificationGroup(key: string): string {
  const GROUPS: Record<string, string[]> = {
    'Pierre': ['pierre_principale', 'taille', 'couleur', 'purete', 'carat', 'origine_pierre', 'traitement'],
    'Métal': ['metal', 'poids_metal'],
    'Monture': ['monture'],
    'Dimensions': ['longueur', 'taille_bague', 'taille_bracelet', 'diametre_boitier'],
    'Horlogerie': ['mouvement', 'etancheite'],
  };

  for (const [group, keys] of Object.entries(GROUPS)) {
    if (keys.includes(key)) {
      return group;
    }
  }
  return 'Autres';
}

/**
 * Detect option type from option title for premium selector
 */
function detectOptionType(title: string): OptionType {
  const lowerTitle = title.toLowerCase();

  // Color-related keywords (French & English)
  const colorKeywords = ['couleur', 'color', 'colour', 'coloris', 'teinte', 'nuance'];
  if (colorKeywords.some(k => lowerTitle.includes(k))) {
    return 'color';
  }

  // Size-related keywords (French & English)
  const sizeKeywords = ['taille', 'size', 'pointure', 'longueur', 'length', 'tour'];
  if (sizeKeywords.some(k => lowerTitle.includes(k))) {
    return 'size';
  }

  // Material-related keywords (French & English)
  const materialKeywords = ['matiere', 'matériau', 'material', 'metal', 'métal', 'or', 'argent', 'platine', 'gold', 'silver'];
  if (materialKeywords.some(k => lowerTitle.includes(k))) {
    return 'material';
  }

  return 'custom';
}

/**
 * Adapt ProductOption to include type for premium selector
 */
interface PremiumProductOption extends ProductOption {
  type: OptionType;
}

function adaptOptionsForPremium(options: ProductOption[]): PremiumProductOption[] {
  return options.map(option => ({
    ...option,
    type: detectOptionType(option.title),
  }));
}

// ============================================================================
// Types
// ============================================================================

export interface ProductDetailClientProps {
  product: Product;
  medusaProduct: MedusaProduct;
  /** Full category with ancestor chain for proper breadcrumbs */
  categoryWithAncestors?: MedusaCategory | null;
  galleryMedia: GalleryMedia[];
  variantImagesMap?: Record<string, string[]>;
  relatedProducts: Product[];
  complementaryProducts?: Product[];
}

// ============================================================================
// Animation Variants
// ============================================================================

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// ============================================================================
// Component
// ============================================================================

export function ProductDetailClient({
  product,
  medusaProduct,
  categoryWithAncestors,
  galleryMedia,
  variantImagesMap,
  relatedProducts,
  complementaryProducts = [],
}: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const { formatPrice, settings } = usePricing();

  // Adapt Medusa data to B2B types
  const b2bProduct = useMemo<B2BProduct>(() => {
    return adaptMedusaProductB2B(medusaProduct);
  }, [medusaProduct]);

  const productOptions = useMemo<ProductOption[]>(() => {
    return extractProductOptions(medusaProduct);
  }, [medusaProduct]);

  // Adapt options for premium selector with type detection
  const premiumOptions = useMemo<PremiumProductOption[]>(() => {
    return adaptOptionsForPremium(productOptions);
  }, [productOptions]);

  const b2bVariants = useMemo<B2BProductVariant[]>(() => {
    return adaptMedusaVariants(medusaProduct);
  }, [medusaProduct]);

  const defaultVariant = useMemo<B2BProductVariant | null>(() => {
    return b2bVariants.length > 0 ? b2bVariants[0] : null;
  }, [b2bVariants]);

  // Build hierarchical breadcrumbs from Medusa category chain
  // Uses categoryWithAncestors which has the full parent chain populated
  const productBreadcrumbs = useMemo(() => {
    if (categoryWithAncestors) {
      const categoryBreadcrumbs = buildCategoryBreadcrumbsFromMedusa(
        categoryWithAncestors
      );
      // Add the product name as last breadcrumb item (no href)
      return [...categoryBreadcrumbs, { label: product.name }];
    }
    // Fallback: basic breadcrumbs without category
    return [
      { label: 'Catalogue', href: '/produits' },
      { label: product.name },
    ];
  }, [categoryWithAncestors, product.name]);

  // State
  const [selectedB2BVariant, setSelectedB2BVariant] = useState<B2BProductVariant | null>(
    defaultVariant
  );
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    medusaProduct.variants?.[0]?.id
  );
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Visibility detection for sticky product actions bar
  const { sentinelRef, shouldShowSticky } = useProductActionsVisibility({
    threshold: 0.3,
    minScrollY: 300,
  });

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Selected variant data (legacy compatibility)
  const selectedVariant = useMemo(() => {
    if (!selectedVariantId) return medusaProduct.variants?.[0];
    return medusaProduct.variants?.find((v) => v.id === selectedVariantId);
  }, [selectedVariantId, medusaProduct.variants]);

  // Get price for selected variant
  const variantPrice = useMemo(() => {
    const eurPrice = selectedVariant?.prices?.find(
      (p) => p.currency_code === 'eur' || p.currency_code === 'EUR'
    );
    return (eurPrice?.amount ?? 0) / 100; // Convert from cents
  }, [selectedVariant]);

  // Stock info - build a simplified ProductStock object
  const stockInfo = useMemo(() => {
    const available = selectedVariant?.inventory_quantity ?? product.stock ?? 0;
    let status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder' = 'in_stock';

    if (available <= 0) {
      status = selectedVariant?.allow_backorder ? 'backorder' : 'out_of_stock';
    } else if (available <= 5) {
      status = 'low_stock';
    }

    return {
      productId: product.id,
      sku: selectedVariant?.sku || product.reference || product.id,
      variantId: selectedVariant?.id,
      globalStatus: status,
      totalAvailable: available,
      warehouseStock: [], // Medusa doesn't have multi-warehouse by default
      isAvailable: available > 0 || (selectedVariant?.allow_backorder ?? false),
      updatedAt: new Date().toISOString(),
    };
  }, [selectedVariant, product.stock, product.id, product.reference]);

  // Handle variant selection (legacy)
  const handleVariantChange = useCallback((variantId: string) => {
    setSelectedVariantId(variantId);
  }, []);

  // Handle B2B variant selection (new options-based)
  const handleB2BVariantChange = useCallback(
    (variant: PremiumVariant | null, selectedOptions: Record<string, string>) => {
      // Cast to B2BProductVariant since PremiumVariant is a subset
      setSelectedB2BVariant(variant as B2BProductVariant | null);
      if (variant) {
        setSelectedVariantId(variant.id);
      }
    },
    []
  );

  // Handle valid variant selection
  const handleValidVariantSelected = useCallback((variant: PremiumVariant) => {
    setSelectedB2BVariant(variant as B2BProductVariant);
    setSelectedVariantId(variant.id);
  }, []);

  // Handle quantity change
  const handleQuantityChange = useCallback((newQuantity: number) => {
    setQuantity(newQuantity);
  }, []);

  // Handle add to cart
  const handleAddToCart = useCallback(
    async (qty: number) => {
      // Create product object with selected variant info
      const productToAdd: Product = {
        ...product,
        price: variantPrice,
        reference: selectedVariant?.sku ?? product.reference,
      };

      addToCart(productToAdd, qty);
    },
    [product, variantPrice, selectedVariant, addToCart]
  );

  // Handle add to wishlist
  const handleAddToWishlist = useCallback(() => {
    setIsInWishlist((prev) => !prev);
    // TODO: Integrate with wishlist context/API
  }, []);

  // Handle request quote
  const handleRequestQuote = useCallback(
    (qty: number) => {
      // TODO: Open quote request modal
      console.log('Request quote for', qty, 'units of', product.name);
    },
    [product.name]
  );

  // Format price helper
  const formatPriceDisplay = useCallback(
    (price: number) => {
      return formatPrice(price, { format: settings.displayFormat });
    },
    [formatPrice, settings.displayFormat]
  );

  // Convert related products for RelatedProducts component
  const relatedProductsData = useMemo(() => {
    return relatedProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      reference: p.reference,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      images: p.images,
      isAvailable: p.isAvailable,
      isNew: p.isNew,
      brand: p.brand,
      inStock: (p.stock ?? 0) > 0,
    }));
  }, [relatedProducts]);

  // Convert complementary products for RelatedProducts component
  const complementaryProductsData = useMemo(() => {
    return complementaryProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      reference: p.reference,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      images: p.images,
      isAvailable: p.isAvailable,
      isNew: p.isNew,
      brand: p.brand,
      inStock: (p.stock ?? 0) > 0,
    }));
  }, [complementaryProducts]);

  return (
    <motion.div
      className="min-h-screen bg-white py-8"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <Container>
        {/* Breadcrumbs - Full width above the grid */}
        <motion.nav
          variants={fadeInUp}
          aria-label="Fil d'Ariane"
          className="flex flex-wrap items-center gap-1.5 text-sm mb-6"
        >
          {productBreadcrumbs.map((item, index) => {
            const isLast = index === productBreadcrumbs.length - 1;
            return (
              <div key={`${item.label}-${index}`} className="flex items-center">
                {index > 0 && (
                  <ChevronRight
                    className="mx-1.5 h-3.5 w-3.5 text-neutral-400"
                    aria-hidden="true"
                  />
                )}
                {isLast || !item.href ? (
                  <span
                    className={`${isLast ? 'text-neutral-900 font-medium truncate max-w-[250px]' : 'text-neutral-600'}`}
                    aria-current={isLast ? 'page' : undefined}
                    title={item.label}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-neutral-600 hover:text-accent transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            );
          })}
        </motion.nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column - Gallery (sticky on desktop) */}
          <motion.div variants={fadeInUp} className="lg:sticky lg:top-32">
            <ProductGallery
              media={galleryMedia}
              productName={product.name}
              productRef={product.reference}
              selectedVariantId={selectedVariantId}
              variantImages={variantImagesMap}
              showZoomIndicator
              enableLightbox
            />
          </motion.div>

          {/* Right Column - Product Info & Actions */}
          <motion.div variants={fadeInUp} className="space-y-6">
            {/* Product Info (name, brand, reference, badges, etc.) - without breadcrumbs */}
            <ProductInfo
              product={product}
              breadcrumbs={[]}
              showDetailedInfo
              showCollectionInfo
            />

            {/* B2B Variant Selector (options-based) - BEFORE price and stock */}
            {premiumOptions.length > 0 && b2bVariants.length > 1 && (
              <div className="pt-4 border-t border-neutral-100">
                <ProductVariantSelectorPremium
                  options={premiumOptions}
                  variants={b2bVariants}
                  defaultVariantId={defaultVariant?.id}
                  currencyCode="EUR"
                  onVariantChange={handleB2BVariantChange}
                  onValidVariantSelected={handleValidVariantSelected}
                  showPriceDiff
                  showStock
                  showSizeGuide={premiumOptions.some(o => o.type === 'size')}
                  onSizeGuideClick={() => {
                    // TODO: Open size guide modal
                    console.log('Open size guide');
                  }}
                />
              </div>
            )}

            {/* Pricing Section */}
            <ProductPricing
              productId={product.id}
              basePrice={variantPrice}
              compareAtPrice={product.compareAtPrice}
              quantity={quantity}
              category={product.category?.id}
              showVolumeTiers
              showPriceSource
              onTierClick={(tier) => {
                if (tier.minQuantity > 1) {
                  setQuantity(tier.minQuantity);
                }
              }}
            />

            {/* Actions (quantity, add to cart, wishlist, etc.) - Premium Design */}
            <div ref={sentinelRef}>
              <ProductActionsPremium
                variant="inline"
                productId={product.id}
                productName={product.name}
                unitPrice={variantPrice}
                formatPrice={formatPriceDisplay}
                stock={stockInfo}
                minQuantity={1}
                maxQuantity={999}
                quantityStep={1}
                isInWishlist={isInWishlist}
                onQuantityChange={handleQuantityChange}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
                onRequestQuote={handleRequestQuote}
              />
            </div>

            {/* B2B Product Characteristics */}
            {(b2bProduct.caracteristiques || b2bProduct.certifications || b2bProduct.garantieText) && (
              <div className="pt-6 border-t border-neutral-200">
                <ProductCharacteristics
                  product={b2bProduct}
                  variant="full"
                  showCertifications
                  showSustainability
                />
              </div>
            )}
          </motion.div>
        </div>

        {/* Product Tabs Section (Description, Specs, etc.) */}
        <motion.section
          variants={fadeInUp}
          className="mt-16 pt-8 border-t border-neutral-200"
        >
          <ProductTabs
            description={product.description}
            specifications={
              b2bProduct.caracteristiques
                ? Object.entries(b2bProduct.caracteristiques)
                    .filter(([_, value]) => value)
                    .map(([key, value]) => ({
                      id: key,
                      label: key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()),
                      value: value as string,
                      group: getSpecificationGroup(key),
                    }))
                : []
            }
          />
        </motion.section>

        {/* Related Products Section */}
        {relatedProductsData.length > 0 && (
          <motion.div
            variants={fadeInUp}
            className="mt-16 pt-8 border-t border-neutral-200"
          >
            <RelatedProducts
              type="similar"
              products={relatedProductsData}
              formatPrice={formatPriceDisplay}
              showQuickAdd
              maxProducts={8}
              onAddToCart={async (relatedProduct) => {
                const productToAdd = relatedProducts.find(
                  (p) => p.id === relatedProduct.id
                );
                if (productToAdd) {
                  addToCart(productToAdd, 1);
                }
              }}
            />
          </motion.div>
        )}

        {/* Complementary Products Section */}
        {complementaryProductsData.length > 0 && (
          <motion.div
            variants={fadeInUp}
            className="mt-12 pt-8 border-t border-neutral-200"
          >
            <RelatedProducts
              type="complementary"
              products={complementaryProductsData}
              formatPrice={formatPriceDisplay}
              showQuickAdd
              maxProducts={4}
              onAddToCart={async (relatedProduct) => {
                const productToAdd = complementaryProducts.find(
                  (p) => p.id === relatedProduct.id
                );
                if (productToAdd) {
                  addToCart(productToAdd, 1);
                }
              }}
            />
          </motion.div>
        )}
      </Container>

      {/* Sticky Product Actions Bar - appears when scrolling past original */}
      <ProductActionsPremium
        variant="sticky"
        showStickyBar={shouldShowSticky}
        productId={product.id}
        productName={product.name}
        unitPrice={variantPrice}
        formatPrice={formatPriceDisplay}
        stock={stockInfo}
        minQuantity={1}
        maxQuantity={999}
        quantityStep={1}
        isInWishlist={isInWishlist}
        onQuantityChange={handleQuantityChange}
        onAddToCart={handleAddToCart}
        onAddToWishlist={handleAddToWishlist}
        onRequestQuote={handleRequestQuote}
      />
    </motion.div>
  );
}

export default ProductDetailClient;
