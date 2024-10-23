import axios from "axios";
import { Command } from "commander";
import fs from "node:fs";
import { Update, VercelUrls, asVercelUrlsMessage } from "./common";

type GetUpdatesApiResponse = {
  ok: boolean;
  result: Array<Update>;
};
const token = process.env.TELEGRAM_API_TOKEN;
const chat = -4520756689;
const client = axios.create({
  baseURL: `https://api.telegram.org/bot${token}`,
});

async function sendMessage(text: string) {
  await client.post("/sendMessage", null, {
    params: { chat_id: chat, text },
  });
}

export async function getUpdates(): Promise<GetUpdatesApiResponse> {
  const { data } = await client.get("/getUpdates");
  return data;
}

export function displayUpdatesSummary(updates: GetUpdatesApiResponse) {
  for (const update of updates.result) {
    if (!update.message || !update.message.chat.title) continue;
    console.log(
      `${update.message.chat.title}(${update.message.chat.id}) - ${update.message.text}`
    );
  }
}

const updates = new Command()
  .name("updates")
  .option("-s, --short", "Display updates summary")
  .action(async (options: { short?: boolean }) => {
    const updates = await getUpdates();
    if (options.short) return displayUpdatesSummary(updates);
    console.log(JSON.stringify(updates, null, 2));
  });

const send = new Command()
  .name("send")
  .argument("<message>", "Message text")
  .action(async (message: string) => {
    await sendMessage(message);
  });

const sendVercelUrls = new Command()
  .name("send-vercel-urls")
  .option("-f, --file <file>", "Vercel urls json file", "vercel-urls.json")
  .option("-p, --pull <number>", "Pull request number")
  .option("-b, --branch <string>", "Branch name")
  .action(
    async ({
      file,
      pull,
      branch,
    }: {
      file: string;
      pull?: string;
      branch?: string;
    }) => {
      const json = fs.readFileSync(file).toString();
      const urls = JSON.parse(json) as VercelUrls;
      const prefix =
        pull && branch
          ? `#${pull} ${branch}: (https://github.com/litespace-org/litespace/pull/${pull})`
          : undefined;
      const message = asVercelUrlsMessage(urls, prefix);
      await sendMessage(message);
    }
  );

new Command()
  .name("telegram")
  .description("Telegram updates")
  .version("1.0.0")
  .addCommand(updates)
  .addCommand(send)
  .addCommand(sendVercelUrls)
  .parse();
