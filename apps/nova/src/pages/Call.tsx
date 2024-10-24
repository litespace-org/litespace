import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MediaConnection } from "peerjs";
import {
  Button,
  ButtonSize,
  ButtonType,
  Drawer,
  useFormatMessage,
  useMediaQueries,
  useRender,
} from "@litespace/luna";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MessageCircle,
  Phone,
  Maximize,
  Minimize,
} from "react-feather";
import { useParams } from "react-router-dom";
import cn from "classnames";
import { Wss } from "@litespace/types";
import {
  useCallEvents,
  useCallRecorder,
  useFullScreen,
  useShareScreen,
  useSpeech,
  useUserMedia,
} from "@/hooks/call";
import Media from "@/components/Call/Media";
import peer from "@/lib/peer";
import Messages from "@/components/Chat/Messages";
import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import { orUndefined } from "@litespace/sol";
import { useSockets } from "@litespace/headless/atlas";
import { useFindCallRoomById } from "@litespace/headless/calls";

const Call: React.FC = () => {
  const profile = useAppSelector(profileSelectors.user);
  const chat = useRender();
  const intl = useFormatMessage();
  const mediaQueries = useMediaQueries();
  const { id } = useParams<{ id: string }>();
  const [remoteMediaStream, setRemoteMediaStream] =
    useState<MediaStream | null>(null);
  const [remoteScreenStream, setRemoteScreenStream] =
    useState<MediaStream | null>(null);
  const { start: startRecording } = useCallRecorder();
  const [mediaConnection, setMediaConnection] =
    useState<MediaConnection | null>(null);
  const sockets = useSockets();
  const {
    start: getUserMedia,
    stream: userMediaStream,
    toggleSound,
    toggleCamera,
    mic,
    camera,
    video: userVideo,
    audio: userAudio,
    loading,
    denied,
  } = useUserMedia();

  const { isFullScreen, toggleFullScreen, ref } = useFullScreen();

  const callId = useMemo(() => {
    const call = Number(id);
    if (!id || Number.isNaN(call)) return null;
    return call;
  }, [id]);

  const shareScreen = useShareScreen(callId, mediaConnection?.peer || null);

  const acknowledgePeer = useCallback(
    (peerId: string) => {
      console.log(peerId);
      if (!callId || !sockets?.api) return;
      sockets.api.emit(Wss.ClientEvent.PeerOpened, { peerId, callId });
    },
    [callId, sockets?.api]
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
    ({ peerId }: { peerId: string }) => {
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
    if (!sockets?.api) return;
    sockets.api.on(Wss.ServerEvent.UserJoinedCall, onJoinCall);
    return () => {
      sockets.api.off(Wss.ServerEvent.UserJoinedCall, onJoinCall);
    };
  }, [onJoinCall, sockets?.api]);

  useEffect(() => {
    if (callId && userMediaStream) startRecording(userMediaStream, callId);
  }, [callId, startRecording, userMediaStream]);

  const onLeaveCall = useCallback(() => {
    peer.destroy();
  }, []);

  const callRoom = useFindCallRoomById(callId);

  const mate = useMemo(() => {
    if (!callRoom.data) return;
    return callRoom.data.members.find((member) => member.id !== profile?.id);
  }, [callRoom.data, profile?.id]);

  const { notifyCameraToggle, notifyMicToggle, mateAudio, mateVideo } =
    useCallEvents(remoteMediaStream, callId, mate?.id);

  const { speaking: userSpeaking } = useSpeech(userMediaStream);
  const { speaking: mateSpeaking } = useSpeech(remoteMediaStream);

  const messages = useMemo(
    () =>
      callRoom.data ? (
        <Messages room={callRoom.data.room} members={callRoom.data.members} />
      ) : null,
    [callRoom.data]
  );

  const onToggleCamera = useCallback(() => {
    toggleCamera();
    notifyCameraToggle(!userVideo);
  }, [notifyCameraToggle, toggleCamera, userVideo]);

  const onToggleMic = useCallback(() => {
    toggleSound();
    notifyMicToggle(!userAudio);
  }, [notifyMicToggle, toggleSound, userAudio]);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden w-full">
      <div
        id="call-page"
        ref={ref}
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
            loadingUserStream={loading}
            userSpeaking={userSpeaking}
            mateSpeaking={mateSpeaking}
            userVideo={userVideo}
            userAudio={userAudio}
            mateVideo={mateVideo}
            mateAudio={mateAudio}
            userDenided={denied}
          />
        </div>
        <div className="flex items-center justify-center gap-4 my-10">
          <Button
            onClick={onLeaveCall}
            size={ButtonSize.Small}
            type={ButtonType.Error}
          >
            <Phone className="w-[20px] h-[20px]" />
          </Button>

          {!mediaQueries.lg ? (
            <Button
              onClick={chat.show}
              size={ButtonSize.Small}
              type={ButtonType.Secondary}
            >
              <MessageCircle />
            </Button>
          ) : null}
          <Button
            type={ButtonType.Secondary}
            size={ButtonSize.Small}
            onClick={toggleFullScreen}
          >
            {isFullScreen ? (
              <Minimize className="w-[20px] h-[20px]" />
            ) : (
              <Maximize className="w-[20px] h-[20px]" />
            )}
          </Button>
          <Button
            onClick={shareScreen.stream ? shareScreen.stop : shareScreen.start}
            loading={shareScreen.loading}
            disabled={shareScreen.loading}
            size={ButtonSize.Small}
            type={shareScreen.stream ? ButtonType.Error : ButtonType.Secondary}
          >
            <Monitor className="w-[20px] h-[20px]" />
          </Button>

          <Button
            onClick={onToggleCamera}
            disabled={!camera}
            size={ButtonSize.Small}
            type={userVideo ? ButtonType.Secondary : ButtonType.Error}
          >
            {userVideo ? (
              <Video className="w-[20px] h-[20px]" />
            ) : (
              <VideoOff className="w-[20px] h-[20px]" />
            )}
          </Button>

          <Button
            onClick={onToggleMic}
            disabled={!mic}
            size={ButtonSize.Small}
            type={userAudio ? ButtonType.Secondary : ButtonType.Error}
          >
            {userAudio ? (
              <Mic className="w-[20px] h-[20px]" />
            ) : (
              <MicOff className="w-[20px] h-[20px]" />
            )}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "hidden w-full lg:flex lg:flex-col lg:max-w-[350px] xl:max-w-[450px]"
        )}
      >
        {messages}
      </div>

      <Drawer
        title={intl("global.labels.chat")}
        open={chat.open && !mediaQueries.lg}
        close={chat.hide}
      >
        {messages}
      </Drawer>
    </div>
  );
};

export default Call;
