import React, { useEffect, useRef } from "react";
import socket from "@/lib/wss";
import { Button } from "@litespace/uilib";

const peerConnection = new RTCPeerConnection();

async function callHost() {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

  socket.emit("callHost", {
    offer,
    hostId: 1,
  });
}

const Call: React.FC = () => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    navigator.getUserMedia(
      { video: true, audio: true },
      (stream) => {
        if (!ref.current) return;
        ref.current.srcObject = stream;

        stream
          .getTracks()
          .forEach((track) => peerConnection.addTrack(track, stream));
      },
      (error) => {
        console.warn(error.message);
      }
    );
  }, [ref]);

  useEffect(() => {
    socket.on(
      "callMade",
      async (data: { offer: RTCSessionDescriptionInit; userId: number }) => {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.offer)
        );

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(
          new RTCSessionDescription(answer)
        );

        socket.emit("makeAnswer", {
          answer,
          hostId: 1,
        });
      }
    );

    socket.on(
      "answerMade",
      async (data: { answer: RTCSessionDescriptionInit; userId: number }) => {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
      }
    );
  }, []);

  return (
    <div className="max-w-screen-md mx-auto my-20">
      <video autoPlay={true} ref={ref} className="w-full ring-2 rounded-sm" />

      <div className="mt-10 flex items-center justify-center">
        <Button onClick={callHost}>Call Tutor</Button>
      </div>
    </div>
  );
};

export default Call;
