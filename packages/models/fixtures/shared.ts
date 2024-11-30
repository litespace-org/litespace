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

export async function down() {
  const command = ci
    ? "pnpm migrate:test:ci down"
    : "pnpm migrate:test:local down";
  await execute(command);
}

export async function up() {
  const command = ci ? "pnpm migrate:test:ci up" : "pnpm migrate:test:local up";
  await execute(command);
}
