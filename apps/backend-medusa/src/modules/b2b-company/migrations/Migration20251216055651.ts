import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251216055651 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "b2b_company" drop constraint if exists "b2b_company_slug_unique";`);
    this.addSql(`create table if not exists "b2b_company" ("id" text not null, "name" text not null, "trade_name" text null, "slug" text not null, "logo_url" text null, "website" text null, "description" text null, "tax_id" text null, "registration_number" text null, "duns_number" text null, "industry_code" text null, "email" text not null, "phone" text null, "fax" text null, "status" text check ("status" in ('pending', 'active', 'suspended', 'inactive', 'closed')) not null default 'pending', "tier" text check ("tier" in ('standard', 'premium', 'enterprise', 'vip')) not null default 'standard', "credit_limit" numeric not null default 0, "credit_used" numeric not null default 0, "payment_terms" jsonb not null, "settings" jsonb not null, "account_manager_id" text null, "sales_rep_id" text null, "notes" text null, "default_billing_address_id" text null, "default_shipping_address_id" text null, "last_order_at" timestamptz null, "raw_credit_limit" jsonb not null default '{"value":"0","precision":20}', "raw_credit_used" jsonb not null default '{"value":"0","precision":20}', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_company_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_b2b_company_slug_unique" ON "b2b_company" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_company_deleted_at" ON "b2b_company" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_company_status" ON "b2b_company" ("status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_company_tier" ON "b2b_company" ("tier") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_company_email" ON "b2b_company" ("email") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "idx_company_slug" ON "b2b_company" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_company_status_tier" ON "b2b_company" ("status", "tier") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "b2b_company_address" ("id" text not null, "company_id" text not null, "type" text check ("type" in ('billing', 'shipping', 'headquarters', 'warehouse')) not null, "label" text not null, "is_default" boolean not null default false, "company_name" text not null, "attention" text null, "address_line1" text not null, "address_line2" text null, "city" text not null, "state" text null, "postal_code" text not null, "country_code" text not null, "phone" text null, "delivery_instructions" text null, "is_verified" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_company_address_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_company_address_deleted_at" ON "b2b_company_address" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_address_company" ON "b2b_company_address" ("company_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_address_company_type" ON "b2b_company_address" ("company_id", "type") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_address_default" ON "b2b_company_address" ("company_id", "type", "is_default") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "b2b_company" cascade;`);

    this.addSql(`drop table if exists "b2b_company_address" cascade;`);
  }

}
