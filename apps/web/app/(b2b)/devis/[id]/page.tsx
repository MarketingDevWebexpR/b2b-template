'use client';

import { use, useState, useTransition, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate, formatRelativeDate, getQuoteStatusLabel, getQuoteStatusColor } from '@/lib/formatters';
import { useB2B, useB2BPermissions } from '@/contexts/B2BContext';
import type { QuoteStatus, QuoteHistoryEventType } from '@maison/types';
import {
  StatusBadge,
  PageLoader,
  SectionLoader,
  PageHeader,
  ActionButton,
  ErrorState,
  Card,
} from '@/components/b2b';

/**
 * Quote detail data structure (maps to B2B context mock data)
 */
interface QuoteDetailData {
  id: string;
  quoteNumber: string;
  status: QuoteStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  validUntil: string;
  submittedAt?: string;
  respondedAt?: string;
  companyId: string;
  companyName: string;
  employeeId: string;
  employeeName: string;
  contactEmail: string;
  notesForSeller?: string;
  sellerNotes?: string;
  items: QuoteItemDetail[];
  totals: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
    currency: string;
  };
  history: QuoteHistoryEntry[];
}

interface QuoteItemDetail {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitOfMeasure: string;
  listPrice: number;
  requestedPrice?: number;
  quotedPrice?: number;
  discountPercent?: number;
  lineTotal: number;
  notes?: string;
}

interface QuoteHistoryEntry {
  id: string;
  eventType: QuoteHistoryEventType;
  description: string;
  actorName: string;
  actorType: 'buyer' | 'seller' | 'system';
  createdAt: string;
}

/**
 * Mock detailed quote data - in production this comes from the API
 */
function getMockQuoteDetail(id: string): QuoteDetailData | null {
  const mockQuotes: Record<string, QuoteDetailData> = {
    quote_001: {
      id: 'quote_001',
      quoteNumber: 'Q-2024-001',
      status: 'submitted',
      priority: 'normal',
      createdAt: '2024-12-15T14:30:00Z',
      updatedAt: '2024-12-15T16:00:00Z',
      validUntil: '2025-01-15T23:59:59Z',
      submittedAt: '2024-12-15T14:30:00Z',
      companyId: 'comp_001',
      companyName: 'Bijouterie Parisienne',
      employeeId: 'emp_001',
      employeeName: 'Marie Dupont',
      contactEmail: 'marie.dupont@bijouterie-parisienne.fr',
      notesForSeller: 'Demande de tarifs preferentiels pour commande importante. Livraison souhaitee avant fin janvier.',
      items: [
        {
          id: 'item-1',
          productId: 'prod_001',
          productSku: 'BRA-001',
          productName: 'Bracelet Or 18K - Maille Figaro',
          quantity: 10,
          unitOfMeasure: 'piece',
          listPrice: 450,
          requestedPrice: 382.50,
          discountPercent: 15,
          lineTotal: 3825,
        },
        {
          id: 'item-2',
          productId: 'prod_002',
          productSku: 'COL-001',
          productName: 'Collier Or 18K - Pendentif Coeur',
          quantity: 5,
          unitOfMeasure: 'piece',
          listPrice: 680,
          requestedPrice: 612,
          discountPercent: 10,
          lineTotal: 3060,
        },
        {
          id: 'item-3',
          productId: 'prod_003',
          productSku: 'BAG-001',
          productName: 'Bague Or Blanc - Solitaire Diamant',
          quantity: 3,
          unitOfMeasure: 'piece',
          listPrice: 1200,
          requestedPrice: 1140,
          discountPercent: 5,
          lineTotal: 3420,
        },
      ],
      totals: {
        subtotal: 10305,
        discount: 1195,
        shipping: 0,
        tax: 0,
        total: 10305,
        currency: 'EUR',
      },
      history: [
        {
          id: 'hist-1',
          eventType: 'submitted',
          description: 'Devis soumis pour examen',
          actorName: 'Marie Dupont',
          actorType: 'buyer',
          createdAt: '2024-12-15T14:30:00Z',
        },
        {
          id: 'hist-2',
          eventType: 'created',
          description: 'Devis cree',
          actorName: 'Marie Dupont',
          actorType: 'buyer',
          createdAt: '2024-12-15T14:00:00Z',
        },
      ],
    },
    quote_002: {
      id: 'quote_002',
      quoteNumber: 'Q-2024-002',
      status: 'responded',
      priority: 'normal',
      createdAt: '2024-12-14T10:00:00Z',
      updatedAt: '2024-12-14T16:45:00Z',
      validUntil: '2025-01-14T23:59:59Z',
      submittedAt: '2024-12-14T10:00:00Z',
      respondedAt: '2024-12-14T16:45:00Z',
      companyId: 'comp_001',
      companyName: 'Bijouterie Parisienne',
      employeeId: 'emp_001',
      employeeName: 'Marie Dupont',
      contactEmail: 'marie.dupont@bijouterie-parisienne.fr',
      notesForSeller: 'Commande urgente pour client VIP',
      sellerNotes: 'Offre speciale validee par la direction. Remise exceptionnelle de 12% sur l\'ensemble.',
      items: [
        {
          id: 'item-1',
          productId: 'prod_001',
          productSku: 'BRA-002',
          productName: 'Bracelet Argent 925 - Maille Venitienne',
          quantity: 8,
          unitOfMeasure: 'piece',
          listPrice: 120,
          requestedPrice: 108,
          quotedPrice: 105.60,
          discountPercent: 12,
          lineTotal: 844.80,
        },
      ],
      totals: {
        subtotal: 844.80,
        discount: 115.20,
        shipping: 15,
        tax: 171.96,
        total: 1031.76,
        currency: 'EUR',
      },
      history: [
        {
          id: 'hist-1',
          eventType: 'responded',
          description: 'Reponse recue du fournisseur avec offre speciale',
          actorName: 'Equipe Commerciale',
          actorType: 'seller',
          createdAt: '2024-12-14T16:45:00Z',
        },
        {
          id: 'hist-2',
          eventType: 'submitted',
          description: 'Devis soumis pour examen',
          actorName: 'Marie Dupont',
          actorType: 'buyer',
          createdAt: '2024-12-14T10:00:00Z',
        },
      ],
    },
  };

  return mockQuotes[id] || null;
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

const ImagePlaceholder = () => (
  <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

/**
 * History event type colors
 */
const historyEventColors: Record<string, string> = {
  created: 'bg-gray-400',
  submitted: 'bg-amber-500',
  viewed: 'bg-blue-400',
  responded: 'bg-blue-500',
  price_updated: 'bg-purple-500',
  accepted: 'bg-green-500',
  rejected: 'bg-red-500',
  expired: 'bg-gray-500',
  converted: 'bg-green-600',
  cancelled: 'bg-gray-500',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Quote Detail Page
 *
 * Displays detailed information about a B2B quote including:
 * - Quote header with status and dates
 * - Customer/company information
 * - Line items table with pricing
 * - Totals breakdown
 * - Actions based on quote status
 * - Timeline/history
 */
export default function DevisDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const { api, isLoading: contextLoading, employee } = useB2B();
  const { canCreateQuote } = useB2BPermissions();

  // In production, this would come from the API via useEffect or server action
  // For now, we use mock data
  const quote = getMockQuoteDetail(id);
  const isLoading = contextLoading;

  // Quote actions
  const handleAcceptQuote = useCallback(async () => {
    if (!quote) return;
    setActionError(null);

    startTransition(async () => {
      try {
        // In production: await api?.b2b.quotes.accept(quote.id);
        console.log('Accepting quote:', quote.id);
        // Redirect to conversion/order creation
        router.push(`/commandes/nouveau?from_quote=${quote.id}`);
      } catch (error) {
        setActionError('Erreur lors de l\'acceptation du devis');
        console.error('Failed to accept quote:', error);
      }
    });
  }, [quote, router]);

  const handleRejectQuote = useCallback(async () => {
    if (!quote) return;
    setActionError(null);

    startTransition(async () => {
      try {
        // In production: await api?.b2b.quotes.reject(quote.id, 'Raison du refus');
        console.log('Rejecting quote:', quote.id);
        router.refresh();
      } catch (error) {
        setActionError('Erreur lors du refus du devis');
        console.error('Failed to reject quote:', error);
      }
    });
  }, [quote, router]);

  const handleDownloadPDF = useCallback(() => {
    // In production: trigger PDF download
    console.log('Downloading PDF for quote:', quote?.id);
  }, [quote]);

  const handleCancelQuote = useCallback(async () => {
    if (!quote) return;
    setActionError(null);

    startTransition(async () => {
      try {
        // In production: await api?.b2b.quotes.cancel(quote.id);
        console.log('Cancelling quote:', quote.id);
        router.push('/devis');
      } catch (error) {
        setActionError('Erreur lors de l\'annulation du devis');
        console.error('Failed to cancel quote:', error);
      }
    });
  }, [quote, router]);

  // Loading state
  if (isLoading) {
    return <PageLoader message="Chargement du devis..." />;
  }

  // Not found state
  if (!quote) {
    return (
      <ErrorState
        title="Devis introuvable"
        message={`Le devis avec l'identifiant "${id}" n'existe pas ou vous n'avez pas les droits pour y acceder.`}
        action={{
          label: 'Retour aux devis',
          href: '/devis',
        }}
      />
    );
  }

  // Calculate totals for display
  const subtotal = quote.items.reduce((sum, item) => sum + (item.listPrice * item.quantity), 0);
  const totalDiscount = quote.items.reduce(
    (sum, item) => sum + ((item.listPrice * item.quantity) - item.lineTotal),
    0
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/devis"
              className="text-text-muted hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2 rounded-soft"
              aria-label="Retour a la liste des devis"
            >
              <BackIcon />
            </Link>
            <h1 className="font-serif text-heading-3 text-text-primary">
              Devis {quote.quoteNumber}
            </h1>
            <StatusBadge status={quote.status} />
          </div>
          <p className="font-sans text-body text-text-muted">
            Cree le {formatDate(quote.createdAt)}
            {quote.validUntil && ` - Valide jusqu'au ${formatDate(quote.validUntil)}`}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleDownloadPDF}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2',
              'bg-white border border-border-light text-text-secondary rounded-soft',
              'font-sans text-body-sm font-medium',
              'hover:bg-background-muted transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2'
            )}
          >
            <DownloadIcon />
            Telecharger PDF
          </button>
          {(quote.status === 'draft' || quote.status === 'submitted') && (
            <button
              type="button"
              onClick={handleCancelQuote}
              disabled={isPending}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2',
                'bg-red-50 border border-red-200 text-red-600 rounded-soft',
                'font-sans text-body-sm font-medium',
                'hover:bg-red-100 transition-colors duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2'
              )}
            >
              Annuler le devis
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-soft p-4" role="alert">
          <p className="font-sans text-body-sm text-red-800">{actionError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <section
            className="bg-white rounded-soft border border-border-light"
            aria-labelledby="items-heading"
          >
            <div className="p-4 border-b border-border-light">
              <h2 id="items-heading" className="font-serif text-heading-5 text-text-primary">
                Articles demandes ({quote.items.length})
              </h2>
            </div>
            <div className="divide-y divide-border-light">
              {quote.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-background-muted rounded-soft flex items-center justify-center flex-shrink-0">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover rounded-soft"
                      />
                    ) : (
                      <ImagePlaceholder />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-body-sm font-medium text-text-primary">
                      {item.productName}
                    </p>
                    <p className="font-mono text-caption text-text-muted">
                      {item.productSku}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-4">
                      <span className="font-sans text-caption text-text-muted">
                        Quantite: {item.quantity}
                      </span>
                      <span className="font-sans text-caption text-text-muted">
                        Prix unitaire: {formatCurrency(item.listPrice, quote.totals.currency)}
                      </span>
                      {item.discountPercent && item.discountPercent > 0 && (
                        <span className="font-sans text-caption text-hermes-600">
                          Remise demandee: -{item.discountPercent}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-sans text-body-sm font-medium text-text-primary">
                      {formatCurrency(item.listPrice * item.quantity, quote.totals.currency)}
                    </p>
                    {item.discountPercent && item.discountPercent > 0 && (
                      <p className="font-sans text-caption text-hermes-600">
                        -{formatCurrency((item.listPrice * item.quantity) - item.lineTotal, quote.totals.currency)}
                      </p>
                    )}
                    {item.quotedPrice && item.quotedPrice !== item.requestedPrice && (
                      <p className="font-sans text-caption text-green-600 font-medium">
                        Prix propose: {formatCurrency(item.quotedPrice, quote.totals.currency)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Notes */}
          {(quote.notesForSeller || quote.sellerNotes) && (
            <section
              className="bg-white rounded-soft border border-border-light p-6"
              aria-labelledby="notes-heading"
            >
              <h2 id="notes-heading" className="font-serif text-heading-5 text-text-primary mb-4">
                Notes
              </h2>
              {quote.notesForSeller && (
                <div className="mb-4">
                  <p className="font-sans text-caption text-text-muted mb-1">Vos notes:</p>
                  <p className="font-sans text-body-sm text-text-secondary">
                    {quote.notesForSeller}
                  </p>
                </div>
              )}
              {quote.sellerNotes && (
                <div className="mt-4 pt-4 border-t border-border-light">
                  <p className="font-sans text-caption text-text-muted mb-1">Reponse du fournisseur:</p>
                  <p className="font-sans text-body-sm text-text-secondary">
                    {quote.sellerNotes}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Timeline */}
          <section
            className="bg-white rounded-soft border border-border-light p-6"
            aria-labelledby="history-heading"
          >
            <h2 id="history-heading" className="font-serif text-heading-5 text-text-primary mb-4">
              Historique
            </h2>
            <div className="space-y-4" role="list" aria-label="Historique du devis">
              {quote.history.map((event, index) => (
                <div key={event.id} className="flex gap-4" role="listitem">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full',
                        historyEventColors[event.eventType] || 'bg-gray-400'
                      )}
                      aria-hidden="true"
                    />
                    {index < quote.history.length - 1 && (
                      <div className="w-0.5 flex-1 bg-border-light mt-2" aria-hidden="true" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-sans text-body-sm font-medium text-text-primary">
                        {event.description}
                      </p>
                      <span className="font-sans text-caption text-text-muted">
                        par {event.actorName}
                      </span>
                    </div>
                    <p className="font-sans text-caption text-text-muted mt-0.5">
                      {formatDate(event.createdAt)} - {formatRelativeDate(event.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <section
            className="bg-white rounded-soft border border-border-light"
            aria-labelledby="summary-heading"
          >
            <div className="p-6 border-b border-border-light">
              <h2 id="summary-heading" className="font-serif text-heading-5 text-text-primary">
                Recapitulatif
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between">
                <span className="font-sans text-body-sm text-text-secondary">Sous-total</span>
                <span className="font-sans text-body-sm text-text-primary">
                  {formatCurrency(subtotal, quote.totals.currency)}
                </span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-hermes-600">
                  <span className="font-sans text-body-sm">Remises demandees</span>
                  <span className="font-sans text-body-sm">
                    -{formatCurrency(totalDiscount, quote.totals.currency)}
                  </span>
                </div>
              )}
              {quote.totals.shipping > 0 && (
                <div className="flex justify-between">
                  <span className="font-sans text-body-sm text-text-secondary">Livraison</span>
                  <span className="font-sans text-body-sm text-text-primary">
                    {formatCurrency(quote.totals.shipping, quote.totals.currency)}
                  </span>
                </div>
              )}
              {quote.totals.tax > 0 && (
                <div className="flex justify-between">
                  <span className="font-sans text-body-sm text-text-secondary">TVA</span>
                  <span className="font-sans text-body-sm text-text-primary">
                    {formatCurrency(quote.totals.tax, quote.totals.currency)}
                  </span>
                </div>
              )}
              <div className="pt-3 border-t border-border-light flex justify-between">
                <span className="font-sans text-body font-medium text-text-primary">
                  Total {quote.status === 'responded' ? 'propose' : 'demande'}
                </span>
                <span className="font-serif text-heading-4 text-text-primary">
                  {formatCurrency(quote.totals.total, quote.totals.currency)}
                </span>
              </div>
            </div>
          </section>

          {/* Requester Info */}
          <section
            className="bg-white rounded-soft border border-border-light p-6"
            aria-labelledby="requester-heading"
          >
            <h2 id="requester-heading" className="font-serif text-heading-5 text-text-primary mb-4">
              Demande par
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-hermes-100 flex items-center justify-center flex-shrink-0">
                <span className="font-sans text-body font-medium text-hermes-600">
                  {quote.employeeName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-sans text-body-sm font-medium text-text-primary truncate">
                  {quote.employeeName}
                </p>
                <p className="font-sans text-caption text-text-muted truncate">
                  {quote.contactEmail}
                </p>
                <p className="font-sans text-caption text-text-muted truncate">
                  {quote.companyName}
                </p>
              </div>
            </div>
          </section>

          {/* Actions for responded quotes */}
          {quote.status === 'responded' && (
            <section
              className="bg-white rounded-soft border border-border-light p-6"
              aria-labelledby="response-heading"
            >
              <h2 id="response-heading" className="font-serif text-heading-5 text-text-primary mb-4">
                Reponse du fournisseur
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-soft border border-green-200">
                  <p className="font-sans text-body-sm text-green-800">
                    Offre valide jusqu'au {formatDate(quote.validUntil)}
                  </p>
                  <p className="font-serif text-heading-4 text-green-700 mt-2">
                    {formatCurrency(quote.totals.total, quote.totals.currency)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAcceptQuote}
                  disabled={isPending}
                  className={cn(
                    'w-full px-4 py-3 rounded-soft',
                    'font-sans text-body-sm font-medium',
                    'bg-green-500 text-white hover:bg-green-600',
                    'transition-colors duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2'
                  )}
                >
                  {isPending ? 'Traitement...' : 'Accepter et commander'}
                </button>
                <button
                  type="button"
                  onClick={handleRejectQuote}
                  disabled={isPending}
                  className={cn(
                    'w-full px-4 py-2 rounded-soft',
                    'font-sans text-body-sm font-medium',
                    'bg-white border border-border-light text-text-secondary',
                    'hover:bg-background-muted',
                    'transition-colors duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2'
                  )}
                >
                  Refuser
                </button>
                <Link
                  href={`/devis/${quote.id}/negocier`}
                  className={cn(
                    'block w-full px-4 py-2 rounded-soft text-center',
                    'font-sans text-body-sm font-medium',
                    'bg-white border border-border-light text-text-secondary',
                    'hover:bg-background-muted',
                    'transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2'
                  )}
                >
                  Negocier
                </Link>
              </div>
            </section>
          )}

          {/* Help */}
          <div className="bg-background-muted rounded-soft p-4">
            <h3 className="font-sans text-body-sm font-medium text-text-primary mb-2">
              Besoin d'aide ?
            </h3>
            <p className="font-sans text-caption text-text-muted mb-3">
              Notre equipe commerciale est disponible pour repondre a vos questions.
            </p>
            <Link
              href="/support"
              className={cn(
                'block w-full px-3 py-2 rounded-soft text-center',
                'font-sans text-caption font-medium',
                'bg-white border border-border-light text-text-secondary',
                'hover:bg-white hover:border-hermes-300',
                'transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hermes-500 focus-visible:ring-offset-2'
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
