import { CallMember } from "./CallMember";

export type EventExt = {
  before?: (session: CallSession) => unknown;
  after?: (session: CallSession) => unknown;
};

export interface EventsExtensions {
  onMemberConnect?: EventExt;
  onMemberDisconnect?: EventExt;
  onMemberMicPublish?: EventExt;
  onMemberMicChange?: EventExt;
  onMemberCamPublish?: EventExt;
  onMemberCamChange?: EventExt;
  onMemberScreenPublish?: EventExt;
  onMemberScreenChange?: EventExt;
}

export abstract class CallSession {
  protected members: CallMember[];
  protected joinedMembers: CallMember[];
  private ext: EventsExtensions;

  constructor(memberIds: Array<CallMember["id"]>, ext?: EventsExtensions) {
    this.members = memberIds.map((id) => new CallMember(id, this));
    this.joinedMembers = [];
    this.ext = ext || {};
  }

  /**
   * by convention the current member is stored at the top of members array.
   */
  get curMember() {
    return this.members[0];
  }

  /**
   * connect to session by the current member.
   */
  async connect(..._params: any[]): Promise<any> {
    throw Error("not implemented!");
  }

  /**
   * disconnect from session by the current member.
   */
  async disconnect(): Promise<any> {
    throw Error("not implemented!");
  }

  getJoinedMembers(): CallMember[] | null {
    return this.joinedMembers;
  }

  getMember(memberId: CallMember["id"]): CallMember | null {
    return this.members.find((m) => m.id === memberId) || null;
  }

  getMemberByIndex(i: number): CallMember | null {
    return this.members[i] || null;
  }

  addMember(memberId: CallMember["id"]) {
    this.members.push(new CallMember(memberId, this));
  }

  rmvMember(memberId: CallMember["id"]) {
    if (this.hasJoined(memberId))
      return console.error("cannot remove joined member.");
    this.members = this.members.filter((m) => m.id !== memberId);
  }

  isFull(): boolean {
    return this.joinedMembers.length >= this.members.length;
  }

  canJoin(memberId: CallMember["id"]): boolean {
    if (!this.members.map((m) => m.id).includes(memberId)) {
      console.error("not allowed to join this session!");
      return false;
    }

    if (this.hasJoined(memberId)) {
      console.error(`the member ${memberId} is already in the session!`);
      return false;
    }

    if (this.isFull()) {
      console.error("the session is full; not expected!");
      return false;
    }

    return true;
  }

  hasJoined(memberId: CallMember["id"]): boolean {
    return this.joinedMembers.map((m) => m.id).includes(memberId);
  }

  protected execEventExt(fn?: (session: CallSession) => unknown) {
    if (fn) return fn(this);
  }

  onMemberConnect(memberId: CallMember["id"]) {
    this.execEventExt(this.ext.onMemberConnect?.before);

    if (!this.canJoin(memberId)) return;
    const member = this.members.find((m) => m.id === memberId);
    this.joinedMembers.push(member!);

    this.execEventExt(this.ext.onMemberConnect?.after);
  }

  onMemberDisconnect(memberId: CallMember["id"]) {
    this.execEventExt(this.ext.onMemberDisconnect?.before);

    this.joinedMembers = this.joinedMembers.filter((m) => m.id !== memberId);

    this.execEventExt(this.ext.onMemberDisconnect?.after);
  }

  onMemberMicPublish() {
    this.execEventExt(this.ext.onMemberMicPublish?.before);
    this.execEventExt(this.ext.onMemberMicPublish?.after);
  }

  onMemberCamPublish() {
    this.execEventExt(this.ext.onMemberCamPublish?.before);
    this.execEventExt(this.ext.onMemberCamPublish?.after);
  }

  onMemberMicChange() {
    this.execEventExt(this.ext.onMemberMicChange?.before);
    this.execEventExt(this.ext.onMemberMicChange?.after);
  }

  onMemberCamChange() {
    this.execEventExt(this.ext.onMemberCamChange?.before);
    this.execEventExt(this.ext.onMemberCamChange?.after);
  }

  onMemberScreenChange() {
    this.execEventExt(this.ext.onMemberScreenChange?.before);
    this.execEventExt(this.ext.onMemberScreenChange?.after);
  }
}
