import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import socket from "@/lib/wss";
import { MediaConnection, Peer } from "peerjs";
import {
  Button,
  ButtonSize,
  ButtonType,
  Form,
  Input,
  messages,
  useValidation,
  Spinner,
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
import { Events } from "@litespace/types";
import { useIntl } from "react-intl";
import { useQuery } from "react-query";
import { atlas } from "@/lib/atlas";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import dayjs from "dayjs";

type IForm = {
  message: string;
};

const peer = new Peer({
  host: "localhost",
  port: 3002,
});

const Call: React.FC = () => {
  const intl = useIntl();
  const validation = useValidation();
  const profile = useAppSelector(profileSelector);
  const { id: callId } = useParams<{ id: string }>();
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const [mediaConnection, setMediaConnection] =
    useState<MediaConnection | null>(null);
  const [accessMic, setMicAccess] = useState<boolean>(true);
  const [accessCamera, setCameraAccess] = useState<boolean>(true);
  const [permissionError, setPermissionError] = useState<boolean>(false);

  const chat = useQuery({
    queryFn: () => atlas.chat.findRoomMessages(1),
  });

  const acknowledgePeer = useCallback(
    (peer: string) => {
      if (!callId) return;
      socket.emit("peerOpened", { peer, call: callId });
    },
    [callId]
  );

  useEffect(() => {
    peer.on("open", acknowledgePeer);
    return () => {
      peer.off("open", acknowledgePeer);
    };
  }, [acknowledgePeer]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: accessCamera, audio: accessMic })
      .then((stream) => {
        if (!localRef.current || !remoteRef.current || !peer) return;
        localRef.current.srcObject = stream;

        peer.on("call", (call) => {
          call.answer(stream);
          call.on("stream", (stream) => {
            if (!remoteRef.current) return;
            remoteRef.current.srcObject = stream;
          });
        });

        socket.on("user-joined", (userId) => {
          setTimeout(() => {
            // shared my stream with the connected user
            const call = peer.call(userId, stream);
            setMediaConnection(call);

            call.on("stream", (stream) => {
              if (!remoteRef.current) return;
              remoteRef.current.srcObject = stream;
            });

            call.on("close", () => {
              if (!remoteRef.current) return;
              remoteRef.current.srcObject = null;
            });
          }, 3000);
        });
      })
      .catch(() => {
        setPermissionError(true);
      });
  }, [accessCamera, accessMic, localRef, remoteRef]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<IForm>({
    defaultValues: { message: "" },
  });

  const sendMessage = useMemo(
    () =>
      handleSubmit(({ message }) => {
        socket.emit(Events.Client.SendMessage, {
          roomId: 1,
          text: message,
        });
        reset();
        chat.refetch();
      }),
    [chat, handleSubmit, reset]
  );

  return (
    <div className="grid grid-cols-12  flex-1 w-full">
      <div
        className={cn(
          "col-span-9 flex flex-col",
          "bg-surface-100 transition-all flex",
          "border border-border-strong hover:border-border-stronger"
        )}
      >
        <div
          className={cn(
            "relative flex flex-col flex-1 w-full items-center justify-center"
          )}
        >
          <div className="absolute bottom-[20px] right-[20px] w-[400px] rounded-lg overflow-hidden">
            <video muted autoPlay ref={localRef} />
          </div>
          <div className="w-full h-full">
            <video muted autoPlay ref={remoteRef} className="w-full h-full" />
          </div>
        </div>
        <div className="flex items-center justify-center my-10 gap-4">
          <div>
            <Button size={ButtonSize.Small} type={ButtonType.Error}>
              <PhoneOff className="w-[20px] h-[20px]" />
            </Button>
          </div>
          <div>
            <Button
              disabled={!mediaConnection}
              size={ButtonSize.Small}
              type={ButtonType.Secondary}
            >
              <Monitor className="w-[20px] h-[20px]" />
            </Button>
          </div>
          <div>
            <Button
              onClick={() => setCameraAccess(!accessCamera)}
              size={ButtonSize.Small}
              type={permissionError ? ButtonType.Error : ButtonType.Secondary}
              disabled={permissionError}
            >
              {accessCamera ? (
                <Video className="w-[20px] h-[20px]" />
              ) : (
                <VideoOff className="w-[20px] h-[20px]" />
              )}
            </Button>
          </div>
          <div>
            <Button
              onClick={() => setMicAccess(!accessMic)}
              size={ButtonSize.Small}
              type={permissionError ? ButtonType.Error : ButtonType.Secondary}
              disabled={permissionError}
            >
              {accessMic ? (
                <Mic className="w-[20px] h-[20px]" />
              ) : (
                <MicOff className="w-[20px] h-[20px]" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "col-span-3 bg-surface-300",
          "border border-border-strong hover:border-border-stronger",
          "flex flex-col px-4"
        )}
      >
        <div className="flex flex-1">
          {chat.isLoading ? (
            <div className="h-full w-full flex-1 flex items-center justify-center mt-10">
              <Spinner />
            </div>
          ) : chat.data && profile ? (
            <div className="mt-10">
              <ul className="flex flex-col gap-4">
                {chat.data.map((message) => {
                  return (
                    <li className="bg-selection rounded-xl pr-4 pl-6 py-2">
                      <p className="mb-1">{message.text}</p>
                      <span className="text-xs">
                        {dayjs(message.createdAt).fromNow()}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
        <Form onSubmit={sendMessage} className="flex flex-row gap-3 my-10">
          <Input
            value={watch("message")}
            register={register("message", validation.message)}
            placeholder={intl.formatMessage({
              id: messages["global.chat.input.placeholder"],
            })}
            error={errors["message"]?.message}
            autoComplete="off"
            disabled={chat.isLoading}
          />
          <div>
            <Button
              disabled={!watch("message") || chat.isLoading}
              htmlType="submit"
              size={ButtonSize.Small}
              className="h-[37px]"
            >
              <Send className="w-[20px] h-[20px]" />
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Call;
