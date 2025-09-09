import { CallSession } from "@/modules/MediaCall/CallSession";
import {
  MemberTracks,
  AudioTrack,
  VideoTrack,
  CallError,
} from "@/modules/MediaCall/types";
import { ErrorHandler } from "@/modules/MediaCall/ErrorHandler";

export class CallMember {
  readonly id: string;
  readonly tracks: MemberTracks;
  private session: CallSession;
  private eh: ErrorHandler;

  constructor(id: string, session: CallSession, eh?: ErrorHandler) {
    this.id = id;
    this.tracks = {};
    this.session = session;
    this.eh = eh || new ErrorHandler();
  }

  publishMicTrack(track?: AudioTrack) {
    if (!this.tracks.mic && !track)
      return this.eh.throw(CallError.TrackNotFound);
    if (track) this.tracks.mic = track;
    this.session.onMemberMicPublish(this.id, this.tracks.mic!);
  }

  publishCamTrack(track?: VideoTrack) {
    if (!this.tracks.cam && !track)
      return this.eh.throw(CallError.TrackNotFound);
    if (track) this.tracks.cam = track;
    this.session.onMemberCamPublish(this.id, this.tracks.cam!);
  }

  publishScreenTrack(track?: VideoTrack) {
    this.tracks.screen = track;
    // TODO onMemberScreenPublish
  }

  setMicStatus(state: boolean) {
    if (!this.tracks.mic) return this.eh.throw(CallError.TrackNotFound);

    this.tracks.mic.enabled = state;
    this.session.onMemberMicChange(this.id, state);
  }

  setCamStatus(state: boolean) {
    if (!this.tracks.cam) return this.eh.throw(CallError.TrackNotFound);

    this.tracks.cam.enabled = state;
    this.session.onMemberCamChange(this.id, state);
  }

  setScreenStatus(state: boolean) {
    if (!this.tracks.screen) return this.eh.throw(CallError.TrackNotFound);

    this.tracks.screen.enabled = state;
    this.session.onMemberScreenChange(this.id, state);
  }

  clone(): CallMember {
    const cloned = new CallMember(this.id, this.session);
    if (this.tracks.mic) cloned.tracks.mic = this.tracks.mic;
    if (this.tracks.cam) cloned.tracks.cam = this.tracks.cam;
    if (this.tracks.screen) cloned.tracks.screen = this.tracks.screen;
    return cloned;
  }
}
