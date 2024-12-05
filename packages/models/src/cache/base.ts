import {
  RedisClientType,
  RedisFunctions,
  RedisModules,
  RedisScripts,
} from "redis";

export type RedisClient = RedisClientType<
  RedisModules,
  RedisFunctions,
  RedisScripts
>;

export class CacheBase {
  constructor(
    public client: RedisClient
  ) {}

  // return class to define and store redis value
  RValue(prefix: string) {
    return new RValue(this.client, prefix);
  }

  // return class to define and store redis set
  RSet(prefix: string) {
    return new RSet(this.client, prefix);
  }

  encode<T extends object | string | number>(values: T): string {
    return JSON.stringify(values);
  }

  decode<T>(values: string): T {
    return JSON.parse(values) as T;
  }
}

/*
 *  ancillary class that's used in Cache to represent redis key-set pairs
 */
class RSet {
  private prefix: string;
  private _client: RedisClient;

  constructor(client: RedisClient, prefix: string) {
    this.prefix = prefix;
    this._client = client;
  }

  get client() {
    return this._client;
  }

  async get(key: string) {
    const list = await this.client.sMembers(`${this.prefix}:${key}`);
    return list.map(v => this.decode(v));
  }
  
  add(key: string, value: string) {
    this.client.sAdd(`${this.prefix}:${key}`, this.encode(value));
    return this;
  }

  rmv(key: string, value: string) {
    this.client.sRem(`${this.prefix}:${key}`, this.encode(value))
    return this;
  }

  expire(key: string, seconds: number) {
    this.client.expire(`${this.prefix}:${key}`, seconds);
    return this;
  }

  encode<T extends object | string | number>(values: T): string {
    return JSON.stringify(values);
  }

  decode<T>(values: string): T {
    return JSON.parse(values) as T;
  }

  prefixKey(key: string): string {
    return `${this.prefix}:${key}`
  }
}

/*
 *  ancillary class that's used in Cache to represent redis key-value pairs
 */
class RValue {
  private prefix: string;
  private _client: RedisClient;

  constructor(client: RedisClient, prefix: string) {
    this.prefix = prefix;
    this._client = client;
  }

  get client() {
    return this._client;
  }

  async get(key: string) {
    const value = await this.client.get(`${this.prefix}:${key}`);
    return value ? this.decode(value) : null;
  }
  
  set(key: string, value: string) {
    this.client.set(`${this.prefix}:${key}`, this.encode(value));
    return this;
  }

  del(key: string) {
    this.client.del(`${this.prefix}:${key}`)
    return this;
  }

  expire(key: string, seconds: number) {
    this.client.expire(`${this.prefix}:${key}`, seconds);
    return this;
  }

  encode<T extends object | string | number>(values: T): string {
    return JSON.stringify(values);
  }

  decode<T>(values: string): T {
    return JSON.parse(values) as T;
  }

  prefixKey(key: string): string {
    return `${this.prefix}:${key}`
  }
}
