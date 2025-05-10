import React, { useEffect, useMemo, useRef, useState } from "react";
import Stream from "@/components/Session/Stream";
import Controllers, { Controller } from "@/components/Session/Controllers";
import { Void } from "@litespace/types";
import { Movable } from "@litespace/ui/Movable";
import { useSearchParams } from "react-router-dom";
import { first } from "lodash";
import { Layout, layoutAspectRatio } from "@litespace/headless/sessions";
import { SessionChat } from "@/components/Session/SessionChat";

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
  chatController?: Controller;
  layout: Layout;
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
  connecting,
  layout,
  leave,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [params, setParams] = useSearchParams();
  const [chat, setChat] = useState(false);

  /**
   * Based on the desing, the session should not have any navigation.
   */
  useEffect(() => {
    if (params.get("nav") !== "false") setParams({ nav: "false" });
  }, [params, setParams]);

  const movableStreamAspectRatio = useMemo(() => {
    const defaultAspectRatio = layoutAspectRatio[layout].aspectRatio;
    const track = first(selfStream.getVideoTracks());
    return track?.getSettings().aspectRatio || defaultAspectRatio;
  }, [layout, selfStream]);

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex-1 flex gap-6">
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
              className="absolute bottom-4 right-4 z-session-movable-stream shadow-session-movable-stream rounded-lg"
            >
              <div
                className="w-32 md:w-60"
                style={{ aspectRatio: movableStreamAspectRatio }}
              >
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
        <SessionChat
          close={() => setChat(false)}
          enabled={chat}
          selfId={selfId}
          memberId={memberId}
        />
      </div>

      <Controllers
        chat={{
          enabled: chat,
          toggle: () => setChat((prev) => !prev),
        }}
        audio={audioController}
        video={videoController}
        leave={leave}
      />
    </div>
  );
};

export default Session;
