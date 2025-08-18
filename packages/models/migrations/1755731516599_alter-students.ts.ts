import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumns("students", ["user_id"]);
  pgm.addConstraint("students", "students_id_fkey", {
    foreignKeys: {
      columns: "id",
      references: "users(id)",
    },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropConstraint("students", "students_id_fkey", { ifExists: true });

  pgm.addColumns("students", {
    user_id: { type: "int", notNull: true, references: "users(id)" },
  });
}
