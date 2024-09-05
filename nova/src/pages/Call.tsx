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
import { useMutation, useQuery } from "react-query";
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

type IForm = {
  message: string;
};

const Call: React.FC = () => {
  const intl = useIntl();
  const validation = useValidation();
  const dispath = useAppDispatch();
  const profile = useAppSelector(profileSelector);
  const rooms = useAppSelector(roomsSelector);
  const { id } = useParams<{ id: string }>();
  const [remoteMediaStream, setRemoteMediaStream] =
    useState<MediaStream | null>(null);
  const [remoteScreenStream, setRemoteScreenStream] =
    useState<MediaStream | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const { start: startRecording } = useCallRecorder();
  const [mediaConnection, setMediaConnection] =
    useState<MediaConnection | null>(null);
  const shareScreen = useShareScreen(mediaConnection?.peer);
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
  const [userScrolled, setUserScolled] = useState<boolean>(false);

  const callId = useMemo(() => {
    const call = Number(id);
    if (!id || Number.isNaN(call)) return null;
    return call;
  }, [id]);

  const call = useQuery({
    queryFn: async () => {
      if (!callId) throw new Error("missing/invalid call id");
      return await atlas.call.findById(callId);
    },
    enabled: !!callId,
  });

  const callRoomId = useMemo(() => {
    if (!call.data || !rooms.value) return null;
    const room = entries<IRoom.PopulatedMember[]>(rooms.value).find(
      ([_, members]) => {
        const roomMemberIds = map(members, "id");
        const callMemberIds = map(call.data.members, "userId");
        return isEqual(sortBy(roomMemberIds), sortBy(callMemberIds));
      }
    );
    const roomId = first(room);
    if (!roomId) return null;
    return Number(roomId);
  }, [call.data, rooms]);

  const roomMessages = useQuery({
    queryFn: async () => {
      if (!callRoomId) return [];
      return await atlas.chat.findRoomMessages(callRoomId);
    },
    queryKey: "room-messages",
    enabled: !!callRoomId,
  });

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

  useEffect(() => {
    if (messagesRef.current && !userScrolled)
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [roomMessages.data, userScrolled]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<IForm>({
    defaultValues: { message: "" },
  });

  const onMessage = useCallback(
    (_message: IMessage.Self) => {
      roomMessages.refetch();
    },
    [roomMessages]
  );

  const chat = useChat(onMessage);

  const onScroll = useCallback(() => {
    const el = messagesRef.current;
    if (!el) return;
    const scrollTop = el.scrollTop + 100;
    const diff = el.scrollHeight - el.offsetHeight;
    const scrolled = scrollTop < diff;
    setUserScolled(scrolled);
  }, []);

  const sendMessage = useMemo(
    () =>
      handleSubmit(({ message }) => {
        if (!callRoomId) return;

        reset();
        chat.sendMessage({ roomId: callRoomId, message });

        if (messagesRef.current)
          messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }),
    [handleSubmit, callRoomId, chat, reset]
  );

  const otherUserId = useMemo(() => {
    if (!call.data || !profile) return null;
    const otherMembers = call.data.members.filter(
      (member) => member.userId !== profile.id
    );
    const otherMember = first(otherMembers);
    return otherMember?.userId || null;
  }, [call.data, profile]);

  const createRoom = useMutation({
    mutationFn: useCallback(async () => {
      if (!otherUserId)
        throw new Error("Other user id not defined; should never happen.");
      return await atlas.chat.createRoom(otherUserId);
    }, [otherUserId]),
    mutationKey: "create-room",
    onSuccess() {
      if (!profile) throw new Error("Profile not found; should never happen.");
      dispath(findRooms.call(profile.id));
    },
    onError(error) {
      toaster.error({
        title: intl.formatMessage({
          id: messages["page.call.start.chat.now.error"],
        }),
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  return (
    <div className="flex h-screen overflow-hidden w-full">
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
        {rooms.loading || call.isLoading ? (
          <div className="h-full w-full flex-1 flex items-center justify-center mt-10">
            <Spinner />
          </div>
        ) : !callRoomId ? (
          <div className="flex items-center justify-center h-full">
            <div>
              <Button
                loading={createRoom.isLoading}
                onClick={() => createRoom.mutate()}
                className="min-w-[200px]"
              >
                {intl.formatMessage({
                  id: messages["page.call.start.chat.now"],
                })}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div
              className={cn(
                "h-full overflow-auto pt-4 pb-6 px-4",
                "scrollbar-thin scrollbar-thumb-border-stronger scrollbar-track-surface-300"
              )}
              ref={messagesRef}
              onScroll={onScroll}
            >
              {roomMessages.isLoading ? (
                <div className="h-full w-full flex-1 flex items-center justify-center mt-10">
                  <Spinner />
                </div>
              ) : roomMessages.data && profile ? (
                <div className="mt-10">
                  <ul className="flex flex-col">
                    {roomMessages.data.map((message, idx) => {
                      const prevMessage: IMessage.Self | undefined =
                        roomMessages.data[idx - 1];

                      const nextMessage: IMessage.Self | undefined =
                        roomMessages.data[idx + 1];

                      const ownMessage = message.userId === profile.id;
                      const ownPrevMessage =
                        prevMessage?.userId === message.userId;
                      const ownNextMessage =
                        nextMessage?.userId === message.userId;

                      return (
                        <li
                          key={message.id}
                          className={cn(
                            "pr-4 pl-6 py-2 w-fit min-w-[200px] border",
                            "transition-colors duration-200 rounded-l-3xl",
                            ownMessage
                              ? "bg-brand-button border-brand/30 hover:border-brand"
                              : "bg-selection border-border-strong hover:border-border-stronger",
                            {
                              "mt-1": ownPrevMessage,
                              "rounded-l-3xl rounded-tr-xl":
                                ownPrevMessage && !ownNextMessage,
                              "rounded-r-xl": ownNextMessage && ownPrevMessage,
                              "rounded-r-3xl rounded-br-xl mt-4":
                                ownNextMessage && !ownPrevMessage,
                              "mt-4 rounded-tr-3xl":
                                !ownNextMessage && !ownPrevMessage,
                            }
                          )}
                        >
                          <p className="mb-1">{message.text}</p>
                          <span
                            className={cn(
                              "text-xs",
                              ownMessage
                                ? "text-foreground-light"
                                : "text-foreground-lighter"
                            )}
                          >
                            {dayjs(message.createdAt).format("HH:mm a")}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </div>
            <Form
              onSubmit={sendMessage}
              className="flex flex-row gap-3 px-4 mb-10 mt-4"
            >
              <Input
                value={watch("message")}
                register={register("message", validation.message)}
                placeholder={intl.formatMessage({
                  id: messages["global.chat.input.placeholder"],
                })}
                error={errors["message"]?.message}
                autoComplete="off"
                disabled={roomMessages.isLoading}
              />
              <div>
                <Button
                  disabled={
                    !watch("message") ||
                    roomMessages.isLoading ||
                    rooms.loading ||
                    callRoomId === null
                  }
                  htmlType="submit"
                  size={ButtonSize.Small}
                  className="h-[37px]"
                >
                  <Send className="w-[20px] h-[20px]" />
                </Button>
              </div>
            </Form>
          </>
        )}
      </div>
    </div>
  );
};

export default Call;
