import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251216224029 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "cms_hero_slide" ("id" text not null, "title" text not null, "subtitle" text null, "description" text null, "badge" text null, "image_url" text null, "image_alt" text null, "gradient" text not null default 'from-primary-700 via-primary-600 to-primary-500', "text_color" text not null default '#ffffff', "overlay_opacity" integer not null default 0, "cta_label" text not null, "cta_href" text not null, "secondary_cta_label" text null, "secondary_cta_href" text null, "position" integer not null default 0, "is_published" boolean not null default false, "start_date" timestamptz null, "end_date" timestamptz null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "cms_hero_slide_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_cms_hero_slide_deleted_at" ON "cms_hero_slide" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_hero_slide_published" ON "cms_hero_slide" ("is_published") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_hero_slide_position" ON "cms_hero_slide" ("position") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_hero_slide_start_date" ON "cms_hero_slide" ("start_date") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_hero_slide_end_date" ON "cms_hero_slide" ("end_date") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_hero_slide_published_position" ON "cms_hero_slide" ("is_published", "position") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_hero_slide_published_period" ON "cms_hero_slide" ("is_published", "start_date", "end_date") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "cms_hero_slide" cascade;`);
  }

}
