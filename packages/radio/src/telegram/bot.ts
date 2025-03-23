import axios, { AxiosInstance } from "axios";

type ParseMode = "markdown" | "markdown-v2" | "html" | "text";

const parseModeMap: Record<ParseMode, string | undefined> = {
  text: undefined,
  markdown: "Markdown",
  "markdown-v2": "MarkdownV2",
  html: "HTML",
};

export class TelegramBot {
  private client: AxiosInstance;

  constructor(token: string) {
    this.client = axios.create({
      baseURL: `https://api.telegram.org/bot${token}`,
    });
  }

  async sendMessage({
    text,
    chat,
    parseMode = "markdown",
  }: {
    text: string;
    chat: number;
    parseMode?: "markdown" | "markdown-v2" | "html" | "text";
  }) {
    return await this.client.post("/sendMessage", null, {
      params: { chat_id: chat, text, parse_mode: parseModeMap[parseMode] },
    });
  }
}
