/**
 * B2B Company Module Definition
 *
 * This module provides company management functionality for B2B e-commerce.
 * It includes company profiles, addresses, credit management, and payment terms.
 *
 * @packageDocumentation
 */

import { Module } from "@medusajs/framework/utils";
import CompanyModuleService from "./service";

/**
 * Module identifier used for dependency injection
 * Note: Must match the service name derived from model table name (b2b_company → b2bCompanyService)
 */
export const B2B_COMPANY_MODULE = "b2bCompanyService";

/**
 * B2B Company Module
 *
 * Register this module in medusa-config.ts:
 * ```typescript
 * modules: [
 *   { resolve: "./src/modules/b2b-company" },
 * ]
 * ```
 */
export default Module(B2B_COMPANY_MODULE, {
  service: CompanyModuleService,
});

// Re-export service and types
export { default as CompanyModuleService } from "./service";
export type {
  PaymentTermType,
  PaymentTerms,
  CompanySettings,
  CompanyStatus,
  CompanyTier,
  AddressType,
  CreateCompanyInput,
  CreateAddressInput,
} from "./service";

// Re-export models
export {
  Company,
  CompanyAddress,
  CompanyUnit,
  CompanyMembership,
  UnitMembership,
  COMPANY_STATUSES,
  COMPANY_TIERS,
  ADDRESS_TYPES,
  COMPANY_UNIT_TYPES,
  MEMBERSHIP_ROLES,
  MEMBERSHIP_STATUSES,
  UNIT_MEMBERSHIP_ROLES,
} from "./models/index";
