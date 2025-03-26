import axios, { AxiosInstance } from "axios";
import FormData from "form-data";

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

  async sendDocument({
    document,
    chat,
    caption,
    name = "doc.txt",
  }: {
    document: Buffer | Blob;
    chat: number;
    caption?: string;
    name?: string;
  }) {
    const form = new FormData();
    form.append("chat_id", chat.toString());
    form.append("protect_content", "true");
    form.append("document", document, name);
    if (caption) form.append("caption", caption);
    return await this.client.post("/sendDocument", form, {
      headers: form.getHeaders(),
    });
  }
}
