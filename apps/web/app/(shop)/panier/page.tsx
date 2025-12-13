import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { HeaderSpacer } from '@/components/layout/Header';
import { CartContent } from './CartContent';

export const metadata: Metadata = {
  title: 'Votre Panier | Maison Joaillerie',
  description:
    'Consultez votre panier et finalisez votre commande. Livraison offerte a partir de 500EUR.',
  robots: {
    index: false,
    follow: true,
  },
};

/**
 * PanierPage - Shopping cart page
 *
 * Features:
 * - Hero section with Hermes-inspired styling
 * - Cart items list with quantity controls
 * - Order summary with totals
 * - Empty cart state
 * - Checkout with authentication check
 */
export default function PanierPage() {
  return (
    <main className="min-h-screen bg-background-cream">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-warm">
        <HeaderSpacer />
        <div className="absolute inset-0 bg-vignette" />
        <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-hermes-500/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light to-transparent" />

        <Container className="py-12 lg:py-16">
          <div className="text-center">
            <span className="mb-4 inline-block font-sans text-overline uppercase tracking-luxe text-hermes-500">
              Votre selection
            </span>

            <h1 className="font-serif text-heading-1 text-text-primary md:text-display-2 lg:text-display-1">
              Panier
            </h1>

            <div className="mx-auto my-6 h-px w-24 bg-hermes-500" />

            <p className="mx-auto max-w-xl font-sans text-body-lg leading-elegant text-text-muted">
              Verifiez votre selection avant de proceder au paiement securise.
            </p>
          </div>
        </Container>
      </section>

      {/* Cart Content Section */}
      <section className="py-12 lg:py-20">
        <Container>
          {/* Breadcrumbs */}
          <Breadcrumbs items={[{ label: 'Panier' }]} className="mb-8 md:mb-12" />

          {/* Cart Content (Client Component) */}
          <CartContent />
        </Container>
      </section>
    </main>
  );
}
