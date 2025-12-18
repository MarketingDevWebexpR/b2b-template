import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251217095156 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "marque" ("id" text not null, "name" text not null, "slug" text not null, "description" text null, "logo_url" text null, "website_url" text null, "country" text null, "is_active" boolean not null default true, "rank" integer not null default 0, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "marque_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_marque_deleted_at" ON "marque" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "idx_marque_name_unique" ON "marque" ("name") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "idx_marque_slug_unique" ON "marque" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_marque_active" ON "marque" ("is_active") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_marque_rank" ON "marque" ("rank") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_marque_active_rank" ON "marque" ("is_active", "rank") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_marque_country" ON "marque" ("country") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "marque" cascade;`);
  }

}
