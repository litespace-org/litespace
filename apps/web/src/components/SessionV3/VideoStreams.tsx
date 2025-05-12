import React, { useRef } from "react";
import Stream from "@/components/SessionV3/Stream";
import { Movable } from "@litespace/ui/Movable";
import { Layout } from "@litespace/headless/sessions";
import { TrackReference } from "@/components/SessionV3/types";

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
  connecting: boolean;
  layout: Layout;
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
  connecting,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="h-full flex flex-col gap-4">
      <div
        className="flex-1 relative flex flex-col items-center justify-center gap-4"
        ref={ref}
      >
        {memberTrackRef ? (
          <Stream
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
        ) : (
          <Stream
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

        {memberTrackRef ? (
          <Movable
            container={ref}
            className="absolute bottom-4 right-4 z-session-movable-stream shadow-session-movable-stream rounded-lg"
          >
            <div className="w-32 md:w-60">
              <Stream
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
        ) : null}
      </div>
    </div>
  );
};

export default VideoStreams;
