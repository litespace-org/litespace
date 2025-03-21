import { MigrationBuilder } from "node-pg-migrate";
import { users, knex } from "@litespace/models";

export async function up(_pgm: MigrationBuilder): Promise<void> {
  const exists = await knex.schema.hasTable(users.table);
  if (!exists) return;

  await knex.transaction(async (tx) => {
    const { list } = await users.find({ tx, full: true });

    for (const user of list) {
      if (!user.email) continue;
      await users.update(user.id, { email: user.email.toLowerCase() }, tx);
    }
  });
}

export async function down(_pgm: MigrationBuilder): Promise<void> {}
