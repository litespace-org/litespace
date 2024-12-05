import { CacheBase } from "@/cache/base";

export class Call extends CacheBase {
  private readonly prefixes = {
    callJoined: "call:joined:members", // prefix for each call id that maps to a set of its joined members ids. string -> set
    callCanJoin: "call:canjoin:users", // prefix for each call id that maps to a set of eligible (can join) members ids. string -> set
    userCalls: "user:calls", // prefix for each user id that maps to a set of all calls that he can join
    userJoinedCall: "user:joined:call", // prefix for each user id that maps to the last joined call id. string -> string
  };
  private ttl = 60 * 60; // 1 hour

  withTtl(ttl: number): Call {
    this.ttl = ttl;
    return this;
  }

  // Join member to call
  async joinMember({ callId, userId }: { callId: number; userId: number }) {
    const callKey = this.asCallKey(callId).joined;
    const userKey = this.asUserKey(userId).joinedCall;
    await this.client
      .multi()
      .sAdd(callKey, this.encode(userId))
      .expire(callKey, this.ttl)
      .set(userKey, this.encode(callId))
      .expire(userKey, this.ttl)
      .exec();
  }

  // leave member from call
  async leaveMember({ callId, userId }: { callId: number; userId: number }) {
    const callKey = this.asCallKey(callId).joined;
    const userKey = this.asUserKey(userId).joinedCall;
    await this.client
      .multi()
      .sRem(callKey, userId.toString())
      .del(userKey)
      .exec();
  }
  async leaveMemberByUserId(userId: number) {
    const result = await this.client.get(this.asUserKey(userId).joinedCall);
    if (!result) return;
    const callId = this.decode(result) as number;
    await this.leaveMember({ callId, userId });
  }
  
  // make user an eligible member to join a call
  async addMember({ callId, userId }: { callId: number; userId: number }) {
    const callKey = this.asCallKey(callId).canJoin;
    const userKey = this.asUserKey(userId).calls;
    await this.client
      .multi()
      .sAdd(callKey, this.encode(userId))
      .expire(callKey, this.ttl)
      .sAdd(userKey, this.encode(callId))
      .exec();
  }

  // make user an uneligible member; cannot join the call
  async rmvMember({ callId, userId }: { callId: number; userId: number }) {
    const callKey = this.asCallKey(callId).canJoin;
    const userKey = this.asUserKey(userId).calls;
    await this.client
      .multi()
      .sRem(callKey, userId.toString())
      .sRem(userKey, callId.toString())
      .exec();
  }

  // returns true if the user joined to the call
  async isJoinedMember({
    callId,
    userId,
  }: {
    callId: number;
    userId: number;
  }): Promise<boolean> {
    return await this.client.sIsMember(
      this.asCallKey(callId).joined,
      this.encode(userId)
    );
  }

  // returns true if the user belongs to the call
  async isEligibleMember({
    callId,
    userId,
  }: {
    callId: number;
    userId: number;
  }): Promise<boolean> {
    return await this.client.sIsMember(
      this.asCallKey(callId).canJoin,
      this.encode(userId)
    );
  }

  // returns list of calls ids to which a specifc user belongs
  async getCallsOfUser(userId: number): Promise<number[]> {
    const ids = await this.client.sMembers(
      this.asUserKey(userId).calls
    );
    return ids ? ids.map((id) => Number(id)) : []
  }

  // returns the call id that a user has joined
  async getJoinedCallByUser(userId: number): Promise<number | null> {
    const id = await this.client.get(this.asUserKey(userId).joinedCall);
    return id ? Number(id) : null;
  }

  private asCallKey(callId: number) {
    return {
      joined: `${this.prefixes.callJoined}:${callId}`,
      canJoin: `${this.prefixes.callCanJoin}:${callId}`,
    }
  }

  private asUserKey(userId: number){
    return {
      joinedCall: `${this.prefixes.userJoinedCall}:${userId}`,
      calls: `${this.prefixes.userCalls}:${userId}`,
    };
  }
}
