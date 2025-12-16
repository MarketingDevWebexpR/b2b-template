'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Package,
  Truck,
  ShieldCheck,
  ArrowRight,
  Gift,
  Clock,
  Mail,
  MapPin,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { B2BHeaderEcomSpacer } from '@/components/layout/B2BHeaderEcom';
import { cn, formatPrice } from '@/lib/utils';

/**
 * Order data structure from sessionStorage
 */
interface OrderData {
  orderId: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  items: Array<{
    productId: string;
    productName: string;
    productImage: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
  }>;
  totalPrice: number;
  shippingCost: number;
  shipping: {
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
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const scaleVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const checkmarkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.8, ease: 'easeOut', delay: 0.3 },
      opacity: { duration: 0.2 },
    },
  },
};

/**
 * ConfirmationContent Component
 */
function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load order from sessionStorage
  useEffect(() => {
    const loadOrder = () => {
      try {
        const storedOrder = sessionStorage.getItem('pendingOrder');
        if (storedOrder) {
          const parsedOrder = JSON.parse(storedOrder);
          // Verify the order ID matches
          if (parsedOrder.orderId === orderId || !orderId) {
            setOrder(parsedOrder);
            // Clear the stored order after loading
            sessionStorage.removeItem('pendingOrder');
          }
        }
      } catch (err) {
        console.error('Error loading order:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay for better UX
    setTimeout(loadOrder, 500);
  }, [orderId]);

  // Calculate estimated delivery date
  const getEstimatedDelivery = () => {
    const today = new Date();
    const minDays = 3;
    const maxDays = 5;
    const minDate = new Date(today.setDate(today.getDate() + minDays));
    const maxDate = new Date(new Date().setDate(new Date().getDate() + maxDays));

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    };

    return `${formatDate(minDate)} - ${formatDate(maxDate)}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="relative w-20 h-20 mx-auto mb-6">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
            <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-primary" />
          </div>
          <p className="font-sans text-lg text-content-primary">
            Validation de votre commande...
          </p>
          <p className="text-sm text-content-muted mt-2">
            Merci de patienter quelques instants
          </p>
        </motion.div>
      </div>
    );
  }

  // No order found
  if (!order) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[400px] text-center"
      >
        <Package className="h-16 w-16 text-content-muted mb-6" />
        <h1 className="font-sans text-2xl md:text-3xl text-content-primary mb-4">
          Aucune commande trouvée
        </h1>
        <p className="text-content-muted mb-8 max-w-md">
          Vous pouvez consulter vos commandes dans votre espace personnel.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/compte/commandes"
            className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-neutral-900 !text-white font-sans text-sm uppercase  font-medium transition-all duration-300 hover:bg-primary"
          >
            Mes commandes
          </Link>
          <Link
            href="/categories"
            className="inline-flex items-center justify-center px-8 py-4 rounded-sm border border-neutral-300 text-neutral-700 font-sans text-sm uppercase tracking-wider font-medium transition-all duration-200 hover:bg-neutral-900 hover:text-white hover:border-neutral-900"
          >
            Continuer mes achats
          </Link>
        </div>
      </motion.div>
    );
  }

  const totalWithShipping = order.totalPrice + order.shippingCost;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      {/* Success Header */}
      <motion.div variants={itemVariants} className="text-center mb-12">
        {/* Animated checkmark */}
        <motion.div
          variants={scaleVariants}
          className="relative inline-flex items-center justify-center w-24 h-24 mb-8"
        >
          {/* Outer ring animation */}
          <motion.div
            className="absolute inset-0 rounded-full bg-green-100"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
          {/* Sparkle effects */}
          <motion.div
            className="absolute -top-2 -right-2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.3 }}
          >
            <Sparkles className="w-6 h-6 text-primary" />
          </motion.div>
          {/* Checkmark */}
          <svg className="relative w-12 h-12" viewBox="0 0 24 24" fill="none">
            <motion.path
              d="M5 13l4 4L19 7"
              stroke="#16a34a"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={checkmarkVariants}
            />
          </svg>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="font-sans text-3xl md:text-4xl lg:text-5xl text-content-primary mb-4"
        >
          Merci pour votre commande !
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-content-muted max-w-lg mx-auto text-lg"
        >
          Votre commande a été confirmée. Un email de confirmation vous sera envoyé sous peu.
        </motion.p>
      </motion.div>

      {/* Order Number Card */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-primary-50 to-white border border-primary/20 p-8 mb-8 text-center"
      >
        <span className="text-xs uppercase  text-primary-600 mb-2 block">
          Numéro de commande
        </span>
        <p className="font-sans text-3xl md:text-4xl text-primary-600 tracking-wide">
          {order.orderNumber}
        </p>
        <p className="text-sm text-content-muted mt-3">
          Conservez ce numéro pour suivre votre commande
        </p>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Order Items */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-stroke-light p-6"
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stroke-light">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="font-sans text-xl text-content-primary">
              Vos articles
            </h2>
          </div>

          <div className="space-y-4">
            {order.items.map((item, index) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex gap-4"
              >
                <div className="relative w-20 h-20 bg-surface-secondary rounded overflow-hidden flex-shrink-0">
                  {item.productImage ? (
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gift className="w-8 h-8 text-content-muted" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-content-primary truncate">
                    {item.productName}
                  </h3>
                  <p className="text-sm text-content-muted">
                    Quantité: {item.quantity}
                  </p>
                  <p className="font-medium text-primary-600 mt-1">
                    {formatPrice(item.totalPrice)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-4 border-t border-stroke-light space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-content-muted">Sous-total</span>
              <span className="text-content-primary">{formatPrice(order.totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-content-muted">Livraison</span>
              <span className={order.shippingCost === 0 ? 'text-green-600' : 'text-content-primary'}>
                {order.shippingCost === 0 ? 'Offerte' : formatPrice(order.shippingCost)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-stroke-light">
              <span className="font-sans text-lg text-content-primary">Total</span>
              <span className="font-sans text-xl text-primary-600">
                {formatPrice(totalWithShipping)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Shipping & Delivery Info */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <motion.div
            variants={itemVariants}
            className="bg-white border border-stroke-light p-6"
          >
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-stroke-light">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="font-sans text-xl text-content-primary">
                Adresse de livraison
              </h2>
            </div>
            <div className="text-content-secondary space-y-1">
              <p className="font-medium text-content-primary">
                {order.shipping.firstName} {order.shipping.lastName}
              </p>
              <p>{order.shipping.address}</p>
              {order.shipping.addressLine2 && <p>{order.shipping.addressLine2}</p>}
              <p>
                {order.shipping.postalCode} {order.shipping.city}
              </p>
              <p>{order.shipping.country}</p>
              {order.shipping.phone && (
                <p className="text-content-muted mt-2">{order.shipping.phone}</p>
              )}
            </div>
          </motion.div>

          {/* Delivery Estimate */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-green-50 to-white border border-green-200 p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-content-primary mb-1">
                  Livraison estimée
                </h3>
                <p className="text-green-700 font-medium">
                  {getEstimatedDelivery()}
                </p>
                <p className="text-sm text-content-muted mt-2">
                  Vous recevrez un email avec le numéro de suivi dès l'expédition de votre colis.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Payment Method */}
          <motion.div
            variants={itemVariants}
            className="bg-white border border-stroke-light p-6"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-primary" />
              <div>
                <span className="text-sm text-content-muted">Paiement par</span>
                <p className="font-medium text-content-primary">Carte bancaire</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* What's Next Section */}
      <motion.div
        variants={itemVariants}
        className="bg-background-beige p-8 mb-12"
      >
        <h2 className="font-sans text-2xl text-content-primary mb-6 text-center">
          Et maintenant ?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-medium text-content-primary mb-1">
                1. Confirmation email
              </h3>
              <p className="text-sm text-content-muted">
                Vous recevrez un email de confirmation avec tous les détails de votre commande.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-medium text-content-primary mb-1">
                2. Préparation
              </h3>
              <p className="text-sm text-content-muted">
                Nos artisans préparent votre commande avec le plus grand soin.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-medium text-content-primary mb-1">
                3. Expédition
              </h3>
              <p className="text-sm text-content-muted">
                Votre colis sera expédié et vous recevrez le numéro de suivi.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
      >
        <Link
          href="/compte/commandes"
          className="inline-flex items-center justify-center px-8 py-4 rounded-lg border border-neutral-900 text-content-primary font-sans text-sm uppercase  font-medium transition-all duration-300 hover:bg-neutral-900 hover:text-white"
        >
          <Clock className="w-4 h-4 mr-2" />
          Suivre ma commande
        </Link>
        <Link
          href="/categories"
          className="inline-flex items-center justify-center px-8 py-4 rounded-sm bg-neutral-900 text-white font-sans text-sm uppercase tracking-wider font-medium transition-all duration-200 hover:bg-accent"
        >
          Continuer mes achats
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </motion.div>

      {/* Trust Badges */}
      <motion.div
        variants={itemVariants}
        className="border-t border-stroke-light pt-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4 p-4 text-center md:text-left">
            <Gift className="h-10 w-10 text-primary flex-shrink-0 mx-auto md:mx-0" />
            <div>
              <h3 className="font-medium text-content-primary mb-1">
                Emballage luxe
              </h3>
              <p className="text-sm text-content-muted">
                Chaque pièce est emballée dans un écrin élégant avec certificat d'authenticité.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 text-center md:text-left">
            <Truck className="h-10 w-10 text-primary flex-shrink-0 mx-auto md:mx-0" />
            <div>
              <h3 className="font-medium text-content-primary mb-1">
                Livraison sécurisée
              </h3>
              <p className="text-sm text-content-muted">
                Transporteur sécurisé avec signature obligatoire à la livraison.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 text-center md:text-left">
            <ShieldCheck className="h-10 w-10 text-primary flex-shrink-0 mx-auto md:mx-0" />
            <div>
              <h3 className="font-medium text-content-primary mb-1">
                Garantie 30 jours
              </h3>
              <p className="text-sm text-content-muted">
                Retours gratuits sous 30 jours. Votre satisfaction est notre priorité.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * ConfirmationPage Component
 */
export default function ConfirmationPage() {
  return (
    <main className="min-h-screen bg-white">
      <B2BHeaderEcomSpacer />

      {/* Page header with gradient */}
      <section
        className={cn(
          'py-8 md:py-12 border-b border-stroke-light',
          'bg-gradient-to-b from-green-50/50 to-transparent'
        )}
      >
        <Container>
          <div className="text-center">
            <span className="block text-xs uppercase  text-primary mb-2">
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
                  <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-content-muted">Chargement...</p>
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
