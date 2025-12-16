/**
 * Admin B2B Spending Reports API Route
 *
 * Provides admin endpoints for spending reports and analytics.
 *
 * GET /admin/b2b/spending/reports - Get spending summary report
 *
 * @packageDocumentation
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import type SpendingModuleService from "../../../../../modules/b2b-spending/service";
const B2B_QUOTE_MODULE = "b2bQuoteService";
const B2B_APPROVAL_MODULE = "b2bApprovalWorkflowService";
const B2B_SPENDING_MODULE = "b2bSpendingLimitService";
const B2B_COMPANY_MODULE = "b2bCompanyService";

/**
 * Query parameters for reports
 */
interface ReportQuery {
  company_id: string;
  start_date?: string;
  end_date?: string;
}

/**
 * GET /admin/b2b/spending/reports
 *
 * Returns spending summary report for a company.
 *
 * @query company_id - Required. Company to generate report for
 * @query start_date - Optional. Start date (ISO format)
 * @query end_date - Optional. End date (ISO format)
 */
export async function GET(
  req: MedusaRequest<object, ReportQuery>,
  res: MedusaResponse
): Promise<void> {
  const { company_id, start_date, end_date } = req.query;

  if (!company_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "company_id is required"
    );
  }

  const spendingService: SpendingModuleService = req.scope.resolve(B2B_SPENDING_MODULE);

  // Parse dates
  const startDate = start_date ? new Date(start_date as string) : undefined;
  const endDate = end_date ? new Date(end_date as string) : undefined;

  // Validate dates
  if (startDate && isNaN(startDate.getTime())) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Invalid start_date format"
    );
  }

  if (endDate && isNaN(endDate.getTime())) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Invalid end_date format"
    );
  }

  // Get spending summary
  const summary = await spendingService.getSpendingSummary(
    company_id as string,
    startDate,
    endDate
  );

  // Get current limits status
  const limits = await spendingService.listSpendingLimits({
    company_id,
    is_active: true,
  });

  const limitsStatus = limits.map((limit) => {
    const currentSpending = Number(limit.current_spending);
    const limitAmount = Number(limit.limit_amount);
    const utilization = limitAmount > 0 ? (currentSpending / limitAmount) * 100 : 0;

    return {
      id: limit.id,
      name: limit.name,
      entity_type: limit.entity_type,
      entity_id: limit.entity_id,
      period: limit.period,
      limit_amount: limitAmount,
      current_spending: currentSpending,
      utilization_percentage: Math.round(utilization * 100) / 100,
      is_over_threshold: utilization >= Number(limit.warning_threshold),
      next_reset_at: limit.next_reset_at,
    };
  });

  // Group limits by status
  const limitsOverThreshold = limitsStatus.filter((l) => l.is_over_threshold);
  const limitsHealthy = limitsStatus.filter((l) => !l.is_over_threshold);

  res.status(200).json({
    company_id,
    period: {
      start_date: startDate?.toISOString() ?? null,
      end_date: endDate?.toISOString() ?? null,
    },
    spending: {
      total: summary.totalSpending,
      transaction_count: summary.transactionCount,
      average_transaction: Math.round(summary.averageTransaction),
    },
    by_customer: Object.entries(summary.byCustomer).map(([customerId, data]) => ({
      customer_id: customerId,
      total: data.total,
      transaction_count: data.count,
    })),
    limits: {
      total: limitsStatus.length,
      over_threshold: limitsOverThreshold.length,
      healthy: limitsHealthy.length,
      details: limitsStatus,
    },
    alerts: limitsOverThreshold.map((l) => ({
      type: "limit_over_threshold",
      limit_id: l.id,
      limit_name: l.name,
      utilization: l.utilization_percentage,
      message: `${l.name || l.entity_type} limit at ${l.utilization_percentage}% utilization`,
    })),
  });
}
