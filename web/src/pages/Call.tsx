import React, { useEffect, useRef } from "react";
import socket from "@/lib/wss";
import { Peer } from "peerjs";

const callId = "masterCall";

// 1. call host
// 2. call made
// 3. make answer
// 4. answer made

const peer = new Peer({
  host: "localhost",
  port: 3002,
});

peer.on("open", (id) => {
  console.log({ id });
  socket.emit("peerOpened", id);
});

const Call: React.FC = () => {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        console.log({ myStream: stream });
        if (!localRef.current || !remoteRef.current || !peer) return;
        localRef.current.srcObject = stream;

        peer.on("call", (call) => {
          console.log({
            desc: "I got a call, I will answer and listen to the stream from it!",
            call: call.peer,
            id: peer.id,
          });

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

            call.on("stream", (stream) => {
              console.log("Got stream from the user ", userId);
              if (!remoteRef.current) return;
              remoteRef.current.srcObject = stream;
            });

            call.on("close", () => {
              console.log("Close call with ", userId);
              if (!remoteRef.current) return;
              remoteRef.current.srcObject = null;
            });
          }, 3000);
        });
      });
  }, [localRef, remoteRef]);

  console.log({
    l: localRef.current?.srcObject,
    r: remoteRef.current?.srcObject,
  });

  return (
    <div className="max-w-screen-md mx-auto my-20">
      <div className="h-screen">
        <video
          muted
          autoPlay
          ref={localRef}
          className="w-full h-1/2 ring-2 rounded-sm"
        />
        <video
          muted
          autoPlay
          ref={remoteRef}
          className="w-full h-1/2 ring-2 rounded-sm"
        />
      </div>
    </div>
  );
};

export default Call;
