import { CacheBase } from "@/cache/base";
import { asSessionId } from "@/lib/utils";
import { ISession } from "@litespace/types";

export class Session extends CacheBase {
  private readonly prefixes = {
    session: "session",
    user: "user:session",
  };
  private ttl = 60 * 60; // 1 hour

  withTtl(ttl: number): Session {
    this.ttl = ttl;
    return this;
  }

  async addMember({ sessionId, userId }: { sessionId: ISession.Id; userId: number }) {
    const sessionKey = this.asSessionKey(sessionId);
    const userKey = this.asUserKey(userId);
    await this.client
      .multi()
      .sAdd(sessionKey, this.encode(userId))
      .set(userKey, this.encode(sessionId))
      .expire(sessionKey, this.ttl)
      .expire(userKey, this.ttl)
      .exec();
  }

  async removeMember({ sessionId, userId }: { sessionId: ISession.Id; userId: number }) {
    await this.client
      .multi()
      .sRem(this.asSessionKey(sessionId), userId.toString())
      .del(this.asUserKey(userId))
      .exec();
  }

  async removeMemberByUserId(userId: number): Promise<string | null> {
    const result = await this.client.get(this.asUserKey(userId));
    if (!result) return null;
    const sessionId = asSessionId(this.decode(result));
    await this.removeMember({ sessionId, userId });
    return sessionId;
  }

  async getMembers(sessionId: ISession.Id): Promise<number[]> {
    const result = await this.client.sMembers(this.asSessionKey(sessionId));
    return result.map((value) => this.decode(value));
  }

  async isMember({
    sessionId,
    userId,
  }: {
    sessionId: ISession.Id;
    userId: number;
  }): Promise<boolean> {
    return await this.client.sIsMember(
      this.asSessionKey(sessionId),
      this.encode(userId)
    );
  }

  private asSessionKey(sessionId: string): string {
    return `${this.prefixes.session}:${sessionId}`;
  }

  private asUserKey(userId: number): string {
    return `${this.prefixes.user}:${userId}`;
  }
}
