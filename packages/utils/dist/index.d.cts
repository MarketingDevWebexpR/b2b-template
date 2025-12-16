import { ClassValue } from 'clsx';

/**
 * Merge Tailwind CSS classes with clsx
 */
declare function cn(...inputs: ClassValue[]): string;
/**
 * Format price in EUR
 */
declare function formatPrice(price: number): string;
/**
 * Generate slug from string
 */
declare function slugify(text: string): string;
/**
 * Truncate text to a specific length
 */
declare function truncate(text: string, length: number): string;
/**
 * Calculate discount percentage
 */
declare function calculateDiscount(price: number, compareAtPrice: number): number;
/**
 * Debounce function
 */
declare function debounce<Args extends unknown[]>(func: (...args: Args) => void, wait: number): (...args: Args) => void;
/**
 * Check if we're on the client side
 */
declare const isClient: boolean;
/**
 * Generate random ID
 */
declare function generateId(): string;
/**
 * Format date for display
 */
declare function formatDate(date: string | Date, locale?: string): string;
/**
 * Delay utility for async operations
 */
declare function delay(ms: number): Promise<void>;

export { calculateDiscount, cn, debounce, delay, formatDate, formatPrice, generateId, isClient, slugify, truncate };
