import { Whatsapp } from "@/messenger/whatsapp";
import { AuthToken, createClient } from "@/lib/client";
import { Env } from "@litespace/types";

export class Messenger {
  public readonly whatsapp: Whatsapp;

  constructor({
    server,
    whatsAppToken,
  }: {
    server: Env.Server;
    whatsAppToken?: AuthToken;
  }) {
    const whatsAppClient = createClient(
      "whatsapp",
      server,
      whatsAppToken || null
    );
    this.whatsapp = new Whatsapp(whatsAppClient);
  }
}
