'use client';

/**
 * ProductCardB2BBadges - B2B Metadata Badges for Product Cards
 *
 * Displays certification badges, sustainability indicators, and
 * manufacturing info on product cards for B2B jewelry wholesale.
 *
 * @packageDocumentation
 */

import { memo } from 'react';
import {
  Award,
  Leaf,
  Recycle,
  Shield,
  Factory,
  Clock,
  BadgeCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';
import type { B2BProduct, ProductCertification } from '@/types/product-b2b';
import { getCertificationInfo } from '@/types/product-b2b';

// ============================================================================
// Types
// ============================================================================

export interface ProductCardB2BBadgesProps {
  /** B2B product data with rich metadata */
  product: Partial<B2BProduct>;
  /** Display variant */
  variant?: 'compact' | 'full';
  /** Show certification badges */
  showCertifications?: boolean;
  /** Show sustainability badges */
  showSustainability?: boolean;
  /** Show manufacturing badges */
  showManufacturing?: boolean;
  /** Maximum badges to display */
  maxBadges?: number;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Sub-Components
// ============================================================================

interface CertificationBadgeProps {
  certification: ProductCertification;
  compact?: boolean;
}

const CertificationBadge = memo(function CertificationBadge({
  certification,
  compact = true,
}: CertificationBadgeProps) {
  const info = getCertificationInfo(certification.authority);

  if (compact) {
    return (
      <Tooltip tooltipContent={`${info.fullName}${certification.number ? ` #${certification.number}` : ''}`}>
        <span
          className={cn(
            'inline-flex items-center justify-center',
            'w-5 h-5 rounded-full',
            'text-[10px] font-bold text-white',
            'shadow-sm'
          )}
          style={{ backgroundColor: info.color }}
        >
          {info.name.charAt(0)}
        </span>
      </Tooltip>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1',
        'px-1.5 py-0.5 rounded',
        'text-[10px] font-semibold',
        'border'
      )}
      style={{
        backgroundColor: `${info.color}15`,
        borderColor: `${info.color}40`,
        color: info.color,
      }}
    >
      <BadgeCheck className="w-3 h-3" />
      {info.name}
    </div>
  );
});

interface SustainabilityBadgeProps {
  type: 'ethical' | 'conflict_free' | 'recycled';
  compact?: boolean;
}

const sustainabilityConfig = {
  ethical: {
    icon: Shield,
    label: 'Ethique',
    fullLabel: 'Sourcing ethique',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  conflict_free: {
    icon: Award,
    label: 'CF',
    fullLabel: 'Conflict-free',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  recycled: {
    icon: Recycle,
    label: 'Recycle',
    fullLabel: 'Metal recycle',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
};

const SustainabilityBadge = memo(function SustainabilityBadge({
  type,
  compact = true,
}: SustainabilityBadgeProps) {
  const config = sustainabilityConfig[type];
  const Icon = config.icon;

  if (compact) {
    return (
      <Tooltip tooltipContent={config.fullLabel}>
        <span
          className={cn(
            'inline-flex items-center justify-center',
            'w-5 h-5 rounded-full',
            config.bgColor,
            config.color
          )}
        >
          <Icon className="w-3 h-3" />
        </span>
      </Tooltip>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1',
        'px-1.5 py-0.5 rounded',
        'text-[10px] font-semibold border',
        config.bgColor,
        config.borderColor,
        config.color
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </div>
  );
});

interface ManufacturingBadgeProps {
  type: 'handmade' | 'made_to_order';
  compact?: boolean;
}

const manufacturingConfig = {
  handmade: {
    icon: Factory,
    label: 'Artisanal',
    fullLabel: 'Fait main',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  made_to_order: {
    icon: Clock,
    label: 'Sur mesure',
    fullLabel: 'Fabrique sur commande',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
};

const ManufacturingBadge = memo(function ManufacturingBadge({
  type,
  compact = true,
}: ManufacturingBadgeProps) {
  const config = manufacturingConfig[type];
  const Icon = config.icon;

  if (compact) {
    return (
      <Tooltip tooltipContent={config.fullLabel}>
        <span
          className={cn(
            'inline-flex items-center justify-center',
            'w-5 h-5 rounded-full',
            config.bgColor,
            config.color
          )}
        >
          <Icon className="w-3 h-3" />
        </span>
      </Tooltip>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1',
        'px-1.5 py-0.5 rounded',
        'text-[10px] font-semibold border',
        config.bgColor,
        config.borderColor,
        config.color
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </div>
  );
});

// ============================================================================
// Main Component
// ============================================================================

/**
 * ProductCardB2BBadges - Display B2B metadata badges on product cards
 *
 * Shows certifications (GIA, HRD, IGI), sustainability badges,
 * and manufacturing indicators in a compact or full format.
 */
export const ProductCardB2BBadges = memo(function ProductCardB2BBadges({
  product,
  variant = 'compact',
  showCertifications = true,
  showSustainability = true,
  showManufacturing = true,
  maxBadges = 4,
  className,
}: ProductCardB2BBadgesProps) {
  const compact = variant === 'compact';

  // Collect all badges
  const badges: React.ReactNode[] = [];

  // Certifications
  if (showCertifications && product.certifications?.length) {
    product.certifications.slice(0, 2).forEach((cert, index) => {
      badges.push(
        <CertificationBadge
          key={`cert-${index}`}
          certification={cert}
          compact={compact}
        />
      );
    });
  }

  // Sustainability
  if (showSustainability) {
    if (product.isEthicallySourced) {
      badges.push(
        <SustainabilityBadge
          key="ethical"
          type="ethical"
          compact={compact}
        />
      );
    }
    if (product.isConflictFree) {
      badges.push(
        <SustainabilityBadge
          key="conflict_free"
          type="conflict_free"
          compact={compact}
        />
      );
    }
    if (product.hasRecycledMetal) {
      badges.push(
        <SustainabilityBadge
          key="recycled"
          type="recycled"
          compact={compact}
        />
      );
    }
  }

  // Manufacturing
  if (showManufacturing) {
    if (product.isHandmade) {
      badges.push(
        <ManufacturingBadge
          key="handmade"
          type="handmade"
          compact={compact}
        />
      );
    }
    if (product.isMadeToOrder) {
      badges.push(
        <ManufacturingBadge
          key="made_to_order"
          type="made_to_order"
          compact={compact}
        />
      );
    }
  }

  // Don't render if no badges
  if (badges.length === 0) return null;

  // Limit badges and show overflow count
  const displayBadges = badges.slice(0, maxBadges);
  const overflowCount = badges.length - maxBadges;

  return (
    <div className={cn('flex items-center gap-1 flex-wrap', className)}>
      {displayBadges}
      {overflowCount > 0 && (
        <Tooltip tooltipContent={`${overflowCount} autres badges`}>
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-medium">
            +{overflowCount}
          </span>
        </Tooltip>
      )}
    </div>
  );
});

export default ProductCardB2BBadges;
