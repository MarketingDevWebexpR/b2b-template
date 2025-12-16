import { useCallback, useMemo, useState } from "react";
import type {
  CartItem,
  Quote,
  QuoteBuilderState,
  QuoteCustomer,
  QuoteDiscount,
  QuoteLineItem,
  QuotePricing,
  QuoteTerms,
  QuoteValidationError,
  TaxType,
  UseQuoteBuilderOptions,
  UseQuoteBuilderReturn,
} from "./types";

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Default quote number generator
 */
function defaultGenerateQuoteNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `Q-${year}${month}-${random}`;
}

/**
 * Calculate effective unit price after discount
 */
function calculateEffectiveUnitPrice(
  unitPrice: number,
  discount?: QuoteLineItem["discount"]
): number {
  if (!discount) return unitPrice;

  switch (discount.type) {
    case "percentage":
      return unitPrice * (1 - discount.value / 100);
    case "fixed":
      return Math.max(0, unitPrice - discount.value);
    case "per_unit":
      return Math.max(0, unitPrice - discount.value);
    default:
      return unitPrice;
  }
}

/**
 * Calculate line total
 */
function calculateLineTotal(
  effectiveUnitPrice: number,
  quantity: number,
  taxRate?: number,
  includeTax?: boolean
): { lineTotal: number; taxAmount: number } {
  const subtotal = effectiveUnitPrice * quantity;
  const taxAmount = taxRate ? subtotal * (taxRate / 100) : 0;
  const lineTotal = includeTax ? subtotal + taxAmount : subtotal;

  return { lineTotal, taxAmount };
}

/**
 * Calculate quote-level discount amount
 */
function calculateQuoteDiscount(
  subtotal: number,
  discount: QuoteDiscount
): number {
  if (discount.minOrderValue && subtotal < discount.minOrderValue) {
    return 0;
  }

  let amount: number;
  switch (discount.type) {
    case "percentage":
      amount = subtotal * (discount.value / 100);
      break;
    case "fixed":
      amount = discount.value;
      break;
    default:
      amount = 0;
  }

  if (discount.maxDiscount) {
    amount = Math.min(amount, discount.maxDiscount);
  }

  return amount;
}

/**
 * Calculate complete pricing summary
 */
function calculatePricing(
  items: QuoteLineItem[],
  discounts: QuoteDiscount[],
  shipping: number,
  taxRate: number,
  taxType: TaxType,
  currency: string
): QuotePricing {
  // Calculate subtotal from all line items
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  // Calculate total discounts
  const discountTotal = discounts.reduce(
    (sum, discount) => sum + calculateQuoteDiscount(subtotal, discount),
    0
  );

  // Discounted subtotal
  const discountedSubtotal = Math.max(0, subtotal - discountTotal);

  // Calculate tax
  let taxAmount = 0;
  if (taxType !== "exempt") {
    const taxableAmount = discountedSubtotal + shipping;
    taxAmount = taxableAmount * (taxRate / 100);
  }

  // Calculate total
  let total = discountedSubtotal + shipping;
  if (taxType === "excluded") {
    total += taxAmount;
  }

  return {
    subtotal,
    discountTotal,
    discountedSubtotal,
    shipping,
    taxType,
    taxRate,
    taxAmount,
    total,
    currency,
  };
}

/**
 * Create initial quote
 */
function createInitialQuote(
  options: UseQuoteBuilderOptions,
  generateQuoteNumber: () => string
): Quote {
  const now = new Date();
  const validityDays = options.validityDays ?? 30;
  const expirationDate = new Date(now);
  expirationDate.setDate(expirationDate.getDate() + validityDays);

  const initialQuote: Quote = {
    id: options.initialQuote?.id ?? generateId(),
    quoteNumber: options.initialQuote?.quoteNumber ?? generateQuoteNumber(),
    status: options.initialQuote?.status ?? "draft",
    customer: options.customer,
    items: options.initialQuote?.items ?? [],
    discounts: options.initialQuote?.discounts ?? [],
    pricing: options.initialQuote?.pricing ?? {
      subtotal: 0,
      discountTotal: 0,
      discountedSubtotal: 0,
      shipping: 0,
      taxType: options.taxType ?? "excluded",
      taxRate: options.taxRate ?? 20,
      taxAmount: 0,
      total: 0,
      currency: options.currency ?? "EUR",
    },
    terms: options.initialQuote?.terms ?? {
      paymentTerms: options.paymentTerms ?? "NET30",
      validityDays,
      expirationDate,
    },
    createdBy: options.initialQuote?.createdBy ?? {
      id: "",
      name: "",
      email: "",
    },
    createdAt: options.initialQuote?.createdAt ?? now,
    updatedAt: now,
    version: options.initialQuote?.version ?? 1,
  };

  // Add optional metadata only if present
  if (options.initialQuote?.metadata) {
    initialQuote.metadata = options.initialQuote.metadata;
  }

  return initialQuote;
}

/**
 * Validate quote
 */
function validateQuote(quote: Quote): QuoteValidationError[] {
  const errors: QuoteValidationError[] = [];

  // Validate items
  if (quote.items.length === 0) {
    errors.push({
      field: "items",
      message: "Quote must have at least one item",
      type: "error",
    });
  }

  // Validate quantities
  quote.items.forEach((item, index) => {
    if (item.quantity <= 0) {
      errors.push({
        field: `items[${index}].quantity`,
        message: `Item "${item.name}" must have a positive quantity`,
        type: "error",
      });
    }
    if (item.unitPrice < 0) {
      errors.push({
        field: `items[${index}].unitPrice`,
        message: `Item "${item.name}" cannot have a negative price`,
        type: "error",
      });
    }
  });

  // Validate customer
  if (!quote.customer.companyName) {
    errors.push({
      field: "customer.companyName",
      message: "Company name is required",
      type: "error",
    });
  }
  if (!quote.customer.email) {
    errors.push({
      field: "customer.email",
      message: "Customer email is required",
      type: "error",
    });
  }

  // Validate expiration
  if (quote.terms.expirationDate < new Date()) {
    errors.push({
      field: "terms.expirationDate",
      message: "Quote expiration date is in the past",
      type: "warning",
    });
  }

  return errors;
}

/**
 * Hook for quote building functionality
 *
 * Provides comprehensive quote construction from cart items
 * with support for discounts, taxes, and custom terms.
 *
 * @example
 * ```tsx
 * const {
 *   state,
 *   addItem,
 *   importFromCart,
 *   setShipping,
 *   save,
 *   send,
 * } = useQuoteBuilder({
 *   customer: selectedCustomer,
 *   currency: 'EUR',
 *   taxRate: 20,
 *   validityDays: 30,
 *   onSend: async (quote) => {
 *     await emailQuoteToCustomer(quote);
 *   },
 * });
 *
 * // Import from cart
 * importFromCart(cartItems);
 *
 * // Apply bulk discount
 * addDiscount({ type: 'percentage', value: 10, reason: 'Volume discount' });
 *
 * // Display quote
 * <QuotePreview
 *   items={state.quote.items}
 *   pricing={state.quote.pricing}
 *   onSend={send}
 * />
 * ```
 */
export function useQuoteBuilder(
  options: UseQuoteBuilderOptions
): UseQuoteBuilderReturn {
  const {
    customer,
    currency = "EUR",
    taxRate = 20,
    taxType = "excluded",
    autoCalculate = true,
    generateQuoteNumber = defaultGenerateQuoteNumber,
    onChange,
    onSave,
    onSend,
  } = options;

  const [quote, setQuote] = useState<Quote>(() =>
    createInitialQuote(options, generateQuoteNumber)
  );
  const [isDirty, setIsDirty] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Recalculate pricing
  const recalculatePricing = useCallback(
    (currentQuote: Quote): Quote => {
      const pricing = calculatePricing(
        currentQuote.items,
        currentQuote.discounts,
        currentQuote.pricing.shipping,
        currentQuote.pricing.taxRate,
        currentQuote.pricing.taxType,
        currentQuote.pricing.currency
      );

      return {
        ...currentQuote,
        pricing,
        updatedAt: new Date(),
      };
    },
    []
  );

  // Update quote with optional recalculation
  const updateQuote = useCallback(
    (updater: (prev: Quote) => Quote) => {
      setQuote((prev) => {
        let updated = updater(prev);

        if (autoCalculate) {
          updated = recalculatePricing(updated);
        }

        setIsDirty(true);
        onChange?.(updated);

        return updated;
      });
    },
    [autoCalculate, recalculatePricing, onChange]
  );

  // Calculate line item totals
  const calculateItemTotals = useCallback(
    (item: Partial<QuoteLineItem>): QuoteLineItem => {
      const unitPrice = item.unitPrice ?? 0;
      const quantity = item.quantity ?? 1;
      const effectiveUnitPrice = calculateEffectiveUnitPrice(
        unitPrice,
        item.discount
      );
      const { lineTotal, taxAmount: calculatedTaxAmount } = calculateLineTotal(
        effectiveUnitPrice,
        quantity,
        item.taxRate ?? taxRate,
        taxType === "included"
      );

      // Build result with only defined optional properties
      const result: QuoteLineItem = {
        id: item.id ?? generateId(),
        productId: item.productId ?? "",
        name: item.name ?? "",
        quantity,
        unitPrice,
        effectiveUnitPrice,
        lineTotal,
      };

      // Conditionally add optional properties
      if (item.description !== undefined) result.description = item.description;
      if (item.sku !== undefined) result.sku = item.sku;
      if (item.unit !== undefined) result.unit = item.unit;
      if (item.discount !== undefined) result.discount = item.discount;
      result.taxRate = item.taxRate ?? taxRate;
      result.taxAmount = calculatedTaxAmount;
      if (item.customizable !== undefined) result.customizable = item.customizable;
      if (item.customOptions !== undefined) result.customOptions = item.customOptions;
      if (item.leadTime !== undefined) result.leadTime = item.leadTime;
      if (item.notes !== undefined) result.notes = item.notes;
      if (item.cartItemId !== undefined) result.cartItemId = item.cartItemId;

      return result;
    },
    [taxRate, taxType]
  );

  // Validation
  const errors = useMemo(() => validateQuote(quote), [quote]);
  const isValid = errors.filter((e) => e.type === "error").length === 0;

  // State
  const state: QuoteBuilderState = useMemo(
    () => ({
      quote,
      isDirty,
      errors,
      isValid,
      selectedItems,
    }),
    [quote, isDirty, errors, isValid, selectedItems]
  );

  // Line item actions
  const addItem = useCallback(
    (item: Omit<QuoteLineItem, "id" | "effectiveUnitPrice" | "lineTotal">) => {
      const newItem = calculateItemTotals(item);
      updateQuote((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
      }));
    },
    [calculateItemTotals, updateQuote]
  );

  const updateItem = useCallback(
    (itemId: string, updates: Partial<QuoteLineItem>) => {
      updateQuote((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === itemId
            ? calculateItemTotals({ ...item, ...updates })
            : item
        ),
      }));
    },
    [calculateItemTotals, updateQuote]
  );

  const removeItem = useCallback(
    (itemId: string) => {
      updateQuote((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== itemId),
      }));
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    },
    [updateQuote]
  );

  const duplicateItem = useCallback(
    (itemId: string) => {
      const item = quote.items.find((i) => i.id === itemId);
      if (item) {
        const newItem = calculateItemTotals({
          ...item,
          id: generateId(),
          notes: `Copy of: ${item.name}`,
        });
        updateQuote((prev) => {
          const index = prev.items.findIndex((i) => i.id === itemId);
          const newItems = [...prev.items];
          newItems.splice(index + 1, 0, newItem);
          return { ...prev, items: newItems };
        });
      }
    },
    [quote.items, calculateItemTotals, updateQuote]
  );

  const setItemQuantity = useCallback(
    (itemId: string, quantity: number) => {
      updateItem(itemId, { quantity: Math.max(1, quantity) });
    },
    [updateItem]
  );

  const applyItemDiscount = useCallback(
    (itemId: string, discount: QuoteLineItem["discount"]) => {
      if (discount) {
        updateItem(itemId, { discount });
      }
    },
    [updateItem]
  );

  const clearItemDiscount = useCallback(
    (itemId: string) => {
      // To clear discount, we need to update the item without the discount property
      updateQuote((prev) => ({
        ...prev,
        items: prev.items.map((item) => {
          if (item.id !== itemId) return item;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { discount: _, ...itemWithoutDiscount } = item;
          return calculateItemTotals(itemWithoutDiscount);
        }),
      }));
    },
    [updateQuote, calculateItemTotals]
  );

  const reorderItems = useCallback(
    (fromIndex: number, toIndex: number) => {
      updateQuote((prev) => {
        // Validate indices
        if (fromIndex < 0 || fromIndex >= prev.items.length) return prev;
        if (toIndex < 0 || toIndex > prev.items.length) return prev;

        const newItems = [...prev.items];
        // splice returns array, destructure to get first element
        const [removed] = newItems.splice(fromIndex, 1);
        // TypeScript control flow analysis with destructuring
        if (removed === undefined) return prev;
        newItems.splice(toIndex, 0, removed);
        return { ...prev, items: newItems };
      });
    },
    [updateQuote]
  );

  // Helper to convert cart item to partial line item
  const cartItemToPartial = useCallback(
    (cartItem: CartItem): Partial<QuoteLineItem> => {
      const partial: Partial<QuoteLineItem> = {
        productId: cartItem.productId,
        name: cartItem.name,
        quantity: cartItem.quantity,
        unitPrice: cartItem.unitPrice,
        cartItemId: cartItem.id,
      };
      if (cartItem.description) partial.description = cartItem.description;
      if (cartItem.sku) partial.sku = cartItem.sku;
      if (cartItem.customOptions) partial.customOptions = cartItem.customOptions;
      return partial;
    },
    []
  );

  // Cart conversion
  const importFromCart = useCallback(
    (cartItems: CartItem[]) => {
      const newItems = cartItems.map((cartItem) =>
        calculateItemTotals(cartItemToPartial(cartItem))
      );

      updateQuote((prev) => ({
        ...prev,
        items: [...prev.items, ...newItems],
      }));
    },
    [calculateItemTotals, cartItemToPartial, updateQuote]
  );

  const replaceFromCart = useCallback(
    (cartItems: CartItem[]) => {
      const newItems = cartItems.map((cartItem) =>
        calculateItemTotals(cartItemToPartial(cartItem))
      );

      updateQuote((prev) => ({
        ...prev,
        items: newItems,
      }));
      setSelectedItems(new Set());
    },
    [calculateItemTotals, updateQuote]
  );

  // Quote-level discount actions
  const addDiscount = useCallback(
    (discount: Omit<QuoteDiscount, "id">) => {
      const newDiscount: QuoteDiscount = {
        ...discount,
        id: generateId(),
      };
      updateQuote((prev) => ({
        ...prev,
        discounts: [...prev.discounts, newDiscount],
      }));
    },
    [updateQuote]
  );

  const removeDiscount = useCallback(
    (discountId: string) => {
      updateQuote((prev) => ({
        ...prev,
        discounts: prev.discounts.filter((d) => d.id !== discountId),
      }));
    },
    [updateQuote]
  );

  const clearDiscounts = useCallback(() => {
    updateQuote((prev) => ({
      ...prev,
      discounts: [],
    }));
  }, [updateQuote]);

  // Pricing actions
  const setShipping = useCallback(
    (amount: number) => {
      updateQuote((prev) => ({
        ...prev,
        pricing: { ...prev.pricing, shipping: Math.max(0, amount) },
      }));
    },
    [updateQuote]
  );

  const setTaxRate = useCallback(
    (rate: number) => {
      updateQuote((prev) => ({
        ...prev,
        pricing: { ...prev.pricing, taxRate: Math.max(0, rate) },
      }));
    },
    [updateQuote]
  );

  const setTaxType = useCallback(
    (type: TaxType) => {
      updateQuote((prev) => ({
        ...prev,
        pricing: { ...prev.pricing, taxType: type },
      }));
    },
    [updateQuote]
  );

  const recalculate = useCallback(() => {
    setQuote((prev) => recalculatePricing(prev));
  }, [recalculatePricing]);

  // Terms actions
  const updateTerms = useCallback(
    (terms: Partial<QuoteTerms>) => {
      updateQuote((prev) => ({
        ...prev,
        terms: { ...prev.terms, ...terms },
      }));
    },
    [updateQuote]
  );

  const setExpirationDate = useCallback(
    (date: Date) => {
      updateTerms({ expirationDate: date });
    },
    [updateTerms]
  );

  const setValidityDays = useCallback(
    (days: number) => {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + days);
      updateTerms({ validityDays: days, expirationDate });
    },
    [updateTerms]
  );

  // Customer actions
  const updateCustomer = useCallback(
    (customerUpdates: Partial<QuoteCustomer>) => {
      updateQuote((prev) => ({
        ...prev,
        customer: { ...prev.customer, ...customerUpdates },
      }));
    },
    [updateQuote]
  );

  // Selection actions
  const selectItem = useCallback((itemId: string) => {
    setSelectedItems((prev) => new Set(prev).add(itemId));
  }, []);

  const deselectItem = useCallback((itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  }, []);

  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const selectAllItems = useCallback(() => {
    setSelectedItems(new Set(quote.items.map((item) => item.id)));
  }, [quote.items]);

  const deselectAllItems = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const removeSelectedItems = useCallback(() => {
    updateQuote((prev) => ({
      ...prev,
      items: prev.items.filter((item) => !selectedItems.has(item.id)),
    }));
    setSelectedItems(new Set());
  }, [selectedItems, updateQuote]);

  const applyDiscountToSelected = useCallback(
    (discount: QuoteLineItem["discount"]) => {
      if (!discount) return;
      updateQuote((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          selectedItems.has(item.id)
            ? calculateItemTotals({ ...item, discount })
            : item
        ),
      }));
    },
    [selectedItems, calculateItemTotals, updateQuote]
  );

  // Quote actions
  const save = useCallback((): Quote => {
    const savedQuote = recalculatePricing(quote);
    setQuote(savedQuote);
    setIsDirty(false);
    onSave?.(savedQuote);
    return savedQuote;
  }, [quote, recalculatePricing, onSave]);

  const send = useCallback(() => {
    const sentQuote: Quote = {
      ...recalculatePricing(quote),
      status: "sent",
      sentAt: new Date(),
    };
    setQuote(sentQuote);
    setIsDirty(false);
    onSend?.(sentQuote);
  }, [quote, recalculatePricing, onSend]);

  const createRevision = useCallback(() => {
    // Create revision without the date properties (they will be omitted)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sentAt, viewedAt, respondedAt, ...baseQuote } = quote;
    const revision: Quote = {
      ...baseQuote,
      id: generateId(),
      quoteNumber: generateQuoteNumber(),
      status: "draft",
      version: quote.version + 1,
      originalQuoteId: quote.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setQuote(revision);
    setIsDirty(true);
  }, [quote, generateQuoteNumber]);

  const reset = useCallback(() => {
    setQuote(createInitialQuote(options, generateQuoteNumber));
    setIsDirty(false);
    setSelectedItems(new Set());
  }, [options, generateQuoteNumber]);

  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  const markClean = useCallback(() => {
    setIsDirty(false);
  }, []);

  // Validation
  const validate = useCallback(() => validateQuote(quote), [quote]);

  const getItem = useCallback(
    (itemId: string) => quote.items.find((item) => item.id === itemId),
    [quote.items]
  );

  const hasItem = useCallback(
    (itemId: string) => quote.items.some((item) => item.id === itemId),
    [quote.items]
  );

  return {
    state,

    // Line item actions
    addItem,
    updateItem,
    removeItem,
    duplicateItem,
    setItemQuantity,
    applyItemDiscount,
    clearItemDiscount,
    reorderItems,

    // Cart conversion
    importFromCart,
    replaceFromCart,

    // Quote-level discount actions
    addDiscount,
    removeDiscount,
    clearDiscounts,

    // Pricing actions
    setShipping,
    setTaxRate,
    setTaxType,
    recalculate,

    // Terms actions
    updateTerms,
    setExpirationDate,
    setValidityDays,

    // Customer actions
    updateCustomer,

    // Selection actions
    selectItem,
    deselectItem,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    removeSelectedItems,
    applyDiscountToSelected,

    // Quote actions
    save,
    send,
    createRevision,
    reset,
    markDirty,
    markClean,

    // Validation
    validate,
    getItem,
    hasItem,
  };
}
