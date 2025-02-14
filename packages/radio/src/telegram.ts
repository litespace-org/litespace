import axios, { AxiosInstance } from "axios";

export class Telegram {
  private client: AxiosInstance;

  constructor(token: string) {
    this.client = axios.create({
      baseURL: `https://api.telegram.org/bot${token}`,
    });
  }

  async sendMessage({ text, chat }: { text: string; chat: number }) {
    return await this.client.post("/sendMessage", null, {
      params: { chat_id: chat, text, parse_mode: "markdown" },
    });
  }
}
