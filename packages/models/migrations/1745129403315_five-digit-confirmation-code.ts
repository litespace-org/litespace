import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.alterColumn("confirmation_codes", "code", {
    type: "int",
  });
}

export async function down(_pgm: MigrationBuilder): Promise<void> {}
