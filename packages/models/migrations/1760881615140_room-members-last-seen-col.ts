import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumn("room_members", {
    last_seen: { type: "TIMESTAMP", notNull: false, default: null },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumn("room_members", "last_seen");
}
