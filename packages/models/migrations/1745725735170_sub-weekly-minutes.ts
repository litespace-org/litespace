import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.renameColumn("subscriptions", "quota", "weekly_minutes");
}

export async function down(_pgm: MigrationBuilder): Promise<void> {}
