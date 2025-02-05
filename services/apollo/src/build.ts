import { config } from "@/config";
import { Workspace } from "@/types";
import { spawn } from "node:child_process";

const workspaceBuildCommand: Record<Workspace, string[]> = {
  "@litespace/apollo": ["pnpm apollo build"],
  "@litespace/server": ["pnpm models migrate up", "pnpm run server build"],
  "@litespace/web": ["pnpm web build"],
  "@litespace/dashboard": ["pnpm dashboard build"],
  "@litespace/landing": ["pnpm landing build"],
  "@litespace/blog": ["pnpm blog build"],
};

export async function build(workspace: Workspace) {
  const commands = [
    `git pull origin ${config.branch}`,
    `pnpm install`,
    `pnpm build:pkgs`,
    ...workspaceBuildCommand[workspace],
  ];

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
