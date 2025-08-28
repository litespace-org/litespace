import {
  useConnectionState,
  useLocalParticipant,
  useRemoteParticipant,
  useTracks,
} from "@livekit/components-react";
import { ConnectionQuality, ConnectionState, Track } from "livekit-client";
import React, { useEffect, useMemo, useState } from "react";
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
import { Void } from "@litespace/types";
import {
  useAudioController,
  useBlurController,
  useVideoController,
} from "@/components/Session/room";
import { SessionChat } from "@/components/Session/SessionChat";
import { useSearchParams } from "react-router-dom";

const Session: React.FC<{
  localMember: LocalMember;
  remoteMember: RemoteMember;
  leave: Void;
  start: string;
}> = ({ localMember, remoteMember, leave, start }) => {
  const mq = useMediaQuery();
  const [chat, setChat] = useState(false);
  const [_, setParams] = useSearchParams();

  const videoTracks = useTracks([Track.Source.Camera]);
  const localParticipant = useLocalParticipant();
  const remoteParticipant = useRemoteParticipant(remoteMember.id.toString());
  const connectionState = useConnectionState();
  const blurController = useBlurController();
  const videoController = useVideoController();
  const audioController = useAudioController();

  const [newMessageIndicator, setNewMessageIndicator] =
    useState<boolean>(false);

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

  // set nav to remove the nav and sidebars
  useEffect(() => {
    setParams({ nav: "false" });
    return () => {
      setParams({ nav: "true" });
    };
  }, [setParams]);

  return (
    <div className="h-full flex flex-col gap-10">
      <div className="h-[calc(100%-80px)] flex gap-6 relative">
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
          memberConnected={
            !!remoteParticipant &&
            remoteParticipant.connectionQuality !== ConnectionQuality.Lost &&
            remoteParticipant.trackPublications.size > 0 // once the member presses join
          }
          connecting={
            connectionState === ConnectionState.Connecting ||
            connectionState === ConnectionState.Reconnecting
          }
          layout={layout}
          startTime={start}
        />

        <AudioStreams />
        <SessionChat
          close={() => setChat(false)}
          enabled={chat}
          memberId={remoteMember.id}
          selfId={localMember.id}
          onNewMessage={() => {
            setNewMessageIndicator(true);
            if (!chat) {
              const audio = new Audio("/new-message.mp3");
              audio.play();
            }
          }}
        />
      </div>

      <Controllers
        chat={{
          enabled: chat,
          toggle: () => {
            setChat((prev) => !prev);
            setNewMessageIndicator(false);
          },
          indicator: newMessageIndicator,
        }}
        leave={leave}
        audio={audioController}
        video={videoController}
        blur={blurController}
      />
    </div>
  );
};

export default Session;
