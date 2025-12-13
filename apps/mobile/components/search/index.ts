/**
 * Search Components
 * Barrel export for search-related components
 */

// Search UI components
export { SearchBar } from './SearchBar';
export { SearchResults } from './SearchResults';
export { SearchFilters } from './SearchFilters';
export type { FilterState, SortOption } from './SearchFilters';

// Voice search
export { VoiceSearch } from './VoiceSearch';
export type { default as VoiceSearchComponent } from './VoiceSearch';

// Barcode Scanner components
export { BarcodeScanner } from './BarcodeScanner';
export { ScannerOverlay } from './ScannerOverlay';
