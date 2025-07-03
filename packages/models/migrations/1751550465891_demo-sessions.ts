import { IDemoSession } from "@litespace/types";
import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("demo_sessions", {
    id: { type: "serial", primaryKey: true, notNull: true },
    session_id: { type: "varchar(50)", notNull: true },
    tutor_id: { type: "int", notNull: true, references: "tutors(id)" },
    slot_id: {
      type: "int",
      notNull: true,
      references: "availability_slots(id)",
    },
    status: {
      type: "smallint",
      notNull: true,
      default: IDemoSession.Status.Pending,
    },
    start: { type: "TIMESTAMP", notNull: true },
    created_at: { type: "TIMESTAMP", notNull: true },
    updated_at: { type: "TIMESTAMP", notNull: true },
  });

  pgm.createIndex("demo_sessions", "id");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex("demo_sessions", "id", { ifExists: true });
  pgm.dropTable("demo_sessions", { ifExists: true });
}
