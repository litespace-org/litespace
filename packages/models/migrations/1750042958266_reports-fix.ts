import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.alterColumn("reports", "log", {
    type: "varchar(32)",
  });

  pgm.alterColumn("reports", "screenshot", {
    type: "varchar(64)",
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.alterColumn("reports", "log", {
    type: "char(32)",
  });

  pgm.alterColumn("reports", "screenshot", {
    type: "char(64)",
  });
}
