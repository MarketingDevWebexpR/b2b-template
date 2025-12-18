/**
 * CMS Types
 *
 * Types for CMS content managed through the Medusa backend.
 */

/**
 * Announcement banner from CMS
 */
export interface Announcement {
  /** Unique identifier */
  id: string;
  /** Message to display in the banner */
  message: string;
  /** Optional link URL */
  link_url: string | null;
  /** Optional link text (button/link label) */
  link_text: string | null;
  /** Background color (hex or CSS color) */
  background_color: string | null;
  /** Text color (hex or CSS color) */
  text_color: string | null;
  /** Start date for the announcement (ISO string) */
  start_date: string | null;
  /** End date for the announcement (ISO string) */
  end_date: string | null;
  /** Whether the announcement is active */
  is_active: boolean;
  /** Priority (higher = more important) */
  priority: number;
  /** Creation timestamp */
  created_at?: string;
  /** Last update timestamp */
  updated_at?: string;
}

/**
 * API response for announcements
 */
export interface AnnouncementsResponse {
  announcements: Announcement[];
}

/**
 * Hero slide layout type
 * - 'background': Image as background with text overlay
 * - 'side': Image on one side, text on the other
 * - 'fullwidth': Full-width image with minimal text
 */
export type HeroSlideLayoutType = 'background' | 'side' | 'fullwidth';

/**
 * Hero slide image position for 'side' layout
 */
export type HeroSlideImagePosition = 'left' | 'right';

/**
 * Hero slide from CMS
 */
export interface HeroSlide {
  /** Unique identifier */
  id: string;
  /** Main title */
  title: string;
  /** Optional subtitle */
  subtitle: string | null;
  /** Optional description */
  description: string | null;
  /** Optional badge text (e.g., "Nouveau", "Promo") */
  badge: string | null;
  /** Image URL */
  image_url: string | null;
  /** Image alt text for accessibility */
  image_alt: string | null;
  /** CSS gradient classes */
  gradient: string;
  /** Text color */
  text_color: string;
  /** Overlay opacity (0-100) */
  overlay_opacity: number;
  /** Primary CTA label */
  cta_label: string;
  /** Primary CTA URL */
  cta_href: string;
  /** Optional secondary CTA label */
  secondary_cta_label: string | null;
  /** Optional secondary CTA URL */
  secondary_cta_href: string | null;
  /** Display position */
  position: number;
  /**
   * Type de mise en page
   * - 'background': Image as background with text overlay
   * - 'side': Image on one side, text on the other
   * - 'fullwidth': Full-width image with minimal text
   */
  layout_type: HeroSlideLayoutType;
  /** Position de l'image pour le layout 'side' */
  image_position: HeroSlideImagePosition;
  /** Clé du fichier S3/MinIO */
  image_file_key: string | null;
}

/**
 * API response for hero slides
 */
export interface HeroSlidesResponse {
  slides: HeroSlide[];
}
