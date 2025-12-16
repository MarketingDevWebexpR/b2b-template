'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { B2BHeaderEcomSpacer } from '@/components/layout/B2BHeaderEcom';
import {
  CheckoutSteps,
  ShippingForm,
  PaymentForm,
  OrderSummary,
  type ShippingFormData,
  type PaymentFormData,
} from '@/components/checkout';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

/**
 * Checkout step type
 */
type CheckoutStep = 1 | 2 | 3;

/**
 * Order data structure for API submission
 * Matches the CartItemWithDetails format expected by the API
 */
interface OrderItem {
  productId: string;
  productReference?: string;
  productName: string;
  productSlug: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  maxQuantity: number;
  totalPrice: number;
}

interface OrderData {
  items: OrderItem[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
    email?: string;
  };
  paymentMethod: 'deferred' | 'immediate' | 'card' | 'paypal' | 'bank_transfer' | 'apple_pay' | 'google_pay';
  notes?: string;
}

/**
 * CheckoutPage Component
 * Multi-step checkout flow with shipping, payment, and confirmation
 * Requires authentication - redirects to login if not logged in
 */
export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cart, clearCart, isLoading: cartLoading } = useCart();

  // Checkout state
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/checkout');
    }
  }, [status, router]);

  // Redirect to home if cart is empty (after loading)
  useEffect(() => {
    if (!cartLoading && cart.items.length === 0 && currentStep === 1) {
      router.push('/');
    }
  }, [cartLoading, cart.items.length, currentStep, router]);

  /**
   * Handle shipping form submission
   * Move to payment step
   */
  const handleShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data);
    setCurrentStep(2);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Handle back to shipping
   */
  const handleBackToShipping = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Handle payment form submission
   * Create order and move to confirmation
   */
  const handlePaymentSubmit = async (paymentData: PaymentFormData) => {
    if (!shippingData) {
      setError('Informations de livraison manquantes');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Generate a fake order ID
      const orderId = `CMD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Prepare order data for confirmation page
      const orderData = {
        orderId,
        orderNumber: orderId,
        createdAt: new Date().toISOString(),
        status: 'confirmed',
        items: cart.items.map((item) => ({
          productId: item.productId,
          productReference: item.productReference,
          productName: item.productName,
          productSlug: item.productSlug,
          productImage: item.productImage || '',
          unitPrice: item.pricing.unitPriceTTC,
          quantity: item.quantity,
          totalPrice: item.pricing.unitPriceTTC * item.quantity,
        })),
        totalPrice: cart.totalTTC,
        shippingCost: cart.totalTTC >= 500 ? 0 : 15,
        shipping: {
          firstName: shippingData.firstName,
          lastName: shippingData.lastName,
          address: shippingData.address,
          addressLine2: shippingData.addressLine2,
          city: shippingData.city,
          postalCode: shippingData.postalCode,
          country: shippingData.country,
          phone: shippingData.phone,
        },
        paymentMethod: paymentData.paymentMethod,
      };

      // Store order data in sessionStorage for confirmation page
      sessionStorage.setItem('pendingOrder', JSON.stringify(orderData));

      // Clear cart after successful order
      clearCart();

      // Redirect to confirmation page
      router.push(`/checkout/confirmation?orderId=${orderId}`);
    } catch (err) {
      console.error('Order submission error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue lors de la commande'
      );
      setIsSubmitting(false);
    }
  };

  // Loading states
  if (status === 'loading' || cartLoading) {
    return (
      <main className="min-h-screen bg-white">
        <B2BHeaderEcomSpacer />
        <Container className="py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-content-muted">Chargement...</p>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  // Not authenticated - show loading while redirecting
  if (!session) {
    return (
      <main className="min-h-screen bg-white">
        <B2BHeaderEcomSpacer />
        <Container className="py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-content-muted">Redirection vers la connexion...</p>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  // Empty cart
  if (cart.items.length === 0 && currentStep === 1) {
    return (
      <main className="min-h-screen bg-white">
        <B2BHeaderEcomSpacer />
        <Container className="py-12">
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <ShoppingBag className="h-16 w-16 text-content-muted mb-6" />
            <h1 className="font-sans text-2xl md:text-3xl text-content-primary mb-4">
              Votre panier est vide
            </h1>
            <p className="text-content-muted mb-8 max-w-md">
              Decouvrez notre catalogue professionnel et trouvez les pieces
              qui correspondent a vos besoins.
            </p>
            <Link href="/categories">
              <Button variant="primary" size="lg">
                Decouvrir notre catalogue
              </Button>
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <B2BHeaderEcomSpacer />

      {/* Page header */}
      <section className="py-8 md:py-12 border-b border-stroke-light">
        <Container>
          {/* Back link */}
          <Link
            href="/panier"
            className={cn(
              'inline-flex items-center gap-2 text-sm text-content-muted',
              'hover:text-primary transition-colors mb-6'
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au panier
          </Link>

          {/* Title */}
          <div className="text-center">
            <span className="block text-xs uppercase  text-primary mb-2">
              Maison Joaillerie
            </span>
            <h1 className="font-sans text-2xl md:text-3xl lg:text-4xl text-content-primary">
              Finaliser votre commande
            </h1>
          </div>
        </Container>
      </section>

      {/* Step indicator */}
      <section className="py-8 border-b border-stroke-light bg-white">
        <Container>
          <CheckoutSteps currentStep={currentStep} />
        </Container>
      </section>

      {/* Main content */}
      <section className="py-8 md:py-12">
        <Container>
          {/* Error message */}
          {error && (
            <div
              role="alert"
              className={cn(
                'mb-8 p-4 border border-red-500/30 bg-red-500/10',
                'text-red-600 text-sm text-center'
              )}
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Form section */}
            <div className="lg:col-span-7 xl:col-span-8">
              <div className="bg-white p-6 md:p-8 border border-stroke-light">
                {/* Step 1: Shipping */}
                {currentStep === 1 && (
                  <ShippingForm
                    initialData={shippingData || undefined}
                    onSubmit={handleShippingSubmit}
                    isLoading={isSubmitting}
                  />
                )}

                {/* Step 2: Payment */}
                {currentStep === 2 && (
                  <PaymentForm
                    onSubmit={handlePaymentSubmit}
                    onBack={handleBackToShipping}
                    isLoading={isSubmitting}
                    totalAmount={cart.totalTTC + (cart.totalTTC >= 500 ? 0 : 15)}
                  />
                )}
              </div>
            </div>

            {/* Order summary sidebar */}
            <aside className="lg:col-span-5 xl:col-span-4">
              <div className="lg:sticky lg:top-8">
                <OrderSummary />
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* Trust section */}
      <section className="py-8 bg-background-beige border-t border-stroke-light">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <span className="block font-sans text-2xl text-primary mb-1">
                100%
              </span>
              <span className="text-xs uppercase  text-content-muted">
                Securise
              </span>
            </div>
            <div>
              <span className="block font-sans text-2xl text-primary mb-1">
                3-5j
              </span>
              <span className="text-xs uppercase  text-content-muted">
                Livraison
              </span>
            </div>
            <div>
              <span className="block font-sans text-2xl text-primary mb-1">
                30j
              </span>
              <span className="text-xs uppercase  text-content-muted">
                Retours
              </span>
            </div>
            <div>
              <span className="block font-sans text-2xl text-primary mb-1">
                24/7
              </span>
              <span className="text-xs uppercase  text-content-muted">
                Support
              </span>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
