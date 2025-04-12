import { useFormatMessage } from "@litespace/ui/hooks/intl";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  PreSession,
  Session,
  PermissionsDialog,
  StreamInfo,
} from "@/components/Session";
import { IUser } from "@litespace/types";
import { useFindLesson } from "@litespace/headless/lessons";
import { useParams, useNavigate } from "react-router-dom";
import { useUserContext } from "@litespace/headless/context/user";
import { useDevices, useSessionV5 } from "@litespace/headless/sessions";
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
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import cn from "classnames";
import { capture } from "@/lib/sentry";
import { useOnError } from "@/hooks/error";

//! WHY?
const trimStream = (stream: MediaStream, video: boolean) => {
  if (!video) return new MediaStream(stream.getAudioTracks());
  return stream;
};

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

  const { query: lesson, keys } = useFindLesson(lessonId);

  useOnError({
    type: "query",
    error: lesson.error,
    keys,
  });

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

  const { query: chatRoomQuery } = useFindRoomByMembers(
    lessonMembers
      ? [lessonMembers.current.userId, lessonMembers.other.userId]
      : null
  );

  const room = chatRoomQuery.data?.room || null;
  const { query: roomMembers } = useFindRoomMembers(room);
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

  const sessionv5 = useSessionV5({
    selfId: user?.id,
    sessionId: lesson.data?.lesson.sessionId,
    memberId: lessonMembers?.other.userId,
  });

  const devices = useDevices();

  const onCameraToggle = useCallback(() => {
    if (!devices.info.camera.permissioned) return setRequestPermission(true);
    return sessionv5.userMedia.toggleCamera();
  }, [devices.info.camera.permissioned, sessionv5.userMedia]);

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
        speaking: sessionv5.userMedia.speaking,
        audio: sessionv5.userMedia.audio,
        video: sessionv5.userMedia.video,
        stream: sessionv5.userMedia.stream,
        cast: false,
        user: current,
      },
    ];

    if (sessionv5.peer.stream)
      streams.push({
        speaking: sessionv5.member.speaking,
        audio: sessionv5.member.audio,
        video: sessionv5.member.video,
        cast: false,
        stream: trimStream(sessionv5.peer.stream, sessionv5.member.video),
        user: other,
      });

    return streams;
  }, [
    lessonMembers,
    sessionv5.member.audio,
    sessionv5.member.speaking,
    sessionv5.member.video,
    sessionv5.peer.stream,
    sessionv5.userMedia.audio,
    sessionv5.userMedia.speaking,
    sessionv5.userMedia.stream,
    sessionv5.userMedia.video,
  ]);

  const videoConfig = useMemo(
    () => ({
      enabled: sessionv5.userMedia.video,
      toggle: onCameraToggle,
      error:
        !devices.info.camera.connected || !devices.info.camera.permissioned,
    }),
    [
      devices.info.camera.connected,
      devices.info.camera.permissioned,
      onCameraToggle,
      sessionv5.userMedia.video,
    ]
  );

  useEffect(() => {
    if (
      devices.info.microphone.permissioned &&
      !sessionv5.userMedia.loading &&
      !sessionv5.userMedia.stream &&
      !sessionv5.userMedia.error &&
      !devices.loading
    )
      sessionv5.userMedia.capture({
        video: devices.info.camera.permissioned,
        silent: true,
      });
  }, [
    devices.error,
    devices.info.camera.permissioned,
    devices.info.microphone.permissioned,
    devices.loading,
    sessionv5.userMedia,
  ]);

  const onBeforeUnload = useCallback(() => {
    sessionv5.leave();
  }, [sessionv5]);

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
      <PermissionsDialog
        onSubmit={(permission) => {
          const enableVideoStream = permission === "mic-and-camera";
          sessionv5.userMedia
            .capture({ video: enableVideoStream })
            .then((stream: MediaStream | Error) => {
              const error = stream instanceof Error;
              // todo: add toast error
              if (error) return capture(stream);
              sessionv5.peer.replaceStream(stream);
              setRequestPermission(false);
              devices.recheck();
            });
          setPermission(permission);
        }}
        loading={
          sessionv5.userMedia.loading || devices.loading
            ? permission
            : undefined
        }
        open={
          !devices.info.microphone.permissioned ||
          !!requestPermission ||
          !!sessionv5.userMedia.error
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
          <Loader size="large" text={intl("lesson.loading")} />
        </div>
      ) : null}

      {lesson.isError ? (
        <div className="mt-[15vh]">
          <LoadingError
            size="large"
            error={intl("lesson.loading-error")}
            retry={lesson.refetch}
          />
        </div>
      ) : null}

      {!sessionv5.manager.joined &&
      lessonMembers &&
      !lesson.isLoading &&
      lesson.data ? (
        <PreSession
          stream={sessionv5.userMedia.stream}
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
              joined: sessionv5.manager.hasJoined(lessonMembers.other.userId),
              role: lessonMembers.other.role,
            },
          }}
          video={videoConfig}
          audio={{
            enabled: sessionv5.userMedia.audio,
            toggle: sessionv5.userMedia.toggleMic,
            error:
              !devices.info.microphone.connected ||
              !devices.info.microphone.permissioned,
          }}
          speaking={sessionv5.userMedia.speaking}
          join={sessionv5.join}
          joining={
            sessionv5.manager.joining
            // || sessionv5.producer.iceGatheringState === "gathering" ||
            // sessionv5.producer.connectionState === "connecting"
          }
        />
      ) : null}

      {lessonMembers &&
      lesson.data &&
      !lesson.isLoading &&
      sessionv5.manager.joined ? (
        <Session
          streams={streams}
          currentUserId={lessonMembers.current.userId}
          chat={{ enabled: chatEnabled, toggle: toggleChat }}
          video={videoConfig}
          audio={{
            enabled: sessionv5.userMedia.audio,
            toggle: sessionv5.userMedia.toggleMic,
            error: !devices.info.microphone.connected,
          }}
          timer={{
            duration: lesson.data.lesson.duration,
            startAt: lesson.data.lesson.start,
          }}
          leave={() => {
            if (!lesson.data) return;
            sessionv5.leave();
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
