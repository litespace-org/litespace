import { createClient } from "redis";
import { Tutors } from "@/cache/tutors";
import { Rules } from "@/cache/rules";
import { RedisClient } from "@/cache/base";
import { Peer } from "@/cache/peer";
import { Call } from "@/cache/call";

export class Cache {
  public tutors: Tutors;
  public rules: Rules;
  public peer: Peer;
  public call: Call;
  private readonly client: RedisClient;

  constructor(url: string) {
    const client = createClient({ url });
    this.client = client;
    this.tutors = new Tutors(client);
    this.rules = new Rules(client);
    this.peer = new Peer(client);
    this.call = new Call(client);
  }

  async flush() {
    await this.client.flushAll();
  }

  async connect() {
    await this.client.connect();
  }
}
