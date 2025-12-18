import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251216221146 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "cms_announcement_banner" ("id" text not null, "message" text not null, "link_url" text null, "link_text" text null, "background_color" text not null default '#1a1a2e', "text_color" text not null default '#ffffff', "start_date" timestamptz null, "end_date" timestamptz null, "is_active" boolean not null default true, "priority" integer not null default 0, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "cms_announcement_banner_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_cms_announcement_banner_deleted_at" ON "cms_announcement_banner" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_announcement_is_active" ON "cms_announcement_banner" ("is_active") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_announcement_start_date" ON "cms_announcement_banner" ("start_date") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_announcement_end_date" ON "cms_announcement_banner" ("end_date") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_announcement_priority" ON "cms_announcement_banner" ("priority") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_announcement_active_period" ON "cms_announcement_banner" ("is_active", "start_date", "end_date") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_announcement_active_priority" ON "cms_announcement_banner" ("is_active", "priority") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "cms_announcement_banner" cascade;`);
  }

}
