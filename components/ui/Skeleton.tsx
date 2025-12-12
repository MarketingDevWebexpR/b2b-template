import { cn } from '@/lib/utils';

export interface SkeletonProps {
  /** Additional CSS classes */
  className?: string;
  /** Width of the skeleton (can be Tailwind class or custom value) */
  width?: string;
  /** Height of the skeleton (can be Tailwind class or custom value) */
  height?: string;
  /** Shape variant */
  variant?: 'rectangular' | 'circular' | 'text';
  /** Number of text lines to render (only for text variant) */
  lines?: number;
}

/**
 * Loading skeleton component with shimmer animation.
 * Creates elegant placeholder content while data loads.
 */
function Skeleton({
  className,
  width,
  height,
  variant = 'rectangular',
  lines = 1,
}: SkeletonProps) {
  const baseClasses = cn(
    // Base shimmer effect
    'relative overflow-hidden',
    'bg-luxury-charcoal',
    // Shimmer animation overlay
    'before:absolute before:inset-0',
    'before:bg-gradient-to-r before:from-transparent before:via-luxury-gray/30 before:to-transparent',
    'before:animate-shimmer before:bg-[length:200%_100%]',
  );

  // Circular variant (for avatars, icons)
  if (variant === 'circular') {
    return (
      <div
        className={cn(
          baseClasses,
          'rounded-full',
          width || 'w-12',
          height || 'h-12',
          className
        )}
        aria-hidden="true"
      />
    );
  }

  // Text variant (for paragraphs, descriptions)
  if (variant === 'text') {
    return (
      <div className={cn('space-y-2', className)} aria-hidden="true">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              'h-4 rounded-sm',
              // Last line is shorter for natural text appearance
              index === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full',
              width
            )}
          />
        ))}
      </div>
    );
  }

  // Rectangular variant (default - for images, cards, etc.)
  return (
    <div
      className={cn(
        baseClasses,
        'rounded-none', // Sharp edges match luxury aesthetic
        width || 'w-full',
        height || 'h-48',
        className
      )}
      aria-hidden="true"
    />
  );
}

/**
 * Pre-configured skeleton for product cards
 */
function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-4', className)} aria-hidden="true">
      {/* Image placeholder */}
      <Skeleton height="h-64" className="aspect-[3/4]" />

      {/* Category/Brand */}
      <Skeleton width="w-1/3" height="h-3" />

      {/* Title */}
      <Skeleton width="w-2/3" height="h-5" />

      {/* Price */}
      <Skeleton width="w-1/4" height="h-4" />
    </div>
  );
}

/**
 * Pre-configured skeleton for text content
 */
function TextSkeleton({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return <Skeleton variant="text" lines={lines} className={className} />;
}

export { Skeleton, ProductCardSkeleton, TextSkeleton };
