import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import MemberStream from "@/components/Session/MemberStream";
import { useMediaCall } from "@/hooks/mediaCall";
import { useUser } from "@litespace/headless/context/user";
import { AudioTrack, VideoTrack } from "@/modules/MediaCall/types";
import { CallMember } from "@/modules/MediaCall/CallMember";
import cn from "classnames";

type StreamInfo = {
  userId: number;
  userImage: string;
  userName: string;
  audioTrack?: AudioTrack;
  videoTrack?: VideoTrack;
  reverse?: boolean;
};

const CallMembers: React.FC<{
  sessionStartDate?: string;
  sessionDuration?: number;
}> = ({ sessionStartDate, sessionDuration }) => {
  const ref = useRef<HTMLDivElement>(null);
  const call = useMediaCall();

  const [mainStream, setMainStream] = useState<StreamInfo | null>(null);
  const [panelStreams, setPanelStreams] = useState<StreamInfo[]>([]);

  const userObj = useMemo(() => {
    const member = call.inMembers[0];
    return member;
  }, [call.inMembers]);

  const { user } = useUser();

  const putInTheFront = useCallback((member: CallMember, screen?: boolean) => {
    const memberId = isNaN(Number(member.id)) ? -1 : Number(member.id);
    if (!screen) {
      setPanelStreams((prev) =>
        prev.filter((info) => info.userId !== memberId)
      );
    }
    setMainStream({
      audioTrack: screen ? undefined : member.tracks.mic,
      videoTrack: screen ? member.tracks.screen : member.tracks.cam,
      userId: memberId,
      userName: member.info.name || "",
      userImage: member.info.imgSrc || "",
      reverse: screen,
    });
  }, []);

  useEffect(() => {
    if (call.inMembers.length === 0) return;

    // Add all joined members in the panel
    setPanelStreams(
      call.inMembers.map((member) => ({
        audioTrack: member?.tracks.mic,
        videoTrack: member?.tracks.cam,
        userId: isNaN(Number(member.id)) ? -1 : Number(member.id),
        userName: member.info.name || "",
        userImage: member.info.imgSrc || "",
      }))
    );

    // Put the one who shares his/her screen in the front
    for (const member of call.inMembers) {
      if (!member.tracks.screen?.enabled) continue;
      putInTheFront(member, true);
      return;
    }

    // In case there is no other member, put the current member in the front
    if (call.inMembers.length === 1) {
      putInTheFront(call.inMembers[0]);
      return;
    }

    // In case noone shares his screen, put the other member in the front
    putInTheFront(call.inMembers[1]);
    return;
  }, [call.inMembers, putInTheFront]);

  if (!user || !userObj) return null;

  return (
    <div className="flex grow-[3] flex-col gap-4 h-full">
      <div
        className="flex-1 relative flex flex-col items-center justify-center gap-4"
        ref={ref}
      >
        {/* Main Stream */}
        {mainStream ? (
          <MemberStream
            sessionStartDate={sessionStartDate}
            sessionDuration={sessionDuration}
            currentMember={mainStream.userId === user.id}
            audioTrack={mainStream.audioTrack}
            videoTrack={mainStream.videoTrack}
            userId={mainStream.userId}
            userImage={mainStream.userImage}
            userName={mainStream.userName}
            audio={mainStream.audioTrack?.enabled}
            video={mainStream.videoTrack?.enabled}
            reverse={mainStream.reverse}
            size="sm"
          />
        ) : null}

        {/* Bottom Panel */}
        <div className="flex gap-4 absolute -bottom-4 sm:-bottom-8 right-4 z-session-movable-stream">
          {panelStreams.map((streamInfo, i) => (
            <div
              key={i}
              className={cn(
                "w-32 sm:w-60 lg:w-72 aspect-mobile bg-natural-100",
                "md:aspect-desktop shadow-session-movable-stream rounded-lg"
              )}
            >
              <MemberStream
                currentMember={streamInfo.userId === user.id}
                audioTrack={streamInfo.audioTrack}
                videoTrack={streamInfo.videoTrack}
                userId={streamInfo.userId}
                userImage={streamInfo.userImage}
                userName={streamInfo.userName}
                audio={streamInfo.audioTrack?.enabled}
                video={streamInfo.videoTrack?.enabled}
                reverse={streamInfo.reverse}
                size="sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CallMembers;
