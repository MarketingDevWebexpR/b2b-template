/**
 * B2B-specific Formatting Utilities
 *
 * Functions for formatting currencies, dates, numbers,
 * and other B2B-specific data.
 */

/**
 * Currency configuration
 */
export interface CurrencyFormatOptions {
  /** Currency code (e.g., 'EUR', 'USD') */
  code?: string;
  /** Locale for formatting */
  locale?: string;
  /** Minimum fraction digits */
  minimumFractionDigits?: number;
  /** Maximum fraction digits */
  maximumFractionDigits?: number;
  /** Whether to show currency symbol */
  showSymbol?: boolean;
  /** Whether to show currency code */
  showCode?: boolean;
}

/**
 * Date format options
 */
export interface DateFormatOptions {
  /** Date format style */
  style?: "short" | "medium" | "long" | "full";
  /** Include time */
  includeTime?: boolean;
  /** Time style */
  timeStyle?: "short" | "medium" | "long";
  /** Locale for formatting */
  locale?: string;
  /** Custom format pattern */
  pattern?: string;
}

/**
 * Number format options
 */
export interface NumberFormatOptions {
  /** Locale for formatting */
  locale?: string;
  /** Minimum fraction digits */
  minimumFractionDigits?: number;
  /** Maximum fraction digits */
  maximumFractionDigits?: number;
  /** Use grouping separators */
  useGrouping?: boolean;
  /** Notation style */
  notation?: "standard" | "scientific" | "engineering" | "compact";
  /** Compact display */
  compactDisplay?: "short" | "long";
}

// Default locale
const DEFAULT_LOCALE = "fr-FR";

/**
 * Format currency amount
 */
export function formatCurrency(
  amount: number,
  options: CurrencyFormatOptions = {}
): string {
  const {
    code = "EUR",
    locale = DEFAULT_LOCALE,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true,
    showCode = false,
  } = options;

  if (showSymbol) {
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      minimumFractionDigits,
      maximumFractionDigits,
    });
    return formatter.format(amount);
  }

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  });

  const formatted = formatter.format(amount);
  return showCode ? `${formatted} ${code}` : formatted;
}

/**
 * Format currency with abbreviated large numbers
 */
export function formatCurrencyCompact(
  amount: number,
  options: CurrencyFormatOptions = {}
): string {
  const { code = "EUR", locale = DEFAULT_LOCALE } = options;

  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  });

  return formatter.format(amount);
}

/**
 * Format date
 */
export function formatDate(
  date: Date | string | number,
  options: DateFormatOptions = {}
): string {
  const {
    style = "medium",
    includeTime = false,
    timeStyle = "short",
    locale = DEFAULT_LOCALE,
  } = options;

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  const dateStyleMap: Record<string, Intl.DateTimeFormatOptions["dateStyle"]> = {
    short: "short",
    medium: "medium",
    long: "long",
    full: "full",
  };

  const timeStyleMap: Record<string, Intl.DateTimeFormatOptions["timeStyle"]> = {
    short: "short",
    medium: "medium",
    long: "long",
  };

  const formatOptions: Intl.DateTimeFormatOptions = {
    dateStyle: dateStyleMap[style],
  };

  if (includeTime) {
    formatOptions.timeStyle = timeStyleMap[timeStyle];
  }

  return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
}

/**
 * Format relative date (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeDate(
  date: Date | string | number,
  locale: string = DEFAULT_LOCALE
): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);
  const diffWeeks = Math.round(diffDays / 7);
  const diffMonths = Math.round(diffDays / 30);
  const diffYears = Math.round(diffDays / 365);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(diffSeconds) < 60) {
    return rtf.format(diffSeconds, "second");
  }
  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute");
  }
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour");
  }
  if (Math.abs(diffDays) < 7) {
    return rtf.format(diffDays, "day");
  }
  if (Math.abs(diffWeeks) < 4) {
    return rtf.format(diffWeeks, "week");
  }
  if (Math.abs(diffMonths) < 12) {
    return rtf.format(diffMonths, "month");
  }
  return rtf.format(diffYears, "year");
}

/**
 * Format number
 */
export function formatNumber(
  value: number,
  options: NumberFormatOptions = {}
): string {
  const {
    locale = DEFAULT_LOCALE,
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping = true,
    notation = "standard",
    compactDisplay = "short",
  } = options;

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping,
    notation,
    compactDisplay: notation === "compact" ? compactDisplay : undefined,
  });

  return formatter.format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(
  value: number,
  options: {
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSign?: boolean;
  } = {}
): string {
  const {
    locale = DEFAULT_LOCALE,
    minimumFractionDigits = 0,
    maximumFractionDigits = 1,
    showSign = false,
  } = options;

  const formatter = new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits,
    maximumFractionDigits,
    signDisplay: showSign ? "always" : "auto",
  });

  // Intl.NumberFormat expects 0.5 for 50%, but we often pass 50
  const normalizedValue = Math.abs(value) > 1 ? value / 100 : value;
  return formatter.format(normalizedValue);
}

/**
 * Format order/quote number
 */
export function formatOrderNumber(
  number: string | number,
  prefix: string = "ORD"
): string {
  const numStr = String(number).padStart(6, "0");
  return `${prefix}-${numStr}`;
}

/**
 * Format quote number
 */
export function formatQuoteNumber(
  number: string | number,
  prefix: string = "QUO"
): string {
  const numStr = String(number).padStart(6, "0");
  return `${prefix}-${numStr}`;
}

/**
 * Format invoice number
 */
export function formatInvoiceNumber(
  number: string | number,
  prefix: string = "INV"
): string {
  const numStr = String(number).padStart(6, "0");
  return `${prefix}-${numStr}`;
}

/**
 * Format phone number
 */
export function formatPhoneNumber(
  phone: string,
  countryCode: string = "FR"
): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // Format based on country
  switch (countryCode) {
    case "FR":
      // French format: 01 23 45 67 89
      if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5");
      }
      if (cleaned.length === 11 && cleaned.startsWith("33")) {
        return `+33 ${cleaned.slice(2).replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5")}`;
      }
      break;
    case "US":
      // US format: (123) 456-7890
      if (cleaned.length === 10) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
      }
      break;
  }

  return phone; // Return original if no formatting matched
}

/**
 * Format address for display
 */
export function formatAddress(
  address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  },
  options: { multiline?: boolean; separator?: string } = {}
): string {
  const { multiline = false, separator = ", " } = options;

  const parts: string[] = [];

  if (address.line1) parts.push(address.line1);
  if (address.line2) parts.push(address.line2);

  const cityParts: string[] = [];
  if (address.city) cityParts.push(address.city);
  if (address.state) cityParts.push(address.state);
  if (address.postalCode) cityParts.push(address.postalCode);
  if (cityParts.length > 0) parts.push(cityParts.join(" "));

  if (address.country) parts.push(address.country);

  return multiline ? parts.join("\n") : parts.join(separator);
}

/**
 * Format VAT/Tax ID
 */
export function formatVatId(vatId: string, countryCode: string = "FR"): string {
  // Remove all whitespace
  const cleaned = vatId.replace(/\s/g, "");

  switch (countryCode) {
    case "FR":
      // French VAT: FR XX XXXXXXXXX
      if (cleaned.length === 13 && cleaned.startsWith("FR")) {
        return `FR ${cleaned.slice(2, 4)} ${cleaned.slice(4)}`;
      }
      break;
    case "DE":
      // German VAT: DE XXXXXXXXX
      if (cleaned.length === 11 && cleaned.startsWith("DE")) {
        return `DE ${cleaned.slice(2)}`;
      }
      break;
  }

  return vatId;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * Format quantity with unit
 */
export function formatQuantity(
  quantity: number,
  unit?: string,
  options: NumberFormatOptions = {}
): string {
  const formatted = formatNumber(quantity, {
    ...options,
    maximumFractionDigits: options.maximumFractionDigits ?? 0,
  });

  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Format duration (in minutes)
 */
export function formatDuration(
  minutes: number,
  options: { short?: boolean } = {}
): string {
  const { short = false } = options;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (short) {
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    }
    if (hours > 0) {
      return `${hours}h`;
    }
    return `${mins}m`;
  }

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  }
  if (mins > 0 || parts.length === 0) {
    parts.push(`${mins} ${mins === 1 ? "minute" : "minutes"}`);
  }

  return parts.join(" ");
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(
  text: string,
  maxLength: number,
  options: { ellipsis?: string; wordBoundary?: boolean } = {}
): string {
  const { ellipsis = "...", wordBoundary = true } = options;

  if (text.length <= maxLength) {
    return text;
  }

  let truncated = text.slice(0, maxLength - ellipsis.length);

  if (wordBoundary) {
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > maxLength * 0.5) {
      truncated = truncated.slice(0, lastSpace);
    }
  }

  return truncated.trim() + ellipsis;
}

/**
 * Format company name (capitalize appropriately)
 */
export function formatCompanyName(name: string): string {
  // List of words that should remain lowercase
  const lowercaseWords = new Set([
    "and",
    "or",
    "the",
    "a",
    "an",
    "of",
    "in",
    "for",
    "to",
    "et",
    "de",
    "la",
    "le",
    "du",
    "des",
  ]);

  // List of words that should remain uppercase
  const uppercaseWords = new Set([
    "sarl",
    "sas",
    "sa",
    "eurl",
    "sci",
    "llc",
    "inc",
    "ltd",
    "plc",
    "gmbh",
    "ag",
  ]);

  return name
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => {
      const lowerWord = word.toLowerCase();

      if (uppercaseWords.has(lowerWord)) {
        return word.toUpperCase();
      }

      if (index > 0 && lowercaseWords.has(lowerWord)) {
        return lowerWord;
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * Format payment terms for display
 */
export function formatPaymentTerms(terms: string): string {
  const termsMap: Record<string, string> = {
    NET30: "Net 30 days",
    NET60: "Net 60 days",
    NET90: "Net 90 days",
    DUE_ON_RECEIPT: "Due on receipt",
    COD: "Cash on delivery",
    PREPAID: "Prepaid",
    "2/10_NET30": "2% 10, Net 30",
  };

  return termsMap[terms] ?? terms;
}
