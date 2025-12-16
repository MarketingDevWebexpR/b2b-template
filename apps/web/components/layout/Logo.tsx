'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'accent';
}

const sizeClasses = {
  sm: 'text-sm md:text-base tracking-wide',
  md: 'text-base md:text-lg tracking-wide',
  lg: 'text-lg md:text-xl tracking-wide',
};

const variantClasses = {
  light: 'text-white',
  dark: 'text-content-primary',
  accent: 'text-primary',
};

export function Logo({ className, size = 'md', variant = 'dark' }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        'font-sans font-bold uppercase',
        'transition-opacity duration-150',
        'hover:opacity-75',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label="WebexpR Pro - Accueil"
    >
      <span className="inline-block">WebexpR Pro</span>
    </Link>
  );
}

// Text-only logo variant with refined styling
export function LogoText({ className, size = 'md', variant = 'dark' }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        'font-sans font-bold uppercase',
        'transition-opacity duration-150',
        'hover:opacity-75',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label="WebexpR Pro - Accueil"
    >
      WebexpR Pro
    </Link>
  );
}

// Minimal logo for compact spaces
export function LogoMinimal({ className, variant = 'dark' }: Omit<LogoProps, 'size'>) {
  return (
    <Link
      href="/"
      className={cn(
        'font-sans font-bold text-xs tracking-wide uppercase',
        'transition-opacity duration-150',
        'hover:opacity-75',
        variantClasses[variant],
        className
      )}
      aria-label="WebexpR Pro - Accueil"
    >
      WP
    </Link>
  );
}
