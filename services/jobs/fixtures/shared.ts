import { exec } from "node:child_process";

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
  await execute(`pnpm --filter @litespace/models ${command} down 0`);
}

export async function up() {
  await execute(`pnpm --filter @litespace/models ${command} up`);
}
