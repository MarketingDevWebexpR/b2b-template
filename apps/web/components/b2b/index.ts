/**
 * B2B Components
 *
 * Reusable UI components for the B2B e-commerce interface.
 *
 * @example
 * ```tsx
 * import {
 *   StatusBadge,
 *   LoadingSpinner,
 *   EmptyState,
 *   StatCard,
 *   FilterTabs,
 *   EntityTypeBadge,
 *   // Shared components
 *   PageHeader,
 *   ErrorState,
 *   ActionButton,
 *   DataTable,
 *   Card,
 *   SectionCard,
 * } from '@/components/b2b';
 * ```
 */

// Status badge for quotes and approvals
export {
  StatusBadge,
  getStatusColor,
  getStatusLabel,
  type StatusType,
} from './StatusBadge';

// Loading spinners
export {
  LoadingSpinner,
  PageLoader,
  SectionLoader,
} from './LoadingSpinner';

// Empty state displays
export { EmptyState } from './EmptyState';

// Statistics cards
export {
  StatCard,
  StatsGrid,
} from './StatCard';

// Filter tabs
export { FilterTabs } from './FilterTabs';

// Entity type badge for approvals
export {
  EntityTypeBadge,
  getEntityTypeColor,
  getEntityTypeLabel,
} from './EntityTypeBadge';

// Shared components
export {
  PageHeader,
  ErrorState,
  ActionButton,
  DataTable,
  Card,
  SectionCard,
  type PageHeaderProps,
  type BreadcrumbItem,
  type ErrorStateProps,
  type ActionButtonProps,
  type ButtonVariant,
  type ButtonSize,
  type DataTableProps,
  type Column,
  type CardProps,
  type SectionCardProps,
} from './shared';
