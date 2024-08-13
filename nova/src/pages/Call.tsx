import React, { useCallback, useEffect, useRef, useState } from "react";
import socket from "@/lib/wss";
import { MediaConnection, Peer } from "peerjs";
import { Button, ButtonSize, ButtonType } from "@litespace/luna";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor } from "react-feather";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import { useParams } from "react-router-dom";
import cn from "classnames";

const peer = new Peer({
  host: "localhost",
  port: 3002,
});

const Call: React.FC = () => {
  const profile = useAppSelector(profileSelector);
  const { id: callId } = useParams<{ id: string }>();
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const [mediaConnection, setMediaConnection] =
    useState<MediaConnection | null>(null);
  const [accessMic, setMicAccess] = useState<boolean>(true);
  const [accessCamera, setCameraAccess] = useState<boolean>(true);
  const [permissionError, setPermissionError] = useState<boolean>(false);

  console.log({ profile });

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
          "border border-border-strong hover:border-border-stronger"
        )}
      >
        Here!!
      </div>
    </div>
  );
};

export default Call;
