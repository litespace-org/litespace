import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumn("tutors", ["activated_by"], {
    ifExists: true,
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumn("tutors", {
    activated_by: { type: "INT", notNull: false, references: "users(id)" },
  });
}
