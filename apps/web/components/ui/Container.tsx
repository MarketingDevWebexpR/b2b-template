import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps {
  /** Container content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Container size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** HTML element to render as */
  as?: 'div' | 'section' | 'article' | 'main' | 'header' | 'footer';
}

/**
 * Container size configurations
 */
const containerSizes = {
  sm: 'max-w-3xl',      // 768px
  md: 'max-w-5xl',      // 1024px
  lg: 'max-w-6xl',      // 1152px
  xl: 'max-w-7xl',      // 1280px
  full: 'max-w-full',
};

/**
 * Max-width container component with responsive padding.
 * Provides consistent horizontal spacing across the site.
 */
function Container({
  children,
  className,
  size = 'xl',
  as: Component = 'div',
}: ContainerProps) {
  return (
    <Component
      className={cn(
        'mx-auto w-full',
        'px-4 sm:px-6 lg:px-8',
        containerSizes[size],
        className
      )}
    >
      {children}
    </Component>
  );
}

export { Container };
