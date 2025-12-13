'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

// About links
const aboutLinks = [
  { label: 'Notre Histoire', href: '/notre-histoire' },
  { label: 'Savoir-Faire', href: '/savoir-faire' },
  { label: 'Nos Artisans', href: '/artisans' },
  { label: 'Engagements', href: '/engagements' },
];

// Collections links
const collectionsLinks = [
  { label: 'Haute Joaillerie', href: '/collections/haute-joaillerie' },
  { label: 'Bagues', href: '/collections/bagues' },
  { label: 'Colliers', href: '/collections/colliers' },
  { label: 'Bracelets', href: '/collections/bracelets' },
  { label: 'Boucles d\'Oreilles', href: '/collections/boucles-oreilles' },
];

// Services links
const servicesLinks = [
  { label: 'Sur Mesure', href: '/sur-mesure' },
  { label: 'Gravure', href: '/gravure' },
  { label: 'Entretien', href: '/entretien' },
  { label: 'Livraison', href: '/livraison' },
  { label: 'Retours', href: '/retours' },
];

// Contact info
const contactInfo = {
  phone: '+33 1 23 45 67 89',
  email: 'contact@maisonbijoux.fr',
  address: '12 Place Vendome, 75001 Paris',
};

// Social links with minimal SVG icons
const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    label: 'Pinterest',
    href: 'https://pinterest.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 12a4 4 0 1 1 8 0c0 2.22-1.8 4-4 7-2.2-3-4-4.78-4-7z"/>
        <line x1="12" y1="12" x2="12" y2="21"/>
      </svg>
    ),
  },
];

export function Footer({ className }: FooterProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubscribed(true);
    setEmail('');
    setIsSubmitting(false);
    setTimeout(() => setIsSubscribed(false), 5000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn('bg-[#f6f1eb]', className)}
      role="contentinfo"
    >
      {/* Newsletter Section */}
      <div className="border-b border-[#2b333f]/10">
        <div className="container mx-auto px-6 lg:px-12 py-16 lg:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-serif text-2xl md:text-3xl text-[#2b333f] mb-4 tracking-wide">
              La Newsletter Maison Bijoux
            </h3>
            <p className="text-[#2b333f]/70 text-sm leading-relaxed mb-8 max-w-md mx-auto">
              Recevez en avant-premiere nos nouveautes, invitations aux evenements prives et conseils d'experts.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email"
                  required
                  className={cn(
                    'flex-1 px-5 py-4',
                    'bg-white border border-[#2b333f]/20',
                    'text-[#2b333f] text-sm placeholder:text-[#2b333f]/40',
                    'focus:outline-none focus:border-[#2b333f]/50',
                    'transition-colors duration-300'
                  )}
                  aria-label="Adresse email pour la newsletter"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    'px-8 py-4',
                    'bg-[#2b333f] text-white',
                    'text-xs uppercase tracking-[0.2em] font-medium',
                    'hover:bg-[#1a1f26]',
                    'transition-colors duration-300',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                  aria-label="S'inscrire a la newsletter"
                >
                  {isSubmitting ? 'Envoi...' : 'S\'inscrire'}
                </button>
              </div>

              {isSubscribed && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-[#2b333f]/80 mt-4"
                >
                  Merci pour votre inscription.
                </motion.p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Column 1: About */}
          <div className="lg:col-span-1">
            <h4 className="text-xs uppercase tracking-[0.25em] text-[#2b333f] font-medium mb-6">
              A Propos
            </h4>
            <ul className="space-y-4">
              {aboutLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'text-sm text-[#2b333f]/70',
                      'hover:text-[#2b333f]',
                      'transition-colors duration-300'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Collections */}
          <div className="lg:col-span-1">
            <h4 className="text-xs uppercase tracking-[0.25em] text-[#2b333f] font-medium mb-6">
              Collections
            </h4>
            <ul className="space-y-4">
              {collectionsLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'text-sm text-[#2b333f]/70',
                      'hover:text-[#2b333f]',
                      'transition-colors duration-300'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className="lg:col-span-1">
            <h4 className="text-xs uppercase tracking-[0.25em] text-[#2b333f] font-medium mb-6">
              Services
            </h4>
            <ul className="space-y-4">
              {servicesLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'text-sm text-[#2b333f]/70',
                      'hover:text-[#2b333f]',
                      'transition-colors duration-300'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="lg:col-span-1">
            <h4 className="text-xs uppercase tracking-[0.25em] text-[#2b333f] font-medium mb-6">
              Contact
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                  className="text-sm text-[#2b333f]/70 hover:text-[#2b333f] transition-colors duration-300"
                >
                  {contactInfo.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-sm text-[#2b333f]/70 hover:text-[#2b333f] transition-colors duration-300"
                >
                  {contactInfo.email}
                </a>
              </li>
              <li>
                <address className="text-sm text-[#2b333f]/70 not-italic leading-relaxed">
                  {contactInfo.address}
                </address>
              </li>
            </ul>
          </div>

          {/* Column 5: Social & Brand */}
          <div className="lg:col-span-1">
            <h4 className="text-xs uppercase tracking-[0.25em] text-[#2b333f] font-medium mb-6">
              Suivez-nous
            </h4>
            <div className="flex items-center gap-4 mb-8">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'text-[#2b333f]/60 hover:text-[#2b333f]',
                    'transition-colors duration-300'
                  )}
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            <div className="space-y-3">
              <Link
                href="/boutiques"
                className="text-sm text-[#2b333f]/70 hover:text-[#2b333f] transition-colors duration-300 block"
              >
                Nos Boutiques
              </Link>
              <Link
                href="/rendez-vous"
                className="text-sm text-[#2b333f]/70 hover:text-[#2b333f] transition-colors duration-300 block"
              >
                Prendre Rendez-vous
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-[#2b333f]/10">
        <div className="container mx-auto px-6 lg:px-12 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Logo / Brand */}
            <Link
              href="/"
              className="font-serif text-lg tracking-[0.3em] text-[#2b333f] hover:opacity-70 transition-opacity duration-300"
            >
              MAISON BIJOUX
            </Link>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-8">
              <Link
                href="/mentions-legales"
                className="text-xs uppercase tracking-[0.15em] text-[#2b333f]/50 hover:text-[#2b333f] transition-colors duration-300"
              >
                Mentions Legales
              </Link>
              <Link
                href="/cgv"
                className="text-xs uppercase tracking-[0.15em] text-[#2b333f]/50 hover:text-[#2b333f] transition-colors duration-300"
              >
                CGV
              </Link>
              <Link
                href="/politique-confidentialite"
                className="text-xs uppercase tracking-[0.15em] text-[#2b333f]/50 hover:text-[#2b333f] transition-colors duration-300"
              >
                Confidentialite
              </Link>
              <Link
                href="/cookies"
                className="text-xs uppercase tracking-[0.15em] text-[#2b333f]/50 hover:text-[#2b333f] transition-colors duration-300"
              >
                Cookies
              </Link>
            </div>

            {/* Copyright */}
            <p className="text-xs text-[#2b333f]/40 tracking-wide">
              {currentYear} Maison Bijoux
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
