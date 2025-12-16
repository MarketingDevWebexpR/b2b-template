import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251216055753 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "b2b_quote" ("id" text not null, "quote_number" text not null, "company_id" text not null, "requester_id" text not null, "assigned_to_id" text null, "status" text check ("status" in ('draft', 'submitted', 'under_review', 'responded', 'negotiating', 'accepted', 'rejected', 'expired', 'converted', 'cancelled')) not null default 'draft', "title" text null, "notes" text null, "totals" jsonb not null default '{}', "terms" jsonb not null default '{}', "valid_until" timestamptz null, "submitted_at" timestamptz null, "responded_at" timestamptz null, "decided_at" timestamptz null, "converted_at" timestamptz null, "order_id" text null, "cart_id" text null, "region_id" text null, "sales_channel_id" text null, "version" integer not null default 1, "rejection_reason" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_quote_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_quote_deleted_at" ON "b2b_quote" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_quote_company" ON "b2b_quote" ("company_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_quote_status" ON "b2b_quote" ("status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_quote_requester" ON "b2b_quote" ("requester_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "idx_quote_number" ON "b2b_quote" ("quote_number") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_quote_company_status" ON "b2b_quote" ("company_id", "status") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "b2b_quote_history" ("id" text not null, "quote_id" text not null, "event_type" text check ("event_type" in ('created', 'updated', 'submitted', 'reviewed', 'responded', 'counter_offered', 'accepted', 'rejected', 'expired', 'converted', 'cancelled', 'item_added', 'item_removed', 'item_updated', 'terms_changed', 'assigned', 'reminder_sent', 'approval_required', 'approval_completed')) not null, "actor_type" text not null, "actor_id" text null, "actor_name" text null, "description" text not null, "previous_values" jsonb null, "new_values" jsonb null, "changed_fields" jsonb not null, "related_entity_type" text null, "related_entity_id" text null, "ip_address" text null, "user_agent" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_quote_history_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_quote_history_deleted_at" ON "b2b_quote_history" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_quote_history_quote" ON "b2b_quote_history" ("quote_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_quote_history_event_type" ON "b2b_quote_history" ("event_type") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_quote_history_quote_event" ON "b2b_quote_history" ("quote_id", "event_type") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "b2b_quote_item" ("id" text not null, "quote_id" text not null, "variant_id" text not null, "product_id" text null, "title" text not null, "variant_title" text null, "sku" text null, "quantity" integer not null default 1, "min_quantity" integer null, "original_unit_price" numeric not null, "requested_unit_price" numeric null, "offered_unit_price" numeric null, "final_unit_price" numeric null, "discount_percentage" integer not null default 0, "line_total" numeric not null default 0, "currency_code" text not null default 'EUR', "notes" text null, "reservation_id" text null, "sort_order" integer not null default 0, "variant_metadata" jsonb null, "metadata" jsonb null, "raw_original_unit_price" jsonb not null, "raw_requested_unit_price" jsonb null, "raw_offered_unit_price" jsonb null, "raw_final_unit_price" jsonb null, "raw_line_total" jsonb not null default '{"value":"0","precision":20}', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_quote_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_quote_item_deleted_at" ON "b2b_quote_item" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_quote_item_quote" ON "b2b_quote_item" ("quote_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_quote_item_variant" ON "b2b_quote_item" ("variant_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_quote_item_quote_variant" ON "b2b_quote_item" ("quote_id", "variant_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "b2b_quote_message" ("id" text not null, "quote_id" text not null, "sender_type" text check ("sender_type" in ('customer', 'admin', 'system')) not null, "sender_id" text not null, "sender_name" text null, "message_type" text check ("message_type" in ('text', 'price_update', 'terms_update', 'status_change', 'attachment', 'internal')) not null default 'text', "content" text not null, "attachments" jsonb not null, "is_internal" boolean not null default false, "is_read" boolean not null default false, "read_at" timestamptz null, "quote_item_id" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_quote_message_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_b2b_quote_message_deleted_at" ON "b2b_quote_message" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_quote_message_quote" ON "b2b_quote_message" ("quote_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_quote_message_sender" ON "b2b_quote_message" ("sender_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "idx_quote_message_quote_type" ON "b2b_quote_message" ("quote_id", "sender_type") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "b2b_quote" cascade;`);

    this.addSql(`drop table if exists "b2b_quote_history" cascade;`);

    this.addSql(`drop table if exists "b2b_quote_item" cascade;`);

    this.addSql(`drop table if exists "b2b_quote_message" cascade;`);
  }

}
