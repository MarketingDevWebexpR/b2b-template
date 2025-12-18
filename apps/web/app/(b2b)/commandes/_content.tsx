'use client';


import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { useB2B } from '@/contexts/B2BContext';
import { useOrdersFeatures, useQuickOrderFeatures } from '@/contexts/FeatureContext';
import type { B2BOrderStatus, OrderSummary } from '@maison/types';
import { type SortState } from '@/components/ui/DataTable';
import {
  PageLoader,
  EmptyState,
  StatsGrid,
  FilterTabs,
  PageHeader,
  ActionButton,
} from '@/components/b2b';
import { OrderList } from '@/components/orders/OrderList';
import { OrderCardsGrid } from '@/components/orders/OrderCard';

/**
 * Filter options for order status
 */
const filterOptions: { value: B2BOrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending_approval', label: 'En attente' },
  { value: 'processing', label: 'En preparation' },
  { value: 'shipped', label: 'Expediees' },
  { value: 'delivered', label: 'Livrees' },
  { value: 'cancelled', label: 'Annulees' },
];

/**
 * Date range options
 */
const dateRangeOptions = [
  { value: '7', label: '7 derniers jours' },
  { value: '30', label: '30 derniers jours' },
  { value: '90', label: '3 derniers mois' },
  { value: '365', label: 'Cette annee' },
  { value: 'all', label: 'Toutes' },
];

/**
 * View mode options
 */
type ViewMode = 'table' | 'cards';

/**
 * Icon components
 */
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const TableIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const GridIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

/**
 * Items per page options
 */
const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50];

/**
 * Orders List Page
 *
 * Displays a comprehensive list of B2B orders with:
 * - Status filtering
 * - Date range filtering
 * - Search by order number
 * - Sortable columns
 * - Pagination
 * - Export to CSV/PDF
 * - Responsive table/card views
 */
export default function CommandesPage() {
  // State
  const [statusFilter, setStatusFilter] = useState<B2BOrderStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState<string>('30');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortState, setSortState] = useState<SortState | undefined>({
    column: 'createdAt',
    direction: 'desc',
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // B2B Context
  const { orders, ordersLoading, isLoading } = useB2B();

  // Feature flags
  const { isEnabled: hasOrders, hasReorder, hasExportPdf, hasTracking } = useOrdersFeatures();
  const { hasCsvImport } = useQuickOrderFeatures();

  // Filter orders based on all criteria
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((order) => order.status === statusFilter);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const daysAgo = parseInt(dateRange, 10);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      result = result.filter((order) => new Date(order.createdAt) >= cutoffDate);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((order) =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.orderedBy?.toLowerCase().includes(query) ||
        order.trackingNumber?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [orders, statusFilter, dateRange, searchQuery]);

  // Sort orders
  const sortedOrders = useMemo(() => {
    if (!sortState) return filteredOrders;

    const sorted = [...filteredOrders].sort((a, b) => {
      const { column, direction } = sortState;

      let aVal: string | number | Date;
      let bVal: string | number | Date;

      switch (column) {
        case 'createdAt':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case 'total':
          aVal = a.total;
          bVal = b.total;
          break;
        case 'itemCount':
          aVal = a.itemCount;
          bVal = b.itemCount;
          break;
        case 'orderNumber':
          aVal = a.orderNumber;
          bVal = b.orderNumber;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'orderedBy':
          aVal = a.orderedBy || '';
          bVal = b.orderedBy || '';
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return sorted;
  }, [filteredOrders, sortState]);

  // Pagination
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedOrders.slice(start, end);
  }, [sortedOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

  // Stats data
  const stats = useMemo(() => [
    { label: 'Total', value: orders.length },
    {
      label: 'En attente',
      value: orders.filter((o) => o.status === 'pending_approval').length,
      color: 'amber' as const,
    },
    {
      label: 'En cours',
      value: orders.filter((o) => o.status === 'processing' || o.status === 'shipped').length,
      color: 'blue' as const,
    },
    {
      label: 'Livrees',
      value: orders.filter((o) => o.status === 'delivered').length,
      color: 'green' as const,
    },
  ], [orders]);

  // Handlers
  const handleReorder = useCallback((order: OrderSummary) => {
    // TODO: Implement reorder functionality
    console.log('Reorder:', order.id);
  }, []);

  const handleExportInvoice = useCallback((order: OrderSummary) => {
    // TODO: Implement invoice export
    console.log('Export invoice:', order.id);
  }, []);

  const handleExportCSV = useCallback(() => {
    // Generate CSV content
    const headers = ['N° Commande', 'Date', 'Articles', 'Total', 'Statut', 'Commande par'];
    const rows = sortedOrders.map((order) => [
      order.orderNumber,
      formatDate(order.createdAt),
      order.itemCount.toString(),
      formatCurrency(order.total, order.currency),
      order.status,
      order.orderedBy || '',
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map((row) => row.join(';')),
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `commandes_${formatDate(new Date())}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [sortedOrders]);

  const handleExportPDF = useCallback(() => {
    // TODO: Implement PDF export
    console.log('Export PDF');
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setSelectedIds([]);
  }, []);

  // Reset pagination when filters change
  const handleFilterChange = useCallback((value: B2BOrderStatus | 'all') => {
    setStatusFilter(value);
    setCurrentPage(1);
    setSelectedIds([]);
  }, []);

  const handleDateRangeChange = useCallback((value: string) => {
    setDateRange(value);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }, []);

  // Module disabled - redirect or show message
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
    return <PageLoader message="Chargement des commandes..." />;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <PageHeader
        title="Commandes"
        description="Historique et suivi de vos commandes"
        actions={
          <>
            {/* Import CSV - Gated by quickOrder.csvImport */}
            {hasCsvImport && (
              <ActionButton
                variant="secondary"
                href="/commandes/bulk"
                icon={<UploadIcon />}
              >
                Import CSV
              </ActionButton>
            )}
            <ActionButton
              variant="primary"
              href="/catalogue"
              icon={<PlusIcon />}
            >
              Nouvelle commande
            </ActionButton>
          </>
        }
      />

      {/* Stats */}
      <StatsGrid stats={stats} columns={4} />

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Rechercher par numero de commande, tracking..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={cn(
                'w-full pl-10 pr-4 py-2.5',
                'bg-white border border-stroke-light rounded-lg',
                'font-sans text-body-sm text-content-primary',
                'placeholder:text-content-muted',
                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                'transition-all duration-200'
              )}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-content-muted hover:text-content-primary"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Export buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5',
                'bg-white border border-stroke-light rounded-lg',
                'font-sans text-body-sm text-content-primary',
                'hover:bg-surface-secondary transition-colors'
              )}
            >
              <DownloadIcon />
              <span className="hidden sm:inline">CSV</span>
            </button>
            {/* PDF Export - Gated by orders.exportPdf */}
            {hasExportPdf && (
              <button
                onClick={handleExportPDF}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5',
                  'bg-white border border-stroke-light rounded-lg',
                  'font-sans text-body-sm text-content-primary',
                  'hover:bg-surface-secondary transition-colors'
                )}
              >
                <DownloadIcon />
                <span className="hidden sm:inline">PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <FilterTabs
            options={filterOptions}
            value={statusFilter}
            onChange={handleFilterChange}
          />

          <div className="flex items-center gap-3">
            {/* Date Range */}
            <select
              value={dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className={cn(
                'px-4 py-2',
                'bg-white border border-stroke-light rounded-lg',
                'font-sans text-body-sm text-content-primary',
                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
              )}
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* View Toggle */}
            <div className="hidden md:flex items-center border border-stroke-light rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'table'
                    ? 'bg-primary text-white'
                    : 'bg-white text-content-muted hover:text-content-primary hover:bg-surface-secondary'
                )}
                aria-label="Vue tableau"
              >
                <TableIcon />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'cards'
                    ? 'bg-primary text-white'
                    : 'bg-white text-content-muted hover:text-content-primary hover:bg-surface-secondary'
                )}
                aria-label="Vue cartes"
              >
                <GridIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions (when items selected) */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-primary-50 border border-primary/20 rounded-lg">
          <span className="font-sans text-body-sm text-primary-700">
            {selectedIds.length} commande{selectedIds.length > 1 ? 's' : ''} selectionnee{selectedIds.length > 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setSelectedIds([])}
            className="font-sans text-body-sm text-primary-600 hover:text-primary-700 underline"
          >
            Deselectionner
          </button>
          <div className="flex-1" />
          <button
            className={cn(
              'px-4 py-1.5 rounded-lg',
              'font-sans text-caption font-medium',
              'bg-primary text-white hover:bg-primary-600',
              'transition-colors'
            )}
          >
            Exporter ({selectedIds.length})
          </button>
        </div>
      )}

      {/* Orders Display */}
      {ordersLoading ? (
        viewMode === 'table' ? (
          <OrderList
            orders={[]}
            isLoading={true}
          />
        ) : (
          <OrderCardsGrid
            orders={[]}
            isLoading={true}
          />
        )
      ) : paginatedOrders.length === 0 ? (
        <EmptyState
          icon="cart"
          message="Aucune commande trouvee"
          description={
            searchQuery || statusFilter !== 'all'
              ? 'Essayez de modifier vos filtres pour voir plus de resultats'
              : 'Vous n\'avez pas encore passe de commandes'
          }
          action={{
            label: 'Nouvelle commande',
            href: '/catalogue',
          }}
        />
      ) : (
        <>
          {/* Table View (Desktop) or Cards View (Mobile/Selected) */}
          <div className={cn(viewMode === 'table' ? 'block' : 'hidden md:block', viewMode === 'cards' && 'md:hidden')}>
            <OrderList
              orders={paginatedOrders}
              isLoading={ordersLoading}
              selectable
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              sortState={sortState}
              onSortChange={setSortState}
              onReorder={hasReorder ? handleReorder : undefined}
              onExportInvoice={hasExportPdf ? handleExportInvoice : undefined}
            />
          </div>

          {/* Cards View */}
          <div className={cn(viewMode === 'cards' ? 'block' : 'md:hidden', viewMode === 'table' && 'hidden')}>
            <OrderCardsGrid
              orders={paginatedOrders}
              isLoading={ordersLoading}
              onReorder={hasReorder ? handleReorder : undefined}
              onViewInvoice={hasExportPdf ? handleExportInvoice : undefined}
            />
          </div>
        </>
      )}

      {/* Pagination */}
      {sortedOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-4">
            <p className="font-sans text-caption text-content-muted">
              Affichage de {((currentPage - 1) * itemsPerPage) + 1} a{' '}
              {Math.min(currentPage * itemsPerPage, sortedOrders.length)} sur{' '}
              {sortedOrders.length} commandes
            </p>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className={cn(
                'px-2 py-1',
                'bg-white border border-stroke-light rounded-lg',
                'font-sans text-caption text-content-primary',
                'focus:outline-none focus:ring-2 focus:ring-primary/20'
              )}
            >
              {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} par page
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className={cn(
                'p-2 rounded-lg',
                'font-sans text-caption',
                'bg-white border border-stroke-light',
                currentPage === 1
                  ? 'text-content-muted cursor-not-allowed opacity-50'
                  : 'text-content-primary hover:bg-surface-secondary'
              )}
              aria-label="Premiere page"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={cn(
                'px-3 py-1.5 rounded-lg',
                'font-sans text-caption font-medium',
                'bg-white border border-stroke-light',
                currentPage === 1
                  ? 'text-content-muted cursor-not-allowed opacity-50'
                  : 'text-content-primary hover:bg-surface-secondary'
              )}
            >
              Precedent
            </button>

            {/* Page Numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={cn(
                      'w-8 h-8 rounded-lg',
                      'font-sans text-caption font-medium',
                      pageNum === currentPage
                        ? 'bg-primary text-white'
                        : 'bg-white border border-stroke-light text-content-primary hover:bg-surface-secondary'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={cn(
                'px-3 py-1.5 rounded-lg',
                'font-sans text-caption font-medium',
                'bg-white border border-stroke-light',
                currentPage === totalPages
                  ? 'text-content-muted cursor-not-allowed opacity-50'
                  : 'text-content-primary hover:bg-surface-secondary'
              )}
            >
              Suivant
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={cn(
                'p-2 rounded-lg',
                'font-sans text-caption',
                'bg-white border border-stroke-light',
                currentPage === totalPages
                  ? 'text-content-muted cursor-not-allowed opacity-50'
                  : 'text-content-primary hover:bg-surface-secondary'
              )}
              aria-label="Derniere page"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
