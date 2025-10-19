import axios from "axios";
import { Command } from "commander";

const regex =
  /```release\s*(\r|\n|\r\n)(?<workspaces>[A-Za-z@/,]*)\s*(\r|\n|\r\n)```/;

const client = axios.create({
  baseURL: "https://deployer.litespace.org",
});

const expected = [
  "@litespace/web",
  "@litespace/dashboard",
  "@litespace/blog",
  "@litespace/landing",
  "@litespace/server",
];

function isValidWorkspaces(workspaces: string[]): boolean {
  for (const workspace of workspaces) {
    if (workspace === "all") continue;
    if (!expected.includes(workspace)) return false;
  }
  return true;
}

async function sendDeploymentRequest(workspaces: string[], secret: string) {
  return await client.post("/", null, {
    params: {
      workspaces: workspaces.join(","),
      secret,
    },
  });
}

new Command()
  .name("release")
  .description("LiteSpace Release CLI")
  .version("1.0.0")
  .requiredOption("-b, --release-body <body>")
  .requiredOption("-s, --secret <secret>")
  .action(
    async ({
      releaseBody,
      secret,
    }: {
      releaseBody: string;
      secret: string;
    }) => {
      const match = regex.exec(releaseBody);
      const raw = match?.groups?.["workspaces"];
      if (!raw) throw new Error("Invalid release body.");
      if (raw === "skip") return console.log("Skipping release deployment");

      const workspaces = raw.split(",");
      const isValid = isValidWorkspaces(workspaces);
      if (!isValid) throw new Error(`"${raw}" invalid workspaces expression`);

      await sendDeploymentRequest(workspaces, secret);
    }
  )
  .parse();
