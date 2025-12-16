/**
 * UI Components - Maison Bijoux B2B Design System
 *
 * Professional B2B design components for jewelry distributor e-commerce platform.
 *
 * Design Philosophy:
 * - Luxurious, professional appearance for B2B jewelry market
 * - Orange Hermes (#f67828) as accent color
 * - Gold (#d4a84b) for premium/luxury elements
 * - Clean, high-density information display
 * - Inter font for optimal readability
 * - Fast, responsive interactions
 * - Fully accessible (WCAG 2.1 AA compliant)
 *
 * Color Palette:
 * - Primary: Neutral gray (#737373) for navigation and secondary elements
 * - Accent: Orange Hermes (#f67828) for CTAs and highlights
 * - Gold: (#d4a84b) for premium badges and luxury indicators
 * - Success: Emerald (#10b981) for positive states
 * - Warning: Amber (#f59e0b) for caution states
 * - Danger: Red (#ef4444) for destructive actions
 * - Info: Blue (#3b82f6) for informational elements
 */

// ============================================
// BUTTONS & ACTIONS
// ============================================

export {
  Button,
  IconButton,
  ButtonGroup,
  buttonVariants,
  buttonSizes,
  iconButtonSizes,
} from './Button';
export type { ButtonProps, IconButtonProps, ButtonGroupProps } from './Button';

// ============================================
// FORM INPUTS
// ============================================

// Input
export { Input } from './Input';
export type { InputProps } from './Input';

// Select
export { Select, selectSizes } from './Select';
export type { SelectProps, SelectOption } from './Select';

// Checkbox
export { Checkbox, CheckboxGroup, checkboxSizes } from './Checkbox';
export type { CheckboxProps, CheckboxGroupProps } from './Checkbox';

// Radio (standalone component)
export { Radio, RadioGroup, RadioCard, radioSizes } from './Radio';
export type { RadioProps, RadioGroupProps, RadioCardProps } from './Radio';

// Switch
export { Switch, switchSizes } from './Switch';
export type { SwitchProps } from './Switch';

// Slider
export { Slider, RangeSlider, sliderSizes } from './Slider';
export type { SliderProps, RangeSliderProps } from './Slider';

// ============================================
// DATA DISPLAY
// ============================================

// Badge
export { Badge, badgeVariants, badgeSizes } from './Badge';
export type { BadgeProps } from './Badge';

// Avatar
export {
  Avatar,
  AvatarGroup,
  UserAvatar,
  CompanyAvatar,
  avatarSizes,
  avatarShapes,
  statusColors,
} from './Avatar';
export type {
  AvatarProps,
  AvatarGroupProps,
  UserAvatarProps,
  CompanyAvatarProps,
} from './Avatar';

// Card
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

// DataTable
export { DataTable } from './DataTable';
export type { DataTableProps, DataTableColumn, SortState } from './DataTable';

// Pagination
export { Pagination, PaginationWithInfo, paginationSizes } from './Pagination';
export type { PaginationProps, PaginationWithInfoProps } from './Pagination';

// SageSyncBadge (ERP sync status indicator)
export { SageSyncBadge } from './SageSyncBadge';
export type { SageSyncBadgeProps, SyncStatus } from './SageSyncBadge';

// ============================================
// FEEDBACK & STATUS
// ============================================

// Alert
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

// Toast
export { ToastProvider, ToastItem, useToast, toast } from './Toast';
export type {
  Toast,
  ToastVariant,
  ToastPosition,
  ToastProviderProps,
  ToastContextValue,
} from './Toast';

// Loading States
export {
  Spinner,
  DotsLoader,
  PulseLoader,
  Loading,
  LoadingOverlay,
  PageLoader,
  InlineLoading,
  ButtonLoading,
  TableLoading,
  spinnerSizes,
  spinnerColors,
} from './Loading';
export type {
  SpinnerProps,
  DotsLoaderProps,
  PulseLoaderProps,
  LoadingProps,
  LoadingOverlayProps,
  PageLoaderProps,
  InlineLoadingProps,
  ButtonLoadingProps,
  TableLoadingProps,
} from './Loading';

// Skeleton
export { Skeleton, ProductCardSkeleton, TextSkeleton } from './Skeleton';
export type { SkeletonProps } from './Skeleton';

// Empty States
export {
  EmptyState,
  NoResults,
  EmptyCart,
  NoOrders,
  NoFavorites,
  NoProducts,
  ErrorState,
  OfflineState,
  ComingSoon,
  emptyStateSizes,
} from './EmptyState';
export type {
  EmptyStateProps,
  NoResultsProps,
  ErrorStateProps,
} from './EmptyState';

// ============================================
// OVERLAYS & DIALOGS
// ============================================

// Modal
export { Modal, ConfirmModal, modalSizes } from './Modal';
export type { ModalProps, ConfirmModalProps } from './Modal';

// Drawer
export { Drawer, drawerSizes } from './Drawer';
export type { DrawerProps } from './Drawer';

// Popover & Dropdown
export { Popover, DropdownMenu } from './Popover';
export type { PopoverProps, DropdownMenuProps, DropdownMenuItem } from './Popover';

// Tooltip
export { Tooltip, InfoTooltip } from './Tooltip';
export type { TooltipProps, InfoTooltipProps } from './Tooltip';

// ============================================
// NAVIGATION & ORGANIZATION
// ============================================

// Tabs
export { Tabs, TabsList, TabsTrigger, TabsContent, PillTabs } from './Tabs';
export type {
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
  PillTabsProps,
} from './Tabs';

// Accordion
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  FAQAccordion,
} from './Accordion';
export type {
  AccordionProps,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionContentProps,
  FAQItem,
  FAQAccordionProps,
} from './Accordion';

// Stepper
export { Stepper, CompactStepper } from './Stepper';
export type { StepperProps, CompactStepperProps, Step } from './Stepper';

// Breadcrumbs
export { Breadcrumbs } from './Breadcrumbs';

// ============================================
// LAYOUT & STRUCTURE
// ============================================

// Container
export { Container } from './Container';
export type { ContainerProps } from './Container';

// Separator
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

// ============================================
// UTILITY COMPONENTS
// ============================================

// LoadMore
export { LoadMore } from './LoadMore';
