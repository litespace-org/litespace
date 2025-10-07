import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumns("transactions", {
    fees: { type: "INT", notNull: true, default: 0 },
    phone: { type: "VARCHAR(15)", notNull: true, default: "" },
  });
  pgm.sql(`
    ALTER TABLE transactions
    ALTER COLUMN phone DROP DEFAULT;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumns("transactions", ["fees", "phone"], { ifExists: true });
}
