import {
  createClient,
  RedisClientType,
  RedisDefaultModules,
  RedisFunctions,
  RedisModules,
  RedisScripts,
} from "redis";

export class CacheBase {
  constructor(
    public client: RedisClientType<RedisModules, RedisFunctions, RedisScripts>
  ) {}

  encode<T extends object>(values: T): string {
    return JSON.stringify(values);
  }

  decode<T>(values: string): T {
    return JSON.parse(values) as T;
  }
}
