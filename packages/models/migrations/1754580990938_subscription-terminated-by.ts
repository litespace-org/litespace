import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumns("subscriptions", {
    terminated_by: { type: "INT", references: "users(id)", default: null },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumns("subscriptions", ["terminated_by"]);
}
