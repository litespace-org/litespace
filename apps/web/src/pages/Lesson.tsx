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
import Timer from "@/components/Session/Timer";
import { capture } from "@/lib/sentry";
import { isMobileBrowser } from "@/lib/browser";
import { useToast } from "@litespace/ui/Toast";
import { useSocket } from "@litespace/headless/socket";

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
  const toast = useToast();
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
  const [newMessageIndicator, setNewMessageIndicator] =
    useState<boolean>(false);

  const toggleChat = useCallback(() => {
    setChatEnabled((prev) => !prev);
    setNewMessageIndicator(false);
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
  const socket = useSocket();

  useEffect(() => {
    if (socket?.connected === false) {
      console.debug("re-connecting web socket...");
      socket.connect();
    }
  }, [socket]);

  useEffect(() => {
    console.debug("web socket connection: ", socket?.connected);
  }, [socket?.connected]);

  const [permission, setPermission] = useState<"mic-and-camera" | "mic-only">();
  const [requestPermission, setRequestPermission] = useState<boolean>(false);
  const [showShareScreenDialog, setShowScreenDialog] = useState<boolean>(false);

  const sessionPayload = useMemo((): SessionV3Payload => {
    return {
      socket,
      sessionId: lesson.data?.lesson.sessionId,
      userIds: {
        current: lessonMembers?.current.userId,
        other: lessonMembers?.other.userId,
      },
      onUserMediaStreamError() {
        toast.error({
          id: "user-media-stream-error",
          title: intl("session.permissions.error.title"),
          description: intl("session.permissions.error.desc"),
        });
      },
    };
  }, [intl, lesson.data?.lesson.sessionId, lessonMembers, toast.error]);

  const session = useSessionV3(sessionPayload)!;
  const devices = useDevices();

  const onCameraToggle = useCallback(() => {
    if (!devices.info.camera.permissioned) return setRequestPermission(true);
    return session.toggleCamera();
  }, [devices.info.camera.permissioned, session]);

  const [currentMemberStreamInfo, setCurrentMemberStreamInfo] =
    useState<StreamInfo | null>(null);
  const [otherMemberStreamInfo, setOtherMemberStreamInfo] =
    useState<StreamInfo | null>(null);

  useEffect(() => {
    if (!lessonMembers || !session.members) return;
    setCurrentMemberStreamInfo(() => ({
      user: {
        id: lessonMembers.current.userId,
        imageUrl: lessonMembers.current.image || null,
        name: lessonMembers.current.name,
      },
      speaking: session.members.current.speaking,
      audio: session.members.current.audio,
      video: session.members.current.video,
      cast: !!session.members.current.screen,
      stream: session.members.current.screen
        ? session.members.current.screen
        : session.members.current.stream,
    }));
  }, [
    lessonMembers?.current.userId,
    lessonMembers?.current.image,
    lessonMembers?.current.name,
    session.members.current.speaking,
    session.members.current.audio,
    session.members.current.video,
    session.members.current.screen,
    session.members.current.stream,
  ]);

  useEffect(() => {
    if (!lessonMembers || !session.members) return;
    setOtherMemberStreamInfo(() => ({
      user: {
        id: lessonMembers.other.userId,
        imageUrl: lessonMembers.other.image || null,
        name: lessonMembers.other.name,
      },
      speaking: session.members.other.speaking,
      audio: session.members.other.audio,
      video: session.members.other.video,
      cast: !!session.members.other.screen,
      stream: session.members.other.screen
        ? session.members.other.screen
        : session.members.other.stream,
    }));
  }, [
    lessonMembers?.other.userId,
    lessonMembers?.other.image,
    lessonMembers?.other.name,
    session.members.other.speaking,
    session.members.other.audio,
    session.members.other.video,
    session.members.other.screen,
    session.members.other.stream,
  ]);

  const streams = useMemo((): StreamInfo[] => {
    const streams: StreamInfo[] = [];

    if (currentMemberStreamInfo && !!currentMemberStreamInfo?.stream)
      streams.push(currentMemberStreamInfo);

    if (otherMemberStreamInfo && !!otherMemberStreamInfo?.stream)
      streams.push(otherMemberStreamInfo);

    return streams;
  }, [currentMemberStreamInfo, otherMemberStreamInfo]);

  const videoConfig = useMemo(
    () => ({
      enabled: session.members.current.video,
      toggle: onCameraToggle,
      error:
        !devices.info.camera.connected || !devices.info.camera.permissioned,
    }),
    [
      session.members,
      devices.info.camera.connected,
      devices.info.camera.permissioned,
      onCameraToggle,
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
    console.debug("session has been left, because of browser window unload!");
    session.leave();
  }, [session.leave]);

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
              <Timer
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
          requestPermission ||
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
          chat={{
            enabled: chatEnabled,
            toggle: toggleChat,
            indicator: newMessageIndicator,
          }}
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
              newMessageHandler={() => setNewMessageIndicator(true)}
            />
          }
        />
      ) : null}
    </div>
  );
};

export default Lesson;
