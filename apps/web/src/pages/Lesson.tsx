import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  PreSession,
  Session,
  PermissionsDialog,
  StreamInfo,
  ShareScreenDialog,
} from "@litespace/ui/Session";
import { IUser } from "@litespace/types";
import { useFindLesson } from "@litespace/headless/lessons";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useUserContext } from "@litespace/headless/context/user";
import {
  SessionV3Payload,
  useSessionV3,
  useDevices,
} from "@litespace/headless/sessions";
import { Loader, LoadingError } from "@litespace/ui/Loading";
import { asRateLessonQuery } from "@/lib/query";
import Messages from "@/components/Chat/Messages";
import {
  useChatStatus,
  useFindRoomByMembers,
  useFindRoomMembers,
} from "@litespace/headless/chat";
import { asOtherMember, isOnline, isTyping } from "@/lib/room";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";
import ArrowRightLong from "@litespace/assets/ArrowRightLong";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import cn from "classnames";
import CalendarFilled from "@litespace/assets/CalendarFilled";
import dayjs from "@/lib/dayjs";
import TimerIndicator from "@/components/Session/TimerIndicator";
import { capture } from "@/lib/sentry";
import { isMobileBrowser } from "@/lib/browser";

/**
 * @todos
 * 1. Only "join" the session in case the user is listening and the peer is ready.
 * 2. Handle loading & errors.
 * 3. Improve and align terminology.
 * 4. Leave the session on permission-state changed.
 */
const Lesson: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const intl = useFormatMessage();
  const mq = useMediaQuery();
  const { user } = useUserContext();
  const navigate = useNavigate();

  // ============================ Lesson ================================
  const lessonId = useMemo(() => {
    if (!id) return;
    const lessonId = Number(id);
    if (Number.isNaN(lessonId)) return;
    return lessonId;
  }, [id]);

  const lesson = useFindLesson(lessonId);

  const lessonMembers = useMemo(() => {
    if (!lesson.data || !user) return null;
    const current = lesson.data.members.find(
      (member) => member.userId === user.id
    );

    const other = lesson.data.members.find(
      (member) => member.userId !== user.id
    );

    if (!current || !other) return null;
    return { current, other };
  }, [lesson.data, user]);

  // ============================ Chat ==================================

  const [chatEnabled, setChatEnabled] = useState<boolean>(false);

  const toggleChat = useCallback(() => {
    setChatEnabled((prev) => !prev);
  }, []);

  const chatRoomQuery = useFindRoomByMembers(
    lessonMembers
      ? [lessonMembers.current.userId, lessonMembers.other.userId]
      : null
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
    const other = lessonMembers?.other.userId;
    return {
      sessionId: lesson.data?.lesson.sessionId,
      isCaller: caller,
      userIds: {
        current: lessonMembers?.current.userId,
        other,
      },
    };
  }, [caller, lesson.data?.lesson.sessionId, lessonMembers]);
  const session = useSessionV3(sessionPayload);
  const devices = useDevices();

  const onCameraToggle = useCallback(() => {
    if (!devices.info.camera.permissioned) return setRequestPermission(true);
    return session.toggleCamera();
  }, [devices.info.camera.permissioned, session]);

  const streams = useMemo((): StreamInfo[] => {
    if (!lessonMembers) return [];

    const current = {
      id: lessonMembers.current.userId,
      imageUrl: lessonMembers.current.image || null,
      name: lessonMembers.current.name,
    };

    const other = {
      id: lessonMembers.other.userId,
      imageUrl: lessonMembers.other.image || null,
      name: lessonMembers.other.name,
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
  }, [lessonMembers, session.members]);

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
      !devices.loading
    )
      session.capture(devices.info.camera.permissioned);
  }, [
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
              <Typography
                tag="h4"
                className="text-natural-950 font-bold text-body lg:text-subtitle-2"
              >
                {intl("lesson.title")}
                {lessonMembers?.other.name ? "/" : null}
              </Typography>
              {lessonMembers?.other.name ? (
                <Typography
                  tag="span"
                  className="text-brand-700 font-bold text-body lg:text-subtitle-2"
                >
                  {lessonMembers.other.name}
                </Typography>
              ) : null}
            </div>
          </div>
          {lesson.data ? (
            <div className="flex gap-2 md:gap-4 items-center">
              <div className="flex gap-1 items-center">
                <CalendarFilled className="w-4 h-4 md:w-6 md:h-6" />
                <Typography
                  className="text-natural-700 text-tiny md:text-caption md:font-semibold"
                  tag="p"
                >
                  {dayjs(lesson.data.lesson.start).format("DD MMMM YYYY")}
                </Typography>
              </div>
              <TimerIndicator
                start={lesson.data.lesson.start}
                duration={lesson.data.lesson.duration}
              />
            </div>
          ) : null}
        </div>
      )}

      <PermissionsDialog
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
        open={!devices.info.microphone.permissioned || requestPermission}
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

      {lesson.isLoading ? (
        <div className="mt-[15vh]">
          <Loader size="large" text={intl("session.loading")} />
        </div>
      ) : null}

      {lesson.isError ? (
        <div className="mt-[15vh]">
          <LoadingError
            size="large"
            error={intl("session.loading-error")}
            retry={lesson.refetch}
          />
        </div>
      ) : null}

      {!session.sessionManager.joined &&
      lessonMembers &&
      !lesson.isLoading &&
      lesson.data ? (
        <PreSession
          stream={session.members.current.stream}
          session={{
            start: lesson.data.lesson.start,
            duration: lesson.data.lesson.duration,
          }}
          members={{
            current: {
              id: lessonMembers.current.userId,
              imageUrl: lessonMembers.current.image || null,
              name: lessonMembers.current.name,
              role: lessonMembers.current.role,
            },
            other: {
              id: lessonMembers.other.userId,
              //! TODO: gender is not in the response.
              //! TODO: gender should be optional
              gender: IUser.Gender.Male,
              incall: session.isOtherMemberJoined,
              role: lessonMembers.other.role,
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
          speaking={session.members.current.speaking}
          join={() => {
            session.sessionManager.join();
            if (session.isOtherMemberJoined && session.members.current.stream)
              return setCaller(true);
          }}
          joining={session.sessionManager.joining}
        />
      ) : null}

      {lessonMembers &&
      lesson.data &&
      !lesson.isLoading &&
      session.sessionManager.joined ? (
        <Session
          streams={streams}
          currentUserId={lessonMembers.current.userId}
          chat={{ enabled: chatEnabled, toggle: toggleChat }}
          video={videoConfig}
          audio={{
            enabled: session.members.current.audio,
            toggle: session.toggleMic,
            error: !devices.info.microphone.connected,
          }}
          cast={cast}
          timer={{
            duration: lesson.data.lesson.duration,
            startAt: lesson.data.lesson.start,
          }}
          leave={() => {
            if (!lesson.data) return;
            session.leave();
            const student = lessonMembers.current.role === IUser.Role.Student;
            const query = asRateLessonQuery({
              lessonId: lessonMembers.current.lessonId,
              start: lesson.data.lesson.start,
              tutorId: lessonMembers.other.userId,
              tutorName: lessonMembers.other.name,
              duration: lesson.data.lesson.duration,
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

export default Lesson;
