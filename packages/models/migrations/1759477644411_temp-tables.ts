import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumns("transactions", ["plan_id", "plan_period"], {
    ifExists: true,
  });

  pgm.addColumn("transactions", {
    type: {
      type: "int",
      notNull: true,
      default: 0, // 0 => paid plan, 1 => paid lesson.
    },
  });

  pgm.addColumn("lessons", {
    tx_id: { type: "int", references: "transactions(id)", default: null },
  });

  pgm.createTable("tx-plan-temp", {
    tx_id: {
      type: "int",
      primaryKey: true,
      notNull: true,
      references: "transactions(id)",
    },
    plan_id: { type: "int", notNull: true, references: "plans(id)" },
    plan_period: { type: "int", notNull: true },
    created_at: { type: "timestamp", notNull: true },
  });

  pgm.createTable("tx-lesson-temp", {
    tx_id: {
      type: "int",
      primaryKey: true,
      notNull: true,
      references: "transactions(id)",
    },
    tutor_id: { type: "int", notNull: true, references: "users(id)" },
    slot_id: {
      type: "int",
      notNull: true,
      references: "availability_slots(id)",
    },
    start: { type: "timestamp", notNull: true },
    duration: { type: "int", notNull: true },
    created_at: { type: "timestamp", notNull: true },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumn("transactions", ["type"], { ifExists: true });
  pgm.dropColumn("lessons", ["tx_id"], { ifExists: true });
  pgm.dropTable("tx-plan-temp", { ifExists: true });
  pgm.dropTable("tx-lesson-temp", { ifExists: true });
}
