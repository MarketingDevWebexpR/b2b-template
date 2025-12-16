/**
 * Dashboard Charts Components
 *
 * A collection of chart components for spending analysis in the B2B dashboard.
 * All charts use pure CSS for rendering (no external charting library required).
 *
 * @example
 * ```tsx
 * import {
 *   DateRangeSelector,
 *   SpendingKPI,
 *   SpendingChart,
 *   CategoryBreakdown,
 *   TopProductsChart,
 *   useDateRange,
 * } from '@/components/dashboard/charts';
 *
 * function SpendingAnalytics() {
 *   const [period, setPeriod] = useDateRange('30d', 'dashboard-period');
 *
 *   return (
 *     <>
 *       <DateRangeSelector value={period} onChange={setPeriod} />
 *       <SpendingKPI data={...} period={period} />
 *       <SpendingChart data={...} period={period} />
 *       <CategoryBreakdown data={...} />
 *       <TopProductsChart data={...} />
 *     </>
 *   );
 * }
 * ```
 */

// Date Range Selector
export {
  DateRangeSelector,
  useDateRange,
  getDateRangeFromPeriod,
  getPeriodLabel,
  type DateRangePeriod,
  type DateRangeSelectorProps,
} from './DateRangeSelector';

// Spending KPIs
export {
  SpendingKPI,
  type SpendingData,
  type SpendingKPIProps,
} from './SpendingKPI';

// Spending Chart
export {
  SpendingChart,
  generateMockSpendingData,
  type SpendingDataPoint,
  type SpendingChartProps,
} from './SpendingChart';

// Category Breakdown
export {
  CategoryBreakdown,
  CategoryBreakdownCompact,
  type CategoryData,
  type CategoryBreakdownProps,
} from './CategoryBreakdown';

// Top Products Chart
export {
  TopProductsChart,
  TopProductsCompact,
  type ProductData,
  type TopProductsChartProps,
} from './TopProductsChart';

// Spending Analytics (integrated component)
export {
  SpendingAnalytics,
  type SpendingAnalyticsProps,
} from './SpendingAnalytics';
