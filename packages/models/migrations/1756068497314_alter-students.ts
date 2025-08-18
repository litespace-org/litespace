import { MigrationBuilder } from "node-pg-migrate";

import { IUser } from "@litespace/types";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumns("students", ["user_id"], { ifExists: true });
  pgm.addConstraint("students", "students_id_fkey", {
    foreignKeys: [{ columns: "id", references: "users(id)" }],
  });

  pgm.sql(
    `insert into students (id, created_at, updated_at) 
    select id, created_at, created_at from users where role = ${IUser.Role.Student};`
  );

  // Keep a conventional user_id column that mirrors id for easier mapping
  pgm.sql(
    "ALTER TABLE students ADD COLUMN IF NOT EXISTS user_id int GENERATED ALWAYS AS (id) STORED;"
  );
  pgm.addConstraint("students", "students_user_id_fkey", {
    foreignKeys: [{ columns: "user_id", references: "users(id)" }],
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropConstraint("students", "students_user_id_fkey", { ifExists: true });
  pgm.sql("ALTER TABLE students DROP COLUMN IF EXISTS user_id;");
  pgm.dropConstraint("students", "students_id_fkey", { ifExists: true });
}
