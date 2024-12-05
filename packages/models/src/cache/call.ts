import { CacheBase, RedisClient } from "@/cache/base";

export class Call extends CacheBase {
  private callInMembers; // callId -> userId[]
  private callAllMembers; // callId -> userId[]
  private userCalls; // userId -> callId[]
  private userJoinedCall; // userId -> callId

  constructor(client: RedisClient) {
    super(client)
    this.callInMembers = this.RSet("call:in:members")
    this.callAllMembers = this.RSet("call:all:members")
    this.userCalls = this.RSet("user:calls")
    this.userJoinedCall = this.RValue("user:joined:call")
  }

  // Join member to call
  async joinMember({ callId, userId }: { callId: number; userId: number }) {
    const CALL = callId.toString();
    const USER = userId.toString();
    this.callInMembers.add(CALL, USER).expire(CALL, 60 * 60);
    this.userJoinedCall.set(USER, CALL);
  }

  // leave member from call
  async leaveMember({ callId, userId }: { callId: number; userId: number }) {
    const CALL = callId.toString();
    const USER = userId.toString();
    this.callInMembers.rmv(CALL, USER);
    this.userJoinedCall.del(USER);
  }

  async leaveMemberByUserId(userId: number) {
    const callId = await this.userJoinedCall.get(userId.toString());
    if (typeof callId !== "string") return;
    await this.leaveMember({ callId: Number(callId), userId });
  }
  
  // make user an eligible member to join a call
  async addMember({ callId, userId }: { callId: number; userId: number }) {
    const CALL = callId.toString();
    const USER = userId.toString();
    this.userCalls.add(USER, CALL);
    this.callAllMembers.add(CALL, USER);
  }

  // make user uneligible member; cannot join the call
  async rmvMember({ callId, userId }: { callId: number; userId: number }) {
    const CALL = callId.toString();
    const USER = userId.toString();
    this.callInMembers.rmv(CALL, USER);
    this.userCalls.rmv(USER, CALL);
  }

  // returns true if the user joined to the call
  async isJoinedMember({
    callId,
    userId,
  }: {
    callId: number;
    userId: number;
  }): Promise<boolean> {
    const CALL = callId.toString();
    const USER = userId.toString();
    return await this.callInMembers.client.sIsMember(
      this.callInMembers.prefixKey(CALL),
      this.callInMembers.encode(USER)
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
    const CALL = callId.toString();
    const USER = userId.toString();
    return await this.callAllMembers.client.sIsMember(
      this.callAllMembers.prefixKey(CALL),
      this.callAllMembers.encode(USER)
    );
  }

  // returns list of calls ids to which a specifc user belongs
  async getCallsOfUser(userId: number): Promise<number[]> {
    const ids = await this.userCalls.get(userId.toString());
    return ids ? ids.map((id) => Number(id)) : []
  }

  // returns the call id that a user has joined
  async getJoinedCallByUser(userId: number): Promise<number | null> {
    const id = await this.userJoinedCall.get(userId.toString());
    return id ? Number(id) : null;
  }
}
