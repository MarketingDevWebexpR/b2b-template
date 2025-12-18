/**
 * Seed Hero Slides Script
 *
 * Script pour migrer les slides hero existantes du frontend vers le CMS.
 * Execute avec: npx medusa exec ./src/scripts/seed-hero-slides.ts
 *
 * @packageDocumentation
 */

import type { ExecArgs } from "@medusajs/framework/types";
import type CmsModuleService from "../modules/cms/service";

const CMS_MODULE = "cmsService";

/**
 * Les slides existantes du frontend a migrer
 */
const existingSlides = [
  {
    title: "Collection Printemps 2025",
    subtitle: "Nouveautes",
    description: "Decouvrez notre selection exclusive de bijoux pour la nouvelle saison",
    cta_label: "Decouvrir les nouveautes",
    cta_href: "/categories?sort=newest",
    badge: "Nouveau",
    gradient: "from-primary-700 via-primary-600 to-primary-500",
    position: 0,
    is_published: true,
  },
  {
    title: "-20% sur les commandes pro",
    subtitle: "Offre limitee",
    description: "Profitez de remises exceptionnelles sur tout le catalogue avec le code PRO20",
    cta_label: "En profiter",
    cta_href: "/promotions",
    secondary_cta_label: "Voir les conditions",
    secondary_cta_href: "/promotions/conditions",
    badge: "Promo",
    gradient: "from-accent-700 via-accent-600 to-accent-500",
    position: 1,
    is_published: true,
  },
  {
    title: "Diamants certifies",
    subtitle: "Selection Premium",
    description: "Une selection de diamants certifies GIA pour vos creations les plus prestigieuses",
    cta_label: "Explorer",
    cta_href: "/categories/pierres/diamants",
    badge: "Premium",
    gradient: "from-gold-700 via-gold-600 to-accent",
    position: 2,
    is_published: true,
  },
  {
    title: "Livraison express 24h",
    subtitle: "Service Pro",
    description: "Recevez vos commandes en 24h sur toute la France metropolitaine",
    cta_label: "En savoir plus",
    cta_href: "/services/livraison-express",
    gradient: "from-success-700 via-success-600 to-success-500",
    position: 3,
    is_published: true,
  },
];

export default async function seedHeroSlides({ container }: ExecArgs) {
  const cmsService: CmsModuleService = container.resolve(CMS_MODULE);

  console.log("🚀 Starting Hero Slides migration...\n");

  // Verifier si des slides existent deja
  const existingCount = await cmsService.listHeroSlides({});

  if (existingCount.length > 0) {
    console.log(`⚠️  Found ${existingCount.length} existing slide(s).`);
    console.log("   Skipping migration to avoid duplicates.\n");
    console.log("   To re-run migration, delete existing slides first.\n");
    return;
  }

  // Creer les slides
  let created = 0;
  let failed = 0;

  for (const slideData of existingSlides) {
    try {
      const slide = await cmsService.createHeroSlideWithValidation(slideData);
      console.log(`✅ Created slide: "${slide.title}" (position: ${slide.position})`);
      created++;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`❌ Failed to create slide "${slideData.title}": ${message}`);
      failed++;
    }
  }

  console.log("\n📊 Migration Summary:");
  console.log(`   - Created: ${created} slide(s)`);
  console.log(`   - Failed: ${failed} slide(s)`);
  console.log("\n✨ Migration complete!");
}
