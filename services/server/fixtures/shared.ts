import { exec } from "node:child_process";
import {
  knex,
  topics,
  messages,
  rooms,
  interviews,
  calls,
  rules,
  lessons,
  ratings,
  users,
} from "@litespace/models";

async function execute(command: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) return reject(error);
      if (stderr) return reject(stdout);
      return resolve(stdout);
    });
  });
}

export async function down() {
  await execute("pnpm --filter @litespace/models migrate:test:local down");
}

export async function up() {
  await execute("pnpm --filter @litespace/models migrate:test:local up");
}

export async function flush() {
  await knex.transaction(async (tx) => {
    await topics.builder(tx).userTopics.del();
    await topics.builder(tx).topics.del();
    await messages.builder(tx).del();
    await rooms.builder(tx).members.del();
    await rooms.builder(tx).rooms.del();
    await interviews.builder(tx).del();
    await calls.builder(tx).members.del();
    await calls.builder(tx).calls.del();
    await rules.builder(tx).del();
    await lessons.builder(tx).members.del();
    await lessons.builder(tx).lessons.del();
    await ratings.builder(tx).del();
    await users.builder(tx).del();
  });
}
