import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("students");
}
