import { CallSession } from "@/modules/MediaCall/CallSession";
import {
  MemberTracks,
  AudioTrack,
  VideoTrack,
  CallError,
  MemberConnectionState,
} from "@/modules/MediaCall/types";
import { ErrorHandler } from "@/modules/MediaCall/ErrorHandler";

type Info = {
  name?: string;
  imgSrc?: string;
};

export class CallMember {
  readonly id: string;
  readonly tracks: MemberTracks;
  private session: CallSession;
  private eh: ErrorHandler;
  private connState: MemberConnectionState;

  private _info: Info = {};

  constructor(id: string, session: CallSession, eh?: ErrorHandler) {
    this.id = id;
    this.tracks = {};
    this.session = session;
    this.eh = eh || new ErrorHandler();
    this.connState = MemberConnectionState.Disconnected;
  }

  get connectionState() {
    return this.connState;
  }

  get info() {
    return Object.assign({}, this._info);
  }

  setConnectionState(state: MemberConnectionState) {
    this.connState = state;
    this.session.onMemberConnectionStateChange(this.id, this.connectionState);
  }

  setInfo(info: Info) {
    Object.assign(this._info, info);
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
    if (!this.tracks.screen && !track)
      return this.eh.throw(CallError.TrackNotFound);
    if (track) this.tracks.screen = track;
    this.session.onMemberScreenPublish(this.id, this.tracks.screen!);
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
    const cloned = new CallMember(this.id, this.session, this.eh);
    cloned.connState = this.connState;
    if (this.tracks.mic) cloned.tracks.mic = this.tracks.mic;
    if (this.tracks.cam) cloned.tracks.cam = this.tracks.cam;
    if (this.tracks.screen) cloned.tracks.screen = this.tracks.screen;
    return cloned;
  }
}
