import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumn("users", ["verified_telegram"], {
    ifExists: true,
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumn("users", {
    verified_telegram: {
      type: "boolean",
      notNull: true,
      default: false,
    },
  });
}
