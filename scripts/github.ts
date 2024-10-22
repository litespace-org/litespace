import axios from "axios";
import { Command } from "commander";
import { VercelUrls, asVercelUrlsMessage } from "./common";
import fs from "node:fs";

function createClient(token: string) {
  return axios.create({
    baseURL: "https://api.github.com/repos/litespace-org/litespace",
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
      Authorization: `Bearer ${token}`,
    },
  });
}

async function comment({
  message,
  pull,
  token,
}: {
  message: string;
  pull: string;
  token: string;
}) {
  const client = createClient(token);
  return await client.post(`/issues/${pull}/comments`, {
    body: message,
  });
}

const commentCommand = new Command()
  .name("comment")
  .option("-f, --file <file>", "Vercel urls json file", "vercel-urls.json")
  .option("-p, --pull <number>", "Pull request number")
  .option("-t, --token <string>", "GitHub auth token")
  .action(
    async ({
      file,
      pull,
      token,
    }: {
      file: string;
      pull: string;
      token: string;
    }) => {
      const json = fs.readFileSync(file).toString();
      const urls = JSON.parse(json) as VercelUrls;
      const message = asVercelUrlsMessage(urls);
      await comment({ token, pull: pull.toString(), message });
    }
  );

new Command()
  .name("github")
  .description("Manage GitHub interactions")
  .version("1.0.0", "-v")
  .addCommand(commentCommand)
  .parse();
