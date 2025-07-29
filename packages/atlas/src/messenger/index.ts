import { Whatsapp } from "@/messenger/whatsapp";
import { AuthToken, createClient } from "@/lib/client";
import { Env } from "@litespace/types";

export class Messenger {
  public readonly whatsapp: Whatsapp;

  constructor({
    server,
    whatsAppToken,
    profileId,
  }: {
    server: Env.Server;
    whatsAppToken: AuthToken;
    profileId: number;
  }) {
    const whatsAppClient = createClient("whatsapp", server, whatsAppToken);
    this.whatsapp = new Whatsapp(whatsAppClient, profileId);
  }
}
