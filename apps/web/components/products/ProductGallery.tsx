'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

export function ProductGallery({ images, productName, className }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const [imageSources, setImageSources] = useState<string[]>(
    images.length > 0 ? images : [PLACEHOLDER_IMAGE]
  );

  const handleImageError = useCallback((index: number) => {
    setImageSources((prev) => {
      const newSources = [...prev];
      newSources[index] = PLACEHOLDER_IMAGE;
      return newSources;
    });
    setLoadedImages((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
  }, []);

  const handleThumbnailClick = useCallback((index: number) => {
    setSelectedIndex(index);
    setIsZoomed(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isZoomed) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({ x, y });
    },
    [isZoomed]
  );

  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleThumbnailClick(index);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = (index + 1) % imageSources.length;
        handleThumbnailClick(nextIndex);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = (index - 1 + imageSources.length) % imageSources.length;
        handleThumbnailClick(prevIndex);
      }
    },
    [imageSources.length, handleThumbnailClick]
  );

  if (imageSources.length === 0) {
    return (
      <div className={cn('aspect-square bg-white flex items-center justify-center relative overflow-hidden', className)}>
        <Image
          src={PLACEHOLDER_IMAGE}
          alt={productName}
          fill
          className="object-contain p-8 scale-110"
        />
        {/* Inner Frame */}
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{ boxShadow: 'inset 0 0 0 16px #FFFFFF' }}
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Image */}
      <div
        className="relative aspect-square overflow-hidden bg-white cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        role="img"
        aria-label={`${productName} - Image ${selectedIndex + 1} sur ${imageSources.length}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndex}
            className="relative w-full h-full scale-110"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={imageSources[selectedIndex]}
              alt={`${productName} - Vue ${selectedIndex + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={cn(
                'object-contain transition-transform duration-500 ease-luxe',
                isZoomed && 'scale-150'
              )}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }
                  : undefined
              }
              priority={selectedIndex === 0}
              onLoad={() => handleImageLoad(selectedIndex)}
              onError={() => handleImageError(selectedIndex)}
            />

            {/* Loading State */}
            {!loadedImages.has(selectedIndex) && (
              <div className="absolute inset-0 bg-background-cream animate-pulse" />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Inner Frame - Solid overlay to mask image edges */}
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{ boxShadow: 'inset 0 0 0 16px #FFFFFF' }}
          aria-hidden="true"
        />

        {/* Zoom Indicator */}
        <motion.div
          className="absolute bottom-6 right-6 px-3 py-1.5 bg-luxe-charcoal/80 text-white text-xs uppercase tracking-luxe z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: isZoomed ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          Zoom actif
        </motion.div>
      </div>

      {/* Thumbnail Strip */}
      {imageSources.length > 1 && (
        <div
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
          role="tablist"
          aria-label="Vignettes des images du produit"
        >
          {imageSources.map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              role="tab"
              aria-selected={selectedIndex === index}
              aria-label={`Voir image ${index + 1}`}
              tabIndex={selectedIndex === index ? 0 : -1}
              className={cn(
                'relative flex-shrink-0 w-20 h-20 overflow-hidden transition-all duration-300 bg-white',
                'border-2 focus:outline-none focus:ring-2 focus:ring-hermes-500 focus:ring-offset-2',
                selectedIndex === index
                  ? 'border-hermes-500'
                  : 'border-border hover:border-hermes-500/50'
              )}
            >
              <div className="relative w-full h-full scale-110">
                <Image
                  src={image}
                  alt={`${productName} - Vignette ${index + 1}`}
                  fill
                  sizes="80px"
                  className={cn(
                    'object-contain transition-opacity duration-300',
                    selectedIndex === index ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                  )}
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageError(index)}
                />
              </div>

              {/* Loading State for Thumbnails */}
              {!loadedImages.has(index) && (
                <div className="absolute inset-0 bg-background-cream animate-pulse" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Image Counter (Mobile) */}
      <div className="md:hidden text-center">
        <span className="text-text-muted text-sm">
          {selectedIndex + 1} / {imageSources.length}
        </span>
      </div>
    </div>
  );
}

export default ProductGallery;
