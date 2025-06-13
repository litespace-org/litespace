import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("reports", {
    id: { type: "serial", primaryKey: true, notNull: true },
    user_id: { type: "int", references: "users(id)", default: null },
    title: { type: "varchar(128)", notNull: true },
    description: { type: "varchar(1000)", notNull: true },
    screenshot: { type: "char(64)", notNull: false },
    log: { type: "char(32)", notNull: false },
    resolved: { type: "boolean", notNull: true, default: false },
    created_at: { type: "timestamp", notNull: true },
    updated_at: { type: "timestamp", notNull: true },
  });

  pgm.createIndex("reports", "id");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex("reports", "id", { ifExists: true });
  pgm.dropTable("reports", { ifExists: true, cascade: true });
}
