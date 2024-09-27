import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { sockets } from "@/lib/wss";
import { MediaConnection } from "peerjs";
import {
  Button,
  ButtonSize,
  ButtonType,
  Form,
  Input,
  messages,
  useValidation,
  Spinner,
  toaster,
} from "@litespace/luna";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Monitor,
  Send,
} from "react-feather";
import { useParams } from "react-router-dom";
import cn from "classnames";
import { useForm } from "react-hook-form";
import { Events, IMessage, IRoom } from "@litespace/types";
import { useIntl } from "react-intl";
import { useMutation, useQuery } from "@tanstack/react-query";
import { atlas } from "@/lib/atlas";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import dayjs from "dayjs";
import { findRooms, roomsSelector } from "@/redux/chat/rooms";
import { entries, first, isEqual, map, sortBy } from "lodash";
import { useChat } from "@/hooks/chat";
import { useCallRecorder, useShareScreen, useUserMedia } from "@/hooks/call";
import Media from "@/components/Call/Media";
import peer from "@/lib/peer";
import Messages from "@/components/Chat/Messages";

const Call: React.FC = () => {
  const dispath = useAppDispatch();
  const profile = useAppSelector(profileSelector);
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

  const call = useQuery({
    queryFn: async () => {
      if (!callId) throw new Error("missing/invalid call id");
      return await atlas.call.findById(callId);
    },
    enabled: !!callId,
    queryKey: ["find-call"],
  });

  // const roomMessages = useQuery({
  //   queryFn: async () => {
  //     if (!callRoomId) return [];
  //     return await atlas.chat.findRoomMessages(callRoomId);
  //   },
  //   queryKey: ["room-messages"],
  //   enabled: !!callRoomId,
  // });

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

  useEffect(() => {
    // todo: disable recording in case call is not recordable
    if (callId && userMediaStream) startRecording(userMediaStream, callId);
  }, [callId, startRecording, userMediaStream]);

  // const createRoom = useMutation({
  //   mutationFn: useCallback(async () => {
  //     if (!otherUserId)
  //       throw new Error("Other user id not defined; should never happen.");
  //     return await atlas.chat.createRoom(otherUserId);
  //   }, [otherUserId]),
  //   mutationKey: ["create-room"],
  //   onSuccess() {
  //     if (!profile) throw new Error("Profile not found; should never happen.");
  //     dispath(findRooms.call(profile.id));
  //   },
  //   onError(error) {
  //     toaster.error({
  //       title: intl.formatMessage({
  //         id: messages["page.call.start.chat.now.error"],
  //       }),
  //       description: error instanceof Error ? error.message : undefined,
  //     });
  //   },
  // });

  const room = useQuery({
    queryFn: async () => {
      if (!call.data) return null;
      return atlas.chat.findRoomByMembers(
        call.data.members.map((member) => member.userId)
      );
    },
    queryKey: ["q1"],
    enabled: !!call.data,
  });

  const members = useQuery({
    queryFn: async () => {
      if (!room.data) return [];
      return await atlas.chat.findRoomMembers(room.data.room);
    },
    queryKey: ["q2"],
    enabled: !!room.data,
  });

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden w-full">
      <div
        className={cn(
          "flex flex-col w-full h-full",
          "bg-surface-100 transition-all duration-300",
          "border border-border-strong hover:border-border-stronger"
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
          "min-w-[450px] bg-surface-300",
          "border border-border-strong hover:border-border-stronger",
          "flex flex-col"
        )}
      >
        {room.data && members.data ? (
          <Messages room={room.data.room} members={members.data} />
        ) : null}
      </div>
    </div>
  );
};

export default Call;
