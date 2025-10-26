import { IUser } from "@litespace/types";
import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `INSERT INTO students (id, created_at, updated_at) 
    SELECT id, created_at, created_at FROM users WHERE role = ${IUser.Role.Student}
    AND id NOT IN (SELECT id FROM students);`
  );
}

export async function down(_pgm: MigrationBuilder): Promise<void> {}
