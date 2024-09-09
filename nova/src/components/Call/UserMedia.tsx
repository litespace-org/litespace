import React, { useEffect, useRef } from "react";

const UserMedia: React.FC<{ stream: MediaStream; muted?: boolean }> = ({
  stream,
  muted = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="w-full h-full">
      <video
        autoPlay
        playsInline
        muted={muted}
        ref={videoRef}
        className="object-contain w-full h-full"
      />
    </div>
  );
};

export default UserMedia;
