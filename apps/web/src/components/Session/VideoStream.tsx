import React, { ComponentProps, useEffect, useRef } from "react";

const VideoStream: React.FC<
  {
    stream?: MediaStream;
    track?: MediaStreamTrack;
  } & ComponentProps<"video">
> = ({ stream, track, ...props }) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current && stream) ref.current.srcObject = stream;
    else if (ref.current && track)
      ref.current.srcObject = new MediaStream([track]);
  }, [stream, track]);

  if (!stream && !track) return <span>no video published</span>;
  return <video ref={ref} autoPlay {...props} />;
};

export default VideoStream;
