'use client';

import { useMemo, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { DateRangePeriod } from './DateRangeSelector';

/**
 * Data point for the spending chart
 */
export interface SpendingDataPoint {
  /** Date or period label */
  date: string;
  /** Amount spent */
  amount: number;
  /** Number of orders (optional) */
  ordersCount?: number;
}

export interface SpendingChartProps {
  /** Array of spending data points */
  data: SpendingDataPoint[];
  /** Current selected period */
  period: DateRangePeriod;
  /** Chart type: line (bars that simulate line) or bar */
  chartType?: 'line' | 'bar';
  /** Currency code */
  currency?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Chart height in pixels */
  height?: number;
  /** Additional class names */
  className?: string;
}

/**
 * Format date label based on period
 */
function formatDateLabel(dateStr: string, period: DateRangePeriod): string {
  const date = new Date(dateStr);

  if (period === '12m') {
    // Show month name for yearly view
    return date.toLocaleDateString('fr-FR', { month: 'short' });
  }

  if (period === '90d') {
    // Show week number or month/day
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  // For 7d and 30d, show day
  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
}

/**
 * Tooltip component for chart hover
 */
interface TooltipProps {
  data: SpendingDataPoint;
  position: { x: number; y: number };
  currency: string;
  visible: boolean;
}

function ChartTooltip({ data, position, currency, visible }: TooltipProps) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        'absolute z-10 pointer-events-none',
        'bg-neutral-900 text-white rounded-lg px-3 py-2 shadow-lg',
        'transform -translate-x-1/2 -translate-y-full',
        'opacity-0 transition-opacity duration-150',
        visible && 'opacity-100'
      )}
      style={{
        left: position.x,
        top: position.y - 8,
      }}
      role="tooltip"
    >
      <p className="font-sans text-caption text-white/80 mb-0.5">
        {formatDate(data.date)}
      </p>
      <p className="font-sans text-body-sm font-semibold">
        {formatCurrency(data.amount, currency)}
      </p>
      {data.ordersCount !== undefined && (
        <p className="font-sans text-caption text-white/70 mt-0.5">
          {data.ordersCount} commande{data.ordersCount > 1 ? 's' : ''}
        </p>
      )}
      {/* Tooltip arrow */}
      <div
        className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full"
        style={{
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid #1e293b',
        }}
      />
    </div>
  );
}

/**
 * SpendingChart Component
 *
 * Displays spending over time as a bar or line chart using pure CSS.
 * Supports hover tooltips with detailed information.
 *
 * @example
 * ```tsx
 * <SpendingChart
 *   data={[
 *     { date: '2024-12-01', amount: 1200, ordersCount: 5 },
 *     { date: '2024-12-02', amount: 850, ordersCount: 3 },
 *     // ...
 *   ]}
 *   period="30d"
 *   chartType="bar"
 * />
 * ```
 */
export function SpendingChart({
  data,
  period,
  chartType = 'bar',
  currency = 'EUR',
  isLoading = false,
  height = 200,
  className,
}: SpendingChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Calculate chart metrics
  const { maxAmount, minAmount, yAxisLabels, normalizedData } = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        maxAmount: 0,
        minAmount: 0,
        yAxisLabels: [],
        normalizedData: [],
      };
    }

    const amounts = data.map((d) => d.amount);
    const max = Math.max(...amounts);
    const min = Math.min(...amounts, 0);
    const range = max - min || 1;

    // Generate Y-axis labels (4 steps)
    const step = range / 4;
    const labels = [0, 1, 2, 3, 4].map((i) => min + step * i).reverse();

    // Normalize data for chart height
    const normalized = data.map((d) => ({
      ...d,
      heightPercent: ((d.amount - min) / range) * 100,
    }));

    return {
      maxAmount: max,
      minAmount: min,
      yAxisLabels: labels,
      normalizedData: normalized,
    };
  }, [data]);

  // Handle bar hover
  const handleBarHover = useCallback(
    (index: number, event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const containerRect = event.currentTarget.parentElement?.parentElement?.getBoundingClientRect();

      if (containerRect) {
        setTooltipPosition({
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top,
        });
      }
      setHoveredIndex(index);
    },
    []
  );

  const handleBarLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn('relative', className)}
        style={{ height }}
        aria-busy="true"
        aria-label="Chargement du graphique"
      >
        <div className="absolute inset-0 flex items-end justify-between gap-1 px-8">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-neutral-100 rounded-t animate-pulse"
              style={{
                height: `${30 + Math.random() * 50}%`,
                animationDelay: `${i * 50}ms`,
              }}
            />
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
          'flex items-center justify-center text-neutral-500 font-sans text-body-sm',
          className
        )}
        style={{ height }}
        role="img"
        aria-label="Aucune donnee disponible"
      >
        Aucune donnee disponible pour cette periode
      </div>
    );
  }

  // Determine how many labels to show based on data points
  const labelInterval = data.length > 15 ? Math.ceil(data.length / 8) : 1;

  return (
    <div
      className={cn('relative', className)}
      style={{ height: height + 40 }} // Extra space for labels
      role="img"
      aria-label={`Graphique des depenses sur ${period === '7d' ? '7 jours' : period === '30d' ? '30 jours' : period === '90d' ? '90 jours' : '12 mois'}`}
    >
      {/* Y-Axis labels */}
      <div
        className="absolute left-0 top-0 bottom-10 w-16 flex flex-col justify-between"
        aria-hidden="true"
      >
        {yAxisLabels.map((value, i) => (
          <span
            key={i}
            className="font-sans text-caption text-neutral-500 text-right pr-2"
          >
            {formatCurrency(value, currency).replace(/\s?EUR$/, '')}
          </span>
        ))}
      </div>

      {/* Chart area */}
      <div className="absolute left-16 right-0 top-0 bottom-10">
        {/* Grid lines */}
        <div
          className="absolute inset-0 flex flex-col justify-between pointer-events-none"
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="border-b border-neutral-200" />
          ))}
        </div>

        {/* Bars */}
        <div className="absolute inset-0 flex items-end gap-px">
          {normalizedData.map((point, index) => {
            const isHovered = hoveredIndex === index;
            const isLast = index === normalizedData.length - 1;

            return (
              <div
                key={index}
                className="flex-1 relative group cursor-pointer"
                onMouseEnter={(e) => handleBarHover(index, e)}
                onMouseLeave={handleBarLeave}
                onFocus={(e) => handleBarHover(index, e as unknown as React.MouseEvent<HTMLDivElement>)}
                onBlur={handleBarLeave}
                tabIndex={0}
                role="button"
                aria-label={`${formatDate(point.date)}: ${formatCurrency(point.amount, currency)}`}
              >
                <div
                  className={cn(
                    'w-full rounded-t transition-all duration-200',
                    chartType === 'line' ? 'rounded-full' : 'rounded-t',
                    isHovered
                      ? 'bg-accent'
                      : isLast
                        ? 'bg-accent'
                        : 'bg-accent/30'
                  )}
                  style={{
                    height: `${Math.max(point.heightPercent, 2)}%`,
                    minHeight: '4px',
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Tooltip */}
        {hoveredIndex !== null && (
          <ChartTooltip
            data={normalizedData[hoveredIndex]}
            position={tooltipPosition}
            currency={currency}
            visible={true}
          />
        )}
      </div>

      {/* X-Axis labels */}
      <div
        className="absolute left-16 right-0 bottom-0 h-8 flex items-start pt-1"
        aria-hidden="true"
      >
        {normalizedData.map((point, index) => {
          // Only show label at intervals
          if (index % labelInterval !== 0 && index !== normalizedData.length - 1) {
            return <div key={index} className="flex-1" />;
          }

          return (
            <div
              key={index}
              className="flex-1 text-center"
              style={{
                marginLeft: index === 0 ? 0 : undefined,
              }}
            >
              <span className="font-sans text-caption text-neutral-500 whitespace-nowrap">
                {formatDateLabel(point.date, period)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Generate mock spending data for a period
 * Useful for testing and development
 */
export function generateMockSpendingData(
  period: DateRangePeriod,
  baseAmount: number = 500
): SpendingDataPoint[] {
  const data: SpendingDataPoint[] = [];
  const now = new Date();

  let daysCount: number;
  let dateStep: number;

  switch (period) {
    case '7d':
      daysCount = 7;
      dateStep = 1;
      break;
    case '30d':
      daysCount = 30;
      dateStep = 1;
      break;
    case '90d':
      daysCount = 12; // Weekly aggregation
      dateStep = 7;
      break;
    case '12m':
      daysCount = 12; // Monthly aggregation
      dateStep = 30;
      break;
    default:
      daysCount = 30;
      dateStep = 1;
  }

  for (let i = daysCount - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * dateStep);

    // Generate some variation
    const variation = (Math.random() - 0.5) * baseAmount;
    const trendFactor = 1 + (daysCount - i) * 0.02; // Slight upward trend
    const amount = Math.max(0, (baseAmount + variation) * trendFactor);

    data.push({
      date: date.toISOString().split('T')[0],
      amount: Math.round(amount * 100) / 100,
      ordersCount: Math.floor(Math.random() * 5) + 1,
    });
  }

  return data;
}

export default SpendingChart;
