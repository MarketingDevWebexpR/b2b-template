'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Building,
  FileText,
  Clock,
  Shield,
  Lock,
  Check,
  AlertCircle,
  MapPin,
  Store,
  Truck,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { B2BHeaderEcomSpacer } from '@/components/layout/B2BHeaderEcom';
import { useCart } from '@/contexts/CartContext';
import { cn, formatPrice } from '@/lib/utils';

import { CheckoutStepper } from '../components/CheckoutStepper';
import { CheckoutSummary } from '../components/CheckoutSummary';
import {
  CheckoutProvider,
  useCheckoutPayment,
  type B2BPaymentMethod,
  type ShippingData,
} from '../contexts/CheckoutContext';

// ============================================================================
// Payment Methods Configuration
// ============================================================================

interface PaymentMethodConfig {
  id: B2BPaymentMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
  badge?: string;
}

const paymentMethods: PaymentMethodConfig[] = [
  {
    id: 'card',
    label: 'Carte bancaire',
    description: 'Paiement securise par CB, Visa, Mastercard',
    icon: <CreditCard className="h-6 w-6" />,
    available: true,
  },
  {
    id: 'bank_transfer',
    label: 'Virement bancaire',
    description: 'Reglement par virement SEPA',
    icon: <Building className="h-6 w-6" />,
    available: true,
  },
  {
    id: 'company_credit',
    label: 'Credit entreprise',
    description: 'Utiliser votre ligne de credit',
    icon: <FileText className="h-6 w-6" />,
    available: true,
    badge: 'Credit disponible',
  },
  {
    id: 'deferred',
    label: 'Paiement differe',
    description: 'Payer a 30 jours fin de mois',
    icon: <Clock className="h-6 w-6" />,
    available: true,
  },
];

// ============================================================================
// Components
// ============================================================================

/**
 * Payment method selector
 */
function PaymentMethodSelector({
  selectedMethod,
  onSelect,
  errors,
}: {
  selectedMethod: B2BPaymentMethod | undefined;
  onSelect: (method: B2BPaymentMethod) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-3">
      {paymentMethods.map((method) => (
        <button
          key={method.id}
          type="button"
          onClick={() => method.available && onSelect(method.id)}
          disabled={!method.available}
          className={cn(
            'w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
            !method.available && 'opacity-50 cursor-not-allowed',
            selectedMethod === method.id
              ? 'border-accent bg-orange-50'
              : 'border-neutral-200 hover:border-neutral-300'
          )}
        >
          <div
            className={cn(
              'flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center',
              selectedMethod === method.id
                ? 'bg-accent text-white'
                : 'bg-neutral-100 text-neutral-500'
            )}
          >
            {method.icon}
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <p className="font-medium text-neutral-900">
                {method.label}
              </p>
              {method.badge && (
                <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                  {method.badge}
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-500">
              {method.description}
            </p>
          </div>
          <div
            className={cn(
              'flex-shrink-0 w-5 h-5 rounded-full border-2',
              'flex items-center justify-center',
              selectedMethod === method.id
                ? 'border-accent bg-accent'
                : 'border-neutral-300'
            )}
          >
            {selectedMethod === method.id && (
              <Check className="h-3 w-3 text-white" />
            )}
          </div>
        </button>
      ))}
      {errors.payment && (
        <p className="text-sm text-red-600" role="alert">
          {errors.payment}
        </p>
      )}
    </div>
  );
}

/**
 * Shipping summary card (recap of previous step)
 */
function ShippingSummaryCard({ shipping }: { shipping: ShippingData | null }) {
  if (!shipping) return null;

  const isPickup = shipping.deliveryMode === 'pickup';

  return (
    <Card variant="outlined" size="none" className="mb-6">
      <CardHeader className="p-4 border-b border-neutral-200 bg-neutral-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-600">
            {isPickup ? (
              <Store className="h-4 w-4 text-accent" />
            ) : (
              <Truck className="h-4 w-4 text-accent" />
            )}
            {isPickup ? 'Retrait en point de vente' : 'Livraison'}
          </CardTitle>
          <Link
            href="/checkout/livraison"
            className="text-sm text-accent hover:text-accent-600"
          >
            Modifier
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {isPickup && shipping.pickupPoint ? (
          <div>
            <p className="font-medium text-neutral-900">
              {shipping.pickupPoint.name}
            </p>
            <p className="text-sm text-neutral-600">
              {shipping.pickupPoint.address}
            </p>
            <p className="text-sm text-neutral-600">
              {shipping.pickupPoint.postalCode} {shipping.pickupPoint.city}
            </p>
          </div>
        ) : shipping.shippingAddress ? (
          <div>
            <p className="font-medium text-neutral-900">
              {shipping.shippingAddress.companyName}
            </p>
            {shipping.shippingAddress.attention && (
              <p className="text-sm text-neutral-600">
                A l'att. de {shipping.shippingAddress.attention}
              </p>
            )}
            <p className="text-sm text-neutral-600">
              {shipping.shippingAddress.addressLine1}
            </p>
            <p className="text-sm text-neutral-600">
              {shipping.shippingAddress.postalCode} {shipping.shippingAddress.city}
            </p>
            <p className="text-sm text-neutral-500 mt-2">
              {shipping.shippingMethod === 'express' ? 'Livraison express (24-48h)' : 'Livraison standard (3-5 jours)'}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

/**
 * Main payment form content
 */
function PaymentFormContent() {
  const router = useRouter();
  const { cart, clearCart, isLoading: cartLoading } = useCart();
  const {
    payment,
    shipping,
    errors,
    setPaymentMethod,
    setPurchaseOrderNumber,
    setOrderNotes,
    setAcceptTerms,
    setAcceptB2BConditions,
    validate,
  } = useCheckoutPayment();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);

  // Load shipping data from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('checkoutShipping');
    if (stored) {
      try {
        setShippingData(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse shipping data');
      }
    }
  }, []);

  // Redirect if no shipping data
  useEffect(() => {
    if (!cartLoading && !shippingData && typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('checkoutShipping');
      if (!stored) {
        router.push('/checkout/livraison');
      }
    }
  }, [cartLoading, shippingData, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && cart.items.length === 0) {
      router.push('/panier');
    }
  }, [cartLoading, cart.items.length, router]);

  const selectedPaymentMethod = payment?.paymentMethod;
  const purchaseOrderNumber = payment?.purchaseOrderNumber || '';
  const orderNotes = payment?.orderNotes || '';
  const acceptTerms = payment?.acceptTerms || false;
  const acceptB2BConditions = payment?.acceptB2BConditions || false;

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    try {
      const isValid = validate();
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

      // Generate order ID
      const orderId = `CMD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Prepare order data
      const orderData = {
        orderId,
        orderNumber: orderId,
        createdAt: new Date().toISOString(),
        status: 'confirmed',
        items: cart.items.map((item) => ({
          productId: item.productId,
          productReference: item.productReference,
          productName: item.productName,
          productImage: item.productImage,
          unitPriceHT: item.pricing.unitPriceHT,
          unitPriceTTC: item.pricing.unitPriceTTC,
          quantity: item.quantity,
          totalPriceHT: item.pricing.unitPriceHT * item.quantity,
          totalPriceTTC: item.pricing.unitPriceTTC * item.quantity,
        })),
        totals: {
          subtotalHT: cart.subtotalHT,
          totalDiscountHT: cart.totalDiscountHT,
          taxAmount: cart.taxAmount,
          totalHT: cart.totalHT,
          totalTTC: cart.totalTTC,
        },
        shipping: shippingData,
        payment: {
          method: selectedPaymentMethod,
          purchaseOrderNumber,
          orderNotes,
        },
      };

      // Store order data in sessionStorage
      sessionStorage.setItem('lastOrder', JSON.stringify(orderData));
      sessionStorage.removeItem('checkoutShipping');

      // Clear cart
      clearCart();

      // Redirect to confirmation
      router.push(`/checkout/confirmation?orderId=${orderId}`);
    } catch (error) {
      console.error('Order submission error:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      {/* Left column: Form */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-6">
        {/* Shipping summary */}
        <ShippingSummaryCard shipping={shippingData || shipping} />

        {/* Payment method selection */}
        <Card variant="outlined" size="none">
          <CardHeader className="p-4 md:p-6 border-b border-neutral-200">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <CreditCard className="h-5 w-5 text-accent" />
              Mode de paiement
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <PaymentMethodSelector
              selectedMethod={selectedPaymentMethod}
              onSelect={setPaymentMethod}
              errors={errors}
            />
          </CardContent>
        </Card>

        {/* Purchase order / Reference */}
        <Card variant="outlined" size="none">
          <CardHeader className="p-4 md:p-6 border-b border-neutral-200">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <FileText className="h-5 w-5 text-accent" />
              Reference commande
              <span className="text-sm font-normal text-neutral-500">(optionnel)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-4">
            <Input
              label="Numero de bon de commande"
              placeholder="Ex: BC-2024-001"
              value={purchaseOrderNumber}
              onChange={(e) => setPurchaseOrderNumber(e.target.value)}
              className="bg-white border-neutral-200 focus:border-accent text-neutral-900"
              containerClassName="text-neutral-600"
            />
            <div>
              <label className="block mb-1.5 font-sans text-sm text-neutral-600">
                Notes pour la commande
              </label>
              <textarea
                placeholder="Instructions particulieres, remarques..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={3}
                className={cn(
                  'w-full px-4 py-2.5 text-sm',
                  'bg-white text-neutral-900',
                  'border border-neutral-200 rounded-md',
                  'focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20',
                  'placeholder:text-neutral-500'
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Terms and conditions */}
        <Card variant="outlined" size="none">
          <CardHeader className="p-4 md:p-6 border-b border-neutral-200">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <Shield className="h-5 w-5 text-accent" />
              Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-4">
            <Checkbox
              label={
                <span>
                  J'accepte les{' '}
                  <Link
                    href="/cgv"
                    className="text-accent hover:underline"
                    target="_blank"
                  >
                    conditions generales de vente
                  </Link>
                </span>
              }
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              error={errors.acceptTerms}
            />
            <Checkbox
              label={
                <span>
                  J'accepte les{' '}
                  <Link
                    href="/conditions-b2b"
                    className="text-accent hover:underline"
                    target="_blank"
                  >
                    conditions specifiques B2B
                  </Link>{' '}
                  (delais de paiement, responsabilites)
                </span>
              }
              checked={acceptB2BConditions}
              onChange={(e) => setAcceptB2BConditions(e.target.checked)}
              error={errors.acceptB2BConditions}
            />
          </CardContent>
        </Card>

        {/* Security notice */}
        <div className="flex items-center gap-3 p-4 bg-neutral-100 rounded-lg">
          <Lock className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-neutral-600">
            Vos informations sont securisees. Ce site utilise un chiffrement SSL
            pour proteger vos donnees.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <Link
            href="/checkout/livraison"
            className={cn(
              'inline-flex items-center gap-2 text-sm text-neutral-600',
              'hover:text-accent transition-colors'
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour a la livraison
          </Link>

          <Button
            onClick={handleSubmitOrder}
            isLoading={isSubmitting}
            disabled={!acceptTerms || !acceptB2BConditions || !selectedPaymentMethod}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Lock className="h-4 w-4 mr-2" />
            Valider la commande
          </Button>
        </div>
      </div>

      {/* Right column: Summary */}
      <aside className="lg:col-span-5 xl:col-span-4">
        <div className="lg:sticky lg:top-24 space-y-6">
          <CheckoutSummary />

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-neutral-200">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-xs text-neutral-600">Paiement securise</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-neutral-200">
              <Truck className="h-5 w-5 text-accent" />
              <span className="text-xs text-neutral-600">Livraison assuree</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

// ============================================================================
// Page Component
// ============================================================================

export default function PaiementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cart, isLoading: cartLoading } = useCart();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/checkout/paiement');
    }
  }, [status, router]);

  // Loading states
  if (status === 'loading' || cartLoading) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <B2BHeaderEcomSpacer />
        <Container className="py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-neutral-500">Chargement...</p>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  // Not authenticated
  if (!session) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <B2BHeaderEcomSpacer />
        <Container className="py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-neutral-500">Redirection vers la connexion...</p>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <CheckoutProvider>
      <main className="min-h-screen bg-neutral-50">
        <B2BHeaderEcomSpacer />

        {/* Page header */}
        <section className="py-6 md:py-8 bg-white border-b border-neutral-200">
          <Container>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Back link */}
              <div>
                <Link
                  href="/checkout/livraison"
                  className={cn(
                    'inline-flex items-center gap-2 text-sm text-neutral-500',
                    'hover:text-accent transition-colors mb-2'
                  )}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </Link>
                <h1 className="font-semibold text-2xl font-semibold text-neutral-900">
                  Paiement
                </h1>
              </div>
            </div>
          </Container>
        </section>

        {/* Stepper */}
        <section className="py-6 bg-white border-b border-neutral-200">
          <Container>
            <CheckoutStepper currentStep="paiement" />
          </Container>
        </section>

        {/* Main content */}
        <section className="py-8 md:py-12">
          <Container>
            <PaymentFormContent />
          </Container>
        </section>
      </main>
    </CheckoutProvider>
  );
}
