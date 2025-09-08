import { MigrationBuilder } from "node-pg-migrate";

import { IUser } from "@litespace/types";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumns("students", ["user_id"], { ifExists: true });

  pgm.addConstraint("students", "students_id_fkey", {
    foreignKeys: [{ columns: "id", references: "users(id)" }],
  });

  pgm.sql(
    `INSERT INTO students (id, created_at, updated_at) 
    SELECT id, created_at, created_at FROM users WHERE role = ${IUser.Role.Student};`
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropConstraint("students", "students_id_fkey", { ifExists: true });

  pgm.addColumn("students", {
    user_id: {
      type: "int",
      notNull: false,
      references: "users(id)",
    },
  });

  /** TODO: re-structure the students data accordingly
  const ids = await pgm.db.select("SELECT id FROM students");
  for (const id of ids) {
    pgm.sql();
  }
  */
}
