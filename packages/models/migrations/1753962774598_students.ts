import { MigrationBuilder } from "node-pg-migrate";
import { IStudent } from "@litespace/types";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable(
    "students",
    {
      id: { type: "serial", primaryKey: true },
      user_id: { type: "int", notNull: true, references: "users(id)" },
      job_title: { type: "varchar(127)", notNull: false },
      english_level: {
        type: "smallint",
        notNull: false,
        default: IStudent.EnglishLevel.Beginner,
      },
      learning_objective: { type: "varchar(127)", notNull: false },
      created_at: {
        type: "timestamp",
        notNull: true,
      },
      updated_at: {
        type: "timestamp",
        notNull: true,
      },
    },
    { cascade: true }
  );
  pgm.createIndex("students", "id");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex("students", "id", { ifExists: true });
  pgm.dropTable("students", { ifExists: true });
  pgm.dropType("english_level", { ifExists: true });
}
