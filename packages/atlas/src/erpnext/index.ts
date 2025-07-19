import { createClient, TokenType } from "@/lib/client";
import { Env } from "@litespace/types";
import { Document } from "@/erpnext/document";

export class ErpNext {
  public readonly document: Document;

  constructor(env: Env.Server, key: string, secret: string) {
    const client = createClient("erpnext", env, {
      type: TokenType.Basic,
      username: key,
      password: secret,
    });

    this.document = new Document(client);
  }
}
