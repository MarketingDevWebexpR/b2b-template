/**
 * useBarcodeScanner Hook
 * Manages camera permissions, scan state, and product lookup for barcode scanning
 * Supports QR codes, EAN-13, EAN-8, UPC-A, and Code 128
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Camera, CameraView, BarcodeScanningResult, BarcodeType } from 'expo-camera';
import { api } from '../lib/api';
import type { Product } from '@bijoux/types';

// Supported barcode types for jewelry product scanning
export const SUPPORTED_BARCODE_TYPES: BarcodeType[] = [
  'qr',
  'ean13',
  'ean8',
  'upc_a',
  'code128',
];

export interface ScanResult {
  type: BarcodeScanningResult['type'];
  data: string;
  timestamp: number;
}

export interface ProductLookupResult {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseBarcodeScanner {
  // Permission state
  hasPermission: boolean | null;
  isPermissionLoading: boolean;
  requestPermission: () => Promise<boolean>;

  // Scan state
  isScanning: boolean;
  lastScan: ScanResult | null;
  scanCount: number;

  // Product lookup
  lookupResult: ProductLookupResult;

  // Actions
  handleBarcodeScan: (result: BarcodeScanningResult) => void;
  resetScan: () => void;
  startScanning: () => void;
  stopScanning: () => void;
  lookupProductByBarcode: (barcode: string) => Promise<Product | null>;
}

// Debounce configuration
const SCAN_DEBOUNCE_MS = 1500;
const SAME_CODE_COOLDOWN_MS = 3000;

export function useBarcodeScanner(): UseBarcodeScanner {
  // Permission state
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isPermissionLoading, setIsPermissionLoading] = useState(true);

  // Scan state
  const [isScanning, setIsScanning] = useState(true);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [scanCount, setScanCount] = useState(0);

  // Product lookup state
  const [lookupResult, setLookupResult] = useState<ProductLookupResult>({
    product: null,
    isLoading: false,
    error: null,
  });

  // Refs for debouncing
  const lastScanTimeRef = useRef<number>(0);
  const lastScannedCodeRef = useRef<string>('');
  const isProcessingRef = useRef<boolean>(false);

  const checkPermission = useCallback(async () => {
    setIsPermissionLoading(true);
    try {
      const { status } = await Camera.getCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (error) {
      console.error('Error checking camera permission:', error);
      setHasPermission(false);
    } finally {
      setIsPermissionLoading(false);
    }
  }, []);

  // Check and request camera permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    setIsPermissionLoading(true);
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setHasPermission(false);
      return false;
    } finally {
      setIsPermissionLoading(false);
    }
  }, []);

  // Product lookup by barcode/EAN
  const lookupProductByBarcode = useCallback(async (barcode: string): Promise<Product | null> => {
    setLookupResult({
      product: null,
      isLoading: true,
      error: null,
    });

    try {
      // Fetch all products and search by EAN/barcode
      const products = await api.getProducts();

      // Search by EAN code
      let product = products.find(
        (p) => p.ean?.toLowerCase() === barcode.toLowerCase()
      );

      // If not found by EAN, try by reference (for QR codes that might contain reference)
      if (!product) {
        product = products.find(
          (p) => p.reference?.toLowerCase() === barcode.toLowerCase()
        );
      }

      // If still not found, try by ID
      if (!product) {
        product = products.find(
          (p) => p.id?.toLowerCase() === barcode.toLowerCase()
        );
      }

      setLookupResult({
        product: product || null,
        isLoading: false,
        error: product ? null : 'Produit non trouvé',
      });

      return product || null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de recherche';
      setLookupResult({
        product: null,
        isLoading: false,
        error: errorMessage,
      });
      return null;
    }
  }, []);

  // Handle barcode scan with debouncing
  const handleBarcodeScan = useCallback(
    (result: BarcodeScanningResult) => {
      const now = Date.now();
      const { type, data } = result;

      // Check if we're already processing
      if (isProcessingRef.current) {
        return;
      }

      // Check debounce timing
      if (now - lastScanTimeRef.current < SCAN_DEBOUNCE_MS) {
        return;
      }

      // Check if same code was scanned recently
      if (
        data === lastScannedCodeRef.current &&
        now - lastScanTimeRef.current < SAME_CODE_COOLDOWN_MS
      ) {
        return;
      }

      // Validate barcode type
      if (!(SUPPORTED_BARCODE_TYPES as readonly string[]).includes(type)) {
        return;
      }

      // Mark as processing
      isProcessingRef.current = true;
      lastScanTimeRef.current = now;
      lastScannedCodeRef.current = data;

      // Update scan state
      const scanResult: ScanResult = {
        type,
        data,
        timestamp: now,
      };

      setLastScan(scanResult);
      setScanCount((prev) => prev + 1);
      setIsScanning(false);

      // Lookup product
      lookupProductByBarcode(data).finally(() => {
        isProcessingRef.current = false;
      });
    },
    [lookupProductByBarcode]
  );

  // Reset scan to allow new scanning
  const resetScan = useCallback(() => {
    setLastScan(null);
    setLookupResult({
      product: null,
      isLoading: false,
      error: null,
    });
    lastScannedCodeRef.current = '';
    setIsScanning(true);
  }, []);

  // Control scanning state
  const startScanning = useCallback(() => {
    setIsScanning(true);
  }, []);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
  }, []);

  return {
    // Permission state
    hasPermission,
    isPermissionLoading,
    requestPermission,

    // Scan state
    isScanning,
    lastScan,
    scanCount,

    // Product lookup
    lookupResult,

    // Actions
    handleBarcodeScan,
    resetScan,
    startScanning,
    stopScanning,
    lookupProductByBarcode,
  };
}

export default useBarcodeScanner;
