import React, { useEffect, useState } from "react";
import { SessionChat } from "@/components/Session/SessionChat";
import { useSearchParams } from "react-router-dom";
import Controllers, { Controller } from "@/components/Session/Controllers";
import CallMembers from "@/components/Session/CallMembers";
import { useMediaCall } from "@/hooks/mediaCall";
import { RemoteMember } from "@/components/Session/types";
import { AlertType, AlertV2 } from "@litespace/ui/Alert";
import { useRender } from "@litespace/headless/common";
import { MemberConnectionState } from "@/modules/MediaCall/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Button } from "@litespace/ui/Button";
import Close2 from "@litespace/assets/Close2";
import cn from "classnames";

const InSession: React.FC<{
  member: RemoteMember;
  controllers: {
    audio: Controller;
    video: Controller;
  };
  startDate?: string;
}> = ({ member, controllers, startDate }) => {
  const call = useMediaCall();
  const intl = useFormatMessage();

  const [chat, setChat] = useState(false);
  const [_, setParams] = useSearchParams();
  const [newMessageIndicator, setNewMessageIndicator] =
    useState<boolean>(false);

  const alertRender = useRender();
  const [alertData, setAlertData] = useState<{
    title: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
  } | null>(null);

  // set nav to remove the nav and sidebars
  useEffect(() => {
    setParams({ nav: "false" });
    return () => setParams({ nav: "true" });
  }, [setParams]);

  useEffect(() => {
    const state = call.curMember?.connectionState;

    if (state === MemberConnectionState.Connected) {
      alertRender.hide();
      setAlertData(null);
      return;
    } else if (state === MemberConnectionState.Disconnected)
      setAlertData({
        title: intl("session.connection-lost"),
        action: (
          <Button
            size="small"
            variant="secondary"
            onClick={() => document.location.reload()}
          >
            {intl("labels.retry")}
          </Button>
        ),
      });
    else if (state === MemberConnectionState.Connecting)
      setAlertData({ title: intl("session.trying-to-reconnect") });
    else if (state === MemberConnectionState.PoorlyConnected)
      setAlertData({
        title: intl("session.poor-connection"),
        action: (
          <button onClick={alertRender.hide}>
            <Close2 className="w-6 h-6" />
          </button>
        ),
      });

    alertRender.show();
  }, [call.curMember, alertRender, intl]);

  if (!call.curMember || !call.manager?.session.getMemberByIndex(1))
    return null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col h-[90%] gap-6">
        {alertRender.open && alertData ? (
          <AlertV2
            type={AlertType.Info}
            title={alertData.title}
            icon={alertData.icon}
            action={alertData.action}
          />
        ) : null}

        <div
          className={cn("flex gap-6", {
            "h-full": !(alertRender.open && alertData),
            "h-[90%]": alertRender.open && alertData,
          })}
        >
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
      </div>

      <div className="absolute flex justify-center items-center w-screen bottom-4 right-0">
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
    </div>
  );
};

export default InSession;
