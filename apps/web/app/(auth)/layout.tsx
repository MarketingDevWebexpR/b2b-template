import { type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { LogoText } from '@/components/layout/Logo';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Auth Layout
 * Split screen design with luxury jewelry image on left, form on right
 * No main header/footer for focused authentication experience
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background image */}
        <Image
          src="https://images.unsplash.com/photo-1585960622850-ed33c41d6418?q=80&w=2070&auto=format&fit=crop"
          alt="Femme portant un collier en or"
          fill
          className="object-cover"
          priority
          sizes="50vw"
        />

        {/* Dark overlay gradient */}
        <div
          className={cn(
            'absolute inset-0',
            'bg-gradient-to-br from-black/70 via-black/50 to-black/70'
          )}
        />

        {/* Gold accent overlay */}
        <div
          className={cn(
            'absolute inset-0',
            'bg-gradient-to-t from-gold-500/10 via-transparent to-transparent'
          )}
        />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          {/* Logo */}
          <div>
            <LogoText variant="light" size="lg" />
          </div>

          {/* Tagline */}
          <div className="space-y-6 max-w-md">
            <div className="w-16 h-[2px] bg-hermes-500" />
            <h2 className="text-3xl xl:text-4xl font-serif text-white leading-tight">
              L'art de la joaillerie d'exception
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              Découvrez notre collection exclusive de pièces uniques,
              créées par les meilleurs artisans joailliers.
            </p>
            <div className="flex items-center gap-8 pt-4">
              <div className="text-center">
                <p className="text-2xl font-serif text-hermes-500">25+</p>
                <p className="text-sm text-white/70 mt-1">Années d'excellence</p>
              </div>
              <div className="w-[1px] h-12 bg-white/30" />
              <div className="text-center">
                <p className="text-2xl font-serif text-hermes-500">1000+</p>
                <p className="text-sm text-white/70 mt-1">Créations uniques</p>
              </div>
              <div className="w-[1px] h-12 bg-white/30" />
              <div className="text-center">
                <p className="text-2xl font-serif text-hermes-500">100%</p>
                <p className="text-sm text-white/70 mt-1">Fait main</p>
              </div>
            </div>
          </div>

          {/* Bottom decorative element */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'w-10 h-10 rounded-full border-2 border-white/30',
                    'bg-black/50 backdrop-blur-sm flex items-center justify-center',
                    'text-xs text-hermes-500 font-medium'
                  )}
                >
                  {['M', 'B', 'J'][i - 1]}
                </div>
              ))}
            </div>
            <p className="text-sm text-white/70">
              Rejoignez notre communauté exclusive
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 bg-luxury-black flex flex-col min-h-screen">
        {/* Header with logo and back link */}
        <header className="flex items-center justify-between p-6 lg:p-8">
          {/* Logo - visible on mobile only */}
          <div className="lg:hidden">
            <LogoText variant="accent" size="sm" />
          </div>

          {/* Back to home link */}
          <Link
            href="/"
            className={cn(
              'flex items-center gap-2',
              'text-sm text-luxury-silver hover:text-gold-500',
              'transition-colors duration-200',
              'group'
            )}
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Retour à l'accueil</span>
            <span className="sm:hidden">Accueil</span>
          </Link>
        </header>

        {/* Main content area */}
        <main className="flex-1 flex items-center justify-center px-6 py-8 lg:px-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-luxury-silver">
            <p>&copy; {new Date().getFullYear()} Maison Bijoux</p>
            <div className="flex items-center gap-6">
              <Link href="#" className="hover:text-gold-500 transition-colors">
                Aide
              </Link>
              <Link href="#" className="hover:text-gold-500 transition-colors">
                Confidentialité
              </Link>
              <Link href="#" className="hover:text-gold-500 transition-colors">
                Mentions légales
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
