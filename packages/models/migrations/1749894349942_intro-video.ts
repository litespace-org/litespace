import { IIntroVideo } from "@litespace/types";
import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("intro_videos", {
    id: {
      type: "serial",
      primaryKey: true,
      notNull: true,
    },
    src: {
      type: "varchar(255)",
      notNull: true,
    },
    tutor_id: {
      type: "int",
      notNull: true,
      references: "tutors(id)",
    },
    reviewer_id: {
      type: "int",
      notNull: true,
      references: "tutors(id)",
    },
    state: { type: "smallint", default: IIntroVideo.State.Pending },
    created_at: { type: "timestamp", notNull: true },
    updated_at: { type: "timestamp", notNull: true },
  });

  pgm.createIndex("intro_videos", "id");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex("intro_videos", "id", { ifExists: true });

  pgm.dropTable("intro_videos", { ifExists: true });
}
