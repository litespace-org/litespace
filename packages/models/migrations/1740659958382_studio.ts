import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumns("tutors", {
    studio_id: {
      type: "INT",
      notNull: false,
      default: null,
      references: "users(id)",
    },
    thumbnail: {
      type: "TEXT",
      notNull: false,
      default: null,
    },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumns("tutors", ["studio_id", "thumbnail"]);
}
