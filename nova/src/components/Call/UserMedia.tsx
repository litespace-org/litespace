import React, { useEffect, useRef } from "react";

const UserMedia: React.FC<{ stream: MediaStream }> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="w-full h-full">
      <video
        autoPlay
        playsInline
        ref={videoRef}
        className="object-contain w-full h-full"
      />
    </div>
  );
};

export default UserMedia;
