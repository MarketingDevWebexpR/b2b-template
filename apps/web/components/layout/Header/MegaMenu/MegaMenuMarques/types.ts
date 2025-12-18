/**
 * Type definitions for MegaMenuMarques components
 */

export interface Brand {
  /** Unique identifier */
  id: string;
  /** Brand display name */
  name: string;
  /** URL-friendly slug */
  slug: string;
  /** Logo image URL (optional - uses initials fallback if missing) */
  logoUrl?: string;
  /** Alt text for logo */
  logoAlt?: string;
  /** Number of products from this brand */
  productCount: number;
  /** Brand tier for visual treatment */
  tier: 'premium' | 'standard';
  /** Whether brand is featured */
  featured?: boolean;
}

export interface BrandSummary {
  /** Unique identifier */
  id: string;
  /** Brand name (shortened key for API optimization) */
  n: string;
  /** Slug */
  s: string;
  /** Logo URL (optional) */
  l?: string;
  /** Product count */
  c: number;
  /** Tier: 0=standard, 1=premium */
  t: 0 | 1;
}

export interface BrandsData {
  /** Premium/featured brands */
  premium: Brand[];
  /** All brands grouped alphabetically */
  alphabetical: Record<string, Brand[]>;
  /** Total number of brands */
  totalCount: number;
  /** Last data update timestamp */
  lastUpdated: string;
}

export interface BrandCardProps {
  /** Brand data */
  brand: Brand;
  /** Display variant */
  variant?: 'grid' | 'list';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Click handler */
  onSelect?: (brand: Brand) => void;
  /** Close menu callback */
  onClose?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export interface BrandsSearchBarProps {
  /** Current search query */
  value: string;
  /** Search query change handler */
  onChange: (query: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
}

export interface BrandsPremiumGridProps {
  /** Premium brands to display */
  brands: Brand[];
  /** Close menu callback */
  onClose?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export interface BrandsAlphabeticalListProps {
  /** Brands grouped by first letter */
  brandsByLetter: Record<string, Brand[]>;
  /** Currently active letter */
  activeLetter?: string;
  /** Letter selection callback */
  onLetterSelect?: (letter: string) => void;
  /** Close menu callback */
  onClose?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export interface AlphabetNavProps {
  /** Available letters */
  letters: string[];
  /** Currently active letter */
  activeLetter?: string;
  /** Letter click handler */
  onLetterClick: (letter: string) => void;
  /** Letters that have brands */
  availableLetters: Set<string>;
  /** Additional CSS classes */
  className?: string;
}

export interface BrandInitialsProps {
  /** Brand name to generate initials from */
  name: string;
  /** Size in pixels */
  size?: number;
  /** Additional CSS classes */
  className?: string;
}

export interface BrandLogoProps {
  /** Image source URL */
  src: string;
  /** Alt text */
  alt: string;
  /** Size in pixels */
  size?: number;
  /** Fallback component when image fails */
  fallback: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}
