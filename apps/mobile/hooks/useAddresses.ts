/**
 * useAddresses Hook
 *
 * Manages saved delivery addresses using AsyncStorage.
 * Features:
 * - Persist addresses to local storage
 * - Add/update/delete addresses
 * - Set default address
 * - Haptic feedback on actions
 *
 * @example
 * ```tsx
 * const { addresses, defaultAddress, isLoading, actions } = useAddresses();
 *
 * // Add new address
 * await actions.addAddress({
 *   label: 'Maison',
 *   firstName: 'Marie',
 *   lastName: 'Dupont',
 *   address: '15 Rue de la Paix',
 *   city: 'Paris',
 *   postalCode: '75002',
 *   country: 'France',
 *   phone: '+33 1 23 45 67 89',
 * });
 *
 * // Set as default
 * await actions.setDefaultAddress(address.id);
 * ```
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hapticFeedback } from '../constants/haptics';

// ============================================
// Types
// ============================================

/**
 * A saved delivery address
 */
export interface SavedAddress {
  /** Unique identifier */
  readonly id: string;
  /** Label for the address (e.g., "Maison", "Bureau") */
  readonly label: string;
  /** First name */
  readonly firstName: string;
  /** Last name */
  readonly lastName: string;
  /** Street address */
  readonly address: string;
  /** Additional address line (optional) */
  readonly address2?: string;
  /** City */
  readonly city: string;
  /** Postal/ZIP code */
  readonly postalCode: string;
  /** Country */
  readonly country: string;
  /** Phone number */
  readonly phone: string;
  /** Whether this is the default address */
  readonly isDefault: boolean;
  /** Timestamp when the address was created */
  readonly createdAt: number;
  /** Timestamp when the address was last updated */
  readonly updatedAt: number;
}

/**
 * Input for creating a new address (without id, timestamps, and isDefault)
 */
export interface AddressInput {
  readonly label: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly address: string;
  readonly address2?: string;
  readonly city: string;
  readonly postalCode: string;
  readonly country: string;
  readonly phone: string;
}

/**
 * Input for updating an existing address
 */
export type AddressUpdateInput = Partial<AddressInput>;

/**
 * State returned by the useAddresses hook
 */
export interface AddressesState {
  /** Array of saved addresses */
  readonly addresses: readonly SavedAddress[];
  /** The default address, if any */
  readonly defaultAddress: SavedAddress | null;
  /** Whether addresses are currently being loaded */
  readonly isLoading: boolean;
  /** Error message if an operation failed */
  readonly error: string | null;
}

/**
 * Actions available from the useAddresses hook
 */
export interface AddressesActions {
  /** Add a new address */
  addAddress: (address: AddressInput, setAsDefault?: boolean) => Promise<SavedAddress>;
  /** Update an existing address */
  updateAddress: (id: string, updates: AddressUpdateInput) => Promise<SavedAddress | null>;
  /** Delete an address */
  deleteAddress: (id: string) => Promise<boolean>;
  /** Set an address as the default */
  setDefaultAddress: (id: string) => Promise<boolean>;
  /** Get an address by ID */
  getAddressById: (id: string) => SavedAddress | undefined;
  /** Refresh addresses from storage */
  refresh: () => Promise<void>;
  /** Clear all addresses */
  clearAllAddresses: () => Promise<void>;
}

/**
 * Configuration options for useAddresses
 */
export interface UseAddressesOptions {
  /** Storage key for addresses (default: '@bijoux/saved_addresses') */
  readonly storageKey?: string;
  /** Whether to load mock data if no addresses exist (default: true in dev) */
  readonly loadMockData?: boolean;
  /** Callback when addresses change */
  readonly onChange?: (addresses: readonly SavedAddress[]) => void;
  /** Enable haptic feedback (default: true) */
  readonly enableHaptics?: boolean;
}

// ============================================
// Constants
// ============================================

const DEFAULT_STORAGE_KEY = '@bijoux/saved_addresses';

/**
 * Mock addresses for development
 */
const MOCK_ADDRESSES: readonly SavedAddress[] = [
  {
    id: 'addr_mock_1',
    label: 'Maison',
    firstName: 'Marie',
    lastName: 'Dupont',
    address: '15 Rue de la Paix',
    city: 'Paris',
    postalCode: '75002',
    country: 'France',
    phone: '+33 1 23 45 67 89',
    isDefault: true,
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
  },
  {
    id: 'addr_mock_2',
    label: 'Bureau',
    firstName: 'Marie',
    lastName: 'Dupont',
    address: '8 Avenue des Champs-Élysées',
    address2: '3ème étage, Bureau 305',
    city: 'Paris',
    postalCode: '75008',
    country: 'France',
    phone: '+33 1 98 76 54 32',
    isDefault: false,
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
    updatedAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'addr_mock_3',
    label: 'Parents',
    firstName: 'Jean',
    lastName: 'Dupont',
    address: '42 Boulevard Haussmann',
    city: 'Lyon',
    postalCode: '69001',
    country: 'France',
    phone: '+33 4 12 34 56 78',
    isDefault: false,
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 days ago
    updatedAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
  },
] as const;

// ============================================
// Utility Functions
// ============================================

/**
 * Generate a unique ID for a new address
 */
function generateAddressId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `addr_${timestamp}_${randomPart}`;
}

/**
 * Validate an address input
 */
function validateAddressInput(input: AddressInput): string | null {
  if (!input.label?.trim()) {
    return 'Le libellé est requis';
  }
  if (!input.firstName?.trim()) {
    return 'Le prénom est requis';
  }
  if (!input.lastName?.trim()) {
    return 'Le nom est requis';
  }
  if (!input.address?.trim()) {
    return 'L\'adresse est requise';
  }
  if (!input.city?.trim()) {
    return 'La ville est requise';
  }
  if (!input.postalCode?.trim()) {
    return 'Le code postal est requis';
  }
  if (!input.country?.trim()) {
    return 'Le pays est requis';
  }
  if (!input.phone?.trim()) {
    return 'Le téléphone est requis';
  }
  return null;
}

// ============================================
// Hook Implementation
// ============================================

/**
 * Custom hook for managing saved delivery addresses with AsyncStorage.
 *
 * @param options - Configuration options
 * @returns Addresses state and actions
 */
export function useAddresses(options: UseAddressesOptions = {}): AddressesState & {
  actions: AddressesActions;
} {
  const {
    storageKey = DEFAULT_STORAGE_KEY,
    loadMockData = __DEV__,
    onChange,
    enableHaptics = true,
  } = options;

  // State
  const [addresses, setAddresses] = useState<readonly SavedAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track if mounted for async operations
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Trigger haptic feedback if enabled
   */
  const triggerHaptic = useCallback(
    (type: 'success' | 'error' | 'selection') => {
      if (!enableHaptics) return;

      switch (type) {
        case 'success':
          hapticFeedback.addToCartSuccess();
          break;
        case 'error':
          hapticFeedback.error();
          break;
        case 'selection':
          hapticFeedback.quantityChange();
          break;
      }
    },
    [enableHaptics]
  );

  /**
   * Load addresses from AsyncStorage
   */
  const loadAddresses = useCallback(async (): Promise<readonly SavedAddress[]> => {
    try {
      const stored = await AsyncStorage.getItem(storageKey);
      if (!stored) {
        // If no stored addresses and mock data is enabled, return mock data
        if (loadMockData) {
          return MOCK_ADDRESSES;
        }
        return [];
      }

      const parsed: SavedAddress[] = JSON.parse(stored);

      // Validate entries
      const validEntries = parsed.filter(
        (entry): entry is SavedAddress =>
          typeof entry.id === 'string' &&
          typeof entry.label === 'string' &&
          typeof entry.firstName === 'string' &&
          typeof entry.lastName === 'string' &&
          typeof entry.address === 'string' &&
          typeof entry.city === 'string' &&
          typeof entry.postalCode === 'string' &&
          typeof entry.country === 'string' &&
          typeof entry.phone === 'string' &&
          typeof entry.isDefault === 'boolean'
      );

      // Sort by createdAt (newest first), with default address at the top
      return validEntries.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return b.createdAt - a.createdAt;
      });
    } catch (err) {
      console.error('Failed to load addresses:', err);
      throw err;
    }
  }, [storageKey, loadMockData]);

  /**
   * Save addresses to AsyncStorage
   */
  const saveAddresses = useCallback(
    async (addressList: readonly SavedAddress[]): Promise<void> => {
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(addressList));
      } catch (err) {
        console.error('Failed to save addresses:', err);
        throw err;
      }
    },
    [storageKey]
  );

  /**
   * Refresh addresses from storage
   */
  const refresh = useCallback(async (): Promise<void> => {
    if (!isMountedRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const loadedAddresses = await loadAddresses();
      if (isMountedRef.current) {
        setAddresses(loadedAddresses);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(
          err instanceof Error ? err.message : 'Erreur lors du chargement des adresses'
        );
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [loadAddresses]);

  /**
   * Add a new address
   */
  const addAddress = useCallback(
    async (input: AddressInput, setAsDefault = false): Promise<SavedAddress> => {
      // Validate input
      const validationError = validateAddressInput(input);
      if (validationError) {
        triggerHaptic('error');
        throw new Error(validationError);
      }

      try {
        const currentAddresses = await loadAddresses();
        const now = Date.now();

        // Create new address
        const newAddress: SavedAddress = {
          id: generateAddressId(),
          label: input.label.trim(),
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          address: input.address.trim(),
          address2: input.address2?.trim(),
          city: input.city.trim(),
          postalCode: input.postalCode.trim(),
          country: input.country.trim(),
          phone: input.phone.trim(),
          isDefault: setAsDefault || currentAddresses.length === 0,
          createdAt: now,
          updatedAt: now,
        };

        // If setting as default, unset other defaults
        let updatedAddresses: SavedAddress[];
        if (newAddress.isDefault) {
          updatedAddresses = currentAddresses.map((addr) => ({
            ...addr,
            isDefault: false,
            updatedAt: addr.isDefault ? now : addr.updatedAt,
          }));
        } else {
          updatedAddresses = [...currentAddresses];
        }

        // Add new address at the beginning
        updatedAddresses = [newAddress, ...updatedAddresses];

        // Save to storage
        await saveAddresses(updatedAddresses);

        // Update state if still mounted
        if (isMountedRef.current) {
          setAddresses(updatedAddresses);
          onChange?.(updatedAddresses);
          triggerHaptic('success');
        }

        return newAddress;
      } catch (err) {
        console.error('Failed to add address:', err);
        triggerHaptic('error');
        if (isMountedRef.current) {
          setError(
            err instanceof Error ? err.message : 'Erreur lors de l\'ajout de l\'adresse'
          );
        }
        throw err;
      }
    },
    [loadAddresses, saveAddresses, onChange, triggerHaptic]
  );

  /**
   * Update an existing address
   */
  const updateAddress = useCallback(
    async (id: string, updates: AddressUpdateInput): Promise<SavedAddress | null> => {
      try {
        const currentAddresses = await loadAddresses();
        const addressIndex = currentAddresses.findIndex((addr) => addr.id === id);

        if (addressIndex === -1) {
          triggerHaptic('error');
          setError('Adresse non trouvée');
          return null;
        }

        const now = Date.now();
        const existingAddress = currentAddresses[addressIndex];

        // Create updated address
        const updatedAddress: SavedAddress = {
          ...existingAddress,
          label: updates.label?.trim() ?? existingAddress.label,
          firstName: updates.firstName?.trim() ?? existingAddress.firstName,
          lastName: updates.lastName?.trim() ?? existingAddress.lastName,
          address: updates.address?.trim() ?? existingAddress.address,
          address2: updates.address2?.trim() ?? existingAddress.address2,
          city: updates.city?.trim() ?? existingAddress.city,
          postalCode: updates.postalCode?.trim() ?? existingAddress.postalCode,
          country: updates.country?.trim() ?? existingAddress.country,
          phone: updates.phone?.trim() ?? existingAddress.phone,
          updatedAt: now,
        };

        // Replace address in list
        const updatedAddresses = [...currentAddresses];
        updatedAddresses[addressIndex] = updatedAddress;

        // Save to storage
        await saveAddresses(updatedAddresses);

        // Update state if still mounted
        if (isMountedRef.current) {
          setAddresses(updatedAddresses);
          onChange?.(updatedAddresses);
          triggerHaptic('success');
        }

        return updatedAddress;
      } catch (err) {
        console.error('Failed to update address:', err);
        triggerHaptic('error');
        if (isMountedRef.current) {
          setError(
            err instanceof Error
              ? err.message
              : 'Erreur lors de la mise à jour de l\'adresse'
          );
        }
        throw err;
      }
    },
    [loadAddresses, saveAddresses, onChange, triggerHaptic]
  );

  /**
   * Delete an address
   */
  const deleteAddress = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const currentAddresses = await loadAddresses();
        const addressToDelete = currentAddresses.find((addr) => addr.id === id);

        if (!addressToDelete) {
          triggerHaptic('error');
          setError('Adresse non trouvée');
          return false;
        }

        // Filter out the address
        let updatedAddresses = currentAddresses.filter((addr) => addr.id !== id);

        // If we deleted the default address, set the first remaining one as default
        if (addressToDelete.isDefault && updatedAddresses.length > 0) {
          const now = Date.now();
          updatedAddresses = updatedAddresses.map((addr, index) => ({
            ...addr,
            isDefault: index === 0,
            updatedAt: index === 0 ? now : addr.updatedAt,
          }));
        }

        // Save to storage
        await saveAddresses(updatedAddresses);

        // Update state if still mounted
        if (isMountedRef.current) {
          setAddresses(updatedAddresses);
          onChange?.(updatedAddresses);
          triggerHaptic('success');
        }

        return true;
      } catch (err) {
        console.error('Failed to delete address:', err);
        triggerHaptic('error');
        if (isMountedRef.current) {
          setError(
            err instanceof Error
              ? err.message
              : 'Erreur lors de la suppression de l\'adresse'
          );
        }
        return false;
      }
    },
    [loadAddresses, saveAddresses, onChange, triggerHaptic]
  );

  /**
   * Set an address as the default
   */
  const setDefaultAddress = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const currentAddresses = await loadAddresses();
        const addressExists = currentAddresses.some((addr) => addr.id === id);

        if (!addressExists) {
          triggerHaptic('error');
          setError('Adresse non trouvée');
          return false;
        }

        const now = Date.now();

        // Update all addresses, setting only the selected one as default
        const updatedAddresses = currentAddresses.map((addr) => ({
          ...addr,
          isDefault: addr.id === id,
          updatedAt: addr.id === id || addr.isDefault ? now : addr.updatedAt,
        }));

        // Save to storage
        await saveAddresses(updatedAddresses);

        // Update state if still mounted
        if (isMountedRef.current) {
          setAddresses(updatedAddresses);
          onChange?.(updatedAddresses);
          triggerHaptic('selection');
        }

        return true;
      } catch (err) {
        console.error('Failed to set default address:', err);
        triggerHaptic('error');
        if (isMountedRef.current) {
          setError(
            err instanceof Error
              ? err.message
              : 'Erreur lors de la définition de l\'adresse par défaut'
          );
        }
        return false;
      }
    },
    [loadAddresses, saveAddresses, onChange, triggerHaptic]
  );

  /**
   * Get an address by ID
   */
  const getAddressById = useCallback(
    (id: string): SavedAddress | undefined => {
      return addresses.find((addr) => addr.id === id);
    },
    [addresses]
  );

  /**
   * Clear all addresses
   */
  const clearAllAddresses = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(storageKey);

      // Update state if still mounted
      if (isMountedRef.current) {
        setAddresses([]);
        onChange?.([]);
        triggerHaptic('success');
      }
    } catch (err) {
      console.error('Failed to clear addresses:', err);
      triggerHaptic('error');
      if (isMountedRef.current) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erreur lors de la suppression des adresses'
        );
      }
    }
  }, [storageKey, onChange, triggerHaptic]);

  // Load addresses on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Compute the default address
  const defaultAddress = useMemo(
    () => addresses.find((addr) => addr.isDefault) ?? null,
    [addresses]
  );

  // Construct actions object
  const actions: AddressesActions = useMemo(
    () => ({
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      getAddressById,
      refresh,
      clearAllAddresses,
    }),
    [
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      getAddressById,
      refresh,
      clearAllAddresses,
    ]
  );

  return {
    addresses,
    defaultAddress,
    isLoading,
    error,
    actions,
  };
}

// ============================================
// Utility Exports
// ============================================

/**
 * Format an address for display (single line)
 *
 * @param address - The address to format
 * @returns Formatted address string
 */
export function formatAddressLine(address: SavedAddress): string {
  const parts = [
    address.address,
    address.address2,
    address.postalCode,
    address.city,
    address.country,
  ].filter(Boolean);

  return parts.join(', ');
}

/**
 * Format an address for display (multi-line)
 *
 * @param address - The address to format
 * @returns Array of address lines
 */
export function formatAddressMultiLine(address: SavedAddress): readonly string[] {
  const lines: string[] = [
    `${address.firstName} ${address.lastName}`,
    address.address,
  ];

  if (address.address2) {
    lines.push(address.address2);
  }

  lines.push(`${address.postalCode} ${address.city}`);
  lines.push(address.country);
  lines.push(address.phone);

  return lines;
}

/**
 * Get the mock addresses (useful for testing)
 */
export function getMockAddresses(): readonly SavedAddress[] {
  return MOCK_ADDRESSES;
}

export default useAddresses;
