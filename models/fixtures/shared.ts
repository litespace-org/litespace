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

export async function down() {
  await execute("yarn migrate:test down");
}

export async function up() {
  await execute("yarn migrate:test up");
}
