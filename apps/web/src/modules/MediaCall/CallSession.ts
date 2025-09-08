import { CallMember } from "./CallMember";

export abstract class CallSession {
  private members: CallMember[];
  private joinedMembers: CallMember[];

  constructor(members: CallMember[]) {
    this.members = members;
    this.joinedMembers = [];
  }

  async connect(..._params: any[]): Promise<any> {
    throw Error("not implemented!");
  }

  async disconnect(): Promise<any> {
    throw Error("not implemented!");
  }

  getMember(memberId: CallMember["id"]): CallMember | null {
    return this.members.find((m) => m.id === memberId) || null;
  }

  getMemberByIndex(i: number): CallMember | null {
    return this.members[i] || null;
  }

  protected addMember(member: CallMember) {
    this.members.push(member);
  }

  protected rmvMember(memberId: CallMember["id"]) {
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

    if (this.isFull()) {
      console.error("the session is full; not expected!");
      return false;
    }

    return true;
  }

  hasJoined(memberId: CallMember["id"]): boolean {
    return this.joinedMembers.map((m) => m.id).includes(memberId);
  }

  protected onMemberConnect(memberId: CallMember["id"]) {
    if (!this.canJoin(memberId)) return;
    const member = this.members.find((m) => m.id === memberId);
    this.joinedMembers.push(member!);
  }

  protected onMemberDisconnect(memberId: CallMember["id"]) {
    if (!this.canJoin(memberId)) return;
    this.joinedMembers = this.joinedMembers.filter((m) => m.id !== memberId);
  }

  protected onMemberMicChange(memberId: CallMember["id"], enabled: boolean) {
    if (!this.hasJoined(memberId)) return console.error("member not joined!");
    const member = this.getMember(memberId)!;
    member.setMicStatus(enabled);
  }

  protected onMemberCamChange(memberId: CallMember["id"], enabled: boolean) {
    if (!this.hasJoined(memberId)) return console.error("member not joined!");
    const member = this.getMember(memberId)!;
    member.setCamStatus(enabled);
  }

  protected onMemberScreenChange(memberId: CallMember["id"], enabled: boolean) {
    if (!this.hasJoined(memberId)) return console.error("member not joined!");
    const member = this.getMember(memberId)!;
    member.setScreenStatus(enabled);
  }
}
