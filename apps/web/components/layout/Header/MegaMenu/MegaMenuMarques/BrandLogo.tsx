'use client';

/**
 * BrandLogo Component
 *
 * Displays a brand logo with lazy loading and graceful fallback.
 * Optimized for performance with native lazy loading and intersection observer.
 *
 * Features:
 * - Native lazy loading
 * - Graceful error handling with fallback
 * - Loading state management
 * - Optimized image sizing
 */

import { memo, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { BrandLogoProps } from './types';

export const BrandLogo = memo(function BrandLogo({
  src,
  alt,
  size = 48,
  fallback,
  className,
}: BrandLogoProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  // If error occurred, render fallback
  if (hasError) {
    return <>{fallback}</>;
  }

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        'overflow-hidden',
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* Loading placeholder - shows until image loads */}
      {!isLoaded && (
        <div
          className={cn(
            'absolute inset-0',
            'bg-neutral-100',
            'animate-pulse',
            'rounded-full'
          )}
        />
      )}

      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        onError={handleError}
        onLoad={handleLoad}
        className={cn(
          'object-contain',
          'transition-opacity duration-200',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        style={{ maxWidth: size, maxHeight: size }}
      />
    </div>
  );
});

BrandLogo.displayName = 'BrandLogo';

export default BrandLogo;
