import { IAvailabilitySlot } from "@litespace/types";
import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addColumn("availability_slots", {
    purpose: {
      type: "SMALLINT",
      notNull: true,
      default: IAvailabilitySlot.Purpose.General,
    },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumn("availability_slots", "purpose");
}
