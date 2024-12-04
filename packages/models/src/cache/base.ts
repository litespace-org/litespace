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
    public client: RedisClientType<RedisModules, RedisFunctions, RedisScripts>
  ) {}

  encode<T extends object | string | number>(values: T): string {
    return JSON.stringify(values);
  }

  decode<T>(values: string): T {
    return JSON.parse(values) as T;
  }
}
