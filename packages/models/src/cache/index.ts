import { createClient } from "redis";
import { Tutors } from "@/cache/tutors";
import { Rules } from "@/cache/rules";
import { RedisClient } from "@/cache/base";
import { Peer } from "@/cache/peer";

export class Cache {
  public tutors: Tutors;
  public rules: Rules;
  public peer: Peer;
  private readonly client: RedisClient;

  constructor(url: string) {
    const client = createClient({ url });
    this.client = client;
    this.tutors = new Tutors(client);
    this.rules = new Rules(client);
    this.peer = new Peer(client);
  }

  async flush() {
    await this.client.flushAll();
  }

  async connect() {
    await this.client.connect();
  }
}
