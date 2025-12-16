/**
 * Health Check API Route
 *
 * Simple endpoint for monitoring and load balancer health checks.
 *
 * GET /health
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

/**
 * GET /health
 *
 * Returns health status of the Medusa backend.
 * Use this endpoint for:
 * - Load balancer health checks
 * - Kubernetes liveness/readiness probes
 * - Monitoring systems
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    service: "@maison/backend-medusa",
  });
}
