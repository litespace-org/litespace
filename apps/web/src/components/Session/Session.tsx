import React, { useEffect, useMemo, useState } from "react";
import { LocalMember, RemoteMember } from "@/components/Session/types";
import VideoStreams from "@/components/Session/VideoStreams";
import { Layout } from "@litespace/headless/sessions";
import { simulateMobile } from "@/lib/window";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import AudioStreams from "@/components/Session/AudioStreams";
import Controllers from "@/components/Session/Controllers";
import { Void } from "@litespace/types";
import { SessionChat } from "@/components/Session/SessionChat";
import { useSearchParams } from "react-router-dom";
import { useMediaCall } from "@/hooks/mediaCall";
import AudioStream from "./AudioStream";
import VideoStream from "./VideoStream";
import { useUser } from "@litespace/headless/context/user";

const Session: React.FC<{
  localMember: LocalMember;
  remoteMember: RemoteMember;
  leave: Void;
}> = () => {
  const mq = useMediaQuery();
  const call = useMediaCall();
  const { user } = useUser();
  const [chat, setChat] = useState(false);
  const [_, setParams] = useSearchParams();
  const [newMessageIndicator, setNewMessageIndicator] =
    useState<boolean>(false);

  const layout = useMemo((): Layout => {
    if (simulateMobile()) return "simulated-mobile";
    if (mq.xl) return "desktop";
    if (mq.sm) return "tablet";
    return "mobile";
  }, [mq.sm, mq.xl]);

  // set nav to remove the nav and sidebars
  useEffect(() => {
    setParams({ nav: "false" });
    return () => setParams({ nav: "true" });
  }, [setParams]);

  return (
    <div className="h-full flex flex-col gap-10">
      <div className="h-[calc(100%-80px)] flex gap-6">
        members:
        {call.inMembers.map((member, i) => (
          <div key={i} className="flex flex-col">
            <div>{member.id}</div>
            <VideoStream track={member.tracks.cam} />
            {member.id !== user?.id.toString() ? (
              <AudioStream track={member.tracks.mic} />
            ) : null}
          </div>
        ))}
        {/*
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
        */}
      </div>

      {/*<Controllers
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
      />*/}
    </div>
  );
};

export default Session;
