import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable(
    "plan_invites",
    {
      id: { type: "serial", primaryKey: true, notNull: true },
      user_id: { type: "int", notNull: true, references: "users(id)" },
      plan_id: { type: "int", notNull: true, references: "plans(id)" },
      created_by: { type: "int", notNull: true, references: "users(id)" },
      created_at: { type: "timestamp", notNull: true },
      expires_at: { type: "timestamp", notNull: false, default: null },
    },
    { cascade: true }
  );
  pgm.createConstraint("plan_invites", "user_plan_ids", {
    unique: ["user_id", "plan_id"],
  });
  pgm.createIndex("plan_invites", "id");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex("plan_invites", "id", { ifExists: true });
  pgm.dropConstraint("plan_invites", "user_plan_ids");
  pgm.dropTable("plan_invites", { ifExists: true });
}
