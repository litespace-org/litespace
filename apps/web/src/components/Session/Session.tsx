import {
  useConnectionState,
  useLocalParticipant,
  useRemoteParticipant,
  useTracks,
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";
import React, { useMemo, useState } from "react";
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
import {
  useChatStatus,
  useFindRoomByMembers,
  useFindRoomMembers,
} from "@litespace/headless/chat";
import { asOtherMember, isOnline, isTyping } from "@/lib/room";
import Messages from "@/components/Chat/Messages";
import cn from "classnames";

const Session: React.FC<{
  localMember: LocalMember;
  remoteMember: RemoteMember;
  leave: Void;
}> = ({ localMember, remoteMember, leave }) => {
  const mq = useMediaQuery();

  // ======================= Chat ======================
  const [chat, setChat] = useState(false);
  const roomQuery = useFindRoomByMembers([localMember.id, remoteMember.id]);

  const roomId = roomQuery.query.data?.room || null;
  const roomMembers = useFindRoomMembers(roomId || null);
  const otherMember = asOtherMember({
    currentUserId: localMember.id,
    roomMembers: roomMembers.query.data,
  });

  const { typingMap, onlineUsersMap } = useChatStatus();

  const isCurrentRoomTyping = useMemo(() => {
    return otherMember
      ? isTyping({
          map: typingMap,
          roomId,
          otherMemberId: otherMember.id,
        })
      : false;
  }, [roomId, otherMember, typingMap]);

  const isOtherMemberOnline = useMemo(() => {
    return otherMember
      ? isOnline({
          map: onlineUsersMap,
          roomId: roomId,
          otherMemberStatus: otherMember.online,
          otherMemberId: otherMember.id,
        })
      : false;
  }, [roomId, otherMember, onlineUsersMap]);
  // ======================= Session ======================
  const videoTracks = useTracks([Track.Source.Camera]);
  const localParticipant = useLocalParticipant();
  const remoteParticipant = useRemoteParticipant(remoteMember.id.toString());
  const connectionState = useConnectionState();
  const blurController = useBlurController();
  const videoController = useVideoController();
  const audioController = useAudioController();

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
        <div
          className={cn(
            "h-full md:absolute top-0 left-0 !w-full lg:w-auto lg:static z-[99999]"
          )}
        >
          <div
            className={cn(
              "lg:w-[344px] border border-natural-100 overflow-hidden  rounded-2xl h-full w-full lg:max-h-[calc(100vh-96px)] lg:h-[calc(100vh-96px)]",
              chat ? "block" : "hidden"
            )}
          >
            <Messages
              room={roomId}
              inSession
              isOnline={isOtherMemberOnline}
              isTyping={isCurrentRoomTyping}
              otherMember={otherMember}
              close={() => setChat((prev) => !prev)}
            />
          </div>
        </div>
      </div>

      <Controllers
        chat={{
          enabled: chat,
          toggle: () => setChat((prev) => !prev),
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
