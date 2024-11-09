import { createClient } from "redis";
import { Tutors } from "@/cache/tutors";
import { Rules } from "@/cache/rules";
import { RedisClient } from "@/cache/base";

export class Cache {
  public tutors: Tutors;
  public rules: Rules;
  private readonly client: RedisClient;

  constructor(url: string) {
    const client = createClient({ url });
    this.client = client;
    this.tutors = new Tutors(client);
    this.rules = new Rules(client);
  }

  async flush() {
    await this.client.flushAll();
  }

  async connect() {
    await this.client.connect();
  }
}
