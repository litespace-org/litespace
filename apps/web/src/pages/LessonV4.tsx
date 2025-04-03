import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  PreSession,
  Session,
  PermissionsDialog,
  StreamInfo,
} from "@litespace/ui/Session";
import { IUser } from "@litespace/types";
import { useFindLesson } from "@litespace/headless/lessons";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useUserContext } from "@litespace/headless/context/user";
import { useDevices, useSessionV4 } from "@litespace/headless/sessions";
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
import { isTutor } from "@litespace/utils";
import Spinner from "@litespace/assets/Spinner";

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
  const [requestPermission, setRequestPermission] = useState<boolean>(false);

  const sessionv4 = useSessionV4({
    selfId: user?.id,
    sessionId: lesson.data?.lesson.sessionId,
    memberId: lessonMembers?.other.userId,
  });

  const devices = useDevices();

  const onCameraToggle = useCallback(() => {
    if (!devices.info.camera.permissioned) return setRequestPermission(true);
    return sessionv4.userMedia.toggleCamera();
  }, [devices.info.camera.permissioned, sessionv4.userMedia]);

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
        speaking: sessionv4.userMedia.speaking,
        audio: sessionv4.userMedia.audio,
        video: sessionv4.userMedia.video,
        stream: sessionv4.userMedia.stream,
        cast: false,
        user: current,
      },
    ];

    if (sessionv4.consumer.stream)
      streams.push({
        speaking: sessionv4.member.speaking,
        audio: sessionv4.member.audio,
        video: sessionv4.member.video || true,
        cast: false,
        stream: sessionv4.consumer.stream,
        user: other,
      });

    return streams;
  }, [
    lessonMembers,
    sessionv4.consumer.stream,
    sessionv4.member.audio,
    sessionv4.member.speaking,
    sessionv4.member.video,
    sessionv4.userMedia.audio,
    sessionv4.userMedia.speaking,
    sessionv4.userMedia.stream,
    sessionv4.userMedia.video,
  ]);

  const videoConfig = useMemo(
    () => ({
      enabled: sessionv4.userMedia.video,
      toggle: onCameraToggle,
      error:
        !devices.info.camera.connected || !devices.info.camera.permissioned,
    }),
    [
      devices.info.camera.connected,
      devices.info.camera.permissioned,
      onCameraToggle,
      sessionv4.userMedia.video,
    ]
  );

  useEffect(() => {
    if (
      devices.info.microphone.permissioned &&
      !sessionv4.userMedia.stream &&
      !sessionv4.userMedia.error &&
      !devices.loading
    )
      sessionv4.userMedia.capture(devices.info.camera.permissioned, true);
  }, [
    devices.error,
    devices.info.camera.permissioned,
    devices.info.microphone.permissioned,
    devices.loading,
    sessionv4.userMedia,
  ]);

  const onBeforeUnload = useCallback(() => {
    sessionv4.leave();
  }, [sessionv4]);

  useEffect(() => {
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [onBeforeUnload]);

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
            <Link
              className="lg:hidden w-6 h-6"
              to={isTutor(user) ? Web.StudentDashboard : Web.TutorDashboard}
            >
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

            {sessionv4.consumer.connectionState === "connecting" ||
            sessionv4.consumer.iceGatheringState === "gathering" ? (
              <div
                dir="ltr"
                className="flex flex-row gap-2 items-center justify-center"
              >
                <Typography tag="span">Connecting...</Typography>
                <Spinner className="w-6 h-6" />
              </div>
            ) : null}
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
          sessionv4.userMedia
            .capture(enableVideoStream)
            .then((stream: MediaStream | Error) => {
              const error = stream instanceof Error;
              if (error) return capture(stream);
              sessionv4.producer.produce(stream);
              setRequestPermission(false);
              devices.recheck();
            });
          setPermission(permission);
        }}
        loading={
          sessionv4.userMedia.loading || devices.loading
            ? permission
            : undefined
        }
        open={
          !devices.info.microphone.permissioned ||
          !!requestPermission ||
          !!sessionv4.userMedia.error
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

      {!sessionv4.manager.joined &&
      lessonMembers &&
      !lesson.isLoading &&
      lesson.data ? (
        <PreSession
          stream={sessionv4.userMedia.stream}
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
              incall: sessionv4.manager.hasJoined(lessonMembers.other.userId),
              role: lessonMembers.other.role,
            },
          }}
          video={videoConfig}
          audio={{
            enabled: sessionv4.userMedia.audio,
            toggle: sessionv4.userMedia.toggleMic,
            error:
              !devices.info.microphone.connected ||
              !devices.info.microphone.permissioned,
          }}
          speaking={sessionv4.userMedia.speaking}
          join={sessionv4.join}
          joining={
            sessionv4.manager.joining ||
            sessionv4.producer.iceGatheringState === "gathering" ||
            sessionv4.producer.connectionState === "connecting"
          }
        />
      ) : null}

      {lessonMembers &&
      lesson.data &&
      !lesson.isLoading &&
      sessionv4.manager.joined ? (
        <Session
          streams={streams}
          currentUserId={lessonMembers.current.userId}
          chat={{ enabled: chatEnabled, toggle: toggleChat }}
          video={videoConfig}
          audio={{
            enabled: sessionv4.userMedia.audio,
            toggle: sessionv4.userMedia.toggleMic,
            error: !devices.info.microphone.connected,
          }}
          timer={{
            duration: lesson.data.lesson.duration,
            startAt: lesson.data.lesson.start,
          }}
          leave={() => {
            if (!lesson.data) return;
            sessionv4.leave();
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
