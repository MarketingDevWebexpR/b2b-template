import Link from 'next/link';
import { Container, Button } from '@/components/ui';
import { Search, ArrowLeft, Package } from 'lucide-react';

/**
 * Product Not Found Page
 *
 * Displayed when a product with the requested handle doesn't exist.
 */
export default function ProductNotFound() {
  return (
    <>
      {/* Header spacer */}
      <div className="h-20" />

      <div className="min-h-[60vh] flex items-center justify-center py-16">
        <Container className="text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-100 mb-6">
            <Package className="w-10 h-10 text-neutral-400" />
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900 mb-3">
            Produit introuvable
          </h1>

          {/* Description */}
          <p className="text-neutral-600 max-w-md mx-auto mb-8">
            Le produit que vous recherchez n'existe pas ou n'est plus disponible.
            Il a peut-etre ete retire de notre catalogue.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/recherche">
              <Button variant="primary" size="lg">
                <Search className="w-5 h-5 mr-2" />
                Rechercher un produit
              </Button>
            </Link>

            <Link href="/produits">
              <Button variant="secondary" size="lg">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voir le catalogue
              </Button>
            </Link>
          </div>

          {/* Help text */}
          <p className="mt-8 text-sm text-neutral-500">
            Besoin d'aide ?{' '}
            <Link
              href="/contact"
              className="text-accent hover:text-accent/80 underline underline-offset-2"
            >
              Contactez-nous
            </Link>
          </p>
        </Container>
      </div>
    </>
  );
}
