'use client';

/**
 * WarehouseSelector Component
 *
 * Dropdown selector for choosing the current warehouse/point of sale.
 * Displays warehouse name, status, and allows switching between locations.
 *
 * Features:
 * - Current warehouse display with open/closed status
 * - Dropdown with all available warehouses
 * - Distance and type indicators
 * - Keyboard accessible
 */

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import {
  MapPin,
  ChevronDown,
  Check,
  Warehouse,
  Store,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWarehouse } from '@/contexts';

// Local warehouse type definition (matches WarehouseContext)
type WarehouseType = 'warehouse' | 'store' | 'depot' | 'distribution_center';

export interface WarehouseSelectorProps {
  /** Additional CSS classes */
  className?: string;
  /** Compact mode for smaller displays */
  compact?: boolean;
}

const getWarehouseIcon = (type: WarehouseType) => {
  switch (type) {
    case 'warehouse':
      return Warehouse;
    case 'store':
      return Store;
    case 'depot':
      return Building2;
    default:
      return MapPin;
  }
};

const getWarehouseTypeLabel = (type: WarehouseType) => {
  switch (type) {
    case 'warehouse':
      return 'Entrepot';
    case 'store':
      return 'Boutique';
    case 'depot':
      return 'Depot';
    default:
      return 'Point de vente';
  }
};

export const WarehouseSelector = memo(function WarehouseSelector({
  className,
  compact = false,
}: WarehouseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    warehouses,
    selectedWarehouse,
    selectWarehouse,
    isWarehouseOpen,
    isLoading,
  } = useWarehouse();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          buttonRef.current?.focus();
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          break;
      }
    },
    [isOpen]
  );

  const handleWarehouseSelect = useCallback(
    (warehouseId: string) => {
      selectWarehouse(warehouseId);
      setIsOpen(false);
      buttonRef.current?.focus();
    },
    [selectWarehouse]
  );

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2',
          'animate-pulse',
          className
        )}
      >
        <div className="w-4 h-4 bg-neutral-100 rounded" />
        <div className="w-24 h-4 bg-neutral-100 rounded" />
      </div>
    );
  }

  if (!selectedWarehouse) {
    return null;
  }

  const isCurrentlyOpen = isWarehouseOpen(selectedWarehouse.id);
  const WarehouseIcon = getWarehouseIcon(selectedWarehouse.type);

  return (
    <div
      ref={dropdownRef}
      className={cn('relative', className)}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger button */}
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className={cn(
          'flex items-center gap-2',
          compact ? 'px-2 py-1.5' : 'px-3 py-2',
          'bg-neutral-50 border border-neutral-200 rounded-lg',
          'text-neutral-600 hover:text-neutral-900',
          'hover:border-neutral-300 hover:bg-white',
          'transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/20'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Point de vente: ${selectedWarehouse.name}`}
      >
        <MapPin
          className="w-4 h-4 text-accent flex-shrink-0"
          strokeWidth={1.5}
          aria-hidden="true"
        />

        {!compact && (
          <>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-neutral-900 truncate max-w-[150px]">
                {selectedWarehouse.code}
              </span>
            </div>

            {/* Open/Closed indicator */}
            <span
              className={cn(
                'hidden lg:inline-flex items-center px-1.5 py-0.5 rounded text-xs',
                isCurrentlyOpen
                  ? 'bg-green-100 text-green-700'
                  : 'bg-neutral-100 text-neutral-500'
              )}
            >
              {isCurrentlyOpen ? 'Ouvert' : 'Ferme'}
            </span>
          </>
        )}

        <ChevronDown
          className={cn(
            'w-4 h-4 text-neutral-500 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute top-full right-0 mt-1 z-50',
            'w-72 max-h-80 overflow-y-auto',
            'bg-white border border-neutral-200 rounded-lg shadow-lg',
            'animate-fade-in-down'
          )}
          role="listbox"
          aria-label="Selectionner un point de vente"
        >
          <div className="p-2">
            <p className="px-2 py-1.5 text-xs text-neutral-500 uppercase tracking-wide">
              Points de vente disponibles
            </p>

            <div className="mt-1 space-y-0.5">
              {warehouses.map((warehouse) => {
                const isSelected = warehouse.id === selectedWarehouse.id;
                const isOpen = isWarehouseOpen(warehouse.id);
                const Icon = getWarehouseIcon(warehouse.type);
                const typeLabel = getWarehouseTypeLabel(warehouse.type);

                return (
                  <button
                    key={warehouse.id}
                    onClick={() => handleWarehouseSelect(warehouse.id)}
                    className={cn(
                      'flex items-start gap-3 w-full p-2 rounded-md',
                      'text-left transition-colors duration-150',
                      isSelected
                        ? 'bg-orange-50 text-orange-700'
                        : 'hover:bg-neutral-50 text-neutral-900'
                    )}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0',
                        isSelected
                          ? 'bg-orange-100'
                          : 'bg-neutral-100'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-4 h-4',
                          isSelected
                            ? 'text-orange-600'
                            : 'text-neutral-500'
                        )}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {warehouse.code}
                        </span>
                        {isSelected && (
                          <Check
                            className="w-4 h-4 text-accent flex-shrink-0"
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 truncate">
                        {warehouse.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-neutral-500">
                          {typeLabel}
                        </span>
                        <span className="text-neutral-500">-</span>
                        <span
                          className={cn(
                            'text-xs',
                            isOpen
                              ? 'text-green-600'
                              : 'text-neutral-500'
                          )}
                        >
                          {isOpen ? 'Ouvert' : 'Ferme'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-200 p-2">
            <a
              href="/points-de-vente"
              className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm text-accent hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
            >
              <MapPin className="w-4 h-4" strokeWidth={1.5} />
              <span>Voir tous les points de vente</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
});

WarehouseSelector.displayName = 'WarehouseSelector';

export default WarehouseSelector;
