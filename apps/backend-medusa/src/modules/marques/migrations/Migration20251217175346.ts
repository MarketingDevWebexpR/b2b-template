import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251217175346 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "marque" add column if not exists "is_favorite" boolean not null default false;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_marque_favorite" ON "marque" ("is_favorite") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_marque_active_favorite" ON "marque" ("is_active", "is_favorite") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "idx_marque_favorite";`);
    this.addSql(`drop index if exists "idx_marque_active_favorite";`);
    this.addSql(`alter table if exists "marque" drop column if exists "is_favorite";`);
  }

}
