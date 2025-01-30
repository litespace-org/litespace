import { exec } from "node:child_process";
import {
  knex,
  topics,
  messages,
  rooms,
  interviews,
  lessons,
  ratings,
  users,
  tutors,
  availabilitySlots,
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

const ci = !!process.env.CI;
const command = ci ? "migrate:test:ci" : "migrate:test:local";

export async function down() {
  await execute(`pnpm --filter @litespace/models ${command} down`);
}

export async function up() {
  await execute(`pnpm --filter @litespace/models ${command} up`);
}

export async function flush() {
  await knex.transaction(async (tx) => {
    /**
     * ! Order matters becuase of the relations
     */
    await topics.builder(tx).userTopics.del();
    await topics.builder(tx).topics.del();
    await messages.builder(tx).del();
    await rooms.builder(tx).members.del();
    await rooms.builder(tx).rooms.del();
    await interviews.builder(tx).del();
    await lessons.builder(tx).members.del();
    await lessons.builder(tx).lessons.del();
    await ratings.builder(tx).del();
    await tutors.builder(tx).del();
    await availabilitySlots.builder(tx).del();
    await users.builder(tx).del();
  });
}
