import { useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import React, { useEffect, useMemo, useRef } from "react";
import { TrackReference } from "@/components/Session/types";

const AudioPlayback: React.FC<{
  stream: MediaStream;
}> = ({ stream }) => {
  const ref = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);

  return <audio ref={ref} autoPlay />;
};

const Audio: React.FC = () => {
  const tracks = useTracks([Track.Source.Microphone]);
  const streams = useMemo(() => {
    return tracks
      .filter((track: TrackReference) => !track.publication.isLocal)
      .map((track: TrackReference) => track.publication.track?.mediaStream)
      .filter((stream) => stream !== undefined);
  }, [tracks]);

  return (
    <div className="hidden">
      {streams.map((stream) => (
        <AudioPlayback key={stream.id} stream={stream} />
      ))}
    </div>
  );
};

export default Audio;
