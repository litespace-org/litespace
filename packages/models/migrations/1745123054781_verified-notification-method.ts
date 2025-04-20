import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumn("users", {
    verified_whatsapp: {
      type: "boolean",
      notNull: true,
      default: false,
    },
    verified_telegram: {
      type: "boolean",
      notNull: true,
      default: false,
    },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumn("users", ["verified_whatsapp", "verified_telegram"], {
    ifExists: true,
  });
}
