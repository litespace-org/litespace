import React, { useEffect, useRef } from "react";
import Stream from "@/components/SessionV5/Stream";
import Controllers, { Controller } from "@/components/SessionV5/Controllers";
import { Void } from "@litespace/types";
import { Movable } from "@litespace/ui/Movable";
import { useSearchParams } from "react-router-dom";

const Session: React.FC<{
  selfStream: MediaStream;
  selfId: number;
  selfName: string | null;
  selfImage: string | null;
  selfAudio: boolean;
  selfVideo: boolean;
  selfSpeaking: boolean;
  memberStream: MediaStream | null;
  memberId: number;
  memberName: string | null;
  memberImage: string | null;
  memberAudio: boolean;
  memberVideo: boolean;
  memberSpeaking: boolean;
  connecting: boolean;
  audioController: Controller;
  videoController: Controller;
  movableStreamAspectRatio: number;
  leave: Void;
}> = ({
  selfStream,
  selfId,
  selfImage,
  selfName,
  selfAudio,
  selfVideo,
  selfSpeaking,
  memberStream,
  memberId,
  memberImage,
  memberName,
  memberAudio,
  memberVideo,
  memberSpeaking,
  audioController,
  videoController,
  movableStreamAspectRatio,
  connecting,
  leave,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [params, setParams] = useSearchParams();

  /**
   * Based on the desing, the session should not have any navigation.
   */
  useEffect(() => {
    if (params.get("nav") !== "false") setParams({ nav: "false" });
  }, [params, setParams]);

  return (
    <div className="h-full flex flex-col gap-4">
      <div
        className="flex-1 relative flex flex-col items-center justify-center gap-4"
        ref={ref}
      >
        {memberStream ? (
          <Stream
            stream={memberStream}
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
            stream={selfStream}
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

        {memberStream ? (
          <Movable
            container={ref}
            className="absolute bottom-4 right-4 z-session-movable-stream w-56 shadow-session-movable-stream rounded-lg"
          >
            <div style={{ aspectRatio: movableStreamAspectRatio }}>
              <Stream
                stream={selfStream}
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

      <Controllers
        audio={audioController}
        video={videoController}
        leave={leave}
      />
    </div>
  );
};

export default Session;
