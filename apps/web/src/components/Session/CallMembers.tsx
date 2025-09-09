import React, { useMemo, useRef } from "react";
import MemberStream from "@/components/Session/MemberStream";
import { Movable } from "@litespace/ui/Movable";
import { useMediaCall } from "@/hooks/mediaCall";
import { useUser } from "@litespace/headless/context/user";
import { RemoteMember } from "@/components/Session/types";

const CallMembers: React.FC<{
  remoteMember: RemoteMember;
}> = ({ remoteMember: member }) => {
  const ref = useRef<HTMLDivElement>(null);
  const call = useMediaCall();

  const userObj = useMemo(() => {
    const member = call.inMembers[0];
    return member;
  }, [call.inMembers]);

  const { user } = useUser();

  const memberObj = useMemo(() => {
    const member = call.inMembers[1];
    return member || null;
  }, [call.inMembers]);

  // TODO use the api to get the members of the session instead of using props

  if (!user || !userObj) return null;

  return (
    <div className="flex grow-[3] flex-col gap-4 h-full">
      <div
        className="flex-1 relative flex flex-col items-center justify-center gap-4"
        ref={ref}
      >
        {memberObj ? (
          <MemberStream
            videoTrack={memberObj.tracks.cam}
            audioTrack={memberObj.tracks.mic}
            userId={member?.id || -1}
            userImage={member?.image || ""}
            userName={member?.name || ""}
            audio={memberObj.tracks.mic?.enabled}
            video={memberObj.tracks.cam?.enabled}
            speaking={false} // TODO
            size="lg"
          />
        ) : null}

        {memberObj ? (
          <Movable
            container={ref}
            className="absolute bottom-4 right-4 z-session-movable-stream shadow-session-movable-stream rounded-lg"
          >
            <div className="w-32 sm:w-60 lg:w-72 aspect-mobile md:aspect-desktop">
              <MemberStream
                videoTrack={userObj.tracks.cam}
                userId={user.id}
                userImage={user.image}
                userName={user.name}
                audio={userObj.tracks.mic?.enabled}
                video={userObj.tracks.cam?.enabled}
                speaking={false} // TODO
                size="sm"
                muted
              />
            </div>
          </Movable>
        ) : (
          <MemberStream
            videoTrack={userObj.tracks.cam}
            userId={user.id}
            userImage={user.image}
            userName={user.name}
            audio={userObj.tracks.mic?.enabled}
            video={userObj.tracks.cam?.enabled}
            speaking={false} // TODO
            size="lg"
            muted
          />
        )}
      </div>
    </div>
  );
};

export default CallMembers;
