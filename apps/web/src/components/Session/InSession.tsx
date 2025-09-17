import React, { useEffect, useState } from "react";
import { SessionChat } from "@/components/Session/SessionChat";
import { useSearchParams } from "react-router-dom";
import Controllers, { Controller } from "@/components/Session/Controllers";
import CallMembers from "@/components/Session/CallMembers";
import { useMediaCall } from "@/hooks/mediaCall";
import { RemoteMember } from "@/components/Session/types";

const InSession: React.FC<{
  member: RemoteMember;
  controllers: {
    audio: Controller;
    video: Controller;
  };
  startDate?: string;
}> = ({ member, controllers, startDate }) => {
  const call = useMediaCall();
  const [chat, setChat] = useState(false);
  const [_, setParams] = useSearchParams();
  const [newMessageIndicator, setNewMessageIndicator] =
    useState<boolean>(false);

  // set nav to remove the nav and sidebars
  useEffect(() => {
    setParams({ nav: "false" });
    return () => setParams({ nav: "true" });
  }, [setParams]);

  if (!call.curMember || !call.manager?.session.getMemberByIndex(1))
    return null;

  return (
    <div className="h-full flex flex-col gap-10">
      <div className="h-[calc(100%-80px)] flex gap-6">
        <CallMembers remoteMember={member} sessionStartDate={startDate} />

        <SessionChat
          close={() => setChat(false)}
          enabled={chat}
          selfId={Number(call.curMember.id)} // TODO: make it more error tolerant
          memberId={Number(call.manager.session.getMemberByIndex(1)?.id)}
          onNewMessage={() => {
            setNewMessageIndicator(true);
            if (!chat) {
              const audio = new Audio("/new-message.mp3");
              audio.play();
            }
          }}
        />
      </div>

      <Controllers
        chat={{
          enabled: chat,
          toggle: () => {
            setChat((prev) => !prev);
            setNewMessageIndicator(false);
          },
          indicator: newMessageIndicator,
        }}
        leave={() =>
          call.manager?.session.disconnect().then(
            // this approuch makes the lesson page more robust by avoiding
            // akward scenarios. Like livekit not emitting the disconnect event.
            () => document.location.reload()
          )
        }
        audio={controllers.audio}
        video={controllers.video}
      />
    </div>
  );
};

export default InSession;
