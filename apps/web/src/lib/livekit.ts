import { CallMember } from "@/modules/MediaCall/CallMember";
import { CallSession, EventsExtensions } from "@/modules/MediaCall/CallSession";
import { ErrorHandler } from "@/modules/MediaCall/ErrorHandler";
import { AudioTrack, MemberConnectionState } from "@/modules/MediaCall/types";
import {
  ConnectionQuality,
  ConnectionState,
  ParticipantEvent,
  Room,
  RoomEvent,
  Track,
} from "livekit-client";

export class LivekitCallSession extends CallSession {
  private room: Room;

  /**
   * By convention, the first id in memberIds is considered as
   * the current memeber id.
   */
  constructor(
    memberIds: Array<CallMember["id"]>,
    ext: Partial<EventsExtensions>,
    eh?: ErrorHandler
  ) {
    super(memberIds, ext, eh);
    const curMemberId = memberIds[0];

    this.room = new Room({
      // Optimize video quality for each participant's screen
      adaptiveStream: true,
      // Enable automatic audio/video quality optimization
      dynacast: true,
      disconnectOnPageLeave: true,
    });

    this.room.on(RoomEvent.Connected, () => {
      console.log("session connected.");
      this.onMemberConnect(curMemberId);
      new Audio("/join-session.mp3").play();
    });

    this.room.on(RoomEvent.Disconnected, () => {
      console.log("session disconnected!");
      this.onMemberDisconnect(curMemberId);
    });

    this.room.on(RoomEvent.ConnectionStateChanged, (state) => {
      console.log("connection state:", state);
      if (state === ConnectionState.Connected)
        this.curMember.setConnectionState(MemberConnectionState.Connected);
      else if (state === ConnectionState.Disconnected)
        this.curMember.setConnectionState(MemberConnectionState.Disconnected);
      else this.curMember.setConnectionState(MemberConnectionState.Connecting);
    });

    this.room.on(RoomEvent.ConnectionQualityChanged, (quality) => {
      console.log("connection quality:", quality);
      if (quality === ConnectionQuality.Poor)
        this.curMember.setConnectionState(
          MemberConnectionState.PoorlyConnected
        );
      if (quality === ConnectionQuality.Good)
        this.curMember.setConnectionState(MemberConnectionState.Connected);
      if (quality === ConnectionQuality.Excellent)
        this.curMember.setConnectionState(MemberConnectionState.Connected);
    });

    this.room.on(ParticipantEvent.ConnectionQualityChanged, (quality, p) => {
      if (quality === ConnectionQuality.Poor)
        this.getMember(p.identity)?.setConnectionState(
          MemberConnectionState.PoorlyConnected
        );
      if (quality === ConnectionQuality.Good)
        this.getMember(p.identity)?.setConnectionState(
          MemberConnectionState.Connected
        );
      if (quality === ConnectionQuality.Excellent)
        this.getMember(p.identity)?.setConnectionState(
          MemberConnectionState.Connected
        );
      if (quality === ConnectionQuality.Lost)
        this.getMember(p.identity)?.setConnectionState(
          MemberConnectionState.Disconnected
        );
    });

    this.room.on(RoomEvent.ParticipantConnected, (p) => {
      console.log(`member ${p.identity} connected.`);
      this.onMemberConnect(p.identity);
      new Audio("/join-session.mp3").play();
    });

    this.room.on(RoomEvent.ParticipantDisconnected, (p) => {
      console.log(`member ${p.identity} disconnected.`);
      this.onMemberDisconnect(p.identity);
      new Audio("/leave-session.mp3").play();
    });

    this.room.on(RoomEvent.TrackSubscribed, (track, pub, p) => {
      console.log(`subscribed to: ${p.identity} track: ${track.kind}.`);
      if (pub.kind === Track.Kind.Audio)
        return this.getMember(p.identity)?.publishMicTrack(
          track.mediaStreamTrack
        );
      if (pub.kind === Track.Kind.Video)
        return this.getMember(p.identity)?.publishCamTrack(
          track.mediaStreamTrack
        );
    });

    this.room.on(RoomEvent.TrackMuted, (pub, p) => {
      if (pub.kind === Track.Kind.Audio)
        return this.getMember(p.identity)?.setMicStatus(false);
      if (pub.kind === Track.Kind.Video)
        return this.getMember(p.identity)?.setCamStatus(false);
    });

    this.room.on(RoomEvent.TrackUnmuted, (pub, p) => {
      if (pub.kind === Track.Kind.Audio)
        return this.getMember(p.identity)?.setMicStatus(true);
      if (pub.kind === Track.Kind.Video)
        return this.getMember(p.identity)?.setCamStatus(true);
    });
  }

  async connect(serverUrl: string, lkAccessToken: string) {
    return this.room.connect(serverUrl, lkAccessToken).then(() => {
      const tracks = this.curMember.tracks;
      if (tracks.mic) this.curMember.publishMicTrack(tracks.mic);
      if (tracks.cam) this.curMember.publishCamTrack(tracks.cam);
      if (tracks.screen) this.curMember.publishScreenTrack(tracks.screen);
    });
  }

  async disconnect() {
    return this.room.disconnect();
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
      track.enabled &&
      this.curMember.id === memberId &&
      this.room.state === ConnectionState.Connected
    ) {
      const p = this.room.localParticipant;
      const micPub = p.getTrackPublication(Track.Source.Microphone);
      if (micPub?.track) p.unpublishTrack(micPub?.track);
      this.room.localParticipant.publishTrack(track, {
        source: Track.Source.Microphone,
      });
    }
  }

  onMemberCamPublish(memberId: CallMember["id"], track: AudioTrack): void {
    super.onMemberCamPublish(memberId, track);
    if (
      track.enabled &&
      this.curMember.id === memberId &&
      this.room.state === ConnectionState.Connected
    ) {
      const p = this.room.localParticipant;
      const camPub = p.getTrackPublication(Track.Source.Camera);
      if (camPub?.track) p.unpublishTrack(camPub?.track);
      this.room.localParticipant.publishTrack(track, {
        source: Track.Source.Camera,
      });
    }
  }

  onMemberMicChange(memberId: CallMember["id"], state: boolean): void {
    super.onMemberMicChange(memberId, state);
    if (memberId !== this.curMember.id) return;
    if (this.room.state !== ConnectionState.Connected) return;
    this.room.localParticipant.setMicrophoneEnabled(state);
  }

  onMemberCamChange(memberId: CallMember["id"], state: boolean): void {
    super.onMemberCamChange(memberId, state);
    if (memberId !== this.curMember.id) return;
    if (this.room.state !== ConnectionState.Connected) return;
    this.room.localParticipant.setCameraEnabled(state);

    // NOTE: livekit setCameraEnabled has a bug. It doesn't work as
    // expected on phones; the track doesn't get published automatically.
    const camPub = this.room.localParticipant.getTrackPublication(
      Track.Source.Camera
    );
    if (!camPub && this.curMember.tracks.cam) {
      this.room.localParticipant.publishTrack(this.curMember.tracks.cam, {
        source: Track.Source.Camera,
      });
    }
  }
}
