import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { B2BHeaderEcomSpacer } from '@/components/layout/B2BHeaderEcom';
import { getOrderByIdForUser, orderStatusLabels, orderStatusColors } from '@/data/orders';
import { formatPrice, cn } from '@/lib/utils';
import {
  Package,
  ChevronRight,
  Clock,
  Truck,
  CheckCircle,
  MapPin,
  CreditCard,
  FileText,
  Download,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Detail Commande | Maison Joaillerie',
  description: 'Consultez les details de votre commande.',
};

export const dynamic = 'force-dynamic';

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Format date to French locale
 */
function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString));
}

/**
 * Format date with time
 */
function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

/**
 * Get status icon component
 */
function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'delivered':
      return <CheckCircle className="h-5 w-5" strokeWidth={1.5} />;
    case 'shipped':
      return <Truck className="h-5 w-5" strokeWidth={1.5} />;
    default:
      return <Clock className="h-5 w-5" strokeWidth={1.5} />;
  }
}

/**
 * Order timeline step
 */
interface TimelineStep {
  status: string;
  label: string;
  date?: string;
  completed: boolean;
  current: boolean;
}

/**
 * Build order timeline
 */
function buildTimeline(order: {
  status: string;
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}): TimelineStep[] {
  const statusOrder = ['confirmed', 'processing', 'shipped', 'delivered'];
  const currentIndex = statusOrder.indexOf(order.status);

  return [
    {
      status: 'confirmed',
      label: 'Commande confirmee',
      date: order.createdAt,
      completed: currentIndex >= 0,
      current: order.status === 'confirmed',
    },
    {
      status: 'processing',
      label: 'En preparation',
      date: currentIndex >= 1 ? order.updatedAt : undefined,
      completed: currentIndex >= 1,
      current: order.status === 'processing',
    },
    {
      status: 'shipped',
      label: 'Expediee',
      date: order.shippedAt,
      completed: currentIndex >= 2,
      current: order.status === 'shipped',
    },
    {
      status: 'delivered',
      label: 'Livree',
      date: order.deliveredAt,
      completed: currentIndex >= 3,
      current: order.status === 'delivered',
    },
  ];
}

/**
 * OrderDetailPage - Full order details
 *
 * Features:
 * - Full order information
 * - Items ordered with images
 * - Shipping address
 * - Order status timeline
 * - Payment information
 */
export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await auth();
  const resolvedParams = await params;

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect('/login');
  }

  // Get order for this user
  const order = getOrderByIdForUser(resolvedParams.id, session.user.id!);

  // 404 if order not found
  if (!order) {
    notFound();
  }

  const statusColor = orderStatusColors[order.status];
  const statusLabel = orderStatusLabels[order.status];
  const timeline = buildTimeline(order);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-warm">
        <B2BHeaderEcomSpacer />
        <div className="absolute inset-0 bg-vignette" />
        <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-light to-transparent" />

        <Container className="py-12 lg:py-16">
          <div className="text-center">
            <span className="mb-4 inline-block font-sans text-overline uppercase  text-primary">
              Commande
            </span>

            <h1 className="font-sans text-heading-1 text-content-primary md:text-display-2">
              {order.orderNumber}
            </h1>

            <div className="mx-auto my-6 h-px w-24 bg-primary" />

            <div className="flex items-center justify-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-2 border px-4 py-2 font-sans text-body-sm uppercase ',
                  statusColor.text,
                  statusColor.bg
                )}
              >
                <StatusIcon status={order.status} />
                {statusLabel}
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-16">
        <Container>
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: 'Mon Compte', href: '/compte' },
              { label: 'Mes Commandes', href: '/compte/commandes' },
              { label: order.orderNumber },
            ]}
            className="mb-8"
          />

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Order Timeline */}
              {order.status !== 'cancelled' && order.status !== 'refunded' && (
                <div className="border border-stroke-light bg-white p-6">
                  <h2 className="mb-6 font-sans text-heading-3 text-content-primary">
                    Suivi de Commande
                  </h2>
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-4 top-0 h-full w-px bg-border-light" />

                    {/* Timeline Steps */}
                    <div className="space-y-6">
                      {timeline.map((step, index) => (
                        <div key={step.status} className="relative flex items-start gap-4">
                          {/* Dot */}
                          <div
                            className={cn(
                              'relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center border',
                              step.completed
                                ? 'border-primary bg-primary text-white'
                                : 'border-stroke-light bg-white text-content-muted'
                            )}
                          >
                            {step.completed ? (
                              <CheckCircle className="h-4 w-4" strokeWidth={2} />
                            ) : (
                              <span className="text-caption">{index + 1}</span>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 pb-4">
                            <h3
                              className={cn(
                                'font-sans text-body font-medium',
                                step.completed ? 'text-content-primary' : 'text-content-muted'
                              )}
                            >
                              {step.label}
                            </h3>
                            {step.date && (
                              <p className="mt-1 font-sans text-caption text-content-muted">
                                {formatDateTime(step.date)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tracking Number */}
                  {order.trackingNumber && (
                    <div className="mt-6 border-t border-stroke-light pt-6">
                      <div className="flex items-center gap-2 text-content-muted">
                        <Truck className="h-4 w-4" strokeWidth={1.5} />
                        <span className="font-sans text-caption uppercase ">
                          Numero de suivi
                        </span>
                      </div>
                      <p className="mt-2 font-mono text-body text-content-primary">
                        {order.trackingNumber}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Order Items */}
              <div className="border border-stroke-light bg-white p-6">
                <h2 className="mb-6 font-sans text-heading-3 text-content-primary">
                  Articles Commandes
                </h2>
                <div className="divide-y divide-border-light">
                  {order.items.map((item, index) => (
                    <div
                      key={`${order.id}-item-${index}`}
                      className="flex gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      {/* Product Image */}
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden border border-stroke-light bg-surface-secondary">
                        {item.productImage ? (
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-8 w-8 text-content-muted" strokeWidth={1} />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="font-sans text-body-lg text-content-primary">
                            {item.productName}
                          </h3>
                          {item.productReference && (
                            <p className="mt-1 font-sans text-caption text-content-muted">
                              Ref: {item.productReference}
                            </p>
                          )}
                        </div>
                        <p className="font-sans text-caption text-content-muted">
                          Quantite: {item.quantity}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="font-sans text-body-lg text-content-primary">
                          {formatPrice(item.totalPrice)}
                        </span>
                        {item.quantity > 1 && (
                          <p className="mt-1 font-sans text-caption text-content-muted">
                            {formatPrice(item.unitPrice)} / piece
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="border border-stroke-light bg-white p-6">
                <h2 className="mb-4 font-sans text-heading-3 text-content-primary">
                  Resume
                </h2>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="font-sans text-body text-content-muted">Sous-total</dt>
                    <dd className="font-sans text-body text-content-primary">
                      {formatPrice(order.totals.subtotal)}
                    </dd>
                  </div>
                  {order.totals.discount > 0 && (
                    <div className="flex justify-between">
                      <dt className="font-sans text-body text-content-muted">Reduction</dt>
                      <dd className="font-sans text-body text-green-600">
                        -{formatPrice(order.totals.discount)}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="font-sans text-body text-content-muted">Livraison</dt>
                    <dd className="font-sans text-body text-content-primary">
                      {order.totals.shipping === 0 ? 'Offerte' : formatPrice(order.totals.shipping)}
                    </dd>
                  </div>
                  <div className="border-t border-stroke-light pt-3">
                    <div className="flex justify-between">
                      <dt className="font-sans text-body-lg text-content-primary">Total</dt>
                      <dd className="font-sans text-heading-3 text-primary">
                        {formatPrice(order.totals.total)}
                      </dd>
                    </div>
                  </div>
                </dl>

                {/* Date */}
                <div className="mt-6 border-t border-stroke-light pt-4">
                  <p className="font-sans text-caption text-content-muted">
                    Commande passee le {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border border-stroke-light bg-white p-6">
                <div className="mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  <h2 className="font-sans text-heading-3 text-content-primary">
                    Adresse de Livraison
                  </h2>
                </div>
                <address className="not-italic font-sans text-body leading-relaxed text-content-secondary">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  <br />
                  {order.shippingAddress.address}
                  {order.shippingAddress.addressLine2 && (
                    <>
                      <br />
                      {order.shippingAddress.addressLine2}
                    </>
                  )}
                  <br />
                  {order.shippingAddress.postalCode} {order.shippingAddress.city}
                  <br />
                  {order.shippingAddress.country}
                  <br />
                  <span className="text-content-muted">{order.shippingAddress.phone}</span>
                </address>
              </div>

              {/* Payment Info */}
              <div className="border border-stroke-light bg-white p-6">
                <div className="mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  <h2 className="font-sans text-heading-3 text-content-primary">
                    Paiement
                  </h2>
                </div>
                <div className="space-y-2 font-sans text-body text-content-secondary">
                  <p className="capitalize">
                    {order.paymentInfo.method === 'card' ? 'Carte bancaire' : order.paymentInfo.method}
                    {order.paymentInfo.cardBrand && (
                      <span className="ml-1 uppercase">({order.paymentInfo.cardBrand})</span>
                    )}
                  </p>
                  {order.paymentInfo.lastFourDigits && (
                    <p className="text-content-muted">
                      **** **** **** {order.paymentInfo.lastFourDigits}
                    </p>
                  )}
                  <p className="text-caption text-content-muted">
                    {order.paymentInfo.status === 'completed' ? 'Paye' : 'En attente'}
                    {order.paymentInfo.paidAt && (
                      <> le {formatDate(order.paymentInfo.paidAt)}</>
                    )}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-stroke-light bg-white px-6 py-3 font-sans text-body-sm uppercase  text-content-secondary transition-all duration-300 hover:border-primary/30 hover:text-primary"
                >
                  <FileText className="h-4 w-4" strokeWidth={1.5} />
                  Voir la facture
                </button>
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-stroke-light bg-white px-6 py-3 font-sans text-body-sm uppercase  text-content-secondary transition-all duration-300 hover:border-primary/30 hover:text-primary"
                >
                  <Download className="h-4 w-4" strokeWidth={1.5} />
                  Telecharger le recu
                </button>
              </div>
            </div>
          </div>

          {/* Back to Orders Link */}
          <div className="mt-8">
            <Link
              href="/compte/commandes"
              className="inline-flex items-center gap-2 font-sans text-body-sm text-content-muted transition-colors hover:text-primary"
            >
              <ChevronRight className="h-4 w-4 rotate-180" strokeWidth={1.5} />
              Retour a mes commandes
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
