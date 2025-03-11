import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("events", {
    id: { type: "SERIAL", primaryKey: true, notNull: true },
    type: { type: "SMALLINT", notNull: true },
    user_id: { type: "INT", notNull: true, references: "users(id)" },
    created_at: { type: "TIMESTAMP", notNull: true },
  });

  pgm.createIndex("events", "id");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex("events", "id");
  pgm.dropTable("events");
}
