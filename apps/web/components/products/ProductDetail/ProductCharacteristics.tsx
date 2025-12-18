'use client';

/**
 * ProductCharacteristics - B2B Product Specifications Display
 *
 * Displays rich product metadata from Medusa for B2B jewelry wholesale:
 * - Technical characteristics (metal, stone, clarity, cut, etc.)
 * - Certifications (GIA, HRD, IGI)
 * - Warranty information
 * - Sustainability badges
 *
 * @packageDocumentation
 */

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Shield,
  ChevronDown,
  Gem,
  Leaf,
  Recycle,
  Check,
  Clock,
  Package,
  Factory,
  BadgeCheck,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import type {
  ProductCharacteristics as CharacteristicsType,
  ProductCertification,
  B2BProduct,
} from '@/types/product-b2b';
import {
  getCharacteristicLabel,
  getCertificationInfo,
  CHARACTERISTIC_LABELS,
} from '@/types/product-b2b';

// ============================================================================
// Types
// ============================================================================

export interface ProductCharacteristicsProps {
  /** B2B product with rich metadata */
  product: B2BProduct;
  /** Display variant: 'compact' for sidebar, 'full' for detail page */
  variant?: 'compact' | 'full';
  /** Initially collapsed (expandable) */
  collapsible?: boolean;
  /** Show certifications section */
  showCertifications?: boolean;
  /** Show sustainability badges */
  showSustainability?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

// Group characteristics by category
const CHARACTERISTIC_GROUPS: Record<string, string[]> = {
  Metal: ['metal', 'poids_metal'],
  Pierre: ['pierre_principale', 'taille', 'couleur', 'purete', 'carat', 'origine_pierre', 'traitement'],
  Monture: ['monture'],
  Dimensions: ['longueur', 'taille_bague', 'taille_bracelet', 'diametre_boitier'],
  Horlogerie: ['mouvement', 'etancheite'],
};

// Ordered characteristic groups
const ORDERED_GROUPS = ['Pierre', 'Metal', 'Monture', 'Dimensions', 'Horlogerie'];

// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

const expandVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Group characteristics by category
 */
function groupCharacteristics(
  characteristics: CharacteristicsType
): Record<string, Array<{ key: string; label: string; value: string }>> {
  const groups: Record<string, Array<{ key: string; label: string; value: string }>> = {};

  Object.entries(characteristics).forEach(([key, value]) => {
    if (!value) return;

    // Find which group this characteristic belongs to
    let groupName = 'Autres';
    for (const [group, keys] of Object.entries(CHARACTERISTIC_GROUPS)) {
      if (keys.includes(key)) {
        groupName = group;
        break;
      }
    }

    if (!groups[groupName]) {
      groups[groupName] = [];
    }

    groups[groupName].push({
      key,
      label: getCharacteristicLabel(key),
      value,
    });
  });

  // Sort groups by order
  const sortedGroups: typeof groups = {};
  for (const group of ORDERED_GROUPS) {
    if (groups[group]) {
      sortedGroups[group] = groups[group];
    }
  }
  if (groups['Autres']) {
    sortedGroups['Autres'] = groups['Autres'];
  }

  return sortedGroups;
}

/**
 * Get icon for characteristic group
 */
function getGroupIcon(group: string) {
  switch (group) {
    case 'Pierre':
      return <Gem className="w-4 h-4" />;
    case 'Metal':
      return <Sparkles className="w-4 h-4" />;
    case 'Monture':
      return <Package className="w-4 h-4" />;
    case 'Dimensions':
      return <Award className="w-4 h-4" />;
    case 'Horlogerie':
      return <Clock className="w-4 h-4" />;
    default:
      return <Check className="w-4 h-4" />;
  }
}

// ============================================================================
// Sub-Components
// ============================================================================

interface CharacteristicRowProps {
  label: string;
  value: string;
  isEven: boolean;
}

function CharacteristicRow({ label, value, isEven }: CharacteristicRowProps) {
  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        'flex items-center justify-between gap-4 px-4 py-2.5',
        isEven ? 'bg-neutral-50' : 'bg-white'
      )}
    >
      <span className="text-sm text-neutral-600">{label}</span>
      <span className="text-sm font-medium text-neutral-900 text-right">
        {value}
      </span>
    </motion.div>
  );
}

interface CertificationBadgeProps {
  certification: ProductCertification;
}

function CertificationBadge({ certification }: CertificationBadgeProps) {
  const info = getCertificationInfo(certification.authority);

  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        'flex items-center gap-2 px-3 py-2',
        'bg-white rounded-lg border border-neutral-200',
        'hover:border-neutral-300 transition-colors'
      )}
    >
      <BadgeCheck
        className="w-5 h-5 flex-shrink-0"
        style={{ color: info.color }}
      />
      <div className="min-w-0">
        <span className="text-sm font-semibold text-neutral-900">
          {info.name}
        </span>
        {certification.number && (
          <span className="text-xs text-neutral-500 ml-2">
            #{certification.number}
          </span>
        )}
        <p className="text-xs text-neutral-500 truncate">{info.fullName}</p>
      </div>
    </motion.div>
  );
}

interface SustainabilityBadgesProps {
  product: B2BProduct;
}

function SustainabilityBadges({ product }: SustainabilityBadgesProps) {
  const badges = useMemo(() => {
    const items: Array<{ icon: React.ReactNode; label: string; color: string }> = [];

    if (product.isEthicallySourced) {
      items.push({
        icon: <Check className="w-3.5 h-3.5" />,
        label: 'Sourcing ethique',
        color: 'text-green-600 bg-green-50 border-green-200',
      });
    }

    if (product.isConflictFree) {
      items.push({
        icon: <Shield className="w-3.5 h-3.5" />,
        label: 'Conflict-free',
        color: 'text-blue-600 bg-blue-50 border-blue-200',
      });
    }

    if (product.hasRecycledMetal) {
      items.push({
        icon: <Recycle className="w-3.5 h-3.5" />,
        label: 'Metal recycle',
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      });
    }

    return items;
  }, [product.isEthicallySourced, product.isConflictFree, product.hasRecycledMetal]);

  if (badges.length === 0) return null;

  return (
    <motion.div variants={containerVariants} className="flex flex-wrap gap-2">
      {badges.map((badge, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5',
            'rounded-full border text-xs font-medium',
            badge.color
          )}
        >
          {badge.icon}
          {badge.label}
        </motion.div>
      ))}
    </motion.div>
  );
}

interface ManufacturingInfoProps {
  product: B2BProduct;
}

function ManufacturingInfo({ product }: ManufacturingInfoProps) {
  const items = useMemo(() => {
    const list: Array<{ icon: React.ReactNode; label: string; value: string }> = [];

    if (product.isHandmade) {
      list.push({
        icon: <Factory className="w-4 h-4 text-amber-600" />,
        label: 'Fabrication',
        value: 'Fait main',
      });
    }

    if (product.isMadeToOrder) {
      list.push({
        icon: <Clock className="w-4 h-4 text-blue-600" />,
        label: 'Production',
        value: 'Sur commande',
      });
    }

    if (product.productionTimeDays) {
      list.push({
        icon: <Clock className="w-4 h-4 text-neutral-600" />,
        label: 'Delai',
        value: `${product.productionTimeDays} jours`,
      });
    }

    if (product.minOrderQuantity && product.minOrderQuantity > 1) {
      list.push({
        icon: <Package className="w-4 h-4 text-neutral-600" />,
        label: 'Qte min.',
        value: `${product.minOrderQuantity} pieces`,
      });
    }

    return list;
  }, [product]);

  if (items.length === 0) return null;

  return (
    <motion.div
      variants={containerVariants}
      className="grid grid-cols-2 gap-3"
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="flex items-center gap-2.5 p-3 bg-neutral-50 rounded-lg"
        >
          {item.icon}
          <div className="min-w-0">
            <p className="text-xs text-neutral-500">{item.label}</p>
            <p className="text-sm font-medium text-neutral-900 truncate">
              {item.value}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ProductCharacteristics({
  product,
  variant = 'full',
  collapsible = false,
  showCertifications = true,
  showSustainability = true,
  className,
}: ProductCharacteristicsProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsible);

  // Group characteristics
  const groupedCharacteristics = useMemo(() => {
    if (!product.caracteristiques) return {};
    return groupCharacteristics(product.caracteristiques);
  }, [product.caracteristiques]);

  const hasCharacteristics = Object.keys(groupedCharacteristics).length > 0;
  const hasCertifications = showCertifications && product.certifications && product.certifications.length > 0;
  const hasWarranty = product.garantieText || (product.warranty && product.warranty > 0);
  const hasManufacturing = product.isHandmade || product.isMadeToOrder || product.productionTimeDays || (product.minOrderQuantity && product.minOrderQuantity > 1);
  const hasSustainability = showSustainability && (product.isEthicallySourced || product.isConflictFree || product.hasRecycledMetal);

  // Don't render if no data
  if (!hasCharacteristics && !hasCertifications && !hasWarranty && !hasManufacturing && !hasSustainability) {
    return null;
  }

  const isCompact = variant === 'compact';

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with collapse toggle */}
      {collapsible && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'w-full flex items-center justify-between gap-2',
            'px-4 py-3 rounded-lg',
            'bg-neutral-50 hover:bg-neutral-100',
            'transition-colors duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
          )}
        >
          <span className="text-sm font-semibold text-neutral-900">
            Caracteristiques techniques
          </span>
          <ChevronDown
            className={cn(
              'w-5 h-5 text-neutral-500 transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
          />
        </button>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            variants={expandVariants}
            initial={collapsible ? 'collapsed' : 'expanded'}
            animate="expanded"
            exit="collapsed"
            className="overflow-hidden"
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Warranty Section */}
              {hasWarranty && (
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      Garantie {product.garantieText || (product.warranty === 999 ? 'A vie' :
                        product.warranty && product.warranty >= 12
                          ? `${Math.floor(product.warranty / 12)} an${Math.floor(product.warranty / 12) > 1 ? 's' : ''}`
                          : `${product.warranty} mois`
                      )}
                    </p>
                    <p className="text-xs text-green-700">
                      Protection constructeur incluse
                    </p>
                  </div>
                </div>
              )}

              {/* Certifications Section */}
              {hasCertifications && (
                <div>
                  {!isCompact && (
                    <h4 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Certifications
                    </h4>
                  )}
                  <div className={cn('grid gap-2', isCompact ? 'grid-cols-1' : 'grid-cols-2')}>
                    {product.certifications!.map((cert, index) => (
                      <CertificationBadge key={index} certification={cert} />
                    ))}
                  </div>
                </div>
              )}

              {/* Sustainability Badges */}
              {hasSustainability && (
                <div>
                  {!isCompact && (
                    <h4 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                      <Leaf className="w-4 h-4" />
                      Engagements
                    </h4>
                  )}
                  <SustainabilityBadges product={product} />
                </div>
              )}

              {/* Manufacturing Info */}
              {hasManufacturing && (
                <div>
                  {!isCompact && (
                    <h4 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                      <Factory className="w-4 h-4" />
                      Fabrication
                    </h4>
                  )}
                  <ManufacturingInfo product={product} />
                </div>
              )}

              {/* Characteristics by Group */}
              {hasCharacteristics && (
                <div className="space-y-4">
                  {Object.entries(groupedCharacteristics).map(([groupName, items]) => (
                    <div key={groupName}>
                      <h4 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                        {getGroupIcon(groupName)}
                        {groupName}
                      </h4>
                      <div className="border border-neutral-200 rounded-lg overflow-hidden">
                        {items.map((item, index) => (
                          <CharacteristicRow
                            key={item.key}
                            label={item.label}
                            value={item.value}
                            isEven={index % 2 === 0}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* HS Code (if available) */}
              {product.hsCode && (
                <div className="text-xs text-neutral-500 flex items-center gap-2">
                  <span>Code douanier:</span>
                  <span className="font-mono">{product.hsCode}</span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProductCharacteristics;
