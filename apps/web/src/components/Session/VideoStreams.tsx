import React, { useRef } from "react";
import Stream from "@/components/Session/Stream";
import { Movable } from "@litespace/ui/Movable";
import { Layout } from "@litespace/headless/sessions";
import { TrackReference } from "@/components/Session/types";

const VideoStreams: React.FC<{
  selfTrackRef: TrackReference | null;
  selfId: number;
  selfName: string | null;
  selfImage: string | null;
  selfAudio: boolean;
  selfVideo: boolean;
  selfSpeaking: boolean;
  memberTrackRef: TrackReference | null;
  memberId: number;
  memberName: string | null;
  memberImage: string | null;
  memberAudio: boolean;
  memberVideo: boolean;
  memberSpeaking: boolean;
  memberConnected: boolean;
  connecting: boolean;
  layout: Layout;
  startTime: string;
}> = ({
  selfTrackRef,
  selfId,
  selfImage,
  selfName,
  selfAudio,
  selfVideo,
  selfSpeaking,
  memberTrackRef,
  memberId,
  memberImage,
  memberName,
  memberAudio,
  memberVideo,
  memberSpeaking,
  memberConnected,
  connecting,
  startTime,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="flex grow-[3] flex-col gap-4 h-full">
      <div
        className="flex-1 relative flex flex-col items-center justify-center gap-4"
        ref={ref}
      >
        {memberConnected ? (
          <Stream
            startTime={startTime}
            trackRef={memberTrackRef}
            userId={memberId}
            userImage={memberImage}
            userName={memberName}
            audio={memberAudio}
            video={memberVideo}
            speaking={memberSpeaking}
            loading={connecting}
            size="lg"
          />
        ) : null}

        {memberConnected ? (
          <Movable
            container={ref}
            className="absolute bottom-4 right-4 z-session-movable-stream shadow-session-movable-stream rounded-lg"
          >
            <div className="w-32 sm:w-60 lg:w-72 aspect-mobile md:aspect-desktop">
              <Stream
                startTime={startTime}
                trackRef={selfTrackRef}
                userId={selfId}
                userImage={selfImage}
                userName={selfName}
                audio={selfAudio}
                video={selfVideo}
                speaking={selfSpeaking}
                size="sm"
                muted
              />
            </div>
          </Movable>
        ) : (
          <Stream
            startTime={startTime}
            trackRef={selfTrackRef}
            userId={selfId}
            userImage={selfImage}
            userName={selfName}
            audio={selfAudio}
            video={selfVideo}
            speaking={selfSpeaking}
            size="lg"
            muted
          />
        )}
      </div>
    </div>
  );
};

export default VideoStreams;
