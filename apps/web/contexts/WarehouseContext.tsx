'use client';

/**
 * Warehouse Context
 *
 * Manages warehouse/point-of-sale selection and availability for B2B e-commerce.
 * Handles multi-location inventory visibility and pickup point selection.
 *
 * @packageDocumentation
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type {
  Warehouse,
  WarehouseSummary,
  WarehouseType,
  DeliveryOption,
  OpeningHours,
  DaySchedule,
  TimeSlot,
} from '@maison/types';

// ============================================================================
// Mock Data
// ============================================================================

const mockWarehouses: Warehouse[] = [
  {
    id: 'wh_001',
    code: 'PARIS-EST',
    name: 'Paris Est - Entrepot Principal',
    type: 'warehouse',
    status: 'active',
    address: {
      street1: '45 Rue des Entrepreneurs',
      city: 'Montreuil',
      postalCode: '93100',
      countryCode: 'FR',
      country: 'France',
      latitude: 48.8566,
      longitude: 2.4403,
    },
    contact: {
      phone: '+33 1 48 00 00 01',
      email: 'paris-est@maison-bijoux.fr',
    },
    openingHours: {
      regular: [
        { day: 'monday', isOpen: true, slots: [{ open: '08:00', close: '18:00' }] },
        { day: 'tuesday', isOpen: true, slots: [{ open: '08:00', close: '18:00' }] },
        { day: 'wednesday', isOpen: true, slots: [{ open: '08:00', close: '18:00' }] },
        { day: 'thursday', isOpen: true, slots: [{ open: '08:00', close: '18:00' }] },
        { day: 'friday', isOpen: true, slots: [{ open: '08:00', close: '17:00' }] },
        { day: 'saturday', isOpen: false, slots: [] },
        { day: 'sunday', isOpen: false, slots: [] },
      ],
      timezone: 'Europe/Paris',
    },
    deliveryOptions: [
      {
        id: 'do_001',
        type: 'store_pickup',
        name: 'Retrait en entrepot',
        description: 'Retrait sur place sous 2h',
        estimatedTime: '2h',
        estimatedHours: 2,
        priceHT: 0,
        currency: 'EUR',
        isAvailable: true,
      },
      {
        id: 'do_002',
        type: 'express_delivery',
        name: 'Livraison Express',
        description: 'Livraison le lendemain avant 13h',
        estimatedTime: '24h',
        estimatedHours: 24,
        priceHT: 15,
        currency: 'EUR',
        freeAbove: 500,
        isAvailable: true,
      },
      {
        id: 'do_003',
        type: 'standard_delivery',
        name: 'Livraison Standard',
        description: 'Livraison sous 2-3 jours ouvrés',
        estimatedTime: '2-3 jours',
        estimatedHours: 72,
        priceHT: 8,
        currency: 'EUR',
        freeAbove: 200,
        isAvailable: true,
      },
    ],
    capabilities: {
      pickupEnabled: true,
      deliveryEnabled: true,
      hasCounter: true,
      hasShowroom: false,
      handlesDangerousGoods: false,
      hasForklift: true,
      maxItemWeight: 50,
      acceptsReturns: true,
    },
    isDefault: true,
    sortOrder: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'wh_002',
    code: 'LYON-SUD',
    name: 'Lyon Sud - Point de vente',
    type: 'store',
    status: 'active',
    address: {
      street1: '12 Rue de la Republique',
      city: 'Lyon',
      postalCode: '69002',
      countryCode: 'FR',
      country: 'France',
      latitude: 45.7640,
      longitude: 4.8357,
    },
    contact: {
      phone: '+33 4 72 00 00 01',
      email: 'lyon-sud@maison-bijoux.fr',
    },
    openingHours: {
      regular: [
        { day: 'monday', isOpen: true, slots: [{ open: '09:00', close: '12:00' }, { open: '14:00', close: '19:00' }] },
        { day: 'tuesday', isOpen: true, slots: [{ open: '09:00', close: '12:00' }, { open: '14:00', close: '19:00' }] },
        { day: 'wednesday', isOpen: true, slots: [{ open: '09:00', close: '12:00' }, { open: '14:00', close: '19:00' }] },
        { day: 'thursday', isOpen: true, slots: [{ open: '09:00', close: '12:00' }, { open: '14:00', close: '19:00' }] },
        { day: 'friday', isOpen: true, slots: [{ open: '09:00', close: '12:00' }, { open: '14:00', close: '19:00' }] },
        { day: 'saturday', isOpen: true, slots: [{ open: '10:00', close: '18:00' }] },
        { day: 'sunday', isOpen: false, slots: [] },
      ],
      timezone: 'Europe/Paris',
    },
    deliveryOptions: [
      {
        id: 'do_004',
        type: 'store_pickup',
        name: 'Retrait en magasin',
        description: 'Retrait sur place sous 1h',
        estimatedTime: '1h',
        estimatedHours: 1,
        priceHT: 0,
        currency: 'EUR',
        isAvailable: true,
      },
      {
        id: 'do_005',
        type: 'standard_delivery',
        name: 'Livraison Standard',
        description: 'Livraison sous 3-4 jours ouvrés',
        estimatedTime: '3-4 jours',
        estimatedHours: 96,
        priceHT: 10,
        currency: 'EUR',
        freeAbove: 200,
        isAvailable: true,
      },
    ],
    capabilities: {
      pickupEnabled: true,
      deliveryEnabled: true,
      hasCounter: true,
      hasShowroom: true,
      handlesDangerousGoods: false,
      hasForklift: false,
      acceptsReturns: true,
    },
    isDefault: false,
    sortOrder: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'wh_003',
    code: 'MARSEILLE',
    name: 'Marseille - Depot',
    type: 'depot',
    status: 'active',
    address: {
      street1: '78 Avenue du Prado',
      city: 'Marseille',
      postalCode: '13008',
      countryCode: 'FR',
      country: 'France',
      latitude: 43.2965,
      longitude: 5.3698,
    },
    contact: {
      phone: '+33 4 91 00 00 01',
      email: 'marseille@maison-bijoux.fr',
    },
    openingHours: {
      regular: [
        { day: 'monday', isOpen: true, slots: [{ open: '08:30', close: '17:30' }] },
        { day: 'tuesday', isOpen: true, slots: [{ open: '08:30', close: '17:30' }] },
        { day: 'wednesday', isOpen: true, slots: [{ open: '08:30', close: '17:30' }] },
        { day: 'thursday', isOpen: true, slots: [{ open: '08:30', close: '17:30' }] },
        { day: 'friday', isOpen: true, slots: [{ open: '08:30', close: '16:30' }] },
        { day: 'saturday', isOpen: false, slots: [] },
        { day: 'sunday', isOpen: false, slots: [] },
      ],
      timezone: 'Europe/Paris',
    },
    deliveryOptions: [
      {
        id: 'do_006',
        type: 'store_pickup',
        name: 'Retrait au depot',
        description: 'Retrait sous 24h',
        estimatedTime: '24h',
        estimatedHours: 24,
        priceHT: 0,
        currency: 'EUR',
        isAvailable: true,
      },
      {
        id: 'do_007',
        type: 'standard_delivery',
        name: 'Livraison Standard',
        description: 'Livraison sous 4-5 jours ouvrés',
        estimatedTime: '4-5 jours',
        estimatedHours: 120,
        priceHT: 12,
        currency: 'EUR',
        freeAbove: 300,
        isAvailable: true,
      },
    ],
    capabilities: {
      pickupEnabled: true,
      deliveryEnabled: true,
      hasCounter: false,
      hasShowroom: false,
      handlesDangerousGoods: false,
      hasForklift: true,
      maxItemWeight: 100,
      acceptsReturns: true,
    },
    isDefault: false,
    sortOrder: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
];

// ============================================================================
// Types
// ============================================================================

/**
 * Warehouse context value
 */
export interface WarehouseContextValue {
  /** All available warehouses */
  warehouses: Warehouse[];
  /** Currently selected warehouse */
  selectedWarehouse: Warehouse | null;
  /** Whether warehouses are loading */
  isLoading: boolean;
  /** Error if any */
  error: Error | null;
  /** Warehouses with pickup enabled */
  pickupWarehouses: Warehouse[];
  /** Warehouses with delivery enabled */
  deliveryWarehouses: Warehouse[];
  /** Select a warehouse */
  selectWarehouse: (warehouseId: string) => void;
  /** Get warehouse by ID */
  getWarehouseById: (id: string) => Warehouse | undefined;
  /** Get warehouses by type */
  getWarehousesByType: (type: WarehouseType) => Warehouse[];
  /** Find nearest warehouse by coordinates */
  findNearestWarehouse: (lat: number, lng: number) => Warehouse | null;
  /** Check if warehouse is currently open */
  isWarehouseOpen: (warehouseId: string) => boolean;
  /** Get next opening time for a warehouse */
  getNextOpeningTime: (warehouseId: string) => string | null;
  /** Get delivery options for selected warehouse */
  getDeliveryOptions: () => DeliveryOption[];
  /** Refresh warehouses data */
  refreshWarehouses: () => Promise<void>;
  /** Clear selected warehouse */
  clearSelection: () => void;
}

// ============================================================================
// Context
// ============================================================================

const WarehouseContext = createContext<WarehouseContextValue | null>(null);

// ============================================================================
// Provider Props
// ============================================================================

export interface WarehouseProviderProps {
  children: React.ReactNode;
  /** Company ID for fetching warehouses */
  companyId?: string;
  /** Initial warehouse ID to select */
  initialWarehouseId?: string;
  /** Enable mock mode for development */
  mockMode?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if warehouse is currently open based on opening hours
 */
function checkIfOpen(openingHours: OpeningHours): boolean {
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = days[now.getDay()];
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const daySchedule = openingHours.regular.find((d: DaySchedule) => d.day === currentDay);
  if (!daySchedule || !daySchedule.isOpen) return false;

  return daySchedule.slots.some((slot: TimeSlot) => currentTime >= slot.open && currentTime <= slot.close);
}

/**
 * Get next opening time for a warehouse
 */
function getNextOpening(openingHours: OpeningHours): string | null {
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDayIndex = now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Check remaining slots today
  const todaySchedule = openingHours.regular.find((d: DaySchedule) => d.day === days[currentDayIndex]);
  if (todaySchedule?.isOpen) {
    const nextSlot = todaySchedule.slots.find((slot: TimeSlot) => currentTime < slot.open);
    if (nextSlot) {
      return `Ouvre a ${nextSlot.open}`;
    }
  }

  // Check next days
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (currentDayIndex + i) % 7;
    const nextDaySchedule = openingHours.regular.find((d: DaySchedule) => d.day === days[nextDayIndex]);
    if (nextDaySchedule?.isOpen && nextDaySchedule.slots.length > 0) {
      const dayLabel = i === 1 ? 'Demain' : days[nextDayIndex].charAt(0).toUpperCase() + days[nextDayIndex].slice(1);
      return `${dayLabel} a ${nextDaySchedule.slots[0].open}`;
    }
  }

  return null;
}

// ============================================================================
// Provider
// ============================================================================

/**
 * Warehouse Provider
 *
 * Provides warehouse selection and data to the application.
 */
export function WarehouseProvider({
  children,
  companyId,
  initialWarehouseId,
  mockMode = true,
}: WarehouseProviderProps) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize warehouses
  useEffect(() => {
    const initWarehouses = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (mockMode) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setWarehouses(mockWarehouses);

          // Set initial warehouse (either specified or default)
          if (initialWarehouseId) {
            const initial = mockWarehouses.find((w) => w.id === initialWarehouseId);
            if (initial) setSelectedWarehouse(initial);
          } else {
            const defaultWarehouse = mockWarehouses.find((w) => w.isDefault);
            if (defaultWarehouse) setSelectedWarehouse(defaultWarehouse);
          }
        } else {
          // TODO: Fetch from API
          setWarehouses(mockWarehouses);
        }
      } catch (err) {
        console.error('Failed to load warehouses:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    initWarehouses();
  }, [companyId, initialWarehouseId, mockMode]);

  // Derived: pickup warehouses
  const pickupWarehouses = useMemo(
    () => warehouses.filter((w) => w.capabilities.pickupEnabled && w.status === 'active'),
    [warehouses]
  );

  // Derived: delivery warehouses
  const deliveryWarehouses = useMemo(
    () => warehouses.filter((w) => w.capabilities.deliveryEnabled && w.status === 'active'),
    [warehouses]
  );

  // Select warehouse
  const selectWarehouse = useCallback(
    (warehouseId: string) => {
      const warehouse = warehouses.find((w) => w.id === warehouseId);
      if (warehouse) {
        setSelectedWarehouse(warehouse);
        // Persist selection
        if (typeof window !== 'undefined') {
          localStorage.setItem('selectedWarehouseId', warehouseId);
        }
      }
    },
    [warehouses]
  );

  // Get warehouse by ID
  const getWarehouseById = useCallback(
    (id: string): Warehouse | undefined => warehouses.find((w) => w.id === id),
    [warehouses]
  );

  // Get warehouses by type
  const getWarehousesByType = useCallback(
    (type: WarehouseType): Warehouse[] => warehouses.filter((w) => w.type === type && w.status === 'active'),
    [warehouses]
  );

  // Find nearest warehouse
  const findNearestWarehouse = useCallback(
    (lat: number, lng: number): Warehouse | null => {
      let nearest: Warehouse | null = null;
      let minDistance = Infinity;

      for (const warehouse of warehouses) {
        if (warehouse.status !== 'active') continue;
        if (!warehouse.address.latitude || !warehouse.address.longitude) continue;

        const distance = calculateDistance(lat, lng, warehouse.address.latitude, warehouse.address.longitude);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = warehouse;
        }
      }

      return nearest;
    },
    [warehouses]
  );

  // Check if warehouse is open
  const isWarehouseOpen = useCallback(
    (warehouseId: string): boolean => {
      const warehouse = warehouses.find((w) => w.id === warehouseId);
      if (!warehouse) return false;
      return checkIfOpen(warehouse.openingHours);
    },
    [warehouses]
  );

  // Get next opening time
  const getNextOpeningTime = useCallback(
    (warehouseId: string): string | null => {
      const warehouse = warehouses.find((w) => w.id === warehouseId);
      if (!warehouse) return null;
      return getNextOpening(warehouse.openingHours);
    },
    [warehouses]
  );

  // Get delivery options for selected warehouse
  const getDeliveryOptions = useCallback((): DeliveryOption[] => {
    if (!selectedWarehouse) return [];
    return selectedWarehouse.deliveryOptions.filter((opt: DeliveryOption) => opt.isAvailable);
  }, [selectedWarehouse]);

  // Refresh warehouses
  const refreshWarehouses = useCallback(async () => {
    setIsLoading(true);
    try {
      if (mockMode) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setWarehouses(mockWarehouses);
      } else {
        // TODO: Fetch from API
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [mockMode]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedWarehouse(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selectedWarehouseId');
    }
  }, []);

  // Memoize context value
  const value = useMemo<WarehouseContextValue>(
    () => ({
      warehouses,
      selectedWarehouse,
      isLoading,
      error,
      pickupWarehouses,
      deliveryWarehouses,
      selectWarehouse,
      getWarehouseById,
      getWarehousesByType,
      findNearestWarehouse,
      isWarehouseOpen,
      getNextOpeningTime,
      getDeliveryOptions,
      refreshWarehouses,
      clearSelection,
    }),
    [
      warehouses,
      selectedWarehouse,
      isLoading,
      error,
      pickupWarehouses,
      deliveryWarehouses,
      selectWarehouse,
      getWarehouseById,
      getWarehousesByType,
      findNearestWarehouse,
      isWarehouseOpen,
      getNextOpeningTime,
      getDeliveryOptions,
      refreshWarehouses,
      clearSelection,
    ]
  );

  return <WarehouseContext.Provider value={value}>{children}</WarehouseContext.Provider>;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to access warehouse context
 *
 * @throws Error if used outside of WarehouseProvider
 */
export function useWarehouse(): WarehouseContextValue {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
}

/**
 * Hook to get selected warehouse info
 */
export function useSelectedWarehouse() {
  const { selectedWarehouse, selectWarehouse, clearSelection, getDeliveryOptions, isWarehouseOpen } = useWarehouse();

  const isOpen = selectedWarehouse ? isWarehouseOpen(selectedWarehouse.id) : false;

  return {
    warehouse: selectedWarehouse,
    isOpen,
    deliveryOptions: getDeliveryOptions(),
    select: selectWarehouse,
    clear: clearSelection,
  };
}

/**
 * Hook to get pickup points
 */
export function usePickupPoints() {
  const { pickupWarehouses, isWarehouseOpen, getNextOpeningTime } = useWarehouse();

  const pickupPointsWithStatus = useMemo(
    () =>
      pickupWarehouses.map((warehouse) => ({
        ...warehouse,
        isOpen: isWarehouseOpen(warehouse.id),
        nextOpening: getNextOpeningTime(warehouse.id),
      })),
    [pickupWarehouses, isWarehouseOpen, getNextOpeningTime]
  );

  return pickupPointsWithStatus;
}

export default WarehouseProvider;
