import { MigrationBuilder } from "node-pg-migrate";

export async function up(_pgm: MigrationBuilder): Promise<void> {
  _pgm.addColumn("students", {
    time_period: {
      type: "int",
      notNull: false,
    },
  });
}

export async function down(_pgm: MigrationBuilder): Promise<void> {
  _pgm.dropColumn("students", "time_period");
}
