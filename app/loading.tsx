/**
 * Global Loading Component
 *
 * Displayed during page transitions and initial load.
 * Features an elegant, luxury-feel loading animation.
 * Uses Tailwind animations defined in tailwind.config.ts.
 */
export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-luxury-black">
      {/* Logo with pulse animation */}
      <div className="relative">
        {/* Outer ring - subtle pulse */}
        <div className="absolute -inset-8 animate-pulse rounded-full border border-gold-500/20" />
        <div className="absolute -inset-12 animate-pulse rounded-full border border-gold-500/10 [animation-delay:0.5s]" />

        {/* Logo text */}
        <div className="relative flex flex-col items-center">
          {/* Main logo */}
          <span className="font-serif text-2xl font-semibold uppercase tracking-[0.25em] text-gold-500 md:text-3xl">
            Maison
          </span>
          <span className="font-serif text-2xl font-semibold uppercase tracking-[0.25em] text-luxury-cream md:text-3xl">
            Bijoux
          </span>

          {/* Gold accent line with shimmer animation */}
          <div className="mt-4 h-px w-16 overflow-hidden">
            <div className="h-full w-full animate-shimmer bg-gold-gradient bg-[length:200%_100%]" />
          </div>
        </div>
      </div>

      {/* Loading text */}
      <div className="mt-12 flex items-center gap-2">
        <span className="text-sm uppercase tracking-widest text-luxury-silver">
          Chargement
        </span>
        {/* Animated dots using float animation */}
        <span className="flex gap-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-500" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-500 [animation-delay:0.2s]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-500 [animation-delay:0.4s]" />
        </span>
      </div>
    </div>
  );
}
