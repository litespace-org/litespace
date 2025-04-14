import { exec } from "node:child_process";

export async function execute(command: string, cwd?: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) return reject(error);
      if (stderr) return reject(stdout);
      return resolve(stdout);
    });
  });
}
