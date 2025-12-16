import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251216055737 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "b2b_approval_request" drop constraint if exists "b2b_approval_request_request_number_unique";`);
    this.addSql(`create table if not exists "b2b_approval_delegation" ("id" text not null, "company_id" text not null, "delegator_id" text not null, "delegate_id" text not null, "start_date" timestamptz not null, "end_date" timestamptz not null, "status" text check ("status" in ('active', 'scheduled', 'expired', 'cancelled')) not null default 'scheduled', "reason" text null, "workflow_ids" jsonb null, "max_amount" numeric null, "raw_max_amount" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_approval_delegation_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_approval_delegation_deleted_at" ON "b2b_approval_delegation" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_delegation_company" ON "b2b_approval_delegation" ("company_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_delegation_delegator" ON "b2b_approval_delegation" ("delegator_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_delegation_delegate" ON "b2b_approval_delegation" ("delegate_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_delegation_status" ON "b2b_approval_delegation" ("status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_delegation_dates" ON "b2b_approval_delegation" ("start_date", "end_date") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "b2b_approval_request" ("id" text not null, "request_number" text not null, "company_id" text not null, "workflow_id" text not null, "entity_type" text check ("entity_type" in ('order', 'quote', 'return', 'credit')) not null, "entity_id" text not null, "entity_amount" numeric null, "entity_currency" text not null default 'EUR', "requester_id" text not null, "requester_notes" text null, "status" text check ("status" in ('pending', 'in_review', 'approved', 'rejected', 'escalated', 'expired', 'cancelled')) not null default 'pending', "current_level" integer not null default 1, "total_levels" integer not null, "due_at" timestamptz null, "submitted_at" timestamptz not null, "decided_at" timestamptz null, "final_approver_id" text null, "final_notes" text null, "metadata" jsonb null, "raw_entity_amount" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_approval_request_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_b2b_approval_request_request_number_unique" ON "b2b_approval_request" ("request_number") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_approval_request_deleted_at" ON "b2b_approval_request" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_request_company" ON "b2b_approval_request" ("company_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_request_status" ON "b2b_approval_request" ("company_id", "status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_request_requester" ON "b2b_approval_request" ("requester_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_request_entity" ON "b2b_approval_request" ("entity_type", "entity_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_request_workflow" ON "b2b_approval_request" ("workflow_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "idx_request_number" ON "b2b_approval_request" ("request_number") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_request_due" ON "b2b_approval_request" ("due_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "b2b_approval_step" ("id" text not null, "request_id" text not null, "level" integer not null, "status" text check ("status" in ('pending', 'approved', 'rejected', 'escalated', 'delegated', 'expired', 'skipped')) not null default 'pending', "assigned_approver_ids" jsonb not null, "acted_by_id" text null, "acted_on_behalf_of_id" text null, "action" text check ("action" in ('approve', 'reject', 'escalate', 'delegate', 'request_info')) null, "acted_at" timestamptz null, "notes" text null, "due_at" timestamptz null, "reminder_sent_at" timestamptz null, "delegated_to_id" text null, "delegation_reason" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_approval_step_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_approval_step_deleted_at" ON "b2b_approval_step" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_step_request" ON "b2b_approval_step" ("request_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_step_level" ON "b2b_approval_step" ("request_id", "level") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_step_status" ON "b2b_approval_step" ("status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_step_due" ON "b2b_approval_step" ("due_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "b2b_approval_workflow" ("id" text not null, "company_id" text not null, "name" text not null, "description" text null, "entity_type" text check ("entity_type" in ('order', 'quote', 'return', 'credit')) not null, "trigger" text check ("trigger" in ('amount_exceeds', 'spending_limit_exceeded', 'category_restricted', 'always')) not null, "trigger_threshold" numeric null, "trigger_category_ids" jsonb null, "levels" jsonb not null, "escalation_hours" integer not null default 24, "expiration_hours" integer not null default 72, "notify_on_creation" boolean not null default true, "notify_on_reminder" boolean not null default true, "allow_delegation" boolean not null default true, "priority" integer not null default 0, "is_active" boolean not null default true, "raw_trigger_threshold" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_approval_workflow_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_approval_workflow_deleted_at" ON "b2b_approval_workflow" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_workflow_company" ON "b2b_approval_workflow" ("company_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_workflow_entity_type" ON "b2b_approval_workflow" ("company_id", "entity_type") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_workflow_active" ON "b2b_approval_workflow" ("company_id", "is_active") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_workflow_priority" ON "b2b_approval_workflow" ("priority") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "b2b_approval_delegation" cascade;`);

    this.addSql(`drop table if exists "b2b_approval_request" cascade;`);

    this.addSql(`drop table if exists "b2b_approval_step" cascade;`);

    this.addSql(`drop table if exists "b2b_approval_workflow" cascade;`);
  }

}
