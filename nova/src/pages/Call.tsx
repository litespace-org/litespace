import React, { useCallback, useEffect, useMemo, useState } from "react";
import { sockets } from "@/lib/wss";
import { MediaConnection } from "peerjs";
import { Button, ButtonSize, ButtonType } from "@litespace/luna";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor } from "react-feather";
import { useParams } from "react-router-dom";
import cn from "classnames";
import { Events } from "@litespace/types";
import { useQuery } from "@tanstack/react-query";
import { atlas } from "@/lib/atlas";
import { useCallRecorder, useShareScreen, useUserMedia } from "@/hooks/call";
import Media from "@/components/Call/Media";
import peer from "@/lib/peer";
import Messages from "@/components/Chat/Messages";
import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/me";
import { orUndefined } from "@litespace/sol";

const Call: React.FC = () => {
  const profile = useAppSelector(profileSelectors.value);
  const { id } = useParams<{ id: string }>();
  const [remoteMediaStream, setRemoteMediaStream] =
    useState<MediaStream | null>(null);
  const [remoteScreenStream, setRemoteScreenStream] =
    useState<MediaStream | null>(null);
  const { start: startRecording } = useCallRecorder();
  const [mediaConnection, setMediaConnection] =
    useState<MediaConnection | null>(null);
  const {
    start: getUserMedia,
    stream: userMediaStream,
    toggleSound,
    toggleCamera,
    mic,
    camera,
    cameraOff,
    muteded,
  } = useUserMedia();

  const callId = useMemo(() => {
    const call = Number(id);
    if (!id || Number.isNaN(call)) return null;
    return call;
  }, [id]);

  const shareScreen = useShareScreen(callId, mediaConnection?.peer || null);

  const acknowledgePeer = useCallback(
    (peerId: string) => {
      if (!callId) return;
      sockets.server.emit(Events.Client.PeerOpened, { peerId, callId });
    },
    [callId]
  );

  // executed on the receiver side
  const onCall = useCallback(
    (call: MediaConnection) => {
      setMediaConnection(call);
      call.answer(userMediaStream || undefined);
      call.on("stream", (stream: MediaStream) => {
        if (call.metadata?.screen) return setRemoteScreenStream(stream);
        return setRemoteMediaStream(stream);
      });
      call.on("close", () => {
        if (call.metadata?.screen) return setRemoteScreenStream(null);
        return setRemoteMediaStream(null);
      });
    },
    [userMediaStream]
  );

  const onJoinCall = useCallback(
    (peerId: string) => {
      console.log(`${peerId} joined the call`);
      setTimeout(() => {
        if (!userMediaStream) return;
        // shared my stream with the connected user
        const call = peer.call(peerId, userMediaStream);
        setMediaConnection(call);
        call.on("stream", setRemoteMediaStream);
        call.on("close", () => setRemoteMediaStream(null));
      }, 3000);
    },
    [userMediaStream]
  );

  useEffect(() => {
    peer.on("open", acknowledgePeer);
    return () => {
      peer.off("open", acknowledgePeer);
    };
  }, [acknowledgePeer]);

  useEffect(() => {
    // listen for calls
    peer.on("call", onCall);
    return () => {
      peer.off("call", onCall);
    };
  }, [onCall]);

  useEffect(() => {
    getUserMedia();
  }, [getUserMedia]);

  useEffect(() => {
    sockets.server.on(Events.Server.UserJoinedCall, onJoinCall);
    return () => {
      sockets.server.off(Events.Server.UserJoinedCall, onJoinCall);
    };
  }, [onJoinCall]);

  // useEffect(() => {
  // todo: disable recording in case call is not recordable
  //   if (callId && userMediaStream) startRecording(userMediaStream, callId);
  // }, [callId, startRecording, userMediaStream]);

  const findCallRoom = useCallback(async () => {
    if (!callId) return null;
    return await atlas.chat.findCallRoom(callId);
  }, [callId]);

  const callRoom = useQuery({
    queryFn: findCallRoom,
    queryKey: ["find-call-room"],
  });

  const mate = useMemo(() => {
    if (!callRoom.data) return;
    return callRoom.data.members.find((member) => member.id !== profile?.id);
  }, [callRoom.data, profile?.id]);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden w-full">
      <div
        className={cn(
          "flex flex-col w-full h-full",
          "transition-all duration-300"
        )}
      >
        <div
          className={cn(
            "relative flex-1 w-full max-h-[calc(100%-110px)] pt-10 px-4"
          )}
        >
          <Media
            userMediaStream={userMediaStream}
            remoteMediaStream={remoteMediaStream}
            userScreenStream={shareScreen.stream}
            remoteScreenStream={remoteScreenStream}
            userName={orUndefined(profile?.name)}
            mateName={orUndefined(mate?.name)}
            userImage={orUndefined(profile?.image)}
            mateImage={orUndefined(mate?.image)}
            userVideo={!cameraOff}
            userAudio={!muteded}
          />
        </div>
        <div className="flex items-center justify-center my-10 gap-4">
          <div>
            <Button size={ButtonSize.Small} type={ButtonType.Error}>
              <PhoneOff className="w-[20px] h-[20px]" />
            </Button>
          </div>
          <div>
            <Button
              onClick={
                shareScreen.stream ? shareScreen.stop : shareScreen.start
              }
              loading={shareScreen.loading}
              disabled={shareScreen.loading}
              size={ButtonSize.Small}
              type={
                shareScreen.stream ? ButtonType.Error : ButtonType.Secondary
              }
            >
              <Monitor className="w-[20px] h-[20px]" />
            </Button>
          </div>
          <div>
            <Button
              onClick={toggleCamera}
              disabled={!camera}
              size={ButtonSize.Small}
              type={cameraOff ? ButtonType.Error : ButtonType.Secondary}
            >
              {cameraOff ? (
                <VideoOff className="w-[20px] h-[20px]" />
              ) : (
                <Video className="w-[20px] h-[20px]" />
              )}
            </Button>
          </div>
          <div>
            <Button
              onClick={toggleSound}
              disabled={!mic}
              size={ButtonSize.Small}
              type={muteded ? ButtonType.Error : ButtonType.Secondary}
            >
              {muteded ? (
                <MicOff className="w-[20px] h-[20px]" />
              ) : (
                <Mic className="w-[20px] h-[20px]" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "hidden lg:flex lg:flex-col lg:min-w-[350px] xl:min-w-[450px]"
        )}
      >
        {callRoom.data ? (
          <Messages room={callRoom.data.room} members={callRoom.data.members} />
        ) : null}
      </div>
    </div>
  );
};

export default Call;
