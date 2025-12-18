import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20251217102407 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "marque" add column if not exists "logo_file_key" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "marque" drop column if exists "logo_file_key";`);
  }

}
