import { createClient } from "redis";
import { Tutors } from "@/cache/tutors";
import { RedisClient } from "@/cache/base";
import { Peer } from "@/cache/peer";
import { Session } from "@/cache/session";
import { OnlineStatus } from "@/cache/onlineStatus";

export class Cache {
  public tutors: Tutors;
  public peer: Peer;
  public session: Session;
  public onlineStatus: OnlineStatus;
  private readonly client: RedisClient;

  constructor(url: string) {
    const client = createClient({ url, readonly: false });
    this.client = client;
    this.tutors = new Tutors(client);
    this.peer = new Peer(client);
    this.session = new Session(client);
    this.onlineStatus = new OnlineStatus(client);
  }

  async flush() {
    await this.client.flushAll();
  }

  async connect() {
    if (!this.client.isOpen) await this.client.connect();
  }

  async disconnect() {
    if (this.client.isOpen) await this.client.quit();
  }
}
