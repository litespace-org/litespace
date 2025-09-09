import { CallMember } from "@/modules/MediaCall/CallMember";
import { CallSession, EventsExtensions } from "@/modules/MediaCall/CallSession";
import { AudioTrack } from "@/modules/MediaCall/types";
import {
  ConnectionState,
  LocalAudioTrack,
  LocalVideoTrack,
  Room,
  RoomEvent,
  Track,
  isAudioTrack,
  isLocalTrack,
  isVideoTrack,
} from "livekit-client";

export function isLocalVideoTrack(track: Track): track is LocalVideoTrack {
  return isLocalTrack(track) && isVideoTrack(track);
}

export function isLocalAudioTrack(track: Track): track is LocalAudioTrack {
  return isLocalTrack(track) && isAudioTrack(track);
}

export class LivekitCallSession extends CallSession {
  private room: Room;
  private connected: boolean = false;

  constructor(
    curMemberId: CallMember["id"],
    memberIds: Array<CallMember["id"]>,
    ext: Partial<EventsExtensions>
  ) {
    super(memberIds, ext);

    this.room = new Room({
      // Optimize video quality for each participant's screen
      adaptiveStream: true,
      // Enable automatic audio/video quality optimization
      dynacast: true,
      disconnectOnPageLeave: true,
    });

    this.room.on(RoomEvent.Connected, () => this.onMemberConnect(curMemberId));

    this.room.on(RoomEvent.Disconnected, () =>
      this.onMemberDisconnect(curMemberId)
    );

    this.room.on(RoomEvent.ParticipantConnected, (p) =>
      this.onMemberConnect(p.identity)
    );

    this.room.on(RoomEvent.ParticipantDisconnected, (p) =>
      this.onMemberDisconnect(p.identity)
    );

    this.room.on(RoomEvent.TrackSubscribed, (track, pub, p) => {
      if (pub.kind === Track.Kind.Audio)
        return this.onMemberMicPublish(p.identity, track.mediaStreamTrack);
      if (pub.kind === Track.Kind.Video)
        return this.onMemberCamPublish(p.identity, track.mediaStreamTrack);
    });

    this.room.on(RoomEvent.TrackMuted, (pub, p) => {
      if (pub.kind === Track.Kind.Audio)
        return this.onMemberMicChange(p.identity, false);
      if (pub.kind === Track.Kind.Video)
        return this.onMemberCamChange(p.identity, false);
    });

    this.room.on(RoomEvent.TrackUnmuted, (pub, p) => {
      if (pub.kind === Track.Kind.Audio)
        return this.onMemberMicChange(p.identity, true);
      if (pub.kind === Track.Kind.Video)
        return this.onMemberCamChange(p.identity, true);
    });
  }

  async connect(serverUrl: string, lkAccessToken: string) {
    return this.room.connect(serverUrl, lkAccessToken).then(() => {
      this.connected = true;
      const tracks = this.curMember.tracks;
      if (tracks.mic) this.curMember.publishMicTrack(tracks.mic);
      if (tracks.cam) this.curMember.publishCamTrack(tracks.cam);
      if (tracks.screen) this.curMember.publishScreenTrack(tracks.screen);
    });
  }

  async disconnect() {
    return this.room.disconnect().then(() => (this.connected = false));
  }

  isConnected() {
    return this.connected;
  }

  onMemberConnect(memberId: CallMember["id"]): void {
    if (!this.getMember(memberId)) {
      this.addMember(memberId);
    }
    super.onMemberConnect(memberId);

    // ensure to update the joinedMembers list
    for (const member of this.members) {
      const p = this.room.getParticipantByIdentity(member.id);
      if (p) super.onMemberConnect(member.id);
    }
  }

  onMemberMicPublish(memberId: CallMember["id"], track: AudioTrack): void {
    super.onMemberMicPublish(memberId, track);
    if (
      this.curMember.id === memberId &&
      this.room.state === ConnectionState.Connected
    )
      this.room.localParticipant.publishTrack(track);
  }

  onMemberCamPublish(memberId: CallMember["id"], track: AudioTrack): void {
    super.onMemberCamPublish(memberId, track);
    if (
      this.curMember.id === memberId &&
      this.room.state === ConnectionState.Connected
    )
      this.room.localParticipant.publishTrack(track);
  }
}
