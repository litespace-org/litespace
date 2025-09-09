import React, { useEffect, useRef } from "react";

const AudioStream: React.FC<{
  stream?: MediaStream;
  track?: MediaStreamTrack;
}> = ({ stream, track }) => {
  const ref = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (ref.current && stream) ref.current.srcObject = stream;
    else if (ref.current && track)
      ref.current.srcObject = new MediaStream([track]);
  }, [stream, track]);

  if (!stream && !track) return <span>no audio published</span>;
  return <audio ref={ref} autoPlay />;
};

export default AudioStream;
