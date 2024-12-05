import { CacheBase } from "@/cache/base";

export class Call extends CacheBase {
  private readonly prefixes = {
    call: "call",
    user: "user:call",
  };
  private ttl = 60 * 60; // 1 hour

  withTtl(ttl: number): Call {
    this.ttl = ttl;
    return this;
  }

  async addMember({ callId, userId }: { callId: number; userId: number }) {
    const callKey = this.asCallKey(callId);
    const userKey = this.asUserKey(userId);
    await this.client
      .multi()
      .sAdd(callKey, this.encode(userId))
      .set(userKey, this.encode(callId))
      .expire(callKey, this.ttl)
      .expire(userKey, this.ttl)
      .exec();
  }

  async removeMember({ callId, userId }: { callId: number; userId: number }) {
    await this.client
      .multi()
      .sRem(this.asCallKey(callId), userId.toString())
      .del(this.asUserKey(userId))
      .exec();
  }

  async removeMemberByUserId(userId: number): Promise<number | null> {
    const result = await this.client.get(this.asUserKey(userId));
    if (!result) return null;
    const callId = this.decode(result) as number;
    await this.removeMember({ callId, userId });
    return callId;
  }

  async getMembers(callId: number): Promise<number[]> {
    const result = await this.client.sMembers(this.asCallKey(callId));
    return result.map((value) => this.decode(value));
  }

  async isMember({
    callId,
    userId,
  }: {
    callId: number;
    userId: number;
  }): Promise<boolean> {
    return await this.client.sIsMember(
      this.asCallKey(callId),
      this.encode(userId)
    );
  }

  private asCallKey(callId: number): string {
    return `${this.prefixes.call}:${callId}`;
  }

  private asUserKey(userId: number): string {
    return `${this.prefixes.user}:${userId}`;
  }
}
