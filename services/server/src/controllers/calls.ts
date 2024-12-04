import ResponseError, { notfound } from "@/lib/error";
import { calls } from "@litespace/models";
import { ICall } from "@litespace/types";

type Memo = {
  calls: {[k: string]: ICall.Self};
  members: {[k: string]: ICall.PopuldatedMember[]}
}

export class CallsController {
  // used to avoid dispatching redundant queries to the database
  // NOTE: remeber to modify/reset the memo on each data manipulation
  private memo: Memo;

  constructor() {
    this.memo = {calls: {}, members: {}}
  }

  /*
   *  retrieve a specific call object from the database
   */
  async getCallById(callId: number): Promise<ICall.Self> {
    if (this.memo.calls[callId]) {
      return this.memo.calls[callId];
    }

    const call = await calls.findById(callId);
    if (!call) throw notfound.call();

    this.memo.calls[callId] = call;
    return call;
  }

  /*
   *  retrieve the list of members of a specific call
   */
  async getCallMembers(callId: number): Promise<ICall.PopuldatedMember[]> {
    if (this.memo.members[callId]) {
      return this.memo.members[callId];
    }

    const call = await this.getCallById(callId);
    if (call instanceof ResponseError) throw call;

    const members = await calls.findCallMembers([callId]);
    this.memo.members[callId] = members;
    return members;
  }

  /*
   *  check if a user is an eligable member of a call
   */
  async isMember(userId: number, callId: number): Promise<boolean> {
    const members = await this.getCallMembers(callId);
    if (members instanceof ResponseError) throw members;
    return members.map(member => member.userId).includes(userId);
  }
}
