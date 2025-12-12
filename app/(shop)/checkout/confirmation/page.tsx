'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, Truck, ShieldCheck, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { HeaderSpacer } from '@/components/layout/Header';
import { cn, formatPrice } from '@/lib/utils';

/**
 * Order details from API
 */
interface OrderDetails {
  orderId: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  shipping: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

/**
 * ConfirmationContent Component
 * Separated to use useSearchParams within Suspense
 */
function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders/${orderId}`);

        if (!response.ok) {
          throw new Error('Commande non trouvee');
        }

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Erreur lors de la recuperation de la commande'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-hermes-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted">Chargement de votre commande...</p>
        </div>
      </div>
    );
  }

  // No order ID provided
  if (!orderId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Package className="h-16 w-16 text-text-muted mb-6" />
        <h1 className="font-serif text-2xl md:text-3xl text-text-primary mb-4">
          Aucune commande specifiee
        </h1>
        <p className="text-text-muted mb-8 max-w-md">
          Vous pouvez consulter vos commandes dans votre espace personnel.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/account/orders">
            <Button variant="primary" size="lg">
              Mes commandes
            </Button>
          </Link>
          <Link href="/collections">
            <Button variant="secondary" size="lg">
              Continuer mes achats
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Package className="h-16 w-16 text-text-muted mb-6" />
        <h1 className="font-serif text-2xl md:text-3xl text-text-primary mb-4">
          Commande non trouvee
        </h1>
        <p className="text-text-muted mb-8 max-w-md">{error}</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/account/orders">
            <Button variant="primary" size="lg">
              Mes commandes
            </Button>
          </Link>
          <Link href="/">
            <Button variant="secondary" size="lg">
              Retour a l'accueil
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Success icon and message */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>

        <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl text-text-primary mb-4">
          Commande confirmee
        </h1>

        <p className="text-text-muted max-w-lg mx-auto">
          Merci pour votre confiance. Votre commande a ete enregistree et sera
          preparee avec le plus grand soin par nos artisans.
        </p>
      </div>

      {/* Order details card */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-border-light p-6 md:p-8 mb-8">
          {/* Order number */}
          <div className="text-center border-b border-border-light pb-6 mb-6">
            <span className="text-xs uppercase tracking-luxe text-text-muted">
              Numero de commande
            </span>
            <p className="font-serif text-2xl md:text-3xl text-hermes-600 mt-2">
              {order?.orderNumber || `#CMD-${orderId.slice(0, 8).toUpperCase()}`}
            </p>
          </div>

          {/* Order items */}
          {order?.items && order.items.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm uppercase tracking-luxe text-text-muted mb-4">
                Articles commandes
              </h2>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-border-light last:border-0"
                  >
                    <div>
                      <p className="font-medium text-text-primary">
                        {item.productName}
                      </p>
                      <p className="text-sm text-text-muted">
                        Quantite: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-hermes-600">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 mt-4 border-t border-border-light">
                <span className="font-medium text-text-primary">Total</span>
                <span className="font-serif text-xl text-hermes-600">
                  {formatPrice(order.totalPrice)}
                </span>
              </div>
            </div>
          )}

          {/* Shipping address */}
          {order?.shipping && (
            <div className="mb-6">
              <h2 className="text-sm uppercase tracking-luxe text-text-muted mb-4">
                Adresse de livraison
              </h2>
              <div className="text-text-secondary">
                <p className="font-medium text-text-primary">
                  {order.shipping.firstName} {order.shipping.lastName}
                </p>
                <p>{order.shipping.address}</p>
                <p>
                  {order.shipping.postalCode} {order.shipping.city}
                </p>
                <p>{order.shipping.country}</p>
              </div>
            </div>
          )}

          {/* Estimated delivery */}
          <div className="bg-background-beige p-4 flex items-start gap-3">
            <Truck className="h-5 w-5 text-hermes-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-text-primary">
                Livraison estimee
              </p>
              <p className="text-sm text-text-muted">
                Sous 3 a 5 jours ouvrables. Vous recevrez un email avec le
                numero de suivi une fois votre colis expedie.
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/account/orders">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Suivre ma commande
            </Button>
          </Link>
          <Link href="/collections">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Continuer mes achats
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-16 pt-8 border-t border-border-light">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4 p-4">
            <Package className="h-8 w-8 text-hermes-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-text-primary mb-1">
                Emballage de luxe
              </h3>
              <p className="text-sm text-text-muted">
                Chaque piece est soigneusement emballee dans un ecrin elegant
                accompagne de son certificat d'authenticite.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4">
            <Truck className="h-8 w-8 text-hermes-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-text-primary mb-1">
                Livraison securisee
              </h3>
              <p className="text-sm text-text-muted">
                Votre commande sera livree par transporteur securise avec
                signature obligatoire.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4">
            <ShieldCheck className="h-8 w-8 text-hermes-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-text-primary mb-1">
                Garantie qualite
              </h3>
              <p className="text-sm text-text-muted">
                Retours gratuits sous 30 jours. Votre satisfaction est notre
                priorite absolue.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * ConfirmationPage Component
 * Order success page showing order details and next steps
 */
export default function ConfirmationPage() {
  return (
    <main className="min-h-screen bg-background-cream">
      <HeaderSpacer />

      {/* Page header */}
      <section
        className={cn(
          'py-8 md:py-12 border-b border-border-light',
          'bg-gradient-to-b from-green-50/50 to-transparent'
        )}
      >
        <Container>
          <div className="text-center">
            <span className="block text-xs uppercase tracking-luxe text-hermes-500 mb-2">
              Maison Joaillerie
            </span>
          </div>
        </Container>
      </section>

      {/* Main content */}
      <section className="py-12 md:py-16">
        <Container>
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="w-12 h-12 border-2 border-hermes-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-text-muted">Chargement...</p>
                </div>
              </div>
            }
          >
            <ConfirmationContent />
          </Suspense>
        </Container>
      </section>
    </main>
  );
}
