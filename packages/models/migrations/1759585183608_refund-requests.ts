import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("refund_requests", {
    id: { type: "serial", primaryKey: true, notNull: true },
    user_id: { type: "int", notNull: true, references: "users(id)" },
    tx_id: { type: "int", notNull: true, references: "transactions(id)" },
    status: { type: "int", notNull: true },
    method: { type: "int", notNull: true },
    address: { type: "text", notNull: true },
    processed_at: { type: "timestamp" },
    created_at: { type: "timestamp", notNull: true },
    updated_at: { type: "timestamp", notNull: true },
  });

  pgm.createIndex("refund_requests", "id");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex("refund_requests", "id", { ifExists: true });
  pgm.dropTable("refund_requests", { ifExists: true });
}
