import { Whatsapp } from "@/messenger/whatsapp";
import { Telegram } from "@/messenger/telegram";
import { AuthToken, createClient } from "@/client";
import { Env } from "@litespace/types";

export class Messenger {
  public readonly whatsapp: Whatsapp;
  public readonly telegram: Telegram;

  constructor(server: Env.Server, token: AuthToken | null) {
    const client = createClient(server, token, "messenger");
    this.whatsapp = new Whatsapp(client);
    this.telegram = new Telegram(client);
  }
}
