'use client';

/**
 * Company Context
 *
 * Manages company data, settings, and operations for B2B functionality.
 * Handles company selection, data refresh, and credit management.
 *
 * @packageDocumentation
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { Company, CompanyAddress } from '@maison/types';

// ============================================================================
// Mock Data
// ============================================================================

/**
 * Mock company data for development
 */
const mockCompany: Company = {
  id: 'comp_001',
  name: 'Bijouterie Parisienne',
  tradeName: 'Bijouterie Parisienne',
  slug: 'bijouterie-parisienne',
  email: 'contact@bijouterie-parisienne.fr',
  phone: '+33 1 23 45 67 89',
  website: 'https://bijouterie-parisienne.fr',
  taxId: 'FR12345678901',
  tier: 'premium',
  status: 'active',
  settings: {
    defaultCurrency: 'EUR',
    defaultLanguage: 'fr',
    taxExempt: false,
    marketingOptIn: true,
    orderNotificationEmails: ['orders@bijouterie-parisienne.fr'],
    invoiceNotificationEmails: ['comptabilite@bijouterie-parisienne.fr'],
    allowEmployeeOrders: true,
    requireOrderApproval: true,
    allowCreditPurchases: true,
    autoReorderEnabled: false,
  },
  paymentTerms: {
    type: 'net_30',
    allowPartialPayments: true,
  },
  creditLimit: 50000,
  creditUsed: 12500,
  creditAvailable: 37500,
  addresses: [
    {
      id: 'addr_001',
      type: 'billing',
      label: 'Siege social',
      isDefault: true,
      companyName: 'Bijouterie Parisienne',
      addressLine1: '123 Rue de la Paix',
      city: 'Paris',
      postalCode: '75001',
      countryCode: 'FR',
      phone: '+33 1 23 45 67 89',
      isVerified: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'addr_002',
      type: 'shipping',
      label: 'Boutique Champs-Elysees',
      isDefault: true,
      companyName: 'Bijouterie Parisienne - Boutique',
      addressLine1: '45 Avenue des Champs-Elysees',
      city: 'Paris',
      postalCode: '75008',
      countryCode: 'FR',
      phone: '+33 1 23 45 67 90',
      isVerified: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
  ],
  tags: ['premium', 'paris'],
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-12-01T14:30:00Z',
};

// ============================================================================
// Types
// ============================================================================

/**
 * Credit information summary
 */
export interface CreditInfo {
  limit: number;
  used: number;
  available: number;
  utilizationPercent: number;
  currency: string;
}

/**
 * Company context value
 */
export interface CompanyContextValue {
  /** Current company data */
  company: Company | null;
  /** Whether company data is loading */
  isLoading: boolean;
  /** Error if any */
  error: Error | null;
  /** Company addresses */
  addresses: CompanyAddress[];
  /** Default billing address */
  defaultBillingAddress: CompanyAddress | null;
  /** Default shipping address */
  defaultShippingAddress: CompanyAddress | null;
  /** Credit information */
  creditInfo: CreditInfo | null;
  /** Whether credit is available for purchases */
  hasCreditAvailable: boolean;
  /** Company tier */
  tier: string | null;
  /** Refresh company data */
  refreshCompany: () => Promise<void>;
  /** Switch to a different company (multi-company support) */
  switchCompany: (companyId: string) => Promise<void>;
  /** Clear company context */
  clearCompany: () => void;
  /** Update company settings */
  updateSettings: (settings: Partial<Company['settings']>) => Promise<void>;
  /** Add a new address */
  addAddress: (address: Omit<CompanyAddress, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  /** Update an address */
  updateAddress: (addressId: string, address: Partial<CompanyAddress>) => Promise<void>;
  /** Delete an address */
  deleteAddress: (addressId: string) => Promise<void>;
  /** Set default address */
  setDefaultAddress: (addressId: string, type: 'billing' | 'shipping') => Promise<void>;
}

// ============================================================================
// Context
// ============================================================================

const CompanyContext = createContext<CompanyContextValue | null>(null);

// ============================================================================
// Provider Props
// ============================================================================

export interface CompanyProviderProps {
  children: React.ReactNode;
  /** Initial company ID to load */
  initialCompanyId?: string;
  /** Enable mock mode for development */
  mockMode?: boolean;
}

// ============================================================================
// Provider
// ============================================================================

/**
 * Company Provider
 *
 * Provides company data and operations to the application.
 */
export function CompanyProvider({
  children,
  initialCompanyId,
  mockMode = true,
}: CompanyProviderProps) {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize company data
  useEffect(() => {
    const initCompany = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (mockMode) {
          // Use mock data in development
          await new Promise((resolve) => setTimeout(resolve, 100));
          setCompany(mockCompany);
        } else {
          // TODO: Fetch from API
          // const response = await api.companies.get(initialCompanyId);
          // setCompany(response);
          setCompany(mockCompany);
        }
      } catch (err) {
        console.error('Failed to load company:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    initCompany();
  }, [initialCompanyId, mockMode]);

  // Derived state: addresses
  const addresses = useMemo(() => company?.addresses ?? [], [company]);

  // Derived state: default billing address
  const defaultBillingAddress = useMemo(
    () => addresses.find((a) => a.type === 'billing' && a.isDefault) ?? null,
    [addresses]
  );

  // Derived state: default shipping address
  const defaultShippingAddress = useMemo(
    () => addresses.find((a) => a.type === 'shipping' && a.isDefault) ?? null,
    [addresses]
  );

  // Derived state: credit info
  const creditInfo = useMemo<CreditInfo | null>(() => {
    if (!company) return null;
    const limit = company.creditLimit ?? 0;
    const used = company.creditUsed ?? 0;
    const available = company.creditAvailable ?? 0;
    return {
      limit,
      used,
      available,
      utilizationPercent: limit > 0 ? Math.round((used / limit) * 100) : 0,
      currency: company.settings?.defaultCurrency ?? 'EUR',
    };
  }, [company]);

  // Derived state: has credit available
  const hasCreditAvailable = useMemo(() => {
    if (!company || !company.settings?.allowCreditPurchases) return false;
    return (company.creditAvailable ?? 0) > 0;
  }, [company]);

  // Derived state: tier
  const tier = company?.tier ?? null;

  // Refresh company data
  const refreshCompany = useCallback(async () => {
    if (!company) return;
    setIsLoading(true);
    try {
      if (mockMode) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        // In real implementation, fetch fresh data
      } else {
        // TODO: Fetch from API
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [company, mockMode]);

  // Switch company
  const switchCompany = useCallback(async (companyId: string) => {
    setIsLoading(true);
    try {
      if (mockMode) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        // In real implementation, fetch different company
        setCompany({ ...mockCompany, id: companyId });
      } else {
        // TODO: Fetch from API
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [mockMode]);

  // Clear company context
  const clearCompany = useCallback(() => {
    setCompany(null);
    setError(null);
  }, []);

  // Update company settings
  const updateSettings = useCallback(
    async (settings: Partial<Company['settings']>) => {
      if (!company) return;
      try {
        if (mockMode) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setCompany((prev) =>
            prev
              ? {
                  ...prev,
                  settings: { ...prev.settings, ...settings },
                  updatedAt: new Date().toISOString(),
                }
              : null
          );
        } else {
          // TODO: Call API
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [company, mockMode]
  );

  // Add address
  const addAddress = useCallback(
    async (address: Omit<CompanyAddress, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!company) return;
      try {
        if (mockMode) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          const newAddress: CompanyAddress = {
            ...address,
            id: `addr_${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setCompany((prev) =>
            prev
              ? {
                  ...prev,
                  addresses: [...(prev.addresses ?? []), newAddress],
                  updatedAt: new Date().toISOString(),
                }
              : null
          );
        } else {
          // TODO: Call API
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [company, mockMode]
  );

  // Update address
  const updateAddress = useCallback(
    async (addressId: string, updates: Partial<CompanyAddress>) => {
      if (!company) return;
      try {
        if (mockMode) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setCompany((prev) =>
            prev
              ? {
                  ...prev,
                  addresses: prev.addresses?.map((a) =>
                    a.id === addressId
                      ? { ...a, ...updates, updatedAt: new Date().toISOString() }
                      : a
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : null
          );
        } else {
          // TODO: Call API
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [company, mockMode]
  );

  // Delete address
  const deleteAddress = useCallback(
    async (addressId: string) => {
      if (!company) return;
      try {
        if (mockMode) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setCompany((prev) =>
            prev
              ? {
                  ...prev,
                  addresses: prev.addresses?.filter((a) => a.id !== addressId),
                  updatedAt: new Date().toISOString(),
                }
              : null
          );
        } else {
          // TODO: Call API
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [company, mockMode]
  );

  // Set default address
  const setDefaultAddress = useCallback(
    async (addressId: string, type: 'billing' | 'shipping') => {
      if (!company) return;
      try {
        if (mockMode) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setCompany((prev) =>
            prev
              ? {
                  ...prev,
                  addresses: prev.addresses?.map((a) => ({
                    ...a,
                    isDefault: a.id === addressId && a.type === type ? true : a.type === type ? false : a.isDefault,
                    updatedAt: a.id === addressId ? new Date().toISOString() : a.updatedAt,
                  })),
                  updatedAt: new Date().toISOString(),
                }
              : null
          );
        } else {
          // TODO: Call API
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [company, mockMode]
  );

  // Memoize context value
  const value = useMemo<CompanyContextValue>(
    () => ({
      company,
      isLoading,
      error,
      addresses,
      defaultBillingAddress,
      defaultShippingAddress,
      creditInfo,
      hasCreditAvailable,
      tier,
      refreshCompany,
      switchCompany,
      clearCompany,
      updateSettings,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
    }),
    [
      company,
      isLoading,
      error,
      addresses,
      defaultBillingAddress,
      defaultShippingAddress,
      creditInfo,
      hasCreditAvailable,
      tier,
      refreshCompany,
      switchCompany,
      clearCompany,
      updateSettings,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
    ]
  );

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to access company context
 *
 * @throws Error if used outside of CompanyProvider
 */
export function useCompany(): CompanyContextValue {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}

/**
 * Hook to access just the credit information
 */
export function useCreditInfo(): CreditInfo | null {
  const { creditInfo } = useCompany();
  return creditInfo;
}

/**
 * Hook to access company addresses
 */
export function useCompanyAddresses() {
  const { addresses, defaultBillingAddress, defaultShippingAddress, addAddress, updateAddress, deleteAddress, setDefaultAddress } =
    useCompany();
  return {
    addresses,
    defaultBillingAddress,
    defaultShippingAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };
}

export default CompanyProvider;
