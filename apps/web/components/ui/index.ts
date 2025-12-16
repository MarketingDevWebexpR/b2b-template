/**
 * UI Components - Maison Bijoux B2B Design System
 *
 * Professional B2B design components for distributor e-commerce platform.
 *
 * Design Principles:
 * - Professional, clean interface optimized for productivity
 * - B2B blue (#0059a1) as primary, orange (#f67828) as accent
 * - Light backgrounds with clear visual hierarchy
 * - Inter font for optimal readability
 * - Fast, responsive interactions
 * - High-density information display
 */

// Button
export { Button, buttonVariants, buttonSizes } from './Button';
export type { ButtonProps } from './Button';

// Select
export { Select, selectSizes } from './Select';
export type { SelectProps, SelectOption } from './Select';

// Checkbox & Radio
export { Checkbox, Radio, CheckboxGroup, checkboxSizes } from './Checkbox';
export type { CheckboxProps, CheckboxGroupProps } from './Checkbox';

// Switch
export { Switch, switchSizes } from './Switch';
export type { SwitchProps } from './Switch';

// Slider
export { Slider, RangeSlider, sliderSizes } from './Slider';
export type { SliderProps, RangeSliderProps } from './Slider';

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

// Toast
export { ToastProvider, ToastItem, useToast, toast } from './Toast';
export type { Toast, ToastVariant, ToastPosition, ToastProviderProps, ToastContextValue } from './Toast';

// Tabs
export { Tabs, TabsList, TabsTrigger, TabsContent, PillTabs } from './Tabs';
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps, PillTabsProps } from './Tabs';

// Accordion
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent, FAQAccordion } from './Accordion';
export type { AccordionProps, AccordionItemProps, AccordionTriggerProps, AccordionContentProps, FAQItem, FAQAccordionProps } from './Accordion';

// DataTable
export { DataTable } from './DataTable';
export type { DataTableProps, DataTableColumn, SortState } from './DataTable';

// Pagination
export { Pagination, PaginationWithInfo, paginationSizes } from './Pagination';
export type { PaginationProps, PaginationWithInfoProps } from './Pagination';
