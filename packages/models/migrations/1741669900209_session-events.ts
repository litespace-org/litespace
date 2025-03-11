import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("session_events", {
    id: { type: "SERIAL", primaryKey: true, notNull: true },
    type: { type: "SMALLINT", notNull: true },
    user_id: { type: "INT", notNull: true, references: "users(id)" },
    session_id: { type: "VARCHAR(50)", notNull: true },
    created_at: { type: "TIMESTAMP", notNull: true },
  });

  pgm.createIndex("session_events", "id");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex("session_events", "id");
  pgm.dropTable("session_events");
}
