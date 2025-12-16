import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251216084731 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "b2b_company_membership" ("id" text not null, "company_id" text not null, "customer_id" text not null, "role" text check ("role" in ('owner', 'admin', 'manager', 'buyer', 'approver', 'viewer')) not null default 'buyer', "is_primary" boolean not null default false, "job_title" text null, "employee_number" text null, "spending_limit" numeric null, "permissions" jsonb null, "status" text check ("status" in ('pending', 'active', 'suspended', 'inactive')) not null default 'pending', "invited_by" text null, "joined_at" timestamptz null, "metadata" jsonb null, "raw_spending_limit" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_company_membership_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_company_membership_deleted_at" ON "b2b_company_membership" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_membership_company" ON "b2b_company_membership" ("company_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_membership_customer" ON "b2b_company_membership" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "idx_membership_company_customer" ON "b2b_company_membership" ("company_id", "customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_membership_customer_primary" ON "b2b_company_membership" ("customer_id", "is_primary") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_membership_company_role" ON "b2b_company_membership" ("company_id", "role") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_membership_company_status" ON "b2b_company_membership" ("company_id", "status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_membership_status" ON "b2b_company_membership" ("status") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "b2b_company_unit" ("id" text not null, "company_id" text not null, "parent_id" text null, "name" text not null, "slug" text not null, "type" text check ("type" in ('department', 'service', 'team', 'division', 'branch', 'office')) not null, "description" text null, "path" text not null, "level" integer not null, "sort_order" integer not null default 0, "manager_id" text null, "settings" jsonb null, "metadata" jsonb null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_company_unit_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_company_unit_deleted_at" ON "b2b_company_unit" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_unit_company" ON "b2b_company_unit" ("company_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "idx_unit_company_slug" ON "b2b_company_unit" ("company_id", "slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_unit_company_parent" ON "b2b_company_unit" ("company_id", "parent_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_unit_company_type" ON "b2b_company_unit" ("company_id", "type") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_unit_company_active" ON "b2b_company_unit" ("company_id", "is_active") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_unit_path" ON "b2b_company_unit" ("path") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_unit_manager" ON "b2b_company_unit" ("manager_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "b2b_unit_membership" ("id" text not null, "unit_id" text not null, "customer_id" text not null, "company_id" text not null, "role" text check ("role" in ('head', 'manager', 'lead', 'member', 'viewer')) not null default 'member', "is_default" boolean not null default false, "can_approve" boolean not null default false, "spending_limit" numeric null, "permissions" jsonb null, "metadata" jsonb null, "raw_spending_limit" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_unit_membership_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_unit_membership_deleted_at" ON "b2b_unit_membership" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_unit_membership_unit" ON "b2b_unit_membership" ("unit_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_unit_membership_customer" ON "b2b_unit_membership" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_unit_membership_company" ON "b2b_unit_membership" ("company_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "idx_unit_membership_unit_customer" ON "b2b_unit_membership" ("unit_id", "customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_unit_membership_customer_company" ON "b2b_unit_membership" ("customer_id", "company_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_unit_membership_customer_default" ON "b2b_unit_membership" ("customer_id", "is_default") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_unit_membership_unit_role" ON "b2b_unit_membership" ("unit_id", "role") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_unit_membership_unit_approvers" ON "b2b_unit_membership" ("unit_id", "can_approve") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_unit_membership_company_customer_default" ON "b2b_unit_membership" ("company_id", "customer_id", "is_default") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "b2b_company_membership" cascade;`);

    this.addSql(`drop table if exists "b2b_company_unit" cascade;`);

    this.addSql(`drop table if exists "b2b_unit_membership" cascade;`);
  }

}
