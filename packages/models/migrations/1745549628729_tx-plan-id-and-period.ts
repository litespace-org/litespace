import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumn("transactions", {
    plan_id: { type: "int", references: "plans(id)", notNull: true },
    plan_period: { type: "smallint", notNull: true },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumns("transactions", ["plan_id", "plan_period"], {
    ifExists: true,
  });
}
