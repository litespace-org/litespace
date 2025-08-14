import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.alterColumn("transactions", "provider_ref_num", {
    type: "varchar(32)",
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.alterColumn("transactions", "provider_ref_num", {
    type: "int",
    using: "provider_ref_num::integer",
  });
}
