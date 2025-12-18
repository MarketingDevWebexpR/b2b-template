/**
 * Migration: Ajout des champs layout pour HeroSlide
 *
 * Cette migration ajoute les nouveaux champs pour supporter differents
 * layouts de slides hero et l'integration avec le stockage de fichiers S3/MinIO.
 *
 * Nouveaux champs:
 * - layout_type: type de mise en page ('background', 'side', 'fullwidth')
 * - image_position: position de l'image pour le layout 'side' ('left', 'right')
 * - image_file_key: cle du fichier dans le stockage S3/MinIO
 *
 * Modifications:
 * - overlay_opacity: changement de la valeur par defaut de 0 a 40
 *
 * @packageDocumentation
 */

import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251217000000 extends Migration {
  override async up(): Promise<void> {
    // Ajouter le champ layout_type avec valeur par defaut 'background'
    this.addSql(`
      ALTER TABLE "cms_hero_slide"
      ADD COLUMN IF NOT EXISTS "layout_type" text NOT NULL DEFAULT 'background';
    `);

    // Ajouter le champ image_position avec valeur par defaut 'right'
    this.addSql(`
      ALTER TABLE "cms_hero_slide"
      ADD COLUMN IF NOT EXISTS "image_position" text NOT NULL DEFAULT 'right';
    `);

    // Ajouter le champ image_file_key pour stocker la cle du fichier S3/MinIO
    this.addSql(`
      ALTER TABLE "cms_hero_slide"
      ADD COLUMN IF NOT EXISTS "image_file_key" text NULL;
    `);

    // Mettre a jour la valeur par defaut de overlay_opacity de 0 a 40
    // pour les nouveaux slides (les existants gardent leur valeur)
    this.addSql(`
      ALTER TABLE "cms_hero_slide"
      ALTER COLUMN "overlay_opacity" SET DEFAULT 40;
    `);

    // Creer un index sur layout_type pour les requetes filtrees
    this.addSql(`
      CREATE INDEX IF NOT EXISTS "idx_hero_slide_layout_type"
      ON "cms_hero_slide" ("layout_type")
      WHERE deleted_at IS NULL;
    `);
  }

  override async down(): Promise<void> {
    // Supprimer l'index sur layout_type
    this.addSql(`DROP INDEX IF EXISTS "idx_hero_slide_layout_type";`);

    // Restaurer la valeur par defaut de overlay_opacity a 0
    this.addSql(`
      ALTER TABLE "cms_hero_slide"
      ALTER COLUMN "overlay_opacity" SET DEFAULT 0;
    `);

    // Supprimer le champ image_file_key
    this.addSql(`
      ALTER TABLE "cms_hero_slide"
      DROP COLUMN IF EXISTS "image_file_key";
    `);

    // Supprimer le champ image_position
    this.addSql(`
      ALTER TABLE "cms_hero_slide"
      DROP COLUMN IF EXISTS "image_position";
    `);

    // Supprimer le champ layout_type
    this.addSql(`
      ALTER TABLE "cms_hero_slide"
      DROP COLUMN IF EXISTS "layout_type";
    `);
  }
}
