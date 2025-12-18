'use client';


import { use, useState, useTransition, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate, formatRelativeDate, getOrderStatusLabel, getOrderStatusColor } from '@/lib/formatters';
import { useB2B } from '@/contexts/B2BContext';
import { useOrdersFeatures } from '@/contexts/FeatureContext';
import type { B2BOrderStatus as OrderStatus, OrderHistoryEventType, PaymentStatus } from '@maison/types';
import {
  StatusBadge,
  PageLoader,
  ErrorState,
  EmptyState,
} from '@/components/b2b';
import {
  OrderStatusBadge,
  OrderStatusTimeline,
  TrackingLink,
} from '@/components/orders';

/**
 * Order detail data structure
 */
interface OrderDetailData {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  statusLabel?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  companyId: string;
  companyName: string;
  employeeId: string;
  employeeName: string;
  contactEmail: string;
  contactPhone?: string;
  reference?: string;
  sourceQuoteId?: string;
  sourceQuoteNumber?: string;
  notesForSeller?: string;
  sellerNotes?: string;
  cancelReason?: string;
  items: OrderItemDetail[];
  totals: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
    currency: string;
  };
  shipping: {
    address: {
      recipientName: string;
      companyName?: string;
      street1: string;
      street2?: string;
      city: string;
      state?: string;
      postalCode: string;
      countryCode: string;
      country: string;
      phone?: string;
      deliveryInstructions?: string;
    };
    billingAddress?: {
      recipientName: string;
      companyName?: string;
      street1: string;
      street2?: string;
      city: string;
      state?: string;
      postalCode: string;
      countryCode: string;
      country: string;
      vatNumber?: string;
    };
    methodName: string;
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDelivery?: string;
    actualDelivery?: string;
    cost: number;
    isFreeShipping: boolean;
  };
  payment: {
    method: string;
    methodName: string;
    status: PaymentStatus;
    statusLabel?: string;
    reference?: string;
    purchaseOrderNumber?: string;
    paymentTerms: string;
    paymentTermsDays?: number;
    amountPaid: number;
    amountDue: number;
    dueDate?: string;
    paidAt?: string;
  };
  history: OrderHistoryEntry[];
}

interface OrderItemDetail {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitOfMeasure: string;
  listPrice: number;
  unitPrice: number;
  discountPercent?: number;
  lineTotal: number;
  lineTax: number;
  fulfillmentStatus?: 'pending' | 'partial' | 'fulfilled' | 'backordered';
  quantityFulfilled?: number;
  notes?: string;
}

interface OrderHistoryEntry {
  id: string;
  eventType: OrderHistoryEventType;
  description: string;
  actorName: string;
  actorType: 'buyer' | 'seller' | 'system';
  createdAt: string;
}

/**
 * Mock detailed order data - in production this comes from the API
 */
function getMockOrderDetail(id: string): OrderDetailData | null {
  const mockOrders: Record<string, OrderDetailData> = {
    ord_001: {
      id: 'ord_001',
      orderNumber: 'CMD-2024-001',
      status: 'delivered',
      statusLabel: 'Livree',
      priority: 'normal',
      createdAt: '2024-12-15T10:30:00Z',
      updatedAt: '2024-12-18T14:00:00Z',
      shippedAt: '2024-12-16T11:30:00Z',
      deliveredAt: '2024-12-18T14:00:00Z',
      companyId: 'comp_001',
      companyName: 'Bijouterie Parisienne',
      employeeId: 'emp_001',
      employeeName: 'Marie Dupont',
      contactEmail: 'marie.dupont@bijouterie-parisienne.fr',
      contactPhone: '+33 1 42 61 00 00',
      reference: 'PO-2024-0089',
      notesForSeller: 'Livraison en boutique uniquement. Appeler avant livraison.',
      items: [
        {
          id: 'item-1',
          productId: 'prod_001',
          productSku: 'BRA-001',
          productName: 'Bracelet Or 18K - Maille Figaro',
          quantity: 5,
          unitOfMeasure: 'piece',
          listPrice: 450,
          unitPrice: 405,
          discountPercent: 10,
          lineTotal: 2025,
          lineTax: 405,
          fulfillmentStatus: 'fulfilled',
          quantityFulfilled: 5,
        },
        {
          id: 'item-2',
          productId: 'prod_002',
          productSku: 'COL-002',
          productName: 'Collier Argent - Perles Eau Douce',
          quantity: 3,
          unitOfMeasure: 'piece',
          listPrice: 220,
          unitPrice: 220,
          lineTotal: 660,
          lineTax: 132,
          fulfillmentStatus: 'fulfilled',
          quantityFulfilled: 3,
        },
      ],
      totals: {
        subtotal: 2685,
        discount: 225,
        shipping: 15,
        tax: 537,
        total: 3237,
        currency: 'EUR',
      },
      shipping: {
        address: {
          recipientName: 'Bijouterie Parisienne',
          companyName: 'Bijouterie Parisienne SARL',
          street1: '15 rue de la Paix',
          city: 'Paris',
          postalCode: '75002',
          countryCode: 'FR',
          country: 'France',
          phone: '+33 1 42 61 00 00',
          deliveryInstructions: 'Livraison en boutique uniquement',
        },
        billingAddress: {
          recipientName: 'Bijouterie Parisienne SARL',
          companyName: 'Bijouterie Parisienne SARL',
          street1: '15 rue de la Paix',
          city: 'Paris',
          postalCode: '75002',
          countryCode: 'FR',
          country: 'France',
          vatNumber: 'FR 12 345 678 901',
        },
        methodName: 'Express 24h',
        carrier: 'Chronopost',
        trackingNumber: 'FR123456789',
        trackingUrl: 'https://www.chronopost.fr/tracking/FR123456789',
        estimatedDelivery: '2024-12-17T23:59:59Z',
        actualDelivery: '2024-12-18T14:00:00Z',
        cost: 15,
        isFreeShipping: false,
      },
      payment: {
        method: 'net_terms',
        methodName: 'Facture 30 jours',
        status: 'pending',
        statusLabel: 'En attente',
        purchaseOrderNumber: 'PO-2024-0089',
        paymentTerms: 'net_30',
        paymentTermsDays: 30,
        amountPaid: 0,
        amountDue: 3237,
        dueDate: '2025-01-15T23:59:59Z',
      },
      history: [
        {
          id: 'hist-1',
          eventType: 'delivered',
          description: 'Commande livree',
          actorName: 'Chronopost',
          actorType: 'system',
          createdAt: '2024-12-18T14:00:00Z',
        },
        {
          id: 'hist-2',
          eventType: 'shipped',
          description: 'Colis expedie via Chronopost Express',
          actorName: 'Equipe Logistique',
          actorType: 'seller',
          createdAt: '2024-12-16T11:30:00Z',
        },
        {
          id: 'hist-3',
          eventType: 'processing',
          description: 'Commande en preparation',
          actorName: 'Equipe Logistique',
          actorType: 'seller',
          createdAt: '2024-12-15T14:00:00Z',
        },
        {
          id: 'hist-4',
          eventType: 'approved',
          description: 'Commande validee',
          actorName: 'Marie Dupont',
          actorType: 'buyer',
          createdAt: '2024-12-15T10:45:00Z',
        },
        {
          id: 'hist-5',
          eventType: 'created',
          description: 'Commande creee',
          actorName: 'Marie Dupont',
          actorType: 'buyer',
          createdAt: '2024-12-15T10:30:00Z',
        },
      ],
    },
    ord_002: {
      id: 'ord_002',
      orderNumber: 'CMD-2024-002',
      status: 'shipped',
      statusLabel: 'Expediee',
      priority: 'high',
      createdAt: '2024-12-14T09:00:00Z',
      updatedAt: '2024-12-16T11:30:00Z',
      shippedAt: '2024-12-16T11:30:00Z',
      companyId: 'comp_001',
      companyName: 'Bijouterie Parisienne',
      employeeId: 'emp_002',
      employeeName: 'Pierre Martin',
      contactEmail: 'pierre.martin@bijouterie-parisienne.fr',
      reference: 'PO-2024-0090',
      items: [
        {
          id: 'item-1',
          productId: 'prod_003',
          productSku: 'BAG-001',
          productName: 'Bague Or Blanc - Solitaire Diamant',
          quantity: 2,
          unitOfMeasure: 'piece',
          listPrice: 1200,
          unitPrice: 1080,
          discountPercent: 10,
          lineTotal: 2160,
          lineTax: 432,
          fulfillmentStatus: 'fulfilled',
          quantityFulfilled: 2,
        },
      ],
      totals: {
        subtotal: 2160,
        discount: 240,
        shipping: 0,
        tax: 432,
        total: 2592,
        currency: 'EUR',
      },
      shipping: {
        address: {
          recipientName: 'Pierre Martin',
          companyName: 'Bijouterie Parisienne',
          street1: '45 Avenue des Champs-Elysees',
          city: 'Paris',
          postalCode: '75008',
          countryCode: 'FR',
          country: 'France',
          phone: '+33 1 42 61 00 01',
        },
        methodName: 'Express 24h',
        carrier: 'Chronopost',
        trackingNumber: 'FR987654321',
        trackingUrl: 'https://www.chronopost.fr/tracking/FR987654321',
        estimatedDelivery: '2024-12-18T23:59:59Z',
        cost: 0,
        isFreeShipping: true,
      },
      payment: {
        method: 'net_terms',
        methodName: 'Facture 30 jours',
        status: 'pending',
        statusLabel: 'En attente',
        purchaseOrderNumber: 'PO-2024-0090',
        paymentTerms: 'net_30',
        paymentTermsDays: 30,
        amountPaid: 0,
        amountDue: 2592,
        dueDate: '2025-01-14T23:59:59Z',
      },
      history: [
        {
          id: 'hist-1',
          eventType: 'shipped',
          description: 'Colis expedie via Chronopost Express',
          actorName: 'Equipe Logistique',
          actorType: 'seller',
          createdAt: '2024-12-16T11:30:00Z',
        },
        {
          id: 'hist-2',
          eventType: 'processing',
          description: 'Commande en preparation',
          actorName: 'Equipe Logistique',
          actorType: 'seller',
          createdAt: '2024-12-14T14:00:00Z',
        },
        {
          id: 'hist-3',
          eventType: 'created',
          description: 'Commande creee',
          actorName: 'Pierre Martin',
          actorType: 'buyer',
          createdAt: '2024-12-14T09:00:00Z',
        },
      ],
    },
  };

  return mockOrders[id] || null;
}

/**
 * Icon components
 */
const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const ReorderIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ImagePlaceholder = () => (
  <svg className="w-10 h-10 text-content-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const TrackingIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

/**
 * History event type colors
 */
const historyEventColors: Record<string, string> = {
  created: 'bg-gray-400',
  submitted: 'bg-amber-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  payment_received: 'bg-green-500',
  payment_failed: 'bg-red-500',
  processing: 'bg-blue-500',
  shipped: 'bg-purple-500',
  out_for_delivery: 'bg-purple-600',
  delivered: 'bg-green-600',
  cancelled: 'bg-gray-500',
  return_requested: 'bg-orange-500',
  returned: 'bg-red-400',
  refunded: 'bg-amber-500',
};

/**
 * Payment status colors
 */
const paymentStatusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  authorized: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  partial: 'bg-orange-100 text-orange-800',
  refunded: 'bg-red-100 text-red-800',
  partial_refund: 'bg-orange-100 text-orange-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-500',
};

/**
 * Payment status labels (French)
 */
const paymentStatusLabels: Record<string, string> = {
  pending: 'En attente',
  authorized: 'Autorise',
  paid: 'Paye',
  partial: 'Partiellement paye',
  refunded: 'Rembourse',
  partial_refund: 'Partiellement rembourse',
  failed: 'Echoue',
  cancelled: 'Annule',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Order Detail Page
 *
 * Displays detailed information about a B2B order including:
 * - Order header with status and dates
 * - Shipping tracking information
 * - Line items table with pricing
 * - Payment information
 * - Shipping and billing addresses
 * - Order timeline
 */
export default function CommandeDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const { api, isLoading: contextLoading } = useB2B();

  // Feature flags
  const { isEnabled: hasOrders, hasReorder, hasExportPdf, hasTracking } = useOrdersFeatures();

  // In production, this would come from the API via useEffect or server action
  const order = getMockOrderDetail(id);
  const isLoading = contextLoading;

  // Order actions
  const handleDownloadInvoice = useCallback(() => {
    console.log('Downloading invoice for order:', order?.id);
  }, [order]);

  const handleReorder = useCallback(() => {
    if (!order) return;
    startTransition(() => {
      // In production: create new cart with same items
      console.log('Reordering:', order.id);
      router.push(`/panier?reorder=${order.id}`);
    });
  }, [order, router]);

  const handleTrackPackage = useCallback(() => {
    if (!order?.shipping.trackingUrl) return;
    window.open(order.shipping.trackingUrl, '_blank', 'noopener,noreferrer');
  }, [order]);

  const handleCancelOrder = useCallback(async () => {
    if (!order) return;
    if (order.status !== 'pending_approval' && order.status !== 'processing') {
      setActionError('Cette commande ne peut plus etre annulee.');
      return;
    }

    setActionError(null);
    startTransition(async () => {
      try {
        // In production: await api?.b2b.orders.cancel(order.id, 'Raison');
        console.log('Cancelling order:', order.id);
        router.refresh();
      } catch (error) {
        setActionError('Erreur lors de l\'annulation de la commande');
        console.error('Failed to cancel order:', error);
      }
    });
  }, [order, router]);

  // Module disabled - show message
  if (!hasOrders) {
    return (
      <EmptyState
        icon="cart"
        message="Module commandes desactive"
        description="Le module de gestion des commandes n'est pas disponible pour votre compte."
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 font-sans text-body text-content-muted">Chargement de la commande...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!order) {
    return (
      <ErrorState
        title="Commande introuvable"
        message={`La commande avec l'identifiant "${id}" n'existe pas ou vous n'avez pas les droits pour y acceder.`}
        action={{
          label: 'Retour aux commandes',
          href: '/commandes',
        }}
      />
    );
  }

  const canCancel = order.status === 'pending_approval' || order.status === 'processing';
  // Reorder is gated by both feature flag AND order status
  const canReorder = hasReorder && (order.status === 'delivered' || order.status === 'cancelled');

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/commandes"
              className="text-content-muted hover:text-content-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
              aria-label="Retour a la liste des commandes"
            >
              <BackIcon />
            </Link>
            <h1 className="font-sans text-heading-3 text-content-primary">
              Commande {order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="font-sans text-body text-content-muted">
            Passee le {formatDate(order.createdAt)}
            {order.reference && ` - Ref: ${order.reference}`}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Invoice download - Gated by orders.exportPdf */}
          {hasExportPdf && (
            <button
              type="button"
              onClick={handleDownloadInvoice}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2',
                'bg-white border border-stroke-light text-content-secondary rounded-lg',
                'font-sans text-body-sm font-medium',
                'hover:bg-surface-secondary transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
              )}
            >
              <DownloadIcon />
              Telecharger facture
            </button>
          )}
          {canReorder && (
            <button
              type="button"
              onClick={handleReorder}
              disabled={isPending}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2',
                'bg-primary text-white rounded-lg',
                'font-sans text-body-sm font-medium',
                'hover:bg-primary-600 transition-colors duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
              )}
            >
              <ReorderIcon />
              Recommander
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
          <p className="font-sans text-body-sm text-red-800">{actionError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tracking - Gated by orders.tracking */}
          {hasTracking && order.shipping.trackingNumber && (order.status === 'shipped' || order.status === 'delivered') && (
            <section
              className="bg-purple-50 rounded-lg border border-purple-200 p-6"
              aria-labelledby="tracking-heading"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 id="tracking-heading" className="font-sans text-heading-5 text-purple-900">
                    Suivi de livraison
                  </h2>
                  <p className="mt-1 font-sans text-body-sm text-purple-700">
                    {order.shipping.carrier} - {order.shipping.methodName}
                  </p>
                  <div className="mt-2">
                    <TrackingLink
                      trackingNumber={order.shipping.trackingNumber}
                      trackingUrl={order.shipping.trackingUrl}
                      carrier={order.shipping.carrier}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-sans text-caption text-purple-600">
                    {order.status === 'delivered' ? 'Livre le' : 'Livraison estimee'}
                  </p>
                  <p className="font-sans text-body font-medium text-purple-900">
                    {order.status === 'delivered' && order.shipping.actualDelivery
                      ? formatDate(order.shipping.actualDelivery)
                      : order.shipping.estimatedDelivery
                        ? formatDate(order.shipping.estimatedDelivery)
                        : 'Non disponible'}
                  </p>
                </div>
              </div>
              {order.shipping.trackingUrl && order.status === 'shipped' && (
                <button
                  type="button"
                  onClick={handleTrackPackage}
                  className={cn(
                    'mt-4 w-full px-4 py-2 rounded-lg',
                    'font-sans text-body-sm font-medium',
                    'bg-purple-600 text-white hover:bg-purple-700',
                    'transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2',
                    'inline-flex items-center justify-center gap-2'
                  )}
                >
                  <TrackingIcon />
                  Suivre le colis
                </button>
              )}
            </section>
          )}

          {/* Items */}
          <section
            className="bg-white rounded-lg border border-stroke-light"
            aria-labelledby="items-heading"
          >
            <div className="p-4 border-b border-stroke-light">
              <h2 id="items-heading" className="font-sans text-heading-5 text-content-primary">
                Articles ({order.items.length})
              </h2>
            </div>
            <div className="divide-y divide-border-light">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center gap-4">
                  <div className="w-20 h-20 bg-surface-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <ImagePlaceholder />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/catalogue/${item.productSku}`}
                      className="font-sans text-body-sm font-medium text-content-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
                    >
                      {item.productName}
                    </Link>
                    <p className="font-mono text-caption text-content-muted">
                      {item.productSku}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-4">
                      <span className="font-sans text-caption text-content-muted">
                        Quantite: {item.quantity}
                      </span>
                      <span className="font-sans text-caption text-content-muted">
                        {formatCurrency(item.unitPrice, order.totals.currency)} /unite
                      </span>
                      {item.fulfillmentStatus && (
                        <span
                          className={cn(
                            'inline-flex px-2 py-0.5 rounded-full font-sans text-caption font-medium',
                            item.fulfillmentStatus === 'fulfilled'
                              ? 'bg-green-100 text-green-800'
                              : item.fulfillmentStatus === 'partial'
                                ? 'bg-amber-100 text-amber-800'
                                : item.fulfillmentStatus === 'backordered'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                          )}
                        >
                          {item.fulfillmentStatus === 'fulfilled'
                            ? 'Expedie'
                            : item.fulfillmentStatus === 'partial'
                              ? `${item.quantityFulfilled}/${item.quantity} expedies`
                              : item.fulfillmentStatus === 'backordered'
                                ? 'En rupture'
                                : 'En attente'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-sans text-body-sm font-medium text-content-primary">
                      {formatCurrency(item.lineTotal, order.totals.currency)}
                    </p>
                    {item.discountPercent && item.discountPercent > 0 && (
                      <p className="font-sans text-caption text-primary-600">
                        -{item.discountPercent}%
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="p-4 border-t border-stroke-light bg-surface-secondary space-y-2">
              <div className="flex justify-between">
                <span className="font-sans text-body-sm text-content-secondary">Sous-total HT</span>
                <span className="font-sans text-body-sm text-content-primary">
                  {formatCurrency(order.totals.subtotal, order.totals.currency)}
                </span>
              </div>
              {order.totals.discount > 0 && (
                <div className="flex justify-between text-primary-600">
                  <span className="font-sans text-body-sm">Remises</span>
                  <span className="font-sans text-body-sm">
                    -{formatCurrency(order.totals.discount, order.totals.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-sans text-body-sm text-content-secondary">Livraison</span>
                <span className="font-sans text-body-sm text-content-primary">
                  {order.shipping.isFreeShipping
                    ? 'Gratuite'
                    : formatCurrency(order.totals.shipping, order.totals.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-body-sm text-content-secondary">TVA (20%)</span>
                <span className="font-sans text-body-sm text-content-primary">
                  {formatCurrency(order.totals.tax, order.totals.currency)}
                </span>
              </div>
              <div className="pt-2 border-t border-stroke-light flex justify-between">
                <span className="font-sans text-body font-medium text-content-primary">Total TTC</span>
                <span className="font-sans text-heading-4 text-content-primary">
                  {formatCurrency(order.totals.total, order.totals.currency)}
                </span>
              </div>
            </div>
          </section>

          {/* Timeline */}
          <section
            className="bg-white rounded-lg border border-stroke-light p-6"
            aria-labelledby="history-heading"
          >
            <h2 id="history-heading" className="font-sans text-heading-5 text-content-primary mb-6">
              Historique de la commande
            </h2>
            <div className="space-y-0" role="list" aria-label="Historique de la commande">
              {order.history.map((event, index) => (
                <div key={event.id} className="flex gap-4" role="listitem">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full',
                        historyEventColors[event.eventType] || 'bg-gray-400'
                      )}
                      aria-hidden="true"
                    />
                    {index < order.history.length - 1 && (
                      <div className="w-0.5 flex-1 bg-border-light my-2" aria-hidden="true" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-sans text-body-sm font-medium text-content-primary">
                        {event.description}
                      </p>
                      <span className="font-sans text-caption text-content-muted">
                        {formatDate(event.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 font-sans text-body-sm text-content-secondary">
                      Par {event.actorName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <section
            className="bg-white rounded-lg border border-stroke-light"
            aria-labelledby="summary-heading"
          >
            <div className="p-6 border-b border-stroke-light">
              <h2 id="summary-heading" className="font-sans text-heading-5 text-content-primary">
                Resume
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="font-sans text-caption text-content-muted">Commandee par</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <span className="font-sans text-body-sm font-medium text-primary-600">
                      {order.employeeName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-sans text-body-sm font-medium text-content-primary truncate">
                      {order.employeeName}
                    </p>
                    <p className="font-sans text-caption text-content-muted truncate">
                      {order.companyName}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-sans text-caption text-content-muted">Paiement</p>
                <p className="mt-1 font-sans text-body-sm text-content-primary">
                  {order.payment.methodName}
                </p>
                <span
                  className={cn(
                    'mt-1 inline-flex px-2 py-0.5 rounded-full',
                    'font-sans text-caption font-medium',
                    paymentStatusColors[order.payment.status] || 'bg-gray-100 text-gray-800'
                  )}
                >
                  {paymentStatusLabels[order.payment.status] || order.payment.statusLabel || order.payment.status}
                </span>
                {order.payment.dueDate && order.payment.status === 'pending' && (
                  <p className="mt-2 font-sans text-caption text-content-muted">
                    Echeance: {formatDate(order.payment.dueDate)}
                  </p>
                )}
              </div>
              {order.sourceQuoteNumber && (
                <div>
                  <p className="font-sans text-caption text-content-muted">Devis d'origine</p>
                  <Link
                    href={`/devis/${order.sourceQuoteId}`}
                    className="mt-1 font-sans text-body-sm text-primary hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
                  >
                    {order.sourceQuoteNumber}
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Shipping Address */}
          <section
            className="bg-white rounded-lg border border-stroke-light p-6"
            aria-labelledby="shipping-address-heading"
          >
            <h2 id="shipping-address-heading" className="font-sans text-heading-5 text-content-primary mb-4">
              Adresse de livraison
            </h2>
            <address className="font-sans text-body-sm text-content-secondary space-y-1 not-italic">
              <p className="font-medium text-content-primary">{order.shipping.address.recipientName}</p>
              {order.shipping.address.companyName && (
                <p>{order.shipping.address.companyName}</p>
              )}
              <p>{order.shipping.address.street1}</p>
              {order.shipping.address.street2 && (
                <p>{order.shipping.address.street2}</p>
              )}
              <p>{order.shipping.address.postalCode} {order.shipping.address.city}</p>
              <p>{order.shipping.address.country}</p>
              {order.shipping.address.phone && (
                <p className="pt-2 text-content-muted">{order.shipping.address.phone}</p>
              )}
              {order.shipping.address.deliveryInstructions && (
                <p className="pt-2 text-content-muted italic">
                  {order.shipping.address.deliveryInstructions}
                </p>
              )}
            </address>
          </section>

          {/* Billing Address */}
          {order.shipping.billingAddress && (
            <section
              className="bg-white rounded-lg border border-stroke-light p-6"
              aria-labelledby="billing-address-heading"
            >
              <h2 id="billing-address-heading" className="font-sans text-heading-5 text-content-primary mb-4">
                Adresse de facturation
              </h2>
              <address className="font-sans text-body-sm text-content-secondary space-y-1 not-italic">
                <p className="font-medium text-content-primary">{order.shipping.billingAddress.recipientName}</p>
                {order.shipping.billingAddress.companyName && (
                  <p>{order.shipping.billingAddress.companyName}</p>
                )}
                <p>{order.shipping.billingAddress.street1}</p>
                {order.shipping.billingAddress.street2 && (
                  <p>{order.shipping.billingAddress.street2}</p>
                )}
                <p>{order.shipping.billingAddress.postalCode} {order.shipping.billingAddress.city}</p>
                <p>{order.shipping.billingAddress.country}</p>
                {order.shipping.billingAddress.vatNumber && (
                  <p className="pt-2 text-content-muted">TVA: {order.shipping.billingAddress.vatNumber}</p>
                )}
              </address>
            </section>
          )}

          {/* Cancel Order (for pending/processing orders) */}
          {canCancel && (
            <button
              type="button"
              onClick={handleCancelOrder}
              disabled={isPending}
              className={cn(
                'w-full px-4 py-2 rounded-lg',
                'font-sans text-body-sm font-medium',
                'bg-red-50 border border-red-200 text-red-600',
                'hover:bg-red-100 transition-colors duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2'
              )}
            >
              {isPending ? 'Annulation...' : 'Annuler la commande'}
            </button>
          )}

          {/* Help */}
          <div className="bg-surface-secondary rounded-lg p-4">
            <h3 className="font-sans text-body-sm font-medium text-content-primary mb-2">
              Un probleme ?
            </h3>
            <p className="font-sans text-caption text-content-muted mb-3">
              Notre equipe est disponible pour vous aider avec votre commande.
            </p>
            <Link
              href="/support"
              className={cn(
                'block w-full px-3 py-2 rounded-lg text-center',
                'font-sans text-caption font-medium',
                'bg-white border border-stroke-light text-content-secondary',
                'hover:bg-white hover:border-primary/20',
                'transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
              )}
            >
              Contacter le support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
