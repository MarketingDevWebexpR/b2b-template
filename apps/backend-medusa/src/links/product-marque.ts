/**
 * Product-Marque Link Definition
 *
 * Defines the relationship between Products and Marques (Brands).
 * One product can have ONE brand (many-to-one from product perspective).
 * Multiple products can share the same brand.
 *
 * This creates a link table: product_marque_marque
 *
 * @packageDocumentation
 */

import { defineLink } from "@medusajs/framework/utils";
import ProductModule from "@medusajs/medusa/product";
import MarquesModule from "../modules/marques";

/**
 * Product-Marque Link
 *
 * Links products to their brand (marque).
 * - A marque can have multiple products (isList: true on product side)
 * - A product belongs to one marque
 *
 * Usage with Remote Query:
 * ```typescript
 * // Get products with their brand
 * const products = await remoteQuery({
 *   product: {
 *     fields: ["id", "title", "handle"],
 *     marque: {
 *       fields: ["id", "name", "slug", "logo_url"],
 *     },
 *   },
 * });
 *
 * // Get brand with all its products
 * const brand = await remoteQuery({
 *   marque: {
 *     fields: ["id", "name", "slug"],
 *     products: {
 *       fields: ["id", "title", "handle"],
 *     },
 *   },
 *   filters: { id: marqueId },
 * });
 * ```
 *
 * Usage with Remote Link:
 * ```typescript
 * import { Modules } from "@medusajs/framework/utils";
 * import { MARQUES_MODULE } from "../modules/marques";
 *
 * // Link a product to a brand
 * await remoteLink.create({
 *   [Modules.PRODUCT]: { product_id: "prod_123" },
 *   [MARQUES_MODULE]: { marque_id: "marque_456" },
 * });
 *
 * // Unlink a product from a brand
 * await remoteLink.dismiss({
 *   [Modules.PRODUCT]: { product_id: "prod_123" },
 *   [MARQUES_MODULE]: { marque_id: "marque_456" },
 * });
 * ```
 */
export default defineLink(
  {
    linkable: ProductModule.linkable.product,
    isList: true,
  },
  MarquesModule.linkable.marque
);
