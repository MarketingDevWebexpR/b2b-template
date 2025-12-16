'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Truck,
  Store,
  Clock,
  Zap,
  Plus,
  Check,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Radio } from '@/components/ui/Checkbox';
import { B2BHeaderEcomSpacer } from '@/components/layout/B2BHeaderEcom';
import { useCart } from '@/contexts/CartContext';
import { cn, formatPrice } from '@/lib/utils';

import { CheckoutStepper } from '../components/CheckoutStepper';
import { CheckoutSummary } from '../components/CheckoutSummary';
import {
  CheckoutProvider,
  useCheckoutShipping,
  type CheckoutAddress,
  type PickupPoint,
  type DeliveryMode,
  type ShippingMethod,
} from '../contexts/CheckoutContext';

// ============================================================================
// Mock Data (to be replaced with API calls)
// ============================================================================

const mockAddresses: CheckoutAddress[] = [
  {
    id: 'addr_1',
    label: 'Siege social',
    companyName: 'Bijouterie Martin SAS',
    attention: 'Service Achats',
    addressLine1: '15 Rue de la Paix',
    city: 'Paris',
    postalCode: '75002',
    countryCode: 'FR',
    phone: '+33 1 42 00 00 00',
  },
  {
    id: 'addr_2',
    label: 'Entrepot Lyon',
    companyName: 'Bijouterie Martin SAS',
    addressLine1: '42 Avenue Jean Jaures',
    addressLine2: 'Batiment B',
    city: 'Lyon',
    postalCode: '69007',
    countryCode: 'FR',
    phone: '+33 4 72 00 00 00',
    deliveryInstructions: 'Livraison par quai C',
  },
];

const mockPickupPoints: PickupPoint[] = [
  {
    id: 'pickup_1',
    name: 'Showroom Paris - Maison Joaillerie',
    address: '8 Place Vendome',
    city: 'Paris',
    postalCode: '75001',
    phone: '+33 1 40 00 00 00',
    openingHours: 'Lun-Sam 10h-19h',
    distance: 2.5,
  },
  {
    id: 'pickup_2',
    name: 'Agence Lyon - Maison Joaillerie',
    address: '25 Rue de la Republique',
    city: 'Lyon',
    postalCode: '69002',
    phone: '+33 4 78 00 00 00',
    openingHours: 'Lun-Ven 9h-18h',
    distance: 125,
  },
];

const shippingMethods: Array<{
  id: ShippingMethod;
  label: string;
  description: string;
  price: number;
  estimatedDays: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'standard',
    label: 'Livraison standard',
    description: 'Transporteur securise',
    price: 0,
    estimatedDays: '3-5 jours ouvrables',
    icon: <Truck className="h-5 w-5" />,
  },
  {
    id: 'express',
    label: 'Livraison express',
    description: 'Livraison prioritaire',
    price: 25,
    estimatedDays: '24-48h',
    icon: <Zap className="h-5 w-5" />,
  },
];

// ============================================================================
// Components
// ============================================================================

/**
 * Address card component
 */
function AddressCard({
  address,
  isSelected,
  onSelect,
}: {
  address: CheckoutAddress;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full text-left p-4 rounded-lg border-2 transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
        isSelected
          ? 'border-accent bg-orange-50'
          : 'border-neutral-200 hover:border-neutral-300'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5',
            'flex items-center justify-center',
            isSelected
              ? 'border-accent bg-accent'
              : 'border-neutral-300'
          )}
        >
          {isSelected && <Check className="h-3 w-3 text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          {address.label && (
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              {address.label}
            </span>
          )}
          <p className="font-medium text-neutral-900 mt-1">
            {address.companyName}
          </p>
          {address.attention && (
            <p className="text-sm text-neutral-600">
              A l'attention de: {address.attention}
            </p>
          )}
          <p className="text-sm text-neutral-600 mt-1">
            {address.addressLine1}
            {address.addressLine2 && <>, {address.addressLine2}</>}
          </p>
          <p className="text-sm text-neutral-600">
            {address.postalCode} {address.city}
          </p>
          {address.phone && (
            <p className="text-sm text-neutral-500 mt-1">
              Tel: {address.phone}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

/**
 * Pickup point card component
 */
function PickupPointCard({
  point,
  isSelected,
  onSelect,
}: {
  point: PickupPoint;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full text-left p-4 rounded-lg border-2 transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
        isSelected
          ? 'border-accent bg-orange-50'
          : 'border-neutral-200 hover:border-neutral-300'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5',
            'flex items-center justify-center',
            isSelected
              ? 'border-accent bg-accent'
              : 'border-neutral-300'
          )}
        >
          {isSelected && <Check className="h-3 w-3 text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-neutral-900">
            {point.name}
          </p>
          <p className="text-sm text-neutral-600 mt-1">
            {point.address}, {point.postalCode} {point.city}
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
            {point.openingHours && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {point.openingHours}
              </span>
            )}
            {point.distance && (
              <span>{point.distance < 10 ? `${point.distance} km` : `${point.distance} km`}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

/**
 * Shipping method selector
 */
function ShippingMethodSelector({
  selectedMethod,
  onSelect,
}: {
  selectedMethod: ShippingMethod;
  onSelect: (method: ShippingMethod) => void;
}) {
  return (
    <div className="space-y-3">
      {shippingMethods.map((method) => (
        <button
          key={method.id}
          type="button"
          onClick={() => onSelect(method.id)}
          className={cn(
            'w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
            selectedMethod === method.id
              ? 'border-accent bg-orange-50'
              : 'border-neutral-200 hover:border-neutral-300'
          )}
        >
          <div
            className={cn(
              'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
              selectedMethod === method.id
                ? 'bg-accent text-white'
                : 'bg-neutral-100 text-neutral-500'
            )}
          >
            {method.icon}
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-neutral-900">
              {method.label}
            </p>
            <p className="text-sm text-neutral-500">
              {method.description} - {method.estimatedDays}
            </p>
          </div>
          <div className="text-right">
            <span className="font-semibold text-neutral-900">
              {method.price === 0 ? (
                <span className="text-green-600">Offert</span>
              ) : (
                formatPrice(method.price)
              )}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

/**
 * Main shipping form content
 */
function ShippingFormContent() {
  const router = useRouter();
  const { cart, isLoading: cartLoading } = useCart();
  const {
    shipping,
    errors,
    setDeliveryMode,
    setShippingAddress,
    setPickupPoint,
    setShippingMethod,
    validate,
  } = useCheckoutShipping();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && cart.items.length === 0) {
      router.push('/panier');
    }
  }, [cartLoading, cart.items.length, router]);

  const deliveryMode = shipping?.deliveryMode || 'shipping';
  const selectedAddress = shipping?.shippingAddress;
  const selectedPickupPoint = shipping?.pickupPoint;
  const selectedShippingMethod = shipping?.shippingMethod || 'standard';

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      const isValid = validate();
      if (isValid) {
        // Store shipping data in sessionStorage for persistence
        sessionStorage.setItem('checkoutShipping', JSON.stringify(shipping));
        router.push('/checkout/paiement');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      {/* Left column: Form */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-6">
        {/* Delivery mode selection */}
        <Card variant="outlined" size="none">
          <CardHeader className="p-4 md:p-6 border-b border-neutral-200">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <Truck className="h-5 w-5 text-accent" />
              Mode de livraison
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => setDeliveryMode('shipping')}
                className={cn(
                  'flex-1 flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  deliveryMode === 'shipping'
                    ? 'border-accent bg-orange-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                )}
              >
                <MapPin className={cn(
                  'h-6 w-6',
                  deliveryMode === 'shipping' ? 'text-accent' : 'text-neutral-500'
                )} />
                <div className="text-left">
                  <p className="font-medium text-neutral-900">Livraison</p>
                  <p className="text-sm text-neutral-500">A mon adresse</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMode('pickup')}
                className={cn(
                  'flex-1 flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  deliveryMode === 'pickup'
                    ? 'border-accent bg-orange-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                )}
              >
                <Store className={cn(
                  'h-6 w-6',
                  deliveryMode === 'pickup' ? 'text-accent' : 'text-neutral-500'
                )} />
                <div className="text-left">
                  <p className="font-medium text-neutral-900">Retrait</p>
                  <p className="text-sm text-neutral-500">En point de vente</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Address or Pickup selection */}
        {deliveryMode === 'shipping' ? (
          <Card variant="outlined" size="none">
            <CardHeader className="p-4 md:p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg font-medium">
                  <MapPin className="h-5 w-5 text-accent" />
                  Adresse de livraison
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-accent hover:text-accent-600"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nouvelle adresse
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockAddresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    isSelected={selectedAddress?.id === address.id}
                    onSelect={() => setShippingAddress(address)}
                  />
                ))}
              </div>
              {errors.shippingAddress && (
                <p className="mt-3 text-sm text-red-600" role="alert">
                  {errors.shippingAddress}
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card variant="outlined" size="none">
            <CardHeader className="p-4 md:p-6 border-b border-neutral-200">
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <Store className="h-5 w-5 text-accent" />
                Point de retrait
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-4">
                {mockPickupPoints.map((point) => (
                  <PickupPointCard
                    key={point.id}
                    point={point}
                    isSelected={selectedPickupPoint?.id === point.id}
                    onSelect={() => setPickupPoint(point)}
                  />
                ))}
              </div>
              {errors.pickupPoint && (
                <p className="mt-3 text-sm text-red-600" role="alert">
                  {errors.pickupPoint}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Shipping method (only for delivery) */}
        {deliveryMode === 'shipping' && (
          <Card variant="outlined" size="none">
            <CardHeader className="p-4 md:p-6 border-b border-neutral-200">
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <Clock className="h-5 w-5 text-accent" />
                Delai de livraison
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <ShippingMethodSelector
                selectedMethod={selectedShippingMethod}
                onSelect={setShippingMethod}
              />
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <Link
            href="/panier"
            className={cn(
              'inline-flex items-center gap-2 text-sm text-neutral-600',
              'hover:text-accent transition-colors'
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au panier
          </Link>

          <Button
            onClick={handleContinue}
            isLoading={isSubmitting}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"
          >
            Continuer vers le paiement
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Right column: Summary */}
      <aside className="lg:col-span-5 xl:col-span-4">
        <div className="lg:sticky lg:top-24">
          <CheckoutSummary collapsedByDefault />
        </div>
      </aside>
    </div>
  );
}

// ============================================================================
// Page Component
// ============================================================================

export default function LivraisonPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cart, isLoading: cartLoading } = useCart();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/checkout/livraison');
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
                  href="/panier"
                  className={cn(
                    'inline-flex items-center gap-2 text-sm text-neutral-500',
                    'hover:text-accent transition-colors mb-2'
                  )}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </Link>
                <h1 className="font-semibold text-2xl font-semibold text-neutral-900">
                  Livraison
                </h1>
              </div>
            </div>
          </Container>
        </section>

        {/* Stepper */}
        <section className="py-6 bg-white border-b border-neutral-200">
          <Container>
            <CheckoutStepper currentStep="livraison" />
          </Container>
        </section>

        {/* Main content */}
        <section className="py-8 md:py-12">
          <Container>
            <ShippingFormContent />
          </Container>
        </section>
      </main>
    </CheckoutProvider>
  );
}
