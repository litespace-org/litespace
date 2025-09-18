import { CallMember } from "@/modules/MediaCall/CallMember";
import {
  AudioTrack,
  CallError,
  MemberConnectionState,
  VideoTrack,
} from "@/modules/MediaCall/types";
import { ErrorHandler } from "@/modules/MediaCall/ErrorHandler";

export type EventExt = {
  before?: (session: CallSession) => unknown;
  after?: (session: CallSession) => unknown;
};

export interface EventsExtensions {
  onMemberConnect?: EventExt;
  onMemberDisconnect?: EventExt;
  onMemberConnectionStateChange?: EventExt;
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
  private eh: ErrorHandler;

  constructor(
    memberIds: Array<CallMember["id"]>,
    ext?: EventsExtensions,
    eh?: ErrorHandler
  ) {
    this.members = memberIds.map((id) => new CallMember(id, this));
    this.joinedMembers = [];
    this.ext = ext || {};
    this.eh = eh || new ErrorHandler();
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
  async connect(..._params: unknown[]): Promise<unknown> {
    throw Error("not implemented!");
  }

  /**
   * disconnect from session by the current member.
   */
  async disconnect(): Promise<unknown> {
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

  setMember(index: number, member: CallMember) {
    if (index >= this.members.length)
      return this.eh.throw(CallError.IndexOutOfRange);

    const joinedTargetIndex = this.joinedMembers.findIndex(
      (m) => m.id === this.members[index].id
    );
    this.members[index] = member;

    if (joinedTargetIndex !== -1)
      this.joinedMembers[joinedTargetIndex] = member;
  }

  addMember(memberId: CallMember["id"]) {
    this.members.push(new CallMember(memberId, this));
  }

  rmvMember(memberId: CallMember["id"]) {
    if (this.hasJoined(memberId))
      return this.eh.throw(CallError.CannotRemoveJoinedMember);
    this.members = this.members.filter((m) => m.id !== memberId);
  }

  isFull(): boolean {
    return this.joinedMembers.length >= this.members.length;
  }

  canJoin(memberId: CallMember["id"]): boolean {
    if (!this.members.map((m) => m.id).includes(memberId)) {
      this.eh.throw(CallError.NotAllowedToJoinSession);
      return false;
    }

    if (this.hasJoined(memberId)) {
      this.eh.throw(CallError.MemberAlreadyInSession);
      return false;
    }

    if (this.isFull()) {
      this.eh.throw(CallError.FullSession);
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

  onMemberMicPublish(_memberId: CallMember["id"], _track: AudioTrack) {
    this.execEventExt(this.ext.onMemberMicPublish?.before);
    this.execEventExt(this.ext.onMemberMicPublish?.after);
  }

  onMemberCamPublish(_memberId: CallMember["id"], _track: VideoTrack) {
    this.execEventExt(this.ext.onMemberCamPublish?.before);
    this.execEventExt(this.ext.onMemberCamPublish?.after);
  }

  onMemberMicChange(_memberId: CallMember["id"], _state: boolean) {
    this.execEventExt(this.ext.onMemberMicChange?.before);
    this.execEventExt(this.ext.onMemberMicChange?.after);
  }

  onMemberCamChange(_memberId: CallMember["id"], _state: boolean) {
    this.execEventExt(this.ext.onMemberCamChange?.before);
    this.execEventExt(this.ext.onMemberCamChange?.after);
  }

  onMemberScreenChange(_memberId: CallMember["id"], _state: boolean) {
    this.execEventExt(this.ext.onMemberScreenChange?.before);
    this.execEventExt(this.ext.onMemberScreenChange?.after);
  }

  onMemberConnectionStateChange(
    _memberId: CallMember["id"],
    _state: MemberConnectionState
  ) {
    this.execEventExt(this.ext.onMemberConnectionStateChange?.before);
    this.execEventExt(this.ext.onMemberConnectionStateChange?.after);
  }
}
