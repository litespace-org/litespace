import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("reports", {
    id: { type: "serial", primaryKey: true, notNull: true },
    user_id: { type: "int", references: "users(id)", default: null },
    title: { type: "VARCHAR(128)", notNull: true },
    description: { type: "VARCHAR(255)", notNull: true },
    screenshot: { type: "TEXT", notNull: false },
    log: { type: "TEXT", notNull: false },
    resolved: { type: "BOOLEAN", notNull: true, default: false },
    created_at: { type: "timestamp", notNull: true },
    updated_at: { type: "timestamp", notNull: true },
  });

  pgm.createIndex("reports", "id");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex("reports", "id", { ifExists: true });
  pgm.dropTable("reports", { ifExists: true, cascade: true });
}
