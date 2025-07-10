import { config } from "@/config";
import { Workspace } from "@/types";
import { flatten } from "lodash";
import { spawn } from "node:child_process";

const services = ["api", "jobs", "landing", "messenger"];

const stopServicesCommands = services.map((s) => `pm2 stop ${s}`);
const restartServicesCommands = services.map((s) => `pm2 restart ${s}`);

const workspaceBuildCommand: Record<Workspace, string[]> = {
  "@litespace/server": ["pnpm models migrate up", "pnpm run server build"],
  "@litespace/web": ["pnpm web build"],
  "@litespace/dashboard": ["pnpm dashboard build"],
  "@litespace/landing": ["pnpm landing build"],
  "@litespace/jobs": ["pnpm jobs build"],
};

function getWorkspaceBuildCommand(workspaces: Workspace[] | "all"): string[] {
  if (workspaces === "all")
    return flatten(Object.values(workspaceBuildCommand));

  const commands: string[] = [];

  for (const workspace of workspaces)
    commands.push(...workspaceBuildCommand[workspace]);

  return commands;
}

export async function build(workspaces: Workspace[] | "all") {
  const commands = [
    ...stopServicesCommands,
    `git reset --hard`,
    `git pull origin ${config.branch}`,
    `git checkout ${config.branch}`,
    `pnpm install --network-concurrency=2`,
    `pnpm build:pkgs`,
    ...getWorkspaceBuildCommand(workspaces),
    ...restartServicesCommands,
  ];

  console.log("Commands: \n", commands.join("\t\n"));

  const process = spawn(commands.join(" && "), [], {
    shell: true,
    cwd: config.repo,
    stdio: "inherit",
  });

  return await new Promise((resolve, reject) => {
    process.on("error", reject);
    process.on("close", resolve);
  });
}
