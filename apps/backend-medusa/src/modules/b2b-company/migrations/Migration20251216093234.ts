import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251216093234 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "b2b_company" drop column if exists "credit_used", drop column if exists "raw_credit_used";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "b2b_company" add column if not exists "credit_used" numeric not null default 0, add column if not exists "raw_credit_used" jsonb not null default '{"value":"0","precision":20}';`);
  }

}
