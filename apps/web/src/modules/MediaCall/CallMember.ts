import { CallSession } from "./CallSession";
import { MemberTracks, AudioTrack, VideoTrack } from "./types";

export class CallMember {
  readonly id: string;
  readonly tracks: MemberTracks;
  private session: CallSession;

  constructor(id: string, session: CallSession) {
    this.id = id;
    this.tracks = {};
    this.session = session;
  }

  publishMicTrack(track: AudioTrack) {
    this.tracks.mic = track;
    this.session.onMemberMicPublish();
  }

  publishCamTrack(track: VideoTrack) {
    this.tracks.cam = track;
    this.session.onMemberCamPublish();
  }

  publishScreenTrack(track: VideoTrack) {
    this.tracks.screen = track;
    // TODO onMemberScreenPublish
  }

  setMicStatus(status: boolean) {
    if (!this.tracks.mic) return;
    this.tracks.mic.enabled = status;
    this.session.onMemberMicChange();
  }

  setCamStatus(status: boolean) {
    if (!this.tracks.cam) return;
    this.tracks.cam.enabled = status;
    this.session.onMemberCamChange();
  }

  setScreenStatus(status: boolean) {
    if (!this.tracks.screen) return;
    this.tracks.screen.enabled = status;
    this.session.onMemberScreenChange();
  }

  clone(): CallMember {
    const cloned = new CallMember(this.id, this.session);
    if (this.tracks.mic) cloned.tracks.mic = this.tracks.mic;
    if (this.tracks.cam) cloned.tracks.cam = this.tracks.cam;
    if (this.tracks.screen) cloned.tracks.screen = this.tracks.screen;
    return cloned;
  }
}
