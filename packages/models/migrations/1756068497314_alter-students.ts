import { MigrationBuilder } from "node-pg-migrate";

import { IUser } from "@litespace/types";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumns("students", ["user_id"]);
  pgm.addConstraint("students", "students_id_fkey", {
    foreignKeys: [{ columns: "id", references: "users(id)" }],
  });

  pgm.sql(
    `insert into students (id, created_at, updated_at) 
    select id, created_at, created_at from users where role = ${IUser.Role.Student};`
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropConstraint("students", "students_id_fkey", { ifExists: true });

  pgm.addColumns("students", {
    user_id: { type: "int", references: "users(id)" },
  });
}
