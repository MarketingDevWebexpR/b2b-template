'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  CreditCard,
  Truck,
  Shield,
  Award,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';

// Catalog links
const catalogLinks = [
  { label: 'Bagues', href: '/categorie/bagues' },
  { label: 'Colliers & Pendentifs', href: '/categorie/colliers' },
  { label: 'Bracelets', href: '/categorie/bracelets' },
  { label: 'Boucles d\'oreilles', href: '/categorie/boucles-oreilles' },
  { label: 'Montres', href: '/categorie/montres' },
  { label: 'Pierres & Diamants', href: '/categorie/pierres' },
  { label: 'Accessoires', href: '/categorie/accessoires' },
];

// Services links - Point to functional B2B pages
const servicesLinks = [
  { label: 'Demande de devis', href: '/devis/nouveau' },
  { label: 'Commande express', href: '/commande-rapide' },
  { label: 'Listes de prix', href: '/listes' },
  { label: 'Mes commandes', href: '/commandes' },
  { label: 'Comparateur produits', href: '/comparer' },
  { label: 'Tableau de bord', href: '/tableau-de-bord' },
];

// Help links - Point to existing pages
const helpLinks = [
  { label: 'Mon compte', href: '/compte' },
  { label: 'Mes commandes', href: '/commandes' },
  { label: 'Mes devis', href: '/devis' },
  { label: 'Mes favoris', href: '/favoris' },
  { label: 'Contact', href: '/contact' },
];

// Pro services links - Point to B2B enterprise pages
const proLinks = [
  { label: 'Mon entreprise', href: '/entreprise' },
  { label: 'Adresses de livraison', href: '/entreprise/adresses' },
  { label: 'Gestion des employes', href: '/entreprise/employes' },
  { label: 'Parametres', href: '/entreprise/parametres' },
  { label: 'Approbations', href: '/approbations' },
  { label: 'Rapports', href: '/rapports' },
];

// About links - Point to existing or placeholder pages
const aboutLinks = [
  { label: 'Notre histoire', href: '/notre-histoire' },
  { label: 'Contact', href: '/contact' },
];

// Legal links
const legalLinks = [
  { label: 'Mentions legales', href: '/mentions-legales' },
  { label: 'CGV', href: '/cgv' },
  { label: 'Politique de confidentialite', href: '/politique-confidentialite' },
  { label: 'Gestion des cookies', href: '/cookies' },
];

// Payment methods
const paymentMethods = [
  { name: 'Visa', icon: '💳' },
  { name: 'Mastercard', icon: '💳' },
  { name: 'Amex', icon: '💳' },
  { name: 'PayPal', icon: '💳' },
  { name: 'Virement', icon: '🏦' },
];

// Trust badges
const trustBadges = [
  { icon: Truck, label: 'Livraison 24h' },
  { icon: CreditCard, label: 'Paiement securise' },
  { icon: Shield, label: 'Garantie 2 ans' },
  { icon: Award, label: 'Certifie RJC' },
];

export interface FooterEcomProps {
  /** Additional CSS classes */
  className?: string;
}

// Collapsible section for mobile
function FooterSection({
  title,
  links,
  defaultOpen = false,
}: {
  title: string;
  links: { label: string; href: string }[];
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-stroke-light lg:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 lg:py-0 lg:cursor-default"
        aria-expanded={isOpen}
      >
        <h4 className="text-body font-semibold text-content-primary">
          {title}
        </h4>
        <span className="lg:hidden">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-content-muted" />
          ) : (
            <ChevronDown className="w-5 h-5 text-content-muted" />
          )}
        </span>
      </button>

      <ul
        className={cn(
          'space-y-2 overflow-hidden transition-all duration-300',
          'lg:!max-h-none lg:!opacity-100 lg:mt-4',
          isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0 pb-0'
        )}
      >
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                'text-body-sm text-content-secondary',
                'hover:text-primary hover:underline',
                'transition-colors duration-150'
              )}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const FooterEcom = memo(function FooterEcom({ className }: FooterEcomProps) {
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
    <footer className={cn('bg-surface-secondary', className)} role="contentinfo">
      {/* Trust badges */}
      <div className="border-b border-stroke-light">
        <div className="container-ecom py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-3 justify-center p-3"
              >
                <badge.icon className="w-6 h-6 text-primary" />
                <span className="text-body-sm font-medium text-content-primary">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter section */}
      <div className="border-b border-stroke-light bg-primary-50">
        <div className="container-ecom py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h3 className="text-section-sm font-semibold text-content-primary mb-1">
                Restez informe des nouveautes
              </h3>
              <p className="text-body-sm text-content-secondary">
                Recevez nos offres exclusives et actualites professionnelles
              </p>
            </div>

            <form
              onSubmit={handleNewsletterSubmit}
              className="flex w-full max-w-md gap-2"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email professionnel"
                required
                className={cn(
                  'flex-1 px-4 py-2.5 rounded-lg',
                  'bg-white border border-stroke',
                  'text-body-sm text-content-primary placeholder:text-content-muted',
                  'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                  'transition-all duration-150'
                )}
                aria-label="Adresse email pour la newsletter"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  'px-6 py-2.5 rounded-lg',
                  'bg-primary text-white font-medium text-body-sm',
                  'hover:bg-primary-600',
                  'transition-colors duration-150',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isSubmitting ? '...' : 'S\'inscrire'}
              </button>
            </form>

            {isSubscribed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-body-sm text-success font-medium"
              >
                Merci pour votre inscription !
              </motion.p>
            )}
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="container-ecom py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-0 lg:gap-8">
          {/* Catalog */}
          <div className="lg:col-span-1">
            <FooterSection title="Catalogue" links={catalogLinks} />
          </div>

          {/* Services */}
          <div className="lg:col-span-1">
            <FooterSection title="Services" links={servicesLinks} />
          </div>

          {/* Help */}
          <div className="lg:col-span-1">
            <FooterSection title="Aide" links={helpLinks} />
          </div>

          {/* Pro */}
          <div className="lg:col-span-1">
            <FooterSection title="Espace Pro" links={proLinks} />
          </div>

          {/* About */}
          <div className="lg:col-span-1">
            <FooterSection title="A propos" links={aboutLinks} />
          </div>

          {/* Contact */}
          <div className="lg:col-span-1 py-4 lg:py-0">
            <h4 className="text-body font-semibold text-content-primary mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+33123456789"
                  className="flex items-center gap-2 text-body-sm text-content-secondary hover:text-primary transition-colors duration-150"
                >
                  <Phone className="w-4 h-4" />
                  <span>01 23 45 67 89</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:pro@webexprpro.fr"
                  className="flex items-center gap-2 text-body-sm text-content-secondary hover:text-primary transition-colors duration-150"
                >
                  <Mail className="w-4 h-4" />
                  <span>pro@webexprpro.fr</span>
                </a>
              </li>
              <li className="flex items-start gap-2 text-body-sm text-content-secondary">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <address className="not-italic">
                  12 Place Vendome<br />
                  75001 Paris
                </address>
              </li>
              <li className="flex items-center gap-2 text-body-sm text-content-secondary">
                <Clock className="w-4 h-4" />
                <span>Lun-Ven: 9h-18h</span>
              </li>
            </ul>

            {/* Social links */}
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white border border-stroke text-content-secondary hover:text-primary hover:border-primary transition-colors duration-150"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white border border-stroke text-content-secondary hover:text-primary hover:border-primary transition-colors duration-150"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white border border-stroke text-content-secondary hover:text-primary hover:border-primary transition-colors duration-150"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white border border-stroke text-content-secondary hover:text-primary hover:border-primary transition-colors duration-150"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="border-t border-stroke-light bg-white">
        <div className="container-ecom py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Logo variant="dark" className="h-8" />
              <span className="text-caption text-content-muted">
                Votre partenaire bijouterie B2B depuis 1985
              </span>
            </div>

            {/* Payment methods */}
            <div className="flex items-center gap-2">
              <span className="text-caption text-content-muted mr-2">Paiements:</span>
              {paymentMethods.map((method) => (
                <span
                  key={method.name}
                  className="flex items-center justify-center w-10 h-6 bg-surface-secondary rounded text-sm"
                  title={method.name}
                >
                  {method.icon}
                </span>
              ))}
            </div>

            {/* Legal links */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-caption text-content-muted hover:text-primary transition-colors duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-4 pt-4 border-t border-stroke-light text-center">
            <p className="text-caption text-content-muted">
              &copy; {currentYear} WebexpR Pro. Tous droits reserves. SIREN: 123 456 789 - TVA: FR12 123 456 789
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
});

FooterEcom.displayName = 'FooterEcom';

export default FooterEcom;
