import {
  useConnectionState,
  useLocalParticipant,
  useRemoteParticipant,
  useTracks,
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";
import React, { useMemo } from "react";
import {
  LocalMember,
  RemoteMember,
  TrackReference,
} from "@/components/Session/types";
import VideoStreams from "@/components/Session/VideoStreams";
import { nullable } from "@litespace/utils";
import { Layout } from "@litespace/headless/sessions";
import { simulateMobile } from "@/lib/window";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import AudioStreams from "@/components/Session/AudioStreams";
import Controllers from "@/components/Session/Controllers";
import { ISession, Void } from "@litespace/types";
import {
  useAudioController,
  useBlurController,
  useRecordController,
  useVideoController,
} from "@/components/Session/room";

const Session: React.FC<{
  id: ISession.Id;
  localMember: LocalMember;
  remoteMember: RemoteMember;
  leave: Void;
}> = ({ id, localMember, remoteMember, leave }) => {
  const mq = useMediaQuery();
  const videoTracks = useTracks([Track.Source.Camera]);
  const localParticipant = useLocalParticipant();
  const remoteParticipant = useRemoteParticipant(remoteMember.id.toString());
  const connectionState = useConnectionState();
  const blurController = useBlurController();
  const videoController = useVideoController();
  const audioController = useAudioController();
  const recordController = useRecordController(id);

  const videoTrackRef = useMemo(() => {
    const local = videoTracks.find(
      (track: TrackReference) => track.participant.isLocal
    ) as TrackReference | undefined;

    const remote = videoTracks.find(
      (track: TrackReference) => !track.participant.isLocal
    ) as TrackReference | undefined;

    return {
      local: nullable(local),
      remote: nullable(remote),
    };
  }, [videoTracks]);

  const layout = useMemo((): Layout => {
    if (simulateMobile()) return "simulated-mobile";
    if (mq.xl) return "desktop";
    if (mq.sm) return "tablet";
    return "mobile";
  }, [mq.sm, mq.xl]);

  return (
    <div className="h-full flex flex-col gap-10">
      <div className="h-[calc(100%-40px)]">
        <VideoStreams
          selfTrackRef={videoTrackRef.local}
          selfId={localMember.id}
          selfName={localMember.name}
          selfImage={localMember.image}
          selfAudio={localParticipant.isMicrophoneEnabled}
          selfVideo={localParticipant.isCameraEnabled}
          selfSpeaking={localParticipant.localParticipant.isSpeaking}
          memberTrackRef={videoTrackRef.remote}
          memberId={remoteMember.id}
          memberImage={remoteMember.image}
          memberName={remoteMember.name}
          memberAudio={!!remoteParticipant?.isMicrophoneEnabled}
          memberVideo={!!remoteParticipant?.isCameraEnabled}
          memberSpeaking={!!remoteParticipant?.isSpeaking}
          connecting={
            connectionState === ConnectionState.Connecting ||
            connectionState === ConnectionState.Reconnecting
          }
          layout={layout}
        />

        <AudioStreams />
      </div>

      <Controllers
        leave={leave}
        audio={audioController}
        video={videoController}
        blur={blurController}
        record={recordController}
      />
    </div>
  );
};

export default Session;
