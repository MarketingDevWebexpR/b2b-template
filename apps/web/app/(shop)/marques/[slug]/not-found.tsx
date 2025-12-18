import Link from 'next/link';
import { Package } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

/**
 * Not Found page for Brand Detail
 *
 * Displayed when a brand slug doesn't match any existing brand.
 */
export default function BrandNotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center">
      <Container>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {/* Icon */}
          <div className="w-20 h-20 mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
            <Package className="w-10 h-10 text-neutral-400" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            Marque introuvable
          </h1>

          {/* Description */}
          <p className="text-neutral-600 max-w-md mb-8">
            La marque que vous recherchez n'existe pas ou n'est plus disponible dans notre
            catalogue. Explorez nos autres marques partenaires.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/marques">
              <Button variant="primary" size="lg">
                Voir toutes les marques
              </Button>
            </Link>
            <Link href="/produits">
              <Button variant="secondary" size="lg">
                Parcourir les produits
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
