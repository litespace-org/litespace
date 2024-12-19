import { CacheBase } from "./base";

export class OnlineStatus extends CacheBase {
  readonly key = "online-status";

  async getAll(): Promise<Record<string, string>> {
    return await this.client.hGetAll(this.key)
  }

  async addUser(userId: number): Promise<void> {
    await this.client.hSet(this.key, this.asField(userId), this.encode(1));
  }

  async removeUser(userId: number): Promise<void> {
    await this.client.hDel(this.key, this.asField(userId));
  }

  async isOnline(userId: number): Promise<boolean> {
    return await this.client.hExists(this.key, this.asField(userId));
  }

  async isOnlineBatch(userIds: number[]): Promise<boolean[]> {
    const redisClient = this.client.multi();
    userIds.forEach(id => redisClient.hExists(this.key, this.asField(id)));
    const result = await redisClient.exec();
    return result as unknown as boolean[];
  }

  private asField(userId: number): string {
    return userId.toString();
  }
}
