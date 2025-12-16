import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Container } from '@/components/ui/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { B2BHeaderEcomSpacer } from '@/components/layout/B2BHeaderEcom';
import { getOrdersByUserId, orderStatusLabels, orderStatusColors } from '@/data/orders';
import { formatPrice, cn } from '@/lib/utils';
import { Package, ChevronRight, Clock, Truck, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Mes Commandes | Maison Joaillerie',
  description: 'Consultez l\'historique de vos commandes et suivez vos livraisons.',
};

export const dynamic = 'force-dynamic';

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
 * Get status icon component
 */
function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'delivered':
      return <CheckCircle className="h-4 w-4" strokeWidth={1.5} />;
    case 'shipped':
      return <Truck className="h-4 w-4" strokeWidth={1.5} />;
    default:
      return <Clock className="h-4 w-4" strokeWidth={1.5} />;
  }
}

/**
 * OrdersPage - List of user's orders
 *
 * Features:
 * - List of all orders with status
 * - Order card showing: order number, date, status, total
 * - Link to order detail
 * - Empty state when no orders
 */
export default async function OrdersPage() {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect('/login');
  }

  const orders = getOrdersByUserId(session.user.id!);

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
              Historique
            </span>

            <h1 className="font-sans text-heading-1 text-content-primary md:text-display-2">
              Mes Commandes
            </h1>

            <div className="mx-auto my-6 h-px w-24 bg-primary" />

            <p className="mx-auto max-w-2xl font-sans text-body-lg leading-elegant text-content-muted">
              Retrouvez l'ensemble de vos commandes et suivez leur livraison
            </p>
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
              { label: 'Mes Commandes' },
            ]}
            className="mb-8"
          />

          {/* Orders List */}
          {orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => {
                const statusColor = orderStatusColors[order.status];
                const statusLabel = orderStatusLabels[order.status];

                return (
                  <Link
                    key={order.id}
                    href={`/compte/commandes/${order.id}`}
                    className="group block border border-stroke-light bg-white transition-all duration-300 duration-200 hover:border-primary/30 hover:shadow-elegant"
                  >
                    {/* Order Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stroke-light px-6 py-4">
                      <div className="flex items-center gap-4">
                        <span className="font-sans text-body-lg text-content-primary">
                          {order.orderNumber}
                        </span>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 border px-3 py-1 font-sans text-caption uppercase ',
                            statusColor.text,
                            statusColor.bg
                          )}
                        >
                          <StatusIcon status={order.status} />
                          {statusLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-content-muted">
                        <span className="font-sans text-caption">
                          {formatDate(order.createdAt)}
                        </span>
                        <ChevronRight
                          className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary"
                          strokeWidth={1.5}
                        />
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="p-6">
                      <div className="flex flex-wrap items-center gap-4">
                        {/* Product Images */}
                        <div className="flex -space-x-3">
                          {order.items.slice(0, 3).map((item, index) => (
                            <div
                              key={`${order.id}-item-${index}`}
                              className="relative h-16 w-16 overflow-hidden border border-stroke-light bg-surface-secondary"
                              style={{ zIndex: 3 - index }}
                            >
                              {item.productImage ? (
                                <Image
                                  src={item.productImage}
                                  alt={item.productName}
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Package className="h-6 w-6 text-content-muted" strokeWidth={1} />
                                </div>
                              )}
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div
                              className="flex h-16 w-16 items-center justify-center border border-stroke-light bg-surface-secondary"
                              style={{ zIndex: 0 }}
                            >
                              <span className="font-sans text-caption text-content-muted">
                                +{order.items.length - 3}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Items Summary */}
                        <div className="flex-1">
                          <p className="font-sans text-body text-content-primary">
                            {order.items.length === 1
                              ? order.items[0].productName
                              : `${order.items.length} articles`}
                          </p>
                          {order.items.length > 1 && (
                            <p className="mt-1 font-sans text-caption text-content-muted">
                              {order.items.map((item) => item.productName).join(', ')}
                            </p>
                          )}
                        </div>

                        {/* Total */}
                        <div className="text-right">
                          <span className="font-sans text-heading-3 text-content-primary">
                            {formatPrice(order.totals.total)}
                          </span>
                        </div>
                      </div>

                      {/* Tracking Info */}
                      {order.trackingNumber && (
                        <div className="mt-4 border-t border-stroke-light pt-4">
                          <span className="font-sans text-caption text-content-muted">
                            Numero de suivi :{' '}
                            <span className="font-medium text-content-primary">
                              {order.trackingNumber}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="border border-stroke-light bg-white px-6 py-16 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center border border-stroke-light">
                <Package className="h-10 w-10 text-content-muted" strokeWidth={1} />
              </div>
              <h2 className="mb-2 font-sans text-heading-3 text-content-primary">
                Aucune commande
              </h2>
              <p className="mx-auto mb-8 max-w-md font-sans text-body text-content-muted">
                Vous n'avez pas encore passe de commande. Decouvrez notre catalogue
                et trouvez la piece qui vous correspond.
              </p>
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 rounded-sm border border-accent bg-accent px-8 py-3 font-sans text-body-sm font-medium uppercase tracking-wider text-white transition-all duration-200 hover:bg-accent/90"
              >
                Decouvrir nos Categories
              </Link>
            </div>
          )}

          {/* Back to Account Link */}
          <div className="mt-8">
            <Link
              href="/compte"
              className="inline-flex items-center gap-2 font-sans text-body-sm text-content-muted transition-colors hover:text-primary"
            >
              <ChevronRight className="h-4 w-4 rotate-180" strokeWidth={1.5} />
              Retour a mon compte
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
