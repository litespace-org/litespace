import { createClient } from "redis";
import { Tutors } from "@/cache/tutors";
import { Rules } from "@/cache/rules";
import { RedisClient } from "@/cache/base";
import { Peer } from "@/cache/peer";
import { Call } from "@/cache/call";

export class Cache {
  public _tutors: Tutors;
  public _rules: Rules;
  public _peer: Peer;
  public _call: Call;

  private readonly client: RedisClient;
  private disconnectTimeout: NodeJS.Timeout | null = null;

  constructor(url: string) {
    const client = createClient({ url });
    this.client = client;
    this._tutors = new Tutors(client);
    this._rules = new Rules(client);
    this._peer = new Peer(client);
    this._call = new Call(client);
  }

  get call(): Call {
    this.connect();
    return this._call;
  }
  get peer(): Peer {
    this.connect();
    return this._peer;
  }
  get rules(): Rules {
    this.connect();
    return this._rules;
  }
  get tutors(): Tutors {
    this.connect();
    return this._tutors;
  }

  async flush() {
    await this.connect();
    await this.client.flushAll();
  }

  async connect() {
    if (this.disconnectTimeout === null) {
      await this.client.connect();
    }
    else {
      clearTimeout(this.disconnectTimeout);
    }
    this.disconnectTimeout = setTimeout(() => this.disconnect(), 10_000);
  }

  async disconnect() {
    if (this.disconnectTimeout) {
      clearTimeout(this.disconnectTimeout);
      this.disconnectTimeout = null;
    }
    await this.client.quit();
  }
}
