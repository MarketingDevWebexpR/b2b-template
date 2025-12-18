/**
 * Hero Slide Layout Components
 *
 * Reusable layout components for hero carousel slides.
 * Each layout offers a different visual presentation while
 * accepting the same LayoutProps interface.
 *
 * Available Layouts:
 * - BackgroundLayout: Full-bleed image with gradient overlay and left-aligned text
 * - SideLayout: 50/50 split with image on one side, text on the other
 * - FullwidthLayout: Immersive full-width image with centered minimal text
 *
 * @example
 * import { BackgroundLayout, SideLayout, FullwidthLayout } from './hero-layouts';
 *
 * // Use based on slide configuration or layout preference
 * const LayoutComponent = {
 *   background: BackgroundLayout,
 *   side: SideLayout,
 *   fullwidth: FullwidthLayout,
 * }[slide.layout];
 *
 * <LayoutComponent slide={slide} />
 */

export { BackgroundLayout, type LayoutProps } from './BackgroundLayout';
export { SideLayout } from './SideLayout';
export { FullwidthLayout } from './FullwidthLayout';

/**
 * Layout component map for dynamic selection
 */
export const layoutComponents = {
  background: () => import('./BackgroundLayout').then((m) => m.BackgroundLayout),
  side: () => import('./SideLayout').then((m) => m.SideLayout),
  fullwidth: () => import('./FullwidthLayout').then((m) => m.FullwidthLayout),
} as const;

export type LayoutType = keyof typeof layoutComponents;
