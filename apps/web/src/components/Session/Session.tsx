import { isMobileBrowser } from "@/lib/browser";
import { asRateLessonQuery } from "@/lib/query";
import { asOtherMember, isOnline, isTyping } from "@/lib/room";
import { router } from "@/lib/routes";
import {
  useChatStatus,
  useFindRoomByMembers,
  useFindRoomMembers,
} from "@litespace/headless/chat";
import {
  SessionV3Payload,
  useDevices,
  useSessionV3,
} from "@litespace/headless/sessions";
import { IInterview, ILesson, ISession, IUser, Void } from "@litespace/types";
import {
  PermissionsDialog,
  PreSession,
  Session,
  ShareScreenDialog,
  StreamInfo,
} from "@litespace/ui/Session";
import { Web } from "@litespace/utils/routes";
import { useCallback, useEffect, useMemo, useState } from "react";
import Messages from "@/components/Chat/Messages";
import { useToast } from "@litespace/ui/Toast";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "@litespace/headless/context/user";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import ArrowRightLong from "@litespace/assets/ArrowRightLong";
import { Typography } from "@litespace/ui/Typography";
import CalendarFilled from "@litespace/assets/CalendarFilled";
import dayjs from "@/lib/dayjs";
import { capture } from "@/lib/sentry";
import Timer from "@/components/Session/Timer";
import cn from "classnames";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { Loader, LoadingError } from "@litespace/ui/Loading";

type Props = {
  loading: boolean;
  error: boolean;
  members: {
    current: ILesson.PopulatedMember | IInterview.PopulatedMember;
    other: ILesson.PopulatedMember | IInterview.PopulatedMember;
  } | null;
  sessionData:
    | {
        duration: number;
        start: string;
        sessionId?: ISession.Id;
      }
    | undefined;
  chatEnabled: boolean;
  id: number | undefined;
  type: ISession.Type;
  refetch: Void;
  toggleChat: Void;
};

const SessionWrapper: React.FC<Props> = ({
  loading,
  error,
  type,
  sessionData,
  members,
  chatEnabled,
  id,
  refetch,
  toggleChat,
}) => {
  const intl = useFormatMessage();
  const sessionType = intl(
    type === "lesson" ? "session.type.lesson" : "session.type.interview"
  );

  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const mq = useMediaQuery();

  // ============================ Chat ==================================

  const chatRoomQuery = useFindRoomByMembers(
    members ? [members.current.userId, members.other.userId] : null
  );

  const room = chatRoomQuery.data?.room || null;
  const roomMembers = useFindRoomMembers(room);
  const chatOtherMember = useMemo(
    () => asOtherMember(user?.id, roomMembers.data),
    [user?.id, roomMembers.data]
  );

  const { typingMap, onlineUsersMap } = useChatStatus();

  const isOtherMemberTyping = useMemo(() => {
    return chatOtherMember
      ? isTyping({
          map: typingMap,
          roomId: room,
          otherMemberId: chatOtherMember.id,
        })
      : false;
  }, [room, chatOtherMember, typingMap]);

  const isOtherMemberOnline = useMemo(() => {
    return chatOtherMember
      ? isOnline({
          map: onlineUsersMap,
          roomId: room,
          otherMemberStatus: chatOtherMember.online,
          otherMemberId: chatOtherMember.id,
        })
      : false;
  }, [chatOtherMember, onlineUsersMap, room]);

  // ============================ Session/Streams ================================
  const [permission, setPermission] = useState<"mic-and-camera" | "mic-only">();
  const [caller, setCaller] = useState<boolean>(false);
  const [requestPermission, setRequestPermission] = useState<boolean>(false);
  const [showShareScreenDialog, setShowScreenDialog] = useState<boolean>(false);
  const sessionPayload = useMemo((): SessionV3Payload => {
    const other = members?.other.userId;
    return {
      sessionId: sessionData?.sessionId,
      isCaller: caller,
      userIds: {
        current: members?.current.userId,
        other,
      },
      onUserMediaStreamError() {
        toast.error({
          id: "user-media-stream-error",
          title: intl("session.permissions.error.title"),
          description: intl("session.permissions.error.desc"),
        });
      },
    };
  }, [caller, intl, sessionData?.sessionId, members, toast]);

  const session = useSessionV3(sessionPayload);
  const devices = useDevices();

  const onCameraToggle = useCallback(() => {
    if (!devices.info.camera.permissioned) return setRequestPermission(true);
    return session.toggleCamera();
  }, [devices.info.camera.permissioned, session]);

  const streams = useMemo((): StreamInfo[] => {
    if (!members) return [];

    const current = {
      id: members.current.userId,
      imageUrl: members.current.image || null,
      name: members.current.name,
    };

    const other = {
      id: members.other.userId,
      imageUrl: members.other.image || null,
      name: members.other.name,
    };

    const streams: StreamInfo[] = [
      {
        speaking: session.members.current.speaking,
        audio: session.members.current.audio,
        video: session.members.current.video,
        stream: session.members.current.stream,
        cast: false,
        user: current,
      },
    ];

    if (session.members.other.stream)
      streams.push({
        speaking: session.members.other.speaking,
        audio: session.members.other.audio,
        video: session.members.other.video,
        cast: false,
        stream: session.members.other.stream,
        user: other,
      });

    if (session.members.current.screen)
      streams.push({
        speaking: false,
        audio: true,
        video: true,
        cast: true,
        stream: session.members.current.screen,
        user: current,
      });

    if (session.members.other.screen)
      streams.push({
        speaking: false,
        audio: true,
        video: true,
        cast: true,
        stream: session.members.other.screen,
        user: other,
      });

    return streams;
  }, [members, session.members]);

  const videoConfig = useMemo(
    () => ({
      enabled: session.members.current.video,
      toggle: onCameraToggle,
      error:
        !devices.info.camera.connected || !devices.info.camera.permissioned,
    }),
    [
      devices.info.camera.connected,
      devices.info.camera.permissioned,
      onCameraToggle,
      session.members,
    ]
  );

  useEffect(() => {
    if (
      devices.info.microphone.permissioned &&
      !session.members.current.stream &&
      !session.members.current.error &&
      !devices.loading
    )
      session.capture(devices.info.camera.permissioned, true);
  }, [
    devices.error,
    devices.info.camera.permissioned,
    devices.info.microphone.permissioned,
    devices.loading,
    session,
  ]);

  const onBeforeUnload = useCallback(() => {
    session.leave();
  }, [session]);

  useEffect(() => {
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [onBeforeUnload]);

  const cast = useMemo(() => {
    if (isMobileBrowser()) return;
    return {
      enabled: !!session.screen.stream,
      toggle: async () => {
        if (session.screen.stream) return session.screen.stop();
        if (session.members.other.screen) return setShowScreenDialog(true);
        return await session.screen.share();
      },
      error: !!session.screen.error,
    };
  }, [session.members.other.screen, session.screen]);

  return (
    <div
      className={cn(
        "max-w-screen-3xl mx-auto w-full grow overflow-hidden",
        chatEnabled && !mq.lg ? "" : "p-6"
      )}
    >
      {chatEnabled && !mq.lg ? null : (
        <div className="mb-4 lg:mb-6 flex gap-2 flex-wrap items-center justify-between">
          <div className="flex flex-row items-center justify-start gap-2">
            <Link className="lg:hidden w-6 h-6" to={Web.StudentDashboard}>
              <ArrowRightLong />
            </Link>
            <div className="flex items-center gap-1">
              {type === "lesson" ? (
                <>
                  <Typography
                    tag="h4"
                    className="text-natural-950 font-bold text-body lg:text-subtitle-2"
                  >
                    {intl("lesson.title")}
                    {members?.other.name ? "/" : null}
                  </Typography>
                  {members?.other.name ? (
                    <Typography
                      tag="span"
                      className="text-brand-700 font-bold text-body lg:text-subtitle-2"
                    >
                      {members.other.name}
                    </Typography>
                  ) : null}
                </>
              ) : (
                <Typography
                  tag="h4"
                  className="text-natural-950 font-bold text-body lg:text-subtitle-2"
                >
                  {intl("interview.title")}
                </Typography>
              )}
            </div>
          </div>
          {sessionData ? (
            <div className="flex gap-2 md:gap-4 items-center">
              <div className="flex gap-1 items-center">
                <CalendarFilled className="w-4 h-4 md:w-6 md:h-6" />
                <Typography
                  className="text-natural-700 text-tiny md:text-caption md:font-semibold"
                  tag="p"
                >
                  {dayjs(sessionData.start).format("DD MMMM YYYY")}
                </Typography>
              </div>
              <Timer
                type={type}
                start={sessionData.start}
                duration={sessionData.duration}
              />
            </div>
          ) : null}
        </div>
      )}

      <PermissionsDialog
        type={type}
        onSubmit={(permission) => {
          const enableVideoStream = permission === "mic-and-camera";
          session
            .capture(enableVideoStream)
            .then((result: MediaStream | Error) => {
              const error = result instanceof Error;
              if (error) return capture(error);

              const call =
                requestPermission && !error && session.isOtherMemberJoined;
              if (call) setCaller(true);
              setRequestPermission(false);
              devices.recheck();
            });
          setPermission(permission);
        }}
        loading={
          session.members.current.loadingStream || devices.loading
            ? permission
            : undefined
        }
        open={
          !devices.info.microphone.permissioned ||
          !!requestPermission ||
          !!session.members.current.error
        }
        devices={{
          mic: devices.info.microphone.connected,
          camera: devices.info.camera.connected,
          speakers: devices.info.speakers.connected,
        }}
        close={
          requestPermission
            ? () => {
                setRequestPermission(false);
              }
            : undefined
        }
      />

      <ShareScreenDialog
        open={showShareScreenDialog}
        confirm={async () => {
          const result = await session.screen.share();
          if (result instanceof Error) return;
          session.closeScreenCall();
          setShowScreenDialog(false);
        }}
        close={() => setShowScreenDialog(false)}
        loading={session.screen.loading}
      />

      {loading ? (
        <div className="mt-[15vh]">
          <Loader
            size="large"
            text={intl("session.loading", {
              type: sessionType,
            })}
          />
        </div>
      ) : null}

      {error ? (
        <div className="mt-[15vh]">
          <LoadingError
            size="large"
            error={intl("session.loading-error", {
              type: sessionType,
            })}
            retry={refetch}
          />
        </div>
      ) : null}

      {!session.sessionManager.joined && members && !loading && sessionData ? (
        <PreSession
          stream={session.members.current.stream}
          session={{
            start: sessionData.start,
            duration: sessionData.duration,
          }}
          members={{
            current: {
              id: members.current.userId,
              imageUrl: members.current.image || null,
              name: members.current.name,
              role: members.current.role,
            },
            other: {
              id: members.other.userId,
              //! TODO: gender is not in the response.
              //! TODO: gender should be optional
              gender: IUser.Gender.Male,
              incall: session.isOtherMemberJoined,
              role: members.other.role,
            },
          }}
          video={videoConfig}
          audio={{
            enabled: session.members.current.audio,
            toggle: session.toggleMic,
            error:
              !devices.info.microphone.connected ||
              !devices.info.microphone.permissioned,
          }}
          type={type}
          speaking={session.members.current.speaking}
          join={() => {
            session.sessionManager.join();
            if (session.isOtherMemberJoined && session.members.current.stream)
              return setCaller(true);
          }}
          joining={session.sessionManager.joining}
        />
      ) : null}

      {members && sessionData && !loading && session.sessionManager.joined ? (
        <Session
          streams={streams}
          currentUserId={members.current.userId}
          chat={{ enabled: chatEnabled, toggle: toggleChat }}
          video={videoConfig}
          audio={{
            enabled: session.members.current.audio,
            toggle: session.toggleMic,
            error: !devices.info.microphone.connected,
          }}
          cast={cast}
          timer={{
            duration: sessionData.duration,
            startAt: sessionData.start,
          }}
          leave={() => {
            if (!sessionData || !id || type === "interview") return;
            session.leave();
            const student = members.current.role === IUser.Role.Student;
            const query = asRateLessonQuery({
              lessonId: id,
              start: sessionData.start,
              tutorId: members.other.userId,
              tutorName: members.other.name,
              duration: sessionData.duration,
            });
            navigate(
              router.web({
                route: Web.UpcomingLessons,
                query: student ? query : {},
              })
            );
          }}
          chatPanel={
            <Messages
              inSession
              room={room}
              close={toggleChat}
              isTyping={isOtherMemberTyping}
              isOnline={isOtherMemberOnline}
              otherMember={chatOtherMember}
              select={() => {}}
              setTemporaryTutor={() => {}}
            />
          }
        />
      ) : null}
    </div>
  );
};

export default SessionWrapper;
