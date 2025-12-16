'use client';

/**
 * Pricing Context
 *
 * Manages B2B pricing, price lists, volume discounts, and personalized pricing.
 * Handles price calculations based on customer tier and negotiated rates.
 *
 * @packageDocumentation
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type {
  PriceList,
  PriceListSummary,
  VolumeDiscount,
  CalculatedPrice,
  CurrencyCode,
} from '@maison/types';

// ============================================================================
// Mock Data
// ============================================================================

const mockPriceLists: PriceList[] = [
  {
    id: 'pl_001',
    code: 'STANDARD',
    name: 'Tarif Standard',
    description: 'Tarif catalogue de base',
    type: 'standard',
    status: 'active',
    currency: 'EUR',
    priority: 1,
    isDefault: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'pl_002',
    code: 'PREMIUM',
    name: 'Tarif Premium',
    description: 'Tarif preferentiel pour clients Premium',
    type: 'tier',
    status: 'active',
    currency: 'EUR',
    priority: 2,
    isDefault: false,
    globalDiscount: 10,
    companyTier: 'premium',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'pl_003',
    code: 'VIP',
    name: 'Tarif VIP',
    description: 'Tarif exclusif pour clients VIP',
    type: 'tier',
    status: 'active',
    currency: 'EUR',
    priority: 3,
    isDefault: false,
    globalDiscount: 20,
    companyTier: 'vip',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'pl_004',
    code: 'PROMO-NOEL',
    name: 'Promotion Noel 2024',
    description: 'Offre speciale fin dannee',
    type: 'promotional',
    status: 'active',
    currency: 'EUR',
    priority: 10,
    isDefault: false,
    globalDiscount: 15,
    validFrom: '2024-12-01T00:00:00Z',
    validUntil: '2024-12-31T23:59:59Z',
    createdAt: '2024-11-15T00:00:00Z',
    updatedAt: '2024-11-15T00:00:00Z',
  },
];

/**
 * Mock volume discounts for products
 */
const mockVolumeDiscounts: Record<string, VolumeDiscount[]> = {
  default: [
    { minQuantity: 5, discountPercent: 5, label: 'Lot de 5' },
    { minQuantity: 10, discountPercent: 10, label: 'Lot de 10' },
    { minQuantity: 25, discountPercent: 15, label: 'Lot de 25' },
    { minQuantity: 50, discountPercent: 20, label: 'Lot de 50' },
  ],
  jewelry: [
    { minQuantity: 3, discountPercent: 5, label: 'Par 3' },
    { minQuantity: 6, discountPercent: 10, label: 'Par 6' },
    { minQuantity: 12, discountPercent: 15, label: 'Par 12' },
  ],
};

// ============================================================================
// Types
// ============================================================================

/**
 * Price display format
 */
export type PriceDisplayFormat = 'ht' | 'ttc' | 'both';

/**
 * Tax rate configuration
 */
export interface TaxConfig {
  rate: number;
  name: string;
  isIncluded: boolean;
}

/**
 * Pricing settings
 */
export interface PricingSettings {
  /** Default currency */
  currency: CurrencyCode;
  /** Display format */
  displayFormat: PriceDisplayFormat;
  /** Show volume discounts */
  showVolumeDiscounts: boolean;
  /** Show original price when discounted */
  showOriginalPrice: boolean;
  /** Default tax rate */
  defaultTaxRate: TaxConfig;
  /** Decimal places for prices */
  decimalPlaces: number;
}

/**
 * Pricing context value
 */
export interface PricingContextValue {
  /** Available price lists */
  priceLists: PriceList[];
  /** Active price list for current user */
  activePriceList: PriceList | null;
  /** Whether pricing is loading */
  isLoading: boolean;
  /** Error if any */
  error: Error | null;
  /** Pricing settings */
  settings: PricingSettings;
  /** Current company tier discount */
  tierDiscount: number;
  /** Calculate price for a product */
  calculatePrice: (
    productId: string,
    basePrice: number,
    quantity?: number,
    options?: { includeVolumeDiscount?: boolean }
  ) => CalculatedPrice;
  /** Get volume discounts for a product */
  getVolumeDiscounts: (productId: string, category?: string) => VolumeDiscount[];
  /** Get applicable volume discount for quantity */
  getApplicableVolumeDiscount: (productId: string, quantity: number, category?: string) => VolumeDiscount | null;
  /** Format price for display */
  formatPrice: (price: number, options?: { format?: PriceDisplayFormat; currency?: CurrencyCode }) => string;
  /** Calculate total with tax */
  calculateTax: (priceHT: number, taxRate?: number) => { priceTTC: number; taxAmount: number };
  /** Get price list by ID */
  getPriceListById: (id: string) => PriceList | undefined;
  /** Check if promotional price is active */
  hasActivePromotion: (productId?: string) => boolean;
  /** Get promotional end date */
  getPromotionEndDate: () => string | null;
  /** Refresh pricing data */
  refreshPricing: () => Promise<void>;
  /** Update pricing settings */
  updateSettings: (settings: Partial<PricingSettings>) => void;
}

// ============================================================================
// Context
// ============================================================================

const PricingContext = createContext<PricingContextValue | null>(null);

// ============================================================================
// Provider Props
// ============================================================================

export interface PricingProviderProps {
  children: React.ReactNode;
  /** Company ID for fetching pricing */
  companyId?: string;
  /** Company tier for tier-based pricing */
  companyTier?: string;
  /** Enable mock mode for development */
  mockMode?: boolean;
  /** Initial settings */
  initialSettings?: Partial<PricingSettings>;
}

// ============================================================================
// Default Settings
// ============================================================================

const defaultSettings: PricingSettings = {
  currency: 'EUR',
  displayFormat: 'ht',
  showVolumeDiscounts: true,
  showOriginalPrice: true,
  defaultTaxRate: {
    rate: 20,
    name: 'TVA',
    isIncluded: false,
  },
  decimalPlaces: 2,
};

// ============================================================================
// Provider
// ============================================================================

/**
 * Pricing Provider
 *
 * Provides pricing calculations and data to the application.
 */
export function PricingProvider({
  children,
  companyId,
  companyTier = 'standard',
  mockMode = true,
  initialSettings,
}: PricingProviderProps) {
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [settings, setSettings] = useState<PricingSettings>({
    ...defaultSettings,
    ...initialSettings,
  });

  // Initialize pricing data
  useEffect(() => {
    const initPricing = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (mockMode) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setPriceLists(mockPriceLists);
        } else {
          // TODO: Fetch from API
          setPriceLists(mockPriceLists);
        }
      } catch (err) {
        console.error('Failed to load pricing:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    initPricing();
  }, [companyId, mockMode]);

  // Determine active price list based on company tier
  const activePriceList = useMemo(() => {
    // Find promotional price list first (highest priority if active)
    const now = new Date();
    const activePromo = priceLists.find(
      (pl) =>
        pl.type === 'promotional' &&
        pl.status === 'active' &&
        (!pl.validFrom || new Date(pl.validFrom) <= now) &&
        (!pl.validUntil || new Date(pl.validUntil) >= now)
    );
    if (activePromo) return activePromo;

    // Find tier-based price list
    const tierPriceList = priceLists.find(
      (pl) => pl.companyTier === companyTier && pl.status === 'active'
    );
    if (tierPriceList) return tierPriceList;

    // Fall back to default
    return priceLists.find((pl) => pl.isDefault && pl.status === 'active') ?? null;
  }, [priceLists, companyTier]);

  // Calculate tier discount
  const tierDiscount = useMemo(() => {
    if (!activePriceList) return 0;
    return activePriceList.globalDiscount ?? 0;
  }, [activePriceList]);

  // Get volume discounts
  const getVolumeDiscounts = useCallback(
    (productId: string, category?: string): VolumeDiscount[] => {
      // In production, this would fetch product-specific discounts
      if (category && mockVolumeDiscounts[category]) {
        return mockVolumeDiscounts[category];
      }
      return mockVolumeDiscounts.default;
    },
    []
  );

  // Get applicable volume discount for quantity
  const getApplicableVolumeDiscount = useCallback(
    (productId: string, quantity: number, category?: string): VolumeDiscount | null => {
      const discounts = getVolumeDiscounts(productId, category);
      // Find the highest applicable discount
      const applicable = discounts
        .filter((d) => quantity >= d.minQuantity)
        .sort((a, b) => b.minQuantity - a.minQuantity);
      return applicable[0] ?? null;
    },
    [getVolumeDiscounts]
  );

  // Calculate price
  const calculatePrice = useCallback(
    (
      productId: string,
      basePrice: number,
      quantity: number = 1,
      options?: { includeVolumeDiscount?: boolean }
    ): CalculatedPrice => {
      const includeVolumeDiscount = options?.includeVolumeDiscount ?? true;

      // Apply tier discount
      let discountedPrice = basePrice;
      let totalDiscountPercent = 0;

      if (tierDiscount > 0) {
        totalDiscountPercent = tierDiscount;
        discountedPrice = basePrice * (1 - tierDiscount / 100);
      }

      // Apply volume discount if applicable
      let volumeDiscount: VolumeDiscount | undefined;
      if (includeVolumeDiscount && quantity > 1) {
        const applicableDiscount = getApplicableVolumeDiscount(productId, quantity);
        if (applicableDiscount) {
          volumeDiscount = applicableDiscount;
          if (applicableDiscount.fixedUnitPrice !== undefined) {
            discountedPrice = applicableDiscount.fixedUnitPrice;
          } else if (applicableDiscount.discountPercent) {
            // Volume discount stacks with tier discount
            discountedPrice = discountedPrice * (1 - applicableDiscount.discountPercent / 100);
            totalDiscountPercent =
              100 - (100 - totalDiscountPercent) * (1 - applicableDiscount.discountPercent / 100);
          }
        }
      }

      // Round to decimal places
      const unitPriceHT = Math.round(discountedPrice * Math.pow(10, settings.decimalPlaces)) / Math.pow(10, settings.decimalPlaces);

      // Calculate TTC
      const taxRate = settings.defaultTaxRate.rate;
      const unitPriceTTC = Math.round(unitPriceHT * (1 + taxRate / 100) * Math.pow(10, settings.decimalPlaces)) / Math.pow(10, settings.decimalPlaces);

      return {
        productId,
        unitPriceHT,
        unitPriceTTC,
        currency: settings.currency,
        taxRate,
        originalPriceHT: totalDiscountPercent > 0 ? basePrice : undefined,
        discountPercent: totalDiscountPercent > 0 ? Math.round(totalDiscountPercent * 10) / 10 : undefined,
        volumeDiscountApplied: volumeDiscount,
        priceSource: {
          type: 'price_list',
          id: activePriceList?.id ?? 'default',
          name: activePriceList?.name ?? 'Tarif Standard',
        },
        isNegotiated: false,
        isPromotional: activePriceList?.type === 'promotional',
        promotionEndsAt: activePriceList?.type === 'promotional' ? activePriceList.validUntil : undefined,
        unit: 'unit',
        unitLabel: 'unite',
      };
    },
    [tierDiscount, getApplicableVolumeDiscount, settings, activePriceList]
  );

  // Format price
  const formatPrice = useCallback(
    (
      price: number,
      options?: { format?: PriceDisplayFormat; currency?: CurrencyCode }
    ): string => {
      const format = options?.format ?? settings.displayFormat;
      const currency = options?.currency ?? settings.currency;

      const formatter = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency,
        minimumFractionDigits: settings.decimalPlaces,
        maximumFractionDigits: settings.decimalPlaces,
      });

      const formatted = formatter.format(price);

      if (format === 'ht') {
        return `${formatted} HT`;
      } else if (format === 'ttc') {
        return `${formatted} TTC`;
      }
      return formatted;
    },
    [settings]
  );

  // Calculate tax
  const calculateTax = useCallback(
    (priceHT: number, taxRate?: number): { priceTTC: number; taxAmount: number } => {
      const rate = taxRate ?? settings.defaultTaxRate.rate;
      const taxAmount = Math.round(priceHT * (rate / 100) * 100) / 100;
      const priceTTC = Math.round((priceHT + taxAmount) * 100) / 100;
      return { priceTTC, taxAmount };
    },
    [settings.defaultTaxRate.rate]
  );

  // Get price list by ID
  const getPriceListById = useCallback(
    (id: string): PriceList | undefined => priceLists.find((pl) => pl.id === id),
    [priceLists]
  );

  // Check for active promotion
  const hasActivePromotion = useCallback(
    (productId?: string): boolean => {
      return activePriceList?.type === 'promotional';
    },
    [activePriceList]
  );

  // Get promotion end date
  const getPromotionEndDate = useCallback((): string | null => {
    if (activePriceList?.type === 'promotional' && activePriceList.validUntil) {
      return activePriceList.validUntil;
    }
    return null;
  }, [activePriceList]);

  // Refresh pricing
  const refreshPricing = useCallback(async () => {
    setIsLoading(true);
    try {
      if (mockMode) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setPriceLists(mockPriceLists);
      } else {
        // TODO: Fetch from API
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [mockMode]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<PricingSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Memoize context value
  const value = useMemo<PricingContextValue>(
    () => ({
      priceLists,
      activePriceList,
      isLoading,
      error,
      settings,
      tierDiscount,
      calculatePrice,
      getVolumeDiscounts,
      getApplicableVolumeDiscount,
      formatPrice,
      calculateTax,
      getPriceListById,
      hasActivePromotion,
      getPromotionEndDate,
      refreshPricing,
      updateSettings,
    }),
    [
      priceLists,
      activePriceList,
      isLoading,
      error,
      settings,
      tierDiscount,
      calculatePrice,
      getVolumeDiscounts,
      getApplicableVolumeDiscount,
      formatPrice,
      calculateTax,
      getPriceListById,
      hasActivePromotion,
      getPromotionEndDate,
      refreshPricing,
      updateSettings,
    ]
  );

  return <PricingContext.Provider value={value}>{children}</PricingContext.Provider>;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to access pricing context
 *
 * @throws Error if used outside of PricingProvider
 */
export function usePricing(): PricingContextValue {
  const context = useContext(PricingContext);
  if (!context) {
    throw new Error('usePricing must be used within a PricingProvider');
  }
  return context;
}

/**
 * Hook for price calculation
 */
export function useProductPrice(productId: string, basePrice: number, quantity: number = 1) {
  const { calculatePrice, formatPrice, getVolumeDiscounts } = usePricing();

  const calculatedPrice = useMemo(
    () => calculatePrice(productId, basePrice, quantity),
    [calculatePrice, productId, basePrice, quantity]
  );

  const volumeDiscounts = useMemo(
    () => getVolumeDiscounts(productId),
    [getVolumeDiscounts, productId]
  );

  const formattedPriceHT = useMemo(
    () => formatPrice(calculatedPrice.unitPriceHT, { format: 'ht' }),
    [formatPrice, calculatedPrice.unitPriceHT]
  );

  const formattedPriceTTC = useMemo(
    () => formatPrice(calculatedPrice.unitPriceTTC, { format: 'ttc' }),
    [formatPrice, calculatedPrice.unitPriceTTC]
  );

  return {
    ...calculatedPrice,
    volumeDiscounts,
    formattedPriceHT,
    formattedPriceTTC,
  };
}

/**
 * Hook for price formatting
 */
export function usePriceFormatter() {
  const { formatPrice, settings } = usePricing();
  return { formatPrice, currency: settings.currency, displayFormat: settings.displayFormat };
}

/**
 * Hook for volume discounts
 */
export function useVolumeDiscounts(productId: string, category?: string) {
  const { getVolumeDiscounts, getApplicableVolumeDiscount } = usePricing();

  const discounts = useMemo(
    () => getVolumeDiscounts(productId, category),
    [getVolumeDiscounts, productId, category]
  );

  const getDiscountForQuantity = useCallback(
    (quantity: number) => getApplicableVolumeDiscount(productId, quantity, category),
    [getApplicableVolumeDiscount, productId, category]
  );

  return { discounts, getDiscountForQuantity };
}

export default PricingProvider;
