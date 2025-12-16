/**
 * B2B Formatting Utilities
 *
 * Centralized formatting functions for currency, dates, numbers,
 * and status labels/colors used across B2B pages.
 *
 * All labels are in French (fr-FR locale).
 *
 * @example
 * ```tsx
 * import {
 *   formatCurrency,
 *   formatDate,
 *   formatRelativeDate,
 *   getQuoteStatusLabel,
 *   getQuoteStatusColor,
 * } from '@/lib/formatters';
 *
 * // Currency: "1 234,56 EUR"
 * formatCurrency(1234.56);
 *
 * // Date: "15 dec. 2024"
 * formatDate('2024-12-15');
 *
 * // Relative: "Il y a 2 jours"
 * formatRelativeDate('2024-12-13');
 * ```
 */

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

/**
 * Format a number as currency using French locale
 *
 * @param amount - The numeric amount to format
 * @param currency - ISO 4217 currency code (default: 'EUR')
 * @returns Formatted currency string (e.g., "1 234,56 EUR")
 *
 * @example
 * formatCurrency(1234.56) // "1 234,56 EUR"
 * formatCurrency(1234.56, 'USD') // "1 234,56 $US"
 */
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount);
}

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format a date string or Date object using French locale
 *
 * @param date - Date string (ISO 8601) or Date object
 * @param options - Optional Intl.DateTimeFormatOptions to customize output
 * @returns Formatted date string (e.g., "15 dec. 2024")
 *
 * @example
 * formatDate('2024-12-15') // "15 dec. 2024"
 * formatDate(new Date(), { weekday: 'long' }) // "dimanche 15 dec. 2024"
 */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };

  return dateObj.toLocaleDateString('fr-FR', { ...defaultOptions, ...options });
}

/**
 * Format a date as a relative time string in French
 *
 * @param date - Date string (ISO 8601) or Date object
 * @returns Relative time string (e.g., "Il y a 2 jours", "Hier")
 *
 * @example
 * formatRelativeDate('2024-12-13') // "Il y a 2 jours" (if today is Dec 15)
 * formatRelativeDate(new Date()) // "Il y a moins d'une heure"
 */
export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Handle future dates
  if (diffMs < 0) {
    const futureDays = Math.abs(diffDays);
    if (futureDays === 0) return "Aujourd'hui";
    if (futureDays === 1) return 'Demain';
    if (futureDays < 7) return `Dans ${futureDays} jours`;
    return formatDate(dateObj);
  }

  // Past dates
  if (diffMinutes < 1) return "A l'instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  if (diffHours < 1) return "Il y a moins d'une heure";
  if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
  }

  return formatDate(dateObj);
}

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

/**
 * Format a number using French locale with optional decimal places
 *
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string (e.g., "1 234,56")
 *
 * @example
 * formatNumber(1234.567) // "1 235"
 * formatNumber(1234.567, 2) // "1 234,57"
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a number as a percentage
 *
 * @param value - The decimal value to format (0.15 = 15%)
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string (e.g., "15 %")
 *
 * @example
 * formatPercent(0.15) // "15 %"
 * formatPercent(0.156, 1) // "15,6 %"
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// ============================================================================
// QUOTE STATUS
// ============================================================================

/**
 * Quote status labels in French
 */
const quoteStatusLabels: Record<string, string> = {
  draft: 'Brouillon',
  submitted: 'Soumis',
  under_review: "En cours d'examen",
  pending_info: 'Info demandee',
  responded: 'Reponse recue',
  negotiating: 'En negociation',
  accepted: 'Accepte',
  rejected: 'Refuse',
  expired: 'Expire',
  converted: 'Converti en commande',
  cancelled: 'Annule',
};

/**
 * Quote status colors (Tailwind CSS classes)
 */
const quoteStatusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-amber-100 text-amber-800',
  under_review: 'bg-amber-100 text-amber-800',
  pending_info: 'bg-orange-100 text-orange-800',
  responded: 'bg-blue-100 text-blue-800',
  negotiating: 'bg-purple-100 text-purple-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-600',
  converted: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

/**
 * Get the French label for a quote status
 *
 * @param status - The quote status string
 * @returns French label for the status
 *
 * @example
 * getQuoteStatusLabel('submitted') // "Soumis"
 * getQuoteStatusLabel('accepted') // "Accepte"
 */
export function getQuoteStatusLabel(status: string): string {
  return quoteStatusLabels[status] ?? status;
}

/**
 * Get Tailwind CSS color classes for a quote status badge
 *
 * @param status - The quote status string
 * @returns Tailwind CSS classes for background and text color
 *
 * @example
 * getQuoteStatusColor('submitted') // "bg-amber-100 text-amber-800"
 */
export function getQuoteStatusColor(status: string): string {
  return quoteStatusColors[status] ?? 'bg-gray-100 text-gray-800';
}

// ============================================================================
// APPROVAL STATUS
// ============================================================================

/**
 * Approval status labels in French
 */
const approvalStatusLabels: Record<string, string> = {
  pending: 'En attente',
  in_review: 'En cours',
  approved: 'Approuvee',
  rejected: 'Refusee',
  escalated: 'Escaladee',
  delegated: 'Deleguee',
  cancelled: 'Annulee',
};

/**
 * Approval status colors (Tailwind CSS classes)
 */
const approvalStatusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  in_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  escalated: 'bg-purple-100 text-purple-800',
  delegated: 'bg-indigo-100 text-indigo-800',
  cancelled: 'bg-gray-100 text-gray-500',
};

/**
 * Get the French label for an approval status
 *
 * @param status - The approval status string
 * @returns French label for the status
 *
 * @example
 * getApprovalStatusLabel('pending') // "En attente"
 * getApprovalStatusLabel('approved') // "Approuvee"
 */
export function getApprovalStatusLabel(status: string): string {
  return approvalStatusLabels[status] ?? status;
}

/**
 * Get Tailwind CSS color classes for an approval status badge
 *
 * @param status - The approval status string
 * @returns Tailwind CSS classes for background and text color
 *
 * @example
 * getApprovalStatusColor('pending') // "bg-amber-100 text-amber-800"
 */
export function getApprovalStatusColor(status: string): string {
  return approvalStatusColors[status] ?? 'bg-gray-100 text-gray-800';
}

// ============================================================================
// ORDER STATUS
// ============================================================================

/**
 * Order status labels in French
 */
const orderStatusLabels: Record<string, string> = {
  pending_approval: 'En attente approbation',
  pending_payment: 'Paiement en attente',
  processing: 'En preparation',
  shipped: 'Expediee',
  delivered: 'Livree',
  returned: 'Retournee',
  cancelled: 'Annulee',
};

/**
 * Order status colors (Tailwind CSS classes)
 */
const orderStatusColors: Record<string, string> = {
  pending_approval: 'bg-amber-100 text-amber-800',
  pending_payment: 'bg-orange-100 text-orange-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  returned: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-500',
};

/**
 * Get the French label for an order status
 *
 * @param status - The order status string
 * @returns French label for the status
 *
 * @example
 * getOrderStatusLabel('processing') // "En preparation"
 * getOrderStatusLabel('delivered') // "Livree"
 */
export function getOrderStatusLabel(status: string): string {
  return orderStatusLabels[status] ?? status;
}

/**
 * Get Tailwind CSS color classes for an order status badge
 *
 * @param status - The order status string
 * @returns Tailwind CSS classes for background and text color
 *
 * @example
 * getOrderStatusColor('delivered') // "bg-green-100 text-green-800"
 */
export function getOrderStatusColor(status: string): string {
  return orderStatusColors[status] ?? 'bg-gray-100 text-gray-800';
}

// ============================================================================
// UTILITY HELPERS
// ============================================================================

/**
 * Get initials from a full name
 *
 * @param name - Full name string
 * @returns Initials (e.g., "JD" for "Jean Dupont")
 *
 * @example
 * getInitials('Jean Dupont') // "JD"
 * getInitials('Marie') // "MA"
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Pluralize a French word based on count
 *
 * @param count - The count to check
 * @param singular - Singular form of the word
 * @param plural - Plural form of the word (default: singular + 's')
 * @returns The appropriate form based on count
 *
 * @example
 * pluralize(1, 'article') // "article"
 * pluralize(5, 'article') // "articles"
 * pluralize(2, 'jeu', 'jeux') // "jeux"
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  return count <= 1 ? singular : (plural ?? `${singular}s`);
}
