'use client';

/**
 * CategoryIcon Component
 *
 * Maps category icon string identifiers to Lucide React icon components.
 * Provides consistent icon rendering across the MegaMenu with fallback support.
 */

import { memo } from 'react';
import {
  Zap,
  Droplets,
  Droplet,
  Hammer,
  Thermometer,
  Wrench,
  Plug,
  Cable,
  Lightbulb,
  Fan,
  Flame,
  Snowflake,
  Lock,
  Key,
  Shield,
  Package,
  Ruler,
  Settings,
  Folder,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Icon name to Lucide component mapping
 */
const iconMap: Record<string, LucideIcon> = {
  // Electrical
  bolt: Zap,
  zap: Zap,
  outlet: Plug,
  plug: Plug,
  cable: Cable,
  lightbulb: Lightbulb,

  // Plumbing
  droplets: Droplets,
  droplet: Droplet,
  faucet: Droplet,
  pipe: Wrench, // Using Wrench as closest alternative

  // Tools
  hammer: Hammer,
  screw: Wrench,
  wrench: Wrench,
  settings: Settings,
  ruler: Ruler,

  // Heating & Cooling
  thermometer: Thermometer,
  flame: Flame,
  fan: Fan,
  snowflake: Snowflake,

  // Security
  lock: Lock,
  key: Key,
  shield: Shield,

  // General
  box: Package,
  package: Package,
  folder: Folder,
};

export interface CategoryIconProps extends Omit<LucideProps, 'ref'> {
  /** Icon name identifier */
  name?: string;
  /** Size preset or custom size */
  size?: 'sm' | 'md' | 'lg' | number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Size presets for icons
 */
const sizePresets = {
  sm: 16,
  md: 20,
  lg: 24,
};

/**
 * CategoryIcon renders a Lucide icon based on a string identifier.
 * Falls back to Folder icon if the specified icon is not found.
 *
 * @example
 * <CategoryIcon name="bolt" size="md" />
 * <CategoryIcon name="droplets" className="text-blue-500" />
 */
export const CategoryIcon = memo(function CategoryIcon({
  name = 'folder',
  size = 'md',
  className,
  ...props
}: CategoryIconProps) {
  // Get the icon component, fallback to Folder
  const IconComponent = iconMap[name.toLowerCase()] || Folder;

  // Resolve size
  const resolvedSize = typeof size === 'string' ? sizePresets[size] : size;

  return (
    <IconComponent
      className={cn('shrink-0', className)}
      size={resolvedSize}
      strokeWidth={1.5}
      aria-hidden="true"
      {...props}
    />
  );
});

CategoryIcon.displayName = 'CategoryIcon';

export default CategoryIcon;
