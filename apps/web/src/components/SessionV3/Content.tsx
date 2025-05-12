import {
  useConnectionState,
  useLocalParticipant,
  useRemoteParticipant,
  useTracks,
} from "@livekit/components-react";
import { ConnectionState, isLocalTrack, Track } from "livekit-client";
import React, { useMemo } from "react";
import {
  LocalMember,
  RemoteMember,
  TrackReference,
} from "@/components/SessionV3/types";
import VideoStreams from "@/components/SessionV3/VideoStreams";
import { nullable } from "@litespace/utils";
import { Layout } from "@litespace/headless/sessions";
import { simulateMobile } from "@/lib/window";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import AudioStreams from "@/components/SessionV3/AudioStreams";
import Controllers, { Controller } from "@/components/SessionV3/Controllers";
import { Void } from "@litespace/types";
import { useHotkeys } from "react-hotkeys-hook";
import {
  BackgroundBlur,
  supportsBackgroundProcessors,
  VirtualBackground,
} from "@livekit/track-processors";

const Content: React.FC<{
  localMember: LocalMember;
  remoteMember: RemoteMember;
  leave: Void;
}> = ({ localMember, remoteMember, leave }) => {
  const mq = useMediaQuery();
  const videoTracks = useTracks([Track.Source.Camera]);
  const localParticipant = useLocalParticipant();
  const remoteParticipant = useRemoteParticipant(remoteMember.id.toString());
  const connectionState = useConnectionState();

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

  const controllers = useMemo(() => {
    const audio: Controller = {
      toggle: () => {
        localParticipant.localParticipant.setMicrophoneEnabled(
          !localParticipant.isMicrophoneEnabled
        );
      },
      enabled: localParticipant.isMicrophoneEnabled,
      error: false,
    };

    const video: Controller = {
      toggle: () => {
        localParticipant.localParticipant.setCameraEnabled(
          !localParticipant.isCameraEnabled
        );
      },
      enabled: localParticipant.isCameraEnabled,
      error: false,
    };

    return { audio, video };
  }, [
    localParticipant.isCameraEnabled,
    localParticipant.isMicrophoneEnabled,
    localParticipant.localParticipant,
  ]);

  const layout = useMemo((): Layout => {
    if (simulateMobile()) return "simulated-mobile";
    if (mq.xl) return "desktop";
    if (mq.sm) return "tablet";
    return "mobile";
  }, [mq.sm, mq.xl]);

  useHotkeys(
    "ctrl+b",
    async () => {
      if (!supportsBackgroundProcessors()) return;

      const track = localParticipant.cameraTrack?.track;
      if (!isLocalTrack(track)) return;

      const processor = track.getProcessor();
      if (processor) return await track.stopProcessor();
      track.setProcessor(BackgroundBlur(10));
    },
    {
      preventDefault: true,
    },
    [localParticipant]
  );

  useHotkeys(
    "ctrl+m",
    async () => {
      if (!supportsBackgroundProcessors()) return;

      const track = localParticipant.cameraTrack?.track;
      if (!isLocalTrack(track)) return;

      const processor = track.getProcessor();
      if (processor) return await track.stopProcessor();
      track.setProcessor(VirtualBackground("/test-bg.jpg"));
    },
    {
      preventDefault: true,
    },
    [localParticipant]
  );

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
        audio={controllers.audio}
        video={controllers.video}
      />
    </div>
  );
};

export default Content;
