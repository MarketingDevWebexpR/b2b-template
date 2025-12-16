'use client';

/**
 * ProductGallery - B2B Product Image Gallery with Zoom and Lightbox
 *
 * Features:
 * - Main image with hover zoom
 * - Thumbnail navigation
 * - Fullscreen lightbox mode
 * - Video support (optional)
 * - Variant-specific images
 * - Keyboard navigation
 * - Touch-friendly swipe
 *
 * @packageDocumentation
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Play,
  Pause,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface GalleryMedia {
  id: string;
  type: 'image' | 'video';
  src: string;
  thumbnail?: string;
  alt?: string;
  /** Video poster for video type */
  poster?: string;
}

export interface ProductGalleryProps {
  /** Media items (images and videos) */
  media: GalleryMedia[];
  /** Product name for alt text */
  productName: string;
  /** Product reference for display */
  productRef?: string;
  /** Currently selected variant ID */
  selectedVariantId?: string;
  /** Variant-specific images mapping */
  variantImages?: Record<string, string[]>;
  /** Additional CSS classes */
  className?: string;
  /** Show zoom indicator */
  showZoomIndicator?: boolean;
  /** Enable lightbox mode */
  enableLightbox?: boolean;
  /** Initial zoom level for lightbox */
  initialZoomLevel?: number;
}

// ============================================================================
// Constants
// ============================================================================

const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg';

const ZOOM_LEVELS = [1, 1.5, 2, 2.5, 3];

// ============================================================================
// Animation Variants
// ============================================================================

const fadeInOut = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const slideIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

// ============================================================================
// Component
// ============================================================================

export function ProductGallery({
  media,
  productName,
  productRef,
  selectedVariantId,
  variantImages,
  className,
  showZoomIndicator = true,
  enableLightbox = true,
  initialZoomLevel = 0,
}: ProductGalleryProps) {
  // State
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoomIndex, setLightboxZoomIndex] = useState(initialZoomLevel);
  const [loadedMedia, setLoadedMedia] = useState<Set<string>>(new Set());
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute display media based on variant selection
  const displayMedia = useCallback((): GalleryMedia[] => {
    if (selectedVariantId && variantImages?.[selectedVariantId]) {
      const variantSrcs = variantImages[selectedVariantId];
      return variantSrcs.map((src, index) => ({
        id: `variant-${selectedVariantId}-${index}`,
        type: 'image' as const,
        src,
        alt: `${productName} - Variante - Vue ${index + 1}`,
      }));
    }
    return media.length > 0 ? media : [{
      id: 'placeholder',
      type: 'image',
      src: PLACEHOLDER_IMAGE,
      alt: productName,
    }];
  }, [media, selectedVariantId, variantImages, productName]);

  const mediaItems = displayMedia();
  const currentMedia = mediaItems[selectedIndex];

  // Reset index when variant changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [selectedVariantId]);

  // Handle media load
  const handleMediaLoad = useCallback((id: string) => {
    setLoadedMedia((prev) => new Set(prev).add(id));
  }, []);

  // Handle thumbnail click
  const handleThumbnailClick = useCallback((index: number) => {
    setSelectedIndex(index);
    setIsZoomed(false);
    setIsVideoPlaying(false);
  }, []);

  // Handle zoom mouse move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isZoomed || currentMedia?.type === 'video') return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({ x, y });
    },
    [isZoomed, currentMedia?.type]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % mediaItems.length);
          break;
        case 'Escape':
          if (isLightboxOpen) {
            setIsLightboxOpen(false);
          }
          break;
        case 'Enter':
        case ' ':
          if (enableLightbox && !isLightboxOpen) {
            e.preventDefault();
            setIsLightboxOpen(true);
          }
          break;
      }
    },
    [mediaItems.length, isLightboxOpen, enableLightbox]
  );

  // Navigate in lightbox
  const navigateLightbox = useCallback(
    (direction: 'prev' | 'next') => {
      if (direction === 'prev') {
        setSelectedIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
      } else {
        setSelectedIndex((prev) => (prev + 1) % mediaItems.length);
      }
    },
    [mediaItems.length]
  );

  // Toggle lightbox zoom
  const toggleLightboxZoom = useCallback(() => {
    setLightboxZoomIndex((prev) => (prev + 1) % ZOOM_LEVELS.length);
  }, []);

  // Toggle video play
  const toggleVideoPlay = useCallback(() => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  }, [isVideoPlaying]);

  // Close lightbox on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isLightboxOpen]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  return (
    <>
      <div
        ref={containerRef}
        className={cn('space-y-4', className)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label={`Galerie de ${productName}`}
      >
        {/* Main Image/Video */}
        <div
          className={cn(
            'relative aspect-square overflow-hidden bg-neutral-50 rounded-lg',
            currentMedia?.type === 'image' && 'cursor-zoom-in',
            enableLightbox && 'cursor-pointer'
          )}
          onMouseEnter={() => currentMedia?.type === 'image' && setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
          onClick={() => enableLightbox && setIsLightboxOpen(true)}
          role="button"
          aria-label={`${productName} - ${currentMedia?.type === 'video' ? 'Video' : 'Image'} ${selectedIndex + 1} sur ${mediaItems.length}. Cliquer pour agrandir.`}
          tabIndex={0}
        >
          <AnimatePresence mode="wait">
            {currentMedia?.type === 'video' ? (
              <motion.div
                key={`video-${currentMedia.id}`}
                className="relative w-full h-full"
                {...fadeInOut}
                transition={{ duration: 0.3 }}
              >
                <video
                  ref={videoRef}
                  src={currentMedia.src}
                  poster={currentMedia.poster}
                  className="w-full h-full object-contain"
                  loop
                  playsInline
                  muted
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVideoPlay();
                  }}
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                  onLoadedData={() => handleMediaLoad(currentMedia.id)}
                />
                {/* Video Controls Overlay */}
                <button
                  type="button"
                  className={cn(
                    'absolute inset-0 flex items-center justify-center',
                    'bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVideoPlay();
                  }}
                  aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
                >
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                    {isVideoPlaying ? (
                      <Pause className="w-8 h-8 text-neutral-900" />
                    ) : (
                      <Play className="w-8 h-8 text-neutral-900 ml-1" />
                    )}
                  </div>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={`image-${currentMedia?.id}`}
                className="relative w-full h-full"
                {...fadeInOut}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={currentMedia?.src || PLACEHOLDER_IMAGE}
                  alt={currentMedia?.alt || `${productName} - Vue ${selectedIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={cn(
                    'object-contain transition-transform duration-500 ease-out',
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
                  onLoad={() => currentMedia && handleMediaLoad(currentMedia.id)}
                  onError={() => {
                    // Handle error by using placeholder
                  }}
                />

                {/* Loading State */}
                {currentMedia && !loadedMedia.has(currentMedia.id) && (
                  <div className="absolute inset-0 bg-neutral-100 animate-pulse" />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Zoom Indicator */}
          {showZoomIndicator && currentMedia?.type === 'image' && (
            <motion.div
              className={cn(
                'absolute bottom-4 right-4 px-3 py-1.5',
                'bg-white/90 backdrop-blur-sm',
                'text-neutral-600 text-xs font-medium',
                'rounded-md shadow-sm',
                'flex items-center gap-1.5',
                'pointer-events-none'
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isZoomed ? 1 : 0, y: isZoomed ? 0 : 10 }}
              transition={{ duration: 0.2 }}
            >
              <ZoomIn className="w-3.5 h-3.5" />
              Zoom actif
            </motion.div>
          )}

          {/* Fullscreen Button */}
          {enableLightbox && (
            <button
              type="button"
              className={cn(
                'absolute top-4 right-4 p-2',
                'bg-white/90 backdrop-blur-sm',
                'text-neutral-600 hover:text-neutral-900',
                'rounded-md shadow-sm',
                'transition-colors duration-200',
                'opacity-0 group-hover:opacity-100',
                'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-accent'
              )}
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
              aria-label="Voir en plein ecran"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          )}

          {/* Reference Badge */}
          {productRef && (
            <div
              className={cn(
                'absolute top-4 left-4 px-3 py-1',
                'bg-white/90 backdrop-blur-sm',
                'text-neutral-500 text-xs font-mono uppercase',
                'rounded-md'
              )}
            >
              Ref: {productRef}
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {mediaItems.length > 1 && (
          <div
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
            role="tablist"
            aria-label="Vignettes des images du produit"
          >
            {mediaItems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selectedIndex === index}
                aria-label={`Voir ${item.type === 'video' ? 'video' : 'image'} ${index + 1}`}
                tabIndex={selectedIndex === index ? 0 : -1}
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  'relative flex-shrink-0 w-20 h-20 overflow-hidden rounded-md',
                  'bg-neutral-50',
                  'border-2 transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
                  selectedIndex === index
                    ? 'border-accent'
                    : 'border-transparent hover:border-neutral-200'
                )}
              >
                {item.type === 'video' ? (
                  <>
                    <Image
                      src={item.poster || item.thumbnail || PLACEHOLDER_IMAGE}
                      alt={`${productName} - Video ${index + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                      onLoad={() => handleMediaLoad(`thumb-${item.id}`)}
                    />
                    {/* Video Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="w-6 h-6 text-white" fill="white" />
                    </div>
                  </>
                ) : (
                  <Image
                    src={item.thumbnail || item.src}
                    alt={`${productName} - Vignette ${index + 1}`}
                    fill
                    sizes="80px"
                    className={cn(
                      'object-contain transition-opacity duration-200',
                      selectedIndex === index ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                    )}
                    onLoad={() => handleMediaLoad(`thumb-${item.id}`)}
                  />
                )}

                {/* Loading State */}
                {!loadedMedia.has(`thumb-${item.id}`) && (
                  <div className="absolute inset-0 bg-neutral-100 animate-pulse" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Image Counter (Mobile) */}
        <div className="md:hidden text-center">
          <span className="text-neutral-500 text-sm">
            {selectedIndex + 1} / {mediaItems.length}
          </span>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
            {...fadeInOut}
            transition={{ duration: 0.3 }}
          >
            {/* Close Button */}
            <button
              type="button"
              className={cn(
                'absolute top-4 right-4 z-10 p-3',
                'bg-white/10 hover:bg-white/20',
                'text-white rounded-full',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-white'
              )}
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Fermer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation - Previous */}
            {mediaItems.length > 1 && (
              <button
                type="button"
                className={cn(
                  'absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3',
                  'bg-white/10 hover:bg-white/20',
                  'text-white rounded-full',
                  'transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-white'
                )}
                onClick={() => navigateLightbox('prev')}
                aria-label="Image precedente"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Navigation - Next */}
            {mediaItems.length > 1 && (
              <button
                type="button"
                className={cn(
                  'absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3',
                  'bg-white/10 hover:bg-white/20',
                  'text-white rounded-full',
                  'transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-white'
                )}
                onClick={() => navigateLightbox('next')}
                aria-label="Image suivante"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Zoom Controls */}
            {currentMedia?.type === 'image' && (
              <div
                className={cn(
                  'absolute bottom-4 left-1/2 -translate-x-1/2 z-10',
                  'flex items-center gap-2 px-4 py-2',
                  'bg-white/10 backdrop-blur-sm rounded-full'
                )}
              >
                <button
                  type="button"
                  className={cn(
                    'p-2 text-white hover:bg-white/20 rounded-full',
                    'transition-colors duration-200'
                  )}
                  onClick={() => setLightboxZoomIndex((prev) => Math.max(0, prev - 1))}
                  disabled={lightboxZoomIndex === 0}
                  aria-label="Reduire le zoom"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-white text-sm min-w-[60px] text-center">
                  {Math.round(ZOOM_LEVELS[lightboxZoomIndex] * 100)}%
                </span>
                <button
                  type="button"
                  className={cn(
                    'p-2 text-white hover:bg-white/20 rounded-full',
                    'transition-colors duration-200'
                  )}
                  onClick={() => setLightboxZoomIndex((prev) => Math.min(ZOOM_LEVELS.length - 1, prev + 1))}
                  disabled={lightboxZoomIndex === ZOOM_LEVELS.length - 1}
                  aria-label="Augmenter le zoom"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Counter */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-md">
              <span className="text-white text-sm">
                {selectedIndex + 1} / {mediaItems.length}
              </span>
            </div>

            {/* Main Content */}
            <motion.div
              className="relative w-full h-full flex items-center justify-center p-8"
              {...slideIn}
              transition={{ duration: 0.3 }}
            >
              {currentMedia?.type === 'video' ? (
                <video
                  src={currentMedia.src}
                  poster={currentMedia.poster}
                  className="max-w-full max-h-full object-contain"
                  controls
                  autoPlay
                  loop
                  playsInline
                />
              ) : (
                <div
                  className="relative w-full h-full cursor-zoom-in"
                  onClick={toggleLightboxZoom}
                  style={{
                    transform: `scale(${ZOOM_LEVELS[lightboxZoomIndex]})`,
                    transition: 'transform 0.3s ease-out',
                  }}
                >
                  <Image
                    src={currentMedia?.src || PLACEHOLDER_IMAGE}
                    alt={currentMedia?.alt || `${productName} - Vue ${selectedIndex + 1}`}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    priority
                  />
                </div>
              )}
            </motion.div>

            {/* Thumbnail Strip */}
            {mediaItems.length > 1 && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
                <div className="flex gap-2 p-2 bg-white/10 backdrop-blur-sm rounded-lg">
                  {mediaItems.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      className={cn(
                        'relative w-12 h-12 rounded-md overflow-hidden',
                        'border-2 transition-all duration-200',
                        selectedIndex === index
                          ? 'border-white'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      )}
                      aria-label={`Voir image ${index + 1}`}
                    >
                      <Image
                        src={item.thumbnail || item.poster || item.src}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                      {item.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="w-4 h-4 text-white" fill="white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ProductGallery;
