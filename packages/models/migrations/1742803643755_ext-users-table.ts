import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumn("users", {
    enabled_whatsapp: {
      type: "BOOLEAN",
      notNull: true,
      default: false,
    },
    enabled_telegram: {
      type: "BOOLEAN",
      notNull: true,
      default: false,
    },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumns("users", ["enabled_whatsapp", "enabled_telegram"]);
}
