import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("subscriptions", {
    id: { type: "SERIAL", primaryKey: true, notNull: true },
    user_id: { type: "INT", notNull: true, references: "users(id)" },
    plan_id: { type: "INT", notNull: true, references: "plans(id)" },
    tx_id: { type: "INT", notNull: true, references: "transactions(id)" },
    quota: { type: "INT", notNull: true },
    period: { type: "SMALLINT", notNull: true },
    start: { type: "TIMESTAMP", notNull: true },
    end: { type: "TIMESTAMP", notNull: true },
    extended_by: {
      type: "INT",
      notNull: false,
      references: "subscriptions(id)",
    },
    created_at: { type: "TIMESTAMP", notNull: true },
    updated_at: { type: "TIMESTAMP", notNull: true },
  });
  pgm.createIndex("subscriptions", "id");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex("subscriptions", "id", { ifExists: true });
  pgm.dropTable("subscriptions", { ifExists: true });
}
