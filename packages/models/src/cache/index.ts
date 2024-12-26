import { createClient } from "redis";
import { Tutors } from "@/cache/tutors";
import { RedisClient } from "@/cache/base";
import { Peer } from "@/cache/peer";
import { Call } from "@/cache/call";
import { OnlineStatus } from "@/cache/onlineStatus";

export class Cache {
  public tutors: Tutors;
  public peer: Peer;
  public call: Call;
  public onlineStatus: OnlineStatus;
  private readonly client: RedisClient;

  constructor(url: string) {
    const client = createClient({ url });
    this.client = client;
    this.tutors = new Tutors(client);
    this.peer = new Peer(client);
    this.call = new Call(client);
    this.onlineStatus = new OnlineStatus(client);
  }

  async flush() {
    await this.client.flushAll();
  }

  async connect() {
    await this.client.connect();
  }

  async disconnect() {
    await this.client.quit();
  }
}
