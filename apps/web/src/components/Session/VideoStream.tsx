import React, { useEffect, useRef } from "react";

const VideoStream: React.FC<{
  stream?: MediaStream;
  track?: MediaStreamTrack;
}> = ({ stream, track }) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current && stream) ref.current.srcObject = stream;
    else if (ref.current && track)
      ref.current.srcObject = new MediaStream([track]);
  }, [stream]);

  if (!stream && !track) return <span>no video published</span>;
  return <video ref={ref} autoPlay />;
};

export default VideoStream;
