/**
 * Mobile Menu Components
 *
 * A comprehensive mobile navigation drawer with support for
 * 5-level category hierarchy using stacked panel navigation.
 *
 * Components:
 * - MobileDrawer: Full-screen drawer with animated panels
 * - MobileMenuTrigger: Hamburger button for header
 * - NavigationPanel: Category list display
 * - BreadcrumbHeader: Back button and navigation trail
 * - CategoryListItem: Individual category item
 *
 * Usage:
 * 1. Wrap your app with MobileMenuProvider (from contexts)
 * 2. Place MobileMenuTrigger in your header
 * 3. Place MobileDrawer at the root of your layout
 * 4. Pass your category data to MobileDrawer
 *
 * @example
 * ```tsx
 * // In layout.tsx
 * import { MobileMenuProvider } from '@/contexts/MobileMenuContext';
 * import { MobileDrawer, MobileMenuTrigger } from '@/components/navigation/MobileMenu';
 *
 * export default function Layout({ children }) {
 *   return (
 *     <MobileMenuProvider>
 *       <header>
 *         <MobileMenuTrigger />
 *       </header>
 *       <MobileDrawer
 *         categories={catalogCategories}
 *         getChildCategories={(id) => findChildrenById(id)}
 *       />
 *       <main>{children}</main>
 *     </MobileMenuProvider>
 *   );
 * }
 * ```
 *
 * @packageDocumentation
 */

// Main components
export { MobileDrawer, DefaultFooterContent } from './MobileDrawer';
export type { MobileDrawerProps, DefaultFooterContentProps } from './MobileDrawer';

export { MobileMenuTrigger } from './MobileMenuTrigger';
export type { MobileMenuTriggerProps } from './MobileMenuTrigger';

export {
  NavigationPanel,
  NavigationPanelContainer,
  iconMap,
  getIconForCategory,
} from './NavigationPanel';
export type {
  NavigationPanelProps,
  NavigationPanelContainerProps,
  CategoryData,
} from './NavigationPanel';

export { BreadcrumbHeader } from './BreadcrumbHeader';
export type { BreadcrumbHeaderProps } from './BreadcrumbHeader';

export { CategoryListItem } from './CategoryListItem';
export type { CategoryListItemProps } from './CategoryListItem';

// MobileNavigation wrapper (recommended for use)
export { MobileNavigation } from './MobileNavigation';
export type { MobileNavigationProps } from './MobileNavigation';

// Re-export context hooks for convenience
export {
  useMobileMenu,
  useMobileMenuNavigation,
  useMobileMenuDrawer,
  MobileMenuProvider,
  MAX_NAVIGATION_DEPTH,
} from '@/contexts/MobileMenuContext';
export type {
  MobileMenuContextType,
  MobileMenuProviderProps,
  NavigationStackItem,
} from '@/contexts/MobileMenuContext';
