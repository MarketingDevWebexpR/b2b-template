'use client';

/**
 * PromoBanner Component
 *
 * Promotional banner for B2B homepage displaying:
 * - Current offers and promotions
 * - Call-to-action button
 * - Optional countdown timer
 * - Eye-catching gradient design
 *
 * Design: Professional B2B style with accent colors
 * Colors: b2b-accent (#f67828) as primary
 */

import { memo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface PromoBannerProps {
  /** Promotion title */
  title?: string;
  /** Promotion description */
  description?: string;
  /** CTA button text */
  ctaText?: string;
  /** CTA link URL */
  ctaLink?: string;
  /** Optional badge text (e.g., "-20%", "Nouveau") */
  badge?: string;
  /** Promotion end date for countdown (optional) */
  endDate?: Date;
  /** Additional CSS classes */
  className?: string;
  /** Variant style */
  variant?: 'accent' | 'primary' | 'gradient';
}

export interface CountdownProps {
  /** Target end date */
  endDate: Date;
  /** Callback when countdown reaches zero */
  onComplete?: () => void;
}

// ============================================================================
// Sub-components
// ============================================================================

const Countdown = memo(function Countdown({ endDate, onComplete }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const calculateTimeLeft = useCallback(() => {
    const difference = endDate.getTime() - new Date().getTime();

    if (difference <= 0) {
      onComplete?.();
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }, [endDate, onComplete]);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <span className="text-2xl lg:text-3xl font-bold text-white tabular-nums">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-xs text-white/70 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );

  return (
    <div
      className="flex items-center gap-3 lg:gap-4"
      role="timer"
      aria-label="Temps restant pour la promotion"
    >
      <TimeUnit value={timeLeft.days} label="Jours" />
      <span className="text-2xl text-white/50">:</span>
      <TimeUnit value={timeLeft.hours} label="Heures" />
      <span className="text-2xl text-white/50">:</span>
      <TimeUnit value={timeLeft.minutes} label="Min" />
      <span className="text-2xl text-white/50 hidden sm:inline">:</span>
      <div className="hidden sm:block">
        <TimeUnit value={timeLeft.seconds} label="Sec" />
      </div>
    </div>
  );
});

Countdown.displayName = 'Countdown';

// ============================================================================
// Variant Styles
// ============================================================================

const variantStyles = {
  accent: 'bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400',
  primary: 'bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-600',
  gradient: 'bg-gradient-to-r from-orange-600 via-neutral-700 to-neutral-600',
};

const buttonStyles = {
  accent: 'bg-white text-orange-600 hover:bg-orange-50',
  primary: 'bg-white text-neutral-700 hover:bg-neutral-50',
  gradient: 'bg-white text-neutral-700 hover:bg-gray-50',
};

// ============================================================================
// Main Component
// ============================================================================

export const PromoBanner = memo(function PromoBanner({
  title = 'Offre speciale professionnels',
  description = 'Jusqu\'a -25% sur une selection de bijoux. Offre valable pour toute commande superieure a 500EUR HT.',
  ctaText = 'Voir les promotions',
  ctaLink = '/promotions',
  badge = '-25%',
  endDate,
  variant = 'accent',
  className,
}: PromoBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleCountdownComplete = useCallback(() => {
    setIsVisible(false);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        variantStyles[variant],
        className
      )}
      aria-label="Promotion en cours"
    >
      {/* Decorative elements */}
      <div
        className="absolute top-0 right-0 w-64 h-64 -mt-32 -mr-32 rounded-full bg-white/5"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-48 h-48 -mb-24 -ml-24 rounded-full bg-white/5"
        aria-hidden="true"
      />

      <div className="relative container mx-auto px-4 lg:px-6 py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
              {/* Badge */}
              {badge && (
                <span
                  className={cn(
                    'inline-flex items-center justify-center',
                    'px-3 py-1',
                    'text-xs font-bold',
                    'bg-white text-orange-600',
                    'rounded-full',
                    'animate-pulse'
                  )}
                >
                  {badge}
                </span>
              )}
              <h2 className="text-2xl lg:text-3xl text-white font-bold">
                {title}
              </h2>
            </div>

            <p className="text-sm text-white/90 max-w-xl mx-auto lg:mx-0">
              {description}
            </p>
          </div>

          {/* Countdown (if endDate provided) */}
          {endDate && (
            <div className="flex-shrink-0">
              <p className="text-xs text-white/70 text-center mb-2">
                Se termine dans
              </p>
              <Countdown
                endDate={endDate}
                onComplete={handleCountdownComplete}
              />
            </div>
          )}

          {/* CTA Button */}
          <div className="flex-shrink-0">
            <Link
              href={ctaLink}
              className={cn(
                'inline-flex items-center gap-2',
                'px-6 py-3',
                'text-sm font-semibold',
                'rounded-lg',
                'shadow-lg hover:shadow-xl',
                'transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-500',
                buttonStyles[variant]
              )}
            >
              {ctaText}
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
});

PromoBanner.displayName = 'PromoBanner';

export default PromoBanner;
