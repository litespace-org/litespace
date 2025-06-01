import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("invoices", {
    id: { type: "SERIAL", primaryKey: true, notNull: true },
    user_id: { type: "INT", notNull: true, references: "users(id)" },
    method: { type: "SMALLINT", notNull: true },
    receiver: { type: "VARCHAR(24)", notNull: true },
    amount: { type: "INT", notNull: true },
    status: { type: "SMALLINT", notNull: true },
    note: { type: "VARCHAR(255)", notNull: false },
    receipt: { type: "VARCHAR(255)", notNull: false },
    addressed_by: { type: "INT", notNull: false, references: "users(id)" },
    created_at: { type: "TIMESTAMP", notNull: true },
    updated_at: { type: "TIMESTAMP", notNull: true },
  });

  pgm.createIndex("invoices", "id");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex("invoices", "id", { ifExists: true });
  pgm.dropTable("invoices", { ifExists: true });
}
