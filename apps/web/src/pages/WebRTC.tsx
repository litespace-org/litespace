import React, { useEffect, useRef, useState } from "react";
import { Textarea } from "@litespace/ui/Textarea";
import { Button } from "@litespace/ui/Button";

const WebRTC: React.FC = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [rawConstrains, setRawConstrains] = useState<string>("");

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div dir="ltr" className="max-w-screen-3xl mx-auto p-6 w-full">
      <video ref={videoRef} playsInline autoPlay />

      <div className="flex flex-col gap-4">
        <Textarea
          className="min-h-56"
          placeholder="Enter media constrains"
          idleDir="ltr"
          onChange={(event) => setRawConstrains(event.target.value)}
        />
        <pre>{rawConstrains}</pre>
        <Button
          onClick={() => {
            navigator.mediaDevices
              .getUserMedia(JSON.parse(rawConstrains))
              .then((stream) => setStream(stream));
          }}
        >
          Capture
        </Button>
      </div>
    </div>
  );
};

export default WebRTC;
