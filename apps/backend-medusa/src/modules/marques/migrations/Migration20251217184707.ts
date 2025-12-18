import { Migration } from "@medusajs/framework/mikro-orm/migrations";

/**
 * Migration to add is_favorite column to marque table
 * This column allows marking brands as favorites for featured display
 */
export class Migration20251217184707 extends Migration {
  override async up(): Promise<void> {
    // Add is_favorite column with default value false
    this.addSql(
      `ALTER TABLE IF EXISTS "marque" ADD COLUMN IF NOT EXISTS "is_favorite" boolean NOT NULL DEFAULT false;`
    );

    // Create index for is_favorite filtering
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "idx_marque_favorite" ON "marque" ("is_favorite") WHERE deleted_at IS NULL;`
    );

    // Create composite index for active favorites
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "idx_marque_active_favorite" ON "marque" ("is_active", "is_favorite") WHERE deleted_at IS NULL;`
    );
  }

  override async down(): Promise<void> {
    // Drop indexes
    this.addSql(`DROP INDEX IF EXISTS "idx_marque_active_favorite";`);
    this.addSql(`DROP INDEX IF EXISTS "idx_marque_favorite";`);

    // Drop column
    this.addSql(
      `ALTER TABLE IF EXISTS "marque" DROP COLUMN IF EXISTS "is_favorite";`
    );
  }
}
