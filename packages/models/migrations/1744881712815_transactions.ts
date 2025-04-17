import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("transactions", {
    id: { type: "SERIAL", primaryKey: true, notNull: true },
    user_id: { type: "INT", notNull: true, references: "users(id)" },
    amount: { type: "INT", notNull: true },
    status: { type: "SMALLINT", notNull: true },
    payment_method: { type: "SMALLINT", notNull: true },
    provider_ref_num: { type: "INT", notNull: false },
    created_at: { type: "TIMESTAMP", notNull: true },
    updated_at: { type: "TIMESTAMP", notNull: true },
  });
  pgm.createIndex("transactions", "id");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex("transactions", "id");
  pgm.dropTable("transactions");
}
