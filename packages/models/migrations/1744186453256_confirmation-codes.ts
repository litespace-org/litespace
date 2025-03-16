import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  // tables
  pgm.createTable("confirmation_codes", {
    id: { type: "SERIAL", primaryKey: true, notNull: true },
    code: { type: "smallint", notNull: true },
    purpose: { type: "smallint", notNull: true },
    created_at: {
      type: "TIMESTAMP",
      notNull: true,
    },
    expires_at: { type: "TIMESTAMP", notNull: true },
  });

  // constraints
  pgm.addConstraint("confirmation_codes", "unique_code_purpose", {
    unique: ["code", "purpose"],
  });

  // indexes for fast lookups
  pgm.createIndex("confirmation_codes", "code");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropConstraint("confirmation_codes", "unique_code_purpose", {
    ifExists: true,
  });
  pgm.dropIndex("confirmation_codes", "code", { ifExists: true });
  pgm.dropTable("confirmation_codes", { ifExists: true, cascade: true });
}
