import { MigrationBuilder } from "node-pg-migrate";

export async function up(_pgm: MigrationBuilder): Promise<void> {
  _pgm.addColumns("tutors", {
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

export async function down(_pgm: MigrationBuilder): Promise<void> {
  _pgm.dropColumns("tutors", ["studio_id", "thumbnail"]);
}
