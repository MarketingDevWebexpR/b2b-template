import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251216055720 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "b2b_spending_limit" ("id" text not null, "company_id" text not null, "entity_type" text check ("entity_type" in ('employee', 'department', 'company', 'role')) not null, "entity_id" text null, "period" text check ("period" in ('per_order', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly')) not null, "limit_amount" numeric not null, "warning_threshold" integer not null default 80, "current_spending" numeric not null default 0, "next_reset_at" timestamptz null, "last_transaction_at" timestamptz null, "is_active" boolean not null default true, "name" text null, "description" text null, "raw_limit_amount" jsonb not null, "raw_current_spending" jsonb not null default '{"value":"0","precision":20}', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_spending_limit_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_spending_limit_deleted_at" ON "b2b_spending_limit" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_spending_limit_company" ON "b2b_spending_limit" ("company_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_spending_limit_entity_type" ON "b2b_spending_limit" ("company_id", "entity_type") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_spending_limit_entity" ON "b2b_spending_limit" ("company_id", "entity_type", "entity_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_spending_limit_reset" ON "b2b_spending_limit" ("next_reset_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_spending_limit_active" ON "b2b_spending_limit" ("is_active") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "b2b_spending_rule" ("id" text not null, "company_id" text not null, "name" text not null, "description" text null, "condition" text check ("condition" in ('amount_exceeds', 'limit_exceeded', 'limit_warning', 'category_restricted', 'vendor_restricted', 'quantity_exceeds')) not null, "threshold_amount" numeric null, "threshold_percentage" integer null, "action" text check ("action" in ('require_approval', 'notify', 'block', 'warn')) not null, "applies_to_entity_types" jsonb null, "applies_to_entity_ids" jsonb null, "restricted_category_ids" jsonb null, "restricted_vendor_ids" jsonb null, "notify_emails" jsonb null, "notify_customer_ids" jsonb null, "priority" integer not null default 0, "is_active" boolean not null default true, "approval_workflow_id" text null, "raw_threshold_amount" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_spending_rule_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_spending_rule_deleted_at" ON "b2b_spending_rule" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_spending_rule_company" ON "b2b_spending_rule" ("company_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_spending_rule_condition" ON "b2b_spending_rule" ("company_id", "condition") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_spending_rule_active" ON "b2b_spending_rule" ("company_id", "is_active") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_spending_rule_priority" ON "b2b_spending_rule" ("priority") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "b2b_spending_transaction" ("id" text not null, "company_id" text not null, "customer_id" text not null, "type" text check ("type" in ('charge', 'refund', 'adjustment', 'reset')) not null, "status" text check ("status" in ('pending', 'applied', 'reversed', 'failed')) not null default 'pending', "amount" numeric not null, "currency_code" text not null default 'EUR', "order_id" text null, "quote_id" text null, "related_transaction_id" text null, "affected_limit_ids" jsonb null, "limits_snapshot_before" jsonb null, "limits_snapshot_after" jsonb null, "description" text null, "metadata" jsonb null, "created_by" text null, "applied_at" timestamptz null, "failure_reason" text null, "raw_amount" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_spending_transaction_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_spending_transaction_deleted_at" ON "b2b_spending_transaction" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_spending_tx_company" ON "b2b_spending_transaction" ("company_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_spending_tx_customer" ON "b2b_spending_transaction" ("company_id", "customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_spending_tx_order" ON "b2b_spending_transaction" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_spending_tx_status" ON "b2b_spending_transaction" ("status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_spending_tx_type" ON "b2b_spending_transaction" ("type") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_spending_tx_created" ON "b2b_spending_transaction" ("company_id", "created_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "b2b_spending_limit" cascade;`);

    this.addSql(`drop table if exists "b2b_spending_rule" cascade;`);

    this.addSql(`drop table if exists "b2b_spending_transaction" cascade;`);
  }

}
