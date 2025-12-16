/**
 * B2B Shared Components
 *
 * Reusable UI components for B2B pages to reduce duplication.
 *
 * @example
 * ```tsx
 * import {
 *   PageHeader,
 *   ErrorState,
 *   ActionButton,
 *   DataTable,
 *   Card,
 *   SectionCard,
 * } from '@/components/b2b/shared';
 * ```
 */

// Page header with title, description, breadcrumbs, and actions
export { PageHeader, type PageHeaderProps, type BreadcrumbItem } from './PageHeader';

// Error state display with retry option
export { ErrorState, type ErrorStateProps } from './ErrorState';

// Flexible action button with variants
export {
  ActionButton,
  type ActionButtonProps,
  type ButtonVariant,
  type ButtonSize,
} from './ActionButton';

// Data table for lists
export { DataTable, type DataTableProps, type Column } from './DataTable';

// Card containers
export { Card, SectionCard, type CardProps, type SectionCardProps } from './Card';
