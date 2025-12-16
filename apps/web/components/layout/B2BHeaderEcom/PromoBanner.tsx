'use client';

import { memo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PromoBannerProps {
  /** Promo message */
  message: string;
  /** Link URL */
  href?: string;
  /** Link label */
  linkLabel?: string;
  /** End date for countdown (ISO string) */
  endDate?: string;
  /** Whether the banner can be dismissed */
  dismissible?: boolean;
  /** Background variant */
  variant?: 'dark' | 'accent' | 'gold';
  /** Additional CSS classes */
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(endDate: string): TimeLeft | null {
  const difference = new Date(endDate).getTime() - new Date().getTime();

  if (difference <= 0) {
    return null;
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

function formatTimeUnit(value: number): string {
  return value.toString().padStart(2, '0');
}

export const PromoBanner = memo(function PromoBanner({
  message,
  href,
  linkLabel = 'En profiter',
  endDate,
  dismissible = true,
  variant = 'dark',
  className,
}: PromoBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  // Calculate initial time left
  useEffect(() => {
    if (endDate) {
      setTimeLeft(calculateTimeLeft(endDate));
    }
  }, [endDate]);

  // Countdown timer
  useEffect(() => {
    if (!endDate) return;

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(endDate);
      setTimeLeft(newTimeLeft);

      if (!newTimeLeft) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
  }, []);

  if (!isVisible) return null;

  const variantStyles = {
    dark: 'bg-surface-promo text-content-inverse',
    accent: 'bg-accent text-white',
    gold: 'bg-accent text-white',
  };

  const content = (
    <>
      {/* Countdown timer */}
      {timeLeft && (
        <div className="hidden sm:flex items-center gap-1.5 mr-4">
          <Clock className="w-3.5 h-3.5 opacity-80" />
          <span className="text-xs font-medium">
            {timeLeft.days > 0 && `${timeLeft.days}j `}
            {formatTimeUnit(timeLeft.hours)}:{formatTimeUnit(timeLeft.minutes)}:{formatTimeUnit(timeLeft.seconds)}
          </span>
        </div>
      )}

      {/* Message */}
      <p className="text-xs sm:text-sm font-medium truncate flex-1 text-center">
        {message}
      </p>

      {/* Link */}
      {href && (
        <span className="hidden sm:inline-flex items-center gap-1 ml-4 text-xs font-semibold whitespace-nowrap group-hover:underline">
          {linkLabel}
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      )}
    </>
  );

  return (
    <div
      className={cn(
        'relative h-10 flex items-center justify-center px-4',
        variantStyles[variant],
        className
      )}
    >
      <div className="container-ecom flex items-center justify-center">
        {href ? (
          <Link
            href={href}
            className="group flex items-center justify-center flex-1 min-w-0"
          >
            {content}
          </Link>
        ) : (
          <div className="flex items-center justify-center flex-1 min-w-0">
            {content}
          </div>
        )}

        {/* Dismiss button */}
        {dismissible && (
          <button
            onClick={handleDismiss}
            className={cn(
              'absolute right-3 p-1 rounded-full',
              'opacity-60 hover:opacity-100',
              'transition-opacity duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50'
            )}
            aria-label="Fermer la banniere"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
});

PromoBanner.displayName = 'PromoBanner';

export default PromoBanner;
