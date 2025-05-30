import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumns("users", ["enabled_whatsapp", "enabled_telegram"], {
    ifExists: true,
  });

  pgm.addColumn("users", {
    notification_method: {
      type: "smallint",
      notNull: false,
      default: null,
    },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumns("users", ["notification_method"], {
    ifExists: true,
  });

  //  Recreate the old columns to allow reversibility
  pgm.addColumn("users", {
    enabled_whatsapp: {
      type: "boolean",
      notNull: true,
      default: false,
    },
    enabled_telegram: {
      type: "boolean",
      notNull: true,
      default: false,
    },
  });
}
