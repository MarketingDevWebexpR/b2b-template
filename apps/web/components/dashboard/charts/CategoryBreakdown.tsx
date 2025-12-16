'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatPercent } from '@/lib/formatters';

/**
 * Category data for the breakdown chart
 */
export interface CategoryData {
  /** Category ID */
  id: string;
  /** Category name */
  name: string;
  /** Total spending in this category */
  amount: number;
  /** Percentage of total (0-100) */
  percentage: number;
  /** Number of items (optional) */
  itemsCount?: number;
}

export interface CategoryBreakdownProps {
  /** Array of category data (will show top 5 + Others) */
  data: CategoryData[];
  /** Currency code */
  currency?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Show as donut chart (true) or pie chart (false) */
  donut?: boolean;
  /** Chart size in pixels */
  size?: number;
  /** Additional class names */
  className?: string;
}

/**
 * Color palette for categories
 * Uses B2B design system colors
 */
const CATEGORY_COLORS = [
  { bg: 'bg-accent', stroke: '#f67828', fill: '#f67828' },
  { bg: 'bg-blue-500', stroke: '#3b82f6', fill: '#3b82f6' },
  { bg: 'bg-green-500', stroke: '#10b981', fill: '#10b981' },
  { bg: 'bg-purple-500', stroke: '#8b5cf6', fill: '#8b5cf6' },
  { bg: 'bg-amber-500', stroke: '#f59e0b', fill: '#f59e0b' },
  { bg: 'bg-neutral-400', stroke: '#94a3b8', fill: '#94a3b8' }, // "Autres"
];

/**
 * SVG Donut/Pie Chart segment
 */
interface DonutSegmentProps {
  percentage: number;
  rotation: number;
  color: string;
  isHovered: boolean;
  index: number;
  donut: boolean;
  size: number;
}

function DonutSegment({
  percentage,
  rotation,
  color,
  isHovered,
  donut,
  size,
}: DonutSegmentProps) {
  const radius = size / 2 - 10;
  const innerRadius = donut ? radius * 0.6 : 0;
  const center = size / 2;

  // Calculate the arc path
  const startAngle = (rotation * Math.PI) / 180;
  const endAngle = ((rotation + (percentage * 360) / 100) * Math.PI) / 180;

  const largeArcFlag = percentage > 50 ? 1 : 0;

  const startX = center + radius * Math.cos(startAngle - Math.PI / 2);
  const startY = center + radius * Math.sin(startAngle - Math.PI / 2);
  const endX = center + radius * Math.cos(endAngle - Math.PI / 2);
  const endY = center + radius * Math.sin(endAngle - Math.PI / 2);

  const innerStartX = center + innerRadius * Math.cos(endAngle - Math.PI / 2);
  const innerStartY = center + innerRadius * Math.sin(endAngle - Math.PI / 2);
  const innerEndX = center + innerRadius * Math.cos(startAngle - Math.PI / 2);
  const innerEndY = center + innerRadius * Math.sin(startAngle - Math.PI / 2);

  let path: string;

  if (donut) {
    path = `
      M ${startX} ${startY}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
      L ${innerStartX} ${innerStartY}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerEndX} ${innerEndY}
      Z
    `;
  } else {
    path = `
      M ${center} ${center}
      L ${startX} ${startY}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
      Z
    `;
  }

  return (
    <path
      d={path}
      fill={color}
      className={cn(
        'transition-all duration-200',
        isHovered && 'opacity-80'
      )}
      style={{
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        transformOrigin: 'center',
      }}
    />
  );
}

/**
 * CategoryBreakdown Component
 *
 * Displays spending breakdown by category as a donut/pie chart
 * with an interactive legend showing top 5 categories + "Others".
 *
 * @example
 * ```tsx
 * <CategoryBreakdown
 *   data={[
 *     { id: '1', name: 'Bracelets', amount: 4500, percentage: 33.3 },
 *     { id: '2', name: 'Colliers', amount: 3200, percentage: 23.7 },
 *     // ...
 *   ]}
 *   donut={true}
 * />
 * ```
 */
export function CategoryBreakdown({
  data,
  currency = 'EUR',
  isLoading = false,
  donut = true,
  size = 180,
  className,
}: CategoryBreakdownProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Process data: top 5 + others
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Sort by amount descending
    const sorted = [...data].sort((a, b) => b.amount - a.amount);

    // Take top 5
    const top5 = sorted.slice(0, 5);

    // Calculate "Others" if there are more than 5 categories
    if (sorted.length > 5) {
      const othersAmount = sorted.slice(5).reduce((sum, cat) => sum + cat.amount, 0);
      const othersPercentage = sorted.slice(5).reduce((sum, cat) => sum + cat.percentage, 0);
      const othersItemsCount = sorted.slice(5).reduce((sum, cat) => sum + (cat.itemsCount || 0), 0);

      top5.push({
        id: 'others',
        name: 'Autres',
        amount: othersAmount,
        percentage: othersPercentage,
        itemsCount: othersItemsCount,
      });
    }

    return top5;
  }, [data]);

  // Calculate rotation for each segment
  const segments = useMemo(() => {
    let currentRotation = 0;
    return processedData.map((category, index) => {
      const segment = {
        ...category,
        rotation: currentRotation,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      };
      currentRotation += (category.percentage * 360) / 100;
      return segment;
    });
  }, [processedData]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn('flex gap-6', className)}
        aria-busy="true"
        aria-label="Chargement de la repartition"
      >
        <div
          className="rounded-full bg-neutral-100 animate-pulse"
          style={{ width: size, height: size }}
        />
        <div className="flex-1 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-neutral-100 animate-pulse" />
              <div className="h-4 bg-neutral-100 rounded flex-1 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center text-neutral-500 font-sans text-body-sm py-8',
          className
        )}
        role="img"
        aria-label="Aucune donnee disponible"
      >
        Aucune donnee de categorie disponible
      </div>
    );
  }

  const totalAmount = processedData.reduce((sum, cat) => sum + cat.amount, 0);

  return (
    <div
      className={cn('flex flex-col sm:flex-row gap-6', className)}
      role="img"
      aria-label="Repartition des depenses par categorie"
    >
      {/* Donut/Pie Chart */}
      <div className="flex-shrink-0 mx-auto sm:mx-0" style={{ width: size, height: size }}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full"
          role="presentation"
        >
          {segments.map((segment, index) => (
            <DonutSegment
              key={segment.id}
              percentage={segment.percentage}
              rotation={segment.rotation}
              color={segment.color.fill}
              isHovered={hoveredIndex === index}
              index={index}
              donut={donut}
              size={size}
            />
          ))}

          {/* Center text for donut */}
          {donut && (
            <>
              <text
                x={size / 2}
                y={size / 2 - 8}
                textAnchor="middle"
                className="font-sans text-caption fill-neutral-500"
                style={{ fontSize: '12px' }}
              >
                Total
              </text>
              <text
                x={size / 2}
                y={size / 2 + 10}
                textAnchor="middle"
                className="font-sans font-semibold fill-neutral-900"
                style={{ fontSize: '14px' }}
              >
                {formatCurrency(totalAmount, currency).replace(/\s?EUR$/, '')}
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2">
        {segments.map((segment, index) => (
          <div
            key={segment.id}
            className={cn(
              'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors duration-150',
              hoveredIndex === index
                ? 'bg-neutral-100'
                : 'hover:bg-neutral-100'
            )}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            role="button"
            tabIndex={0}
            aria-label={`${segment.name}: ${formatPercent(segment.percentage / 100)} - ${formatCurrency(segment.amount, currency)}`}
          >
            {/* Color indicator */}
            <div
              className={cn('w-3 h-3 rounded-sm flex-shrink-0', segment.color.bg)}
              aria-hidden="true"
            />

            {/* Category info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-sans text-body-sm text-neutral-900 truncate">
                  {segment.name}
                </span>
                <span className="font-sans text-body-sm font-medium text-neutral-900 flex-shrink-0">
                  {formatPercent(segment.percentage / 100)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-sans text-caption text-neutral-500">
                  {segment.itemsCount !== undefined && (
                    <>{segment.itemsCount} article{segment.itemsCount > 1 ? 's' : ''}</>
                  )}
                </span>
                <span className="font-sans text-caption text-neutral-500">
                  {formatCurrency(segment.amount, currency)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Compact version of CategoryBreakdown for smaller spaces
 */
export function CategoryBreakdownCompact({
  data,
  currency = 'EUR',
  className,
}: Pick<CategoryBreakdownProps, 'data' | 'currency' | 'className'>) {
  // Process data: top 5 + others
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const sorted = [...data].sort((a, b) => b.amount - a.amount);
    const top5 = sorted.slice(0, 5);

    if (sorted.length > 5) {
      const othersAmount = sorted.slice(5).reduce((sum, cat) => sum + cat.amount, 0);
      const othersPercentage = sorted.slice(5).reduce((sum, cat) => sum + cat.percentage, 0);

      top5.push({
        id: 'others',
        name: 'Autres',
        amount: othersAmount,
        percentage: othersPercentage,
      });
    }

    return top5;
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <p className="text-neutral-500 font-sans text-body-sm">
        Aucune donnee disponible
      </p>
    );
  }

  const totalAmount = processedData.reduce((sum, cat) => sum + cat.amount, 0);

  return (
    <div className={cn('space-y-3', className)}>
      {processedData.map((category, index) => (
        <div key={category.id} className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-2 h-2 rounded-sm',
                  CATEGORY_COLORS[index % CATEGORY_COLORS.length].bg
                )}
              />
              <span className="font-sans text-body-sm text-neutral-900 truncate">
                {category.name}
              </span>
            </div>
            <span className="font-sans text-body-sm font-medium text-neutral-900">
              {formatPercent(category.percentage / 100)}
            </span>
          </div>
          <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                CATEGORY_COLORS[index % CATEGORY_COLORS.length].bg
              )}
              style={{ width: `${category.percentage}%` }}
            />
          </div>
        </div>
      ))}

      {/* Total */}
      <div className="pt-2 border-t border-neutral-200">
        <div className="flex items-center justify-between">
          <span className="font-sans text-caption text-neutral-500">Total</span>
          <span className="font-sans text-body-sm font-semibold text-neutral-900">
            {formatCurrency(totalAmount, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CategoryBreakdown;
