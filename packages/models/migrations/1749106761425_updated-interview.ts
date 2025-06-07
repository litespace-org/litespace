import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumn(
    "interviews",
    ["note", "level", "signer", "canceled_by", "canceled_at"],
    { ifExists: true }
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumn(
    "interviews",
    {
      note: { type: "TEXT", default: null },
      level: { type: "INT", default: null },
      signer: { type: "INT", references: "users(id)" },
      canceled_by: { type: "INT", references: "users(id)", default: null },
      canceled_at: { type: "TIMESTAMP", default: null },
    },
    { ifNotExists: true }
  );
}
