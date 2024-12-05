import { redisUrl } from "@/constants";
import ResponseError, { notfound } from "@/lib/error";
import { Cache, calls } from "@litespace/models";
import { ICall } from "@litespace/types";

type KCallId = string;

type Memo = {
  calls: {[k: KCallId]: ICall.Self};
  callsJoinedMembers: {[k: KCallId]: ICall.PopuldatedMember[]}
}

/* 
 * This controller ensures harmony and synchronously between posgtesql and redis.
 * components should communicate with the db with **ONLY** this component.
 */
export class CallsController {
  // TODO: consider adding memo to avoid dispatching redundant queries to the database
  // NOTE: remeber to modify/reset the memo on each data manipulation
  private _redis: Cache | null;

  constructor() {
    this._redis = null;
  }

  // this getter is a connect-disconnect shorthand wrapper to simplify code
  private get redis(): Cache {
    if (this._redis !== null) return this._redis;
    this._redis = new Cache(redisUrl);
    this._redis.connect()

    // auto gracefully disconnect after 10 seconds
    setTimeout(async () => {
      if (!this._redis) return
      await this._redis.disconnect()
      this._redis = null
    }, 10 * 1000);

    return this._redis;
  }

  /*
   * inserts a call row in the database
   */
  async create(): Promise<ICall.Self> {
    return await calls.create();
  }

  /*
   * inserts a call row in the database along with members
   */
  async createWithMembers(membersIds: number[]): Promise<ICall.Self> {
    const call = await calls.create();
    for (const id of membersIds) {
      await this.redis.call.addMember({ callId: call.id, userId: id });
    }
    return call;
  }

  async joinMemberToCall({callId, userId}: {callId: number, userId: number}): Promise<void> {
    // NOTE addMember in knex calls wrapper means joining the call
    await calls.addMember({ callId, userId });
    await this.redis.call.joinMember({ callId, userId });
  }

  async leaveMemberFromCall({callId, userId}: {callId: number, userId: number}): Promise<void> {
    // NOTE removeMemeber in knex calls wrapper means leaving the call
    await calls.removeMember({ callId, userId });
    await this.redis.call.leaveMember({ callId, userId });
  }

  async leaveMemberFromAll(userId: number): Promise<void> {
    const callId = Number(await this.redis.call.getJoinedCallByUser(userId));
    this.leaveMemberFromCall({ userId, callId })
  }

  /*
   *  retrieve a specific call object from the database
   */
  async getCallById(callId: number): Promise<ICall.Self> {
    const call = await calls.findById(callId);
    if (!call) throw notfound.call();
    return call;
  }

  /*
   *  retrieve the list of calls that one user belongs to
   */
  async getCallsOfUser(userId: number): Promise<number[]> {
    return await this.redis.call.getCallsOfUser(userId);
  }

  /*
   *  retrieve the list of joined members of a specific call
   */
  async getJoinedMembers(callId: number): Promise<ICall.PopuldatedMember[]> {
    const call = await this.getCallById(callId);
    if (call instanceof ResponseError) throw call;
    // NOTE: findCallMembers means retrieve joined members
    return await calls.findCallMembers([callId]);
  }

  /*
   *  check if a user is an eligible member of a call
   */
  async isMember({callId, userId}: {callId: number, userId: number}): Promise<boolean> {
    const call = await this.getCallById(callId);
    if (call instanceof ResponseError) throw call;
    return await this.redis.call.isEligibleMember({ userId, callId })
  }
}
