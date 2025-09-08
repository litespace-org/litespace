import { MemberTracks, AudioTrack, VideoTrack } from "./types";

export class CallMember {
  readonly id: string;

  private tracks: MemberTracks;

  constructor(id: string) {
    this.id = id;
    this.tracks = {};
  }

  publishMicTrack(track: AudioTrack) {
    this.tracks.mic = track;
  }

  publishCamTrack(track: VideoTrack) {
    this.tracks.cam = track;
  }

  publishScreenTrack(track: VideoTrack) {
    this.tracks.screen = track;
  }

  setMicStatus(status: boolean) {
    if (!this.tracks.mic) return;
    this.tracks.mic.enabled = status;
  }

  setCamStatus(status: boolean) {
    if (!this.tracks.cam) return;
    this.tracks.cam.enabled = status;
  }

  setScreenStatus(status: boolean) {
    if (!this.tracks.screen) return;
    this.tracks.screen.enabled = status;
  }
}
