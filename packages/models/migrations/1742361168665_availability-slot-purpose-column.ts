import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumn("availability_slots", {
    purpose: {
      type: "SMALLINT",
      notNull: true,
      default: 0, // by convention, (type) lesson = 0
    },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumn("availability_slots", "purpose");
}
