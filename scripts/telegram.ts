import axios from "axios";
import { Command } from "commander";
import fs from "node:fs";

type Update = {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name: string;
    };
    chat: {
      id: number;
      title: string;
      type: string;
    };
    text?: string;
    date?: number;
  };
};

type GetUpdatesApiResponse = {
  ok: boolean;
  result: Array<Update>;
};

type VercelUrls = Record<string, string | null>;

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

async function getUpdates(): Promise<GetUpdatesApiResponse> {
  const { data } = await client.get("/getUpdates");
  return data;
}

function displayUpdatesSummary(updates: GetUpdatesApiResponse) {
  for (const update of updates.result) {
    if (!update.message || !update.message.chat.title) continue;
    console.log(
      `${update.message.chat.title}(${update.message.chat.id}) - ${update.message.text}`
    );
  }
}

function asVercelUrl(url: string | null) {
  if (!url) return "-";
  return `https://${url}`;
}

function asVercelUrlsMessage(urls: VercelUrls): string {
  let message = "";

  for (const [name, url] of Object.entries(urls)) {
    message += `🚀 ${name}: ${asVercelUrl(url)}\n`;
  }

  return message;
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
  .action(async (options: { file: string }) => {
    const json = fs.readFileSync(options.file).toString();
    const urls = JSON.parse(json) as VercelUrls;
    const message = asVercelUrlsMessage(urls);
    await sendMessage(message);
  });

new Command()
  .name("telegram")
  .description("Telegram updates")
  .version("1.0.0")
  .addCommand(updates)
  .addCommand(send)
  .addCommand(sendVercelUrls)
  .parse();
