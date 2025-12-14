import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page non trouvée | Maison Bijoux',
  description: 'La page que vous recherchez n\'existe pas ou a été déplacée.',
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * 404 Not Found Page
 *
 * Elegant error page maintaining luxury brand aesthetic.
 * Provides clear navigation back to the homepage.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-luxury-black px-4">
      {/* Decorative gold line */}
      <div className="mb-12 h-px w-24 bg-gold-gradient" />

      {/* Error code */}
      <div className="relative mb-6">
        <span className="font-serif text-[10rem] font-bold leading-none text-luxury-charcoal md:text-[14rem]">
          404
        </span>
        {/* Gold overlay accent */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-serif text-4xl text-gold-500 md:text-5xl">
            404
          </span>
        </div>
      </div>

      {/* Title */}
      <h1 className="mb-4 text-center font-serif text-heading-2 text-luxury-cream md:text-heading-1">
        Page non trouvée
      </h1>

      {/* Description */}
      <p className="mb-10 max-w-md text-center text-luxury-silver">
        La page que vous recherchez n'existe pas ou a été déplacée. Nous vous
        invitons à retourner à l'accueil pour continuer votre exploration.
      </p>

      {/* CTA Button */}
      <Link
        href="/"
        className="group relative inline-flex items-center justify-center overflow-hidden bg-gold-gradient px-10 py-4 font-sans text-sm font-medium uppercase tracking-widest text-luxury-black transition-all duration-500 hover:shadow-luxury-lg"
      >
        <span className="relative z-10">Retour à l'accueil</span>
        <div className="absolute inset-0 -translate-x-full bg-gold-600 transition-transform duration-500 group-hover:translate-x-0" />
        <span className="absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          Retour à l'accueil
        </span>
      </Link>

      {/* Decorative gold line */}
      <div className="mt-12 h-px w-24 bg-gold-gradient" />

      {/* Additional help links */}
      <div className="mt-16 flex flex-wrap justify-center gap-6 text-sm">
        <Link
          href="/collections"
          className="text-luxury-silver transition-colors duration-300 hover:text-gold-500"
        >
          Nos collections
        </Link>
        <span className="text-luxury-gray">|</span>
        <Link
          href="/contact"
          className="text-luxury-silver transition-colors duration-300 hover:text-gold-500"
        >
          Nous contacter
        </Link>
        <span className="text-luxury-gray">|</span>
        <Link
          href="/faq"
          className="text-luxury-silver transition-colors duration-300 hover:text-gold-500"
        >
          Aide
        </Link>
      </div>
    </div>
  );
}
