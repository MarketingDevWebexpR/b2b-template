/**
 * UI Components - Maison Bijoux Design System
 *
 * Hermes-inspired luxury design components for checkout flow and e-commerce.
 *
 * Design Principles:
 * - Elegance through simplicity and restraint
 * - Hermes orange (#f67828) as primary accent
 * - Light cream/white backgrounds with warm tones
 * - Serif typography for headings, sans-serif for body
 * - Subtle animations and refined transitions
 * - Generous spacing for visual breathing room
 */

// Button
export { Button, buttonVariants, buttonSizes } from './Button';
export type { ButtonProps } from './Button';

// Container
export { Container } from './Container';
export type { ContainerProps } from './Container';

// Badge
export { Badge, badgeVariants, badgeSizes } from './Badge';
export type { BadgeProps } from './Badge';

// Skeleton
export { Skeleton, ProductCardSkeleton, TextSkeleton } from './Skeleton';
export type { SkeletonProps } from './Skeleton';

// Input
export { Input } from './Input';
export type { InputProps } from './Input';

// Breadcrumbs
export { Breadcrumbs } from './Breadcrumbs';

// LoadMore
export { LoadMore } from './LoadMore';

// Card (new)
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CartItemCard,
  OrderSummaryCard,
  cardVariants,
  cardSizes,
} from './Card';
export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps,
  CartItemCardProps,
  OrderSummaryCardProps,
} from './Card';

// Stepper (new)
export { Stepper, CompactStepper } from './Stepper';
export type { StepperProps, CompactStepperProps, Step } from './Stepper';

// Separator (new)
export {
  Separator,
  DecorativeDivider,
  SectionDivider,
  separatorVariants,
  separatorSizes,
} from './Separator';
export type {
  SeparatorProps,
  DecorativeDividerProps,
  SectionDividerProps,
} from './Separator';

// Alert (new)
export {
  Alert,
  InlineAlert,
  ToastAlert,
  alertVariants,
  alertSizes,
} from './Alert';
export type {
  AlertProps,
  InlineAlertProps,
  ToastAlertProps,
} from './Alert';

// SageSyncBadge (ERP sync status indicator)
export { SageSyncBadge } from './SageSyncBadge';
export type { SageSyncBadgeProps, SyncStatus } from './SageSyncBadge';
