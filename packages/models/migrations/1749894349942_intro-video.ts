import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createType("intro_video_state", ["approved", "rejected", "pending"]);

  pgm.createTable("intro_videos", {
    id: {
      type: "SERIAL",
      primaryKey: true,
      notNull: true,
    },
    src: {
      type: "VARCHAR(255)",
      notNull: true,
    },
    tutor_id: {
      type: "INT",
      notNull: true,
      references: "tutors(id)",
    },
    reviewer_id: {
      type: "INT",
      default: null,
      references: "tutors(id)",
    },
    state: { type: "intro_video_state", default: "pending" },
    created_at: { type: "TIMESTAMP", notNull: true },
    updated_at: { type: "TIMESTAMP", notNull: true },
  });

  pgm.createIndex("intro_videos", "id");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex("intro_videos", "id", { ifExists: true });

  pgm.dropTable("intro_videos", { ifExists: true });

  pgm.dropType("intro_video_state", { ifExists: true });
}
