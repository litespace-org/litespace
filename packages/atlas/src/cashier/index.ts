import { AuthToken, createClient } from "@/lib/client";
import { Env } from "@litespace/types";
import { Paymob } from "@/cashier/paymob";

export class Cashier {
  public readonly paymob: Paymob;

  constructor({
    server,
    paymobSecretKey,
    notificationUrl,
    redirectionUrl,
  }: {
    server: Env.Server;
    paymobSecretKey: AuthToken;
    notificationUrl?: string;
    redirectionUrl?: string;
  }) {
    const paymobClient = createClient("paymob", server, paymobSecretKey);
    this.paymob = new Paymob(paymobClient, notificationUrl, redirectionUrl);
  }
}
