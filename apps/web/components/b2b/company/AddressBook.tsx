'use client';

import { useState, useMemo, useCallback } from 'react';
import type { CompanyAddress, CompanyAddressType } from '@maison/types';
import { cn } from '@/lib/utils';
import { AddressCard } from './AddressCard';
import { FilterTabs } from '@/components/b2b/FilterTabs';
import { EmptyState } from '@/components/b2b/EmptyState';

/**
 * Filter type for address filtering
 */
export type AddressFilterType = 'all' | CompanyAddressType;

/**
 * Props for AddressBook component
 */
export interface AddressBookProps {
  /** List of addresses to display */
  addresses: CompanyAddress[];
  /** Whether the component is in loading state */
  isLoading?: boolean;
  /** Whether actions are disabled */
  disabled?: boolean;
  /** Currently selected address ID (for selection mode) */
  selectedAddressId?: string;
  /** Callback when edit is clicked */
  onEdit?: (address: CompanyAddress) => void;
  /** Callback when delete is clicked */
  onDelete?: (address: CompanyAddress) => void;
  /** Callback when set as default is clicked */
  onSetDefault?: (address: CompanyAddress) => void;
  /** Callback when an address is selected */
  onSelect?: (address: CompanyAddress) => void;
  /** Callback when add new is clicked */
  onAddNew?: () => void;
  /** Initial filter value */
  initialFilter?: AddressFilterType;
  /** Hide the filter tabs */
  hideFilters?: boolean;
  /** Show add button in empty state */
  showAddButton?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Loading skeleton for address cards
 */
function AddressCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-stroke-light p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-surface-secondary rounded" />
          <div className="h-5 w-20 bg-surface-secondary rounded" />
        </div>
        <div className="h-6 w-6 bg-surface-secondary rounded" />
      </div>
      <div className="h-5 w-3/4 bg-surface-secondary rounded mb-2" />
      <div className="h-4 w-1/2 bg-surface-secondary rounded mb-4" />
      <div className="space-y-1.5">
        <div className="h-4 w-full bg-surface-secondary rounded" />
        <div className="h-4 w-2/3 bg-surface-secondary rounded" />
        <div className="h-4 w-1/2 bg-surface-secondary rounded" />
      </div>
    </div>
  );
}

/**
 * AddressBook Component
 *
 * Displays a grid of address cards with filtering capabilities.
 * Supports edit, delete, set default, and selection actions.
 *
 * @example
 * ```tsx
 * <AddressBook
 *   addresses={companyAddresses}
 *   onEdit={(addr) => openEditModal(addr)}
 *   onDelete={(addr) => confirmDelete(addr)}
 *   onSetDefault={(addr) => setAsDefault(addr)}
 *   onAddNew={() => openAddModal()}
 * />
 * ```
 */
export function AddressBook({
  addresses,
  isLoading = false,
  disabled = false,
  selectedAddressId,
  onEdit,
  onDelete,
  onSetDefault,
  onSelect,
  onAddNew,
  initialFilter = 'all',
  hideFilters = false,
  showAddButton = true,
  className,
}: AddressBookProps) {
  const [activeFilter, setActiveFilter] = useState<AddressFilterType>(initialFilter);

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    const counts: Record<AddressFilterType, number> = {
      all: addresses.length,
      billing: 0,
      shipping: 0,
      headquarters: 0,
      warehouse: 0,
    };

    addresses.forEach((addr) => {
      if (addr.type in counts) {
        counts[addr.type as CompanyAddressType]++;
      }
    });

    return counts;
  }, [addresses]);

  // Filter options with counts
  const filterOptions = useMemo(
    () => [
      { value: 'all' as const, label: 'Toutes', count: filterCounts.all },
      { value: 'shipping' as const, label: 'Livraison', count: filterCounts.shipping },
      { value: 'billing' as const, label: 'Facturation', count: filterCounts.billing },
      { value: 'headquarters' as const, label: 'Siege', count: filterCounts.headquarters },
      { value: 'warehouse' as const, label: 'Entrepot', count: filterCounts.warehouse },
    ].filter((opt) => opt.value === 'all' || opt.count > 0),
    [filterCounts]
  );

  // Filtered addresses
  const filteredAddresses = useMemo(() => {
    if (activeFilter === 'all') {
      return addresses;
    }
    return addresses.filter((addr) => addr.type === activeFilter);
  }, [addresses, activeFilter]);

  // Sort addresses: default first, then by label
  const sortedAddresses = useMemo(() => {
    return [...filteredAddresses].sort((a, b) => {
      // Default addresses first
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      // Then by label alphabetically
      return a.label.localeCompare(b.label, 'fr');
    });
  }, [filteredAddresses]);

  const handleFilterChange = useCallback((value: AddressFilterType) => {
    setActiveFilter(value);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        {!hideFilters && (
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 w-24 bg-surface-secondary rounded-lg animate-pulse"
              />
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <AddressCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (addresses.length === 0) {
    return (
      <EmptyState
        icon="folder"
        message="Aucune adresse enregistree"
        description="Ajoutez des adresses pour faciliter vos commandes et livraisons"
        action={
          showAddButton && onAddNew
            ? {
                label: 'Ajouter une adresse',
                onClick: onAddNew,
              }
            : undefined
        }
        className={className}
      />
    );
  }

  // Empty filtered results
  if (filteredAddresses.length === 0) {
    const filterLabel =
      filterOptions.find((opt) => opt.value === activeFilter)?.label || activeFilter;
    return (
      <div className={cn('space-y-6', className)}>
        {!hideFilters && filterOptions.length > 1 && (
          <FilterTabs
            options={filterOptions}
            value={activeFilter}
            onChange={handleFilterChange}
            showCounts
          />
        )}
        <EmptyState
          icon="search"
          message={`Aucune adresse de type "${filterLabel}"`}
          description="Essayez un autre filtre ou ajoutez une nouvelle adresse"
          action={
            showAddButton && onAddNew
              ? {
                  label: 'Ajouter une adresse',
                  onClick: onAddNew,
                }
              : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Filter tabs */}
      {!hideFilters && filterOptions.length > 1 && (
        <FilterTabs
          options={filterOptions}
          value={activeFilter}
          onChange={handleFilterChange}
          showCounts
        />
      )}

      {/* Address grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        role="list"
        aria-label="Liste des adresses"
      >
        {sortedAddresses.map((address) => (
          <div key={address.id} role="listitem">
            <AddressCard
              address={address}
              isSelected={selectedAddressId === address.id}
              disabled={disabled}
              onEdit={onEdit}
              onDelete={onDelete}
              onSetDefault={onSetDefault}
              onClick={onSelect}
            />
          </div>
        ))}
      </div>

      {/* Results summary */}
      <p className="font-sans text-caption text-content-muted text-center">
        {filteredAddresses.length} adresse{filteredAddresses.length !== 1 ? 's' : ''}{' '}
        {activeFilter !== 'all' && `de type "${filterOptions.find((opt) => opt.value === activeFilter)?.label}"`}
      </p>
    </div>
  );
}

export default AddressBook;
