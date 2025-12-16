/**
 * Product mappers for Sage ERP API responses
 *
 * Maps Sage API product format to domain Product type.
 */

import type { Product } from "@maison/types";
import type { SageProduct, SageRawArticle } from "../types";

/**
 * Generate slug from name
 */
function generateSlug(name: string, sku: string): string {
  if (!name) return sku.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Map Sage raw article (from Proconsult WebServices) to domain Product
 *
 * @param raw - Raw article from Sage API
 * @returns Domain Product object
 */
export function mapSageArticle(raw: SageRawArticle): Product {
  // Extract collection/style from statistics
  const collection = raw.Statistique1 || undefined;
  const style = raw.Statistique2 || undefined;

  // Extract brand from InfosLibres if available
  let brand: string | undefined;
  if (raw.InfosLibres) {
    const brandInfo = raw.InfosLibres.find(
      (info) => info.Name === "Marque commerciale"
    );
    if (brandInfo && brandInfo.Value) {
      brand = String(brandInfo.Value);
    }
  }

  // Determine availability
  const isAvailable = raw.Publie && !raw.EstEnSommeil && !raw.InterdireCommande;

  // Extract images (single photo path from Sage)
  const images: string[] = [];
  if (raw.Photo) {
    images.push(raw.Photo);
  }

  return {
    id: raw.Reference,
    reference: raw.Reference,
    name: raw.Intitule,
    slug: generateSlug(raw.Intitule, raw.Reference),
    description: raw.Langue1 ?? raw.Intitule,
    shortDescription: raw.Intitule,
    price: raw.PrixVente,
    isPriceTTC: raw.EstEnPrixTTTC,
    images,
    categoryId: raw.CodeFamille,
    materials: [],
    weightUnit: "g",
    stock: 0, // Stock comes from separate inventory call
    isAvailable,
    featured: false,
    isNew: false,
    createdAt: raw.DateCreation,
    // Optional properties
    ...(raw.Langue1 && { nameEn: raw.Langue1 }),
    ...(raw.CodeBarres && { ean: raw.CodeBarres }),
    ...(collection && { collection }),
    ...(style && { style }),
    ...(raw.PoidsNet && { weight: raw.PoidsNet }),
    ...(brand && { brand }),
    ...(raw.Pays && { origin: raw.Pays }),
    ...(raw.Garantie && { warranty: raw.Garantie }),
  };
}

/**
 * Map simplified Sage product to domain Product
 */
export function mapSageProduct(raw: SageProduct): Product {
  return {
    id: raw.id,
    reference: raw.sku,
    name: raw.name,
    slug: generateSlug(raw.name, raw.sku),
    description: raw.description ?? "",
    shortDescription: raw.description ?? "",
    price: raw.price,
    isPriceTTC: false,
    images: [],
    categoryId: raw.category ?? "",
    materials: [],
    weightUnit: "g",
    stock: 0,
    isAvailable: raw.active,
    featured: false,
    isNew: false,
    createdAt: raw.createdAt,
    ...(raw.category && { collection: raw.category }),
  };
}

/**
 * Map array of Sage products to domain Products
 */
export function mapSageProducts(rawProducts: SageProduct[]): Product[] {
  return rawProducts.map(mapSageProduct);
}

/**
 * Map array of Sage articles to domain Products
 */
export function mapSageArticles(rawArticles: SageRawArticle[]): Product[] {
  return rawArticles.map(mapSageArticle);
}
