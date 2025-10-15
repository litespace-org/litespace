import React, { useEffect, useState } from "react";
import { SessionChat } from "@/components/Session/SessionChat";
import { useNavigate, useSearchParams } from "react-router-dom";
import Controllers, { Controller } from "@/components/Session/Controllers";
import CallMembers from "@/components/Session/CallMembers";
import { useMediaCall } from "@/hooks/mediaCall";
import { RemoteMember } from "@/components/Session/types";
import { AlertType, AlertV2 } from "@litespace/ui/Alert";
import { useRender } from "@litespace/headless/common";
import { Device, MemberConnectionState } from "@/modules/MediaCall/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Button } from "@litespace/ui/Button";
import Close2 from "@litespace/assets/Close2";
import { ISession, IUser, Wss } from "@litespace/types";
import { useSocket } from "@litespace/headless/socket";
import { useCreateReport } from "@litespace/headless/report";
import { useUser } from "@litespace/headless/context/user";
import dayjs from "@/lib/dayjs";
import { useOnError } from "@/hooks/error";
import { useToast } from "@litespace/ui/Toast";
import { useReportLesson } from "@litespace/headless/lessons";
import { Web } from "@litespace/utils/routes";
import { ConfirmationDialog } from "@litespace/ui/ConfirmationDialog";
import CallIncoming from "@litespace/assets/CallIncoming";
import { MIN_LESSON_DURATION } from "@litespace/utils";

const InSession: React.FC<{
  sessionId: ISession.Id;
  sessionTypeId: number;
  remoteMember: RemoteMember;
  controllers: {
    audio: Controller;
    video: Controller;
    screen: Controller;
  };
  devices: Device[];
  startDate?: string;
  sessionDuration?: number;
}> = ({
  sessionId,
  sessionTypeId,
  remoteMember,
  controllers,
  startDate,
  sessionDuration,
  devices,
}) => {
  const call = useMediaCall();
  const intl = useFormatMessage();
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useUser();
  const { socket, reconnect } = useSocket();

  const [chat, setChat] = useState(false);
  const [_, setParams] = useSearchParams();
  const [newMessageIndicator, setNewMessageIndicator] = useState<number>(0);

  const [connState, setConnState] = useState<
    MemberConnectionState | undefined
  >();

  const connAlertRender = useRender();
  const [connAlertData, setConnAlertData] = useState<{
    title: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
  } | null>(null);

  const timeAlertRender = useRender();
  const [timeAlertData, setTimeAlertData] = useState<{
    title: string;
    id?: number;
    icon?: React.ReactNode;
    action?: React.ReactNode;
  } | null>(null);

  // inform the backend that the user entered session
  // and inform that he/she left on disconnect
  useEffect(() => {
    socket?.on("disconnect", () => {
      socket?.emit(Wss.ClientEvent.LeaveSession, { sessionId });
    });
  }, [socket, sessionId]);

  // set nav to remove the nav and sidebars
  useEffect(() => {
    setParams({ nav: "false" });
    return () => setParams({ nav: "true" });
  }, [setParams]);

  useEffect(() => {
    const state = call.curMember?.connectionState;
    // No changes just return
    // Note: curMember object changes frequently
    if (state === connState) return;

    setConnState(state);

    if (state === MemberConnectionState.Connected) {
      socket?.emit(Wss.ClientEvent.JoinSession, { sessionId });
      connAlertRender.hide();
      setConnAlertData(null);
      return;
    } else if (state === MemberConnectionState.Disconnected) {
      socket?.emit(Wss.ClientEvent.LeaveSession, { sessionId });
      setConnAlertData({
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
    } else if (state === MemberConnectionState.Connecting)
      setConnAlertData({ title: intl("session.trying-to-reconnect") });
    else if (state === MemberConnectionState.PoorlyConnected)
      setConnAlertData({
        title: intl("session.poor-connection"),
        action: (
          <button onClick={connAlertRender.hide}>
            <Close2 className="w-6 h-6" />
          </button>
        ),
      });

    connAlertRender.show();
  }, [call.curMember, connAlertRender, intl, socket, connState, sessionId]);

  const [memberJoinedOnce, setMemberJoinedOnce] = useState(false);
  useEffect(() => {
    if (memberJoinedOnce) return;
    if (call.inMembers.length > 1) timeAlertRender.hide();
    setMemberJoinedOnce(call.inMembers.length > 1);
  }, [call.inMembers, memberJoinedOnce, timeAlertRender]);

  const onError = useOnError({
    type: "mutation",
    handler: (e) => toast.error({ title: intl(e.messageId) }),
  });

  const reportLessonDialog = useRender();

  const createReport = useCreateReport({
    onSuccess: () => {},
    onError,
  });

  const reportLesson = useReportLesson({
    onSuccess: () => navigate(Web.Lessons),
    onError,
  });

  // render an alert component based on three factors: one: the difference between
  // the current time and the session time, two: the role of the current user, and
  // three: the joined call members.
  // In a nutshell, an alert should render to students based on the current time
  // and whether the tutor joined or not.
  useEffect(() => {
    // return if the user is not a student
    if (user?.role !== IUser.Role.Student) return;

    // return if the session is already finished
    const now = dayjs();
    if (
      now.isAfter(
        dayjs(startDate).add(sessionDuration || MIN_LESSON_DURATION, "minutes")
      )
    )
      return;

    // return if the tutor is already in the session
    if (memberJoinedOnce) return;

    // show report-tutor alert and return if tutor not joined
    if (
      now.isAfter(dayjs(startDate).add(3, "minutes")) &&
      timeAlertData?.id !== 3
    ) {
      setTimeAlertData({
        id: 3,
        title: intl("session.alert.tutor-cannot-join"),
        action: (
          <Button
            size="small"
            variant="secondary"
            onClick={() => {
              createReport.mutate({
                title: `tutor absence`,
                description: `tutor ${remoteMember.id} didn't attend session ${sessionId}`,
              });
              reportLessonDialog.show();
            }}
          >
            {intl("session.label.tutor-didnot-attend")}
          </Button>
        ),
      });
      timeAlertRender.show();
      return;
    }

    const interval = setInterval(() => {
      const now = dayjs();

      if (dayjs(startDate).add(3, "minutes").isBefore(now)) return;

      if (now.isAfter(startDate)) {
        setTimeAlertData({
          title: intl("session.alert.wait-tutor"),
          action: (
            <button onClick={timeAlertRender.hide}>
              <Close2 className="w-6 h-6" />
            </button>
          ),
        });
        timeAlertRender.show();
        return;
      }

      setTimeAlertData({
        title: intl("session.alert.wait-session-start"),
        action: (
          <button onClick={timeAlertRender.hide}>
            <Close2 className="w-6 h-6" />
          </button>
        ),
      });
      timeAlertRender.show();
    }, 1000);

    return () => clearInterval(interval);
  }, [
    user,
    intl,
    createReport,
    remoteMember.id,
    sessionId,
    startDate,
    sessionDuration,
    memberJoinedOnce,
    timeAlertRender,
    timeAlertData,
    reportLessonDialog,
  ]);

  if (!call.curMember || !call.manager?.session.getMemberByIndex(1))
    return null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col h-[90%] gap-6">
        <div className="flex flex-col gap-2">
          {connAlertRender.open && connAlertData ? (
            <AlertV2
              type={AlertType.Info}
              title={connAlertData.title}
              icon={connAlertData.icon}
              action={connAlertData.action}
            />
          ) : null}

          {timeAlertRender.open && timeAlertData && !memberJoinedOnce ? (
            <AlertV2
              type={AlertType.Info}
              title={timeAlertData.title}
              icon={timeAlertData.icon}
              action={timeAlertData.action}
            />
          ) : null}
        </div>

        <div className="flex gap-6 h-full">
          <CallMembers
            sessionStartDate={startDate}
            sessionDuration={sessionDuration}
          />

          <SessionChat
            close={() => setChat(false)}
            enabled={chat}
            selfId={Number(call.curMember.id)} // TODO: make it more error tolerant
            memberId={Number(call.manager.session.getMemberByIndex(1)?.id)}
            onNewMessage={() => {
              setNewMessageIndicator((prev) => prev + 1);
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
          devices={devices}
          chat={{
            enabled: chat,
            toggle: () => {
              setChat((prev) => !prev);
              setNewMessageIndicator(0);
              if (!socket?.connected) reconnect();
            },
            indicator: newMessageIndicator,
          }}
          leave={() =>
            call.manager?.session.disconnect().then(
              // this approach makes the lesson page more robust by avoiding
              // akward scenarios. Like livekit not emitting the disconnect event.
              () => document.location.reload()
            )
          }
          audio={controllers.audio}
          video={controllers.video}
          screen={controllers.screen}
        />
      </div>

      <ConfirmationDialog
        title={intl("session.report-dialog.title")}
        description={intl("session.report-dialog.description")}
        icon={<CallIncoming />}
        type="error"
        actions={{
          primary: {
            label: intl("labels.report"),
            onClick: () => reportLesson.mutate({ id: sessionTypeId }),
          },
          secondary: {
            label: intl("cancel-lesson.cancel-and-return"),
            onClick: reportLessonDialog.hide,
          },
        }}
        open={reportLessonDialog.open}
        close={reportLessonDialog.hide}
      />
    </div>
  );
};

export default InSession;
