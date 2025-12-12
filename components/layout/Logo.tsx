'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'accent';
}

const sizeClasses = {
  sm: 'text-sm md:text-base tracking-[0.2em]',
  md: 'text-base md:text-lg tracking-[0.25em]',
  lg: 'text-lg md:text-xl tracking-[0.3em]',
};

const variantClasses = {
  light: 'text-text-inverse',
  dark: 'text-luxe-charcoal',
  accent: 'text-hermes-500',
};

export function Logo({ className, size = 'md', variant = 'dark' }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        'font-serif font-normal uppercase',
        'transition-all duration-350 ease-luxe',
        'hover:opacity-75',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label="Maison Bijoux - Accueil"
    >
      <span className="inline-block">Maison Bijoux</span>
    </Link>
  );
}

// Text-only logo variant with refined styling
export function LogoText({ className, size = 'md', variant = 'dark' }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        'font-serif font-normal uppercase',
        'transition-all duration-350 ease-luxe',
        'hover:opacity-75',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label="Maison Bijoux - Accueil"
    >
      Maison Bijoux
    </Link>
  );
}

// Minimal logo for compact spaces
export function LogoMinimal({ className, variant = 'dark' }: Omit<LogoProps, 'size'>) {
  return (
    <Link
      href="/"
      className={cn(
        'font-serif font-normal text-xs tracking-[0.15em] uppercase',
        'transition-all duration-350 ease-luxe',
        'hover:opacity-75',
        variantClasses[variant],
        className
      )}
      aria-label="Maison Bijoux - Accueil"
    >
      MB
    </Link>
  );
}
