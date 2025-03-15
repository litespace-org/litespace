import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.alterColumn("lessons", "slot_id", {
    type: "INT",
  });

  pgm.alterColumn("interviews", "slot_id", {
    type: "INT",
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // Looks like SERIAL cannot be used in ALTER COLUMN, only in CREATE TABLE.
  pgm.alterColumn("lessons", "slot_id", {
    type: "INT",
  });

  pgm.alterColumn("interviews", "slot_id", {
    type: "INT",
  });
}
