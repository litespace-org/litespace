import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Typography } from "@litespace/luna/Typography";
import React, { useEffect, useMemo, useState } from "react";
import {
  PreSession,
  Session,
  PermissionsDialog,
  StreamInfo,
  ShareScreenDialog,
} from "@litespace/luna/Session";
import { IUser } from "@litespace/types";
import { useFindLesson } from "@litespace/headless/lessons";
import { useParams } from "react-router-dom";
import { useUserContext } from "@litespace/headless/context/user";
import { asFullAssetUrl } from "@litespace/luna/backend";
import {
  SessionV3Payload,
  useSessionV3,
  useDevices,
  useSessionMembers,
} from "@litespace/headless/sessions";

/**
 * @todos
 * 1. Only "join" the session in case the user is listening and the peer is ready.
 * 2. Handle loading & errors.
 * 3. Improve and align terminology.
 */
const Lesson: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const intl = useFormatMessage();
  const { user } = useUserContext();

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

  // ============================ Session/Streams ================================
  const [permission, setPermission] = useState<"mic-and-camera" | "mic-only">();
  const [showShareScreenDialog, setShowScreenDialog] = useState<boolean>(false);
  const sessionManager = useSessionMembers(lesson.data?.lesson.sessionId);
  const sessionPayload = useMemo((): SessionV3Payload => {
    const other = lessonMembers?.other.userId;
    const isOtherMemberReady =
      !!other && sessionManager.members.includes(other);
    return {
      sessionId: lesson.data?.lesson.sessionId,
      isOtherMemberReady,
      userIds: {
        current: lessonMembers?.current.userId,
        other,
      },
    };
  }, [lesson.data?.lesson.sessionId, lessonMembers, sessionManager.members]);
  const session = useSessionV3(sessionPayload);
  const devices = useDevices();

  const streams = useMemo((): StreamInfo[] => {
    if (!lessonMembers) return [];

    const current = {
      id: lessonMembers.current.userId,
      imageUrl: lessonMembers.current.image
        ? asFullAssetUrl(lessonMembers.current.image)
        : null,
      name: lessonMembers.current.name,
    };

    const other = {
      id: lessonMembers.other.userId,
      imageUrl: lessonMembers.other.image
        ? asFullAssetUrl(lessonMembers.other.image)
        : null,
      name: lessonMembers.other.name,
    };

    const streams: StreamInfo[] = [
      {
        speaking: session.members.current.speaking,
        muted: !session.members.current.audio,
        camera: session.members.current.video,
        stream: session.members.current.stream,
        cast: false,
        user: current,
      },
    ];

    if (session.members.other.stream)
      streams.push({
        speaking: session.members.other.speaking,
        muted: !session.members.other.audio,
        camera: session.members.other.video,
        cast: false,
        stream: session.members.other.stream,
        user: other,
      });

    if (session.members.current.screen)
      streams.push({
        speaking: false,
        muted: false,
        camera: true,
        cast: true,
        stream: session.members.current.screen,
        user: current,
      });

    if (session.members.other.screen)
      streams.push({
        speaking: false,
        muted: false,
        camera: true,
        cast: true,
        stream: session.members.other.screen,
        user: other,
      });

    return streams;
  }, [lessonMembers, session.members]);

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

  if (!lessonMembers || !lesson.data) return null;

  return (
    <div className="max-w-screen-3xl mx-auto w-full p-6">
      <div className="mb-6 flex flex-row items-center justify-start gap-1">
        <Typography
          element="subtitle-2"
          weight="bold"
          className="text-natural-950"
        >
          {intl("lesson.title")}
          {lessonMembers.other.name ? "/" : null}
        </Typography>
        {lessonMembers.other.name ? (
          <Typography
            element="subtitle-2"
            weight="bold"
            className="text-brand-700"
          >
            {lessonMembers.other.name}
          </Typography>
        ) : null}
      </div>

      <PermissionsDialog
        onSubmit={(permission) => {
          const enableVideoStream = permission === "mic-and-camera";
          session.capture(enableVideoStream).then(() => {
            devices.recheck();
          });
          setPermission(permission);
        }}
        loading={
          session.members.current.loadingStream || devices.loading
            ? permission
            : undefined
        }
        open={!devices.info.microphone.permissioned}
        devices={{
          mic: devices.info.microphone.connected,
          camera: devices.info.camera.connected,
          speakers: devices.info.speakers.connected,
        }}
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

      {!sessionManager.members.includes(lessonMembers.current.userId) ? (
        <PreSession
          stream={session.members.current.stream}
          currentMember={{
            id: lessonMembers.current.userId,
            imageUrl: lessonMembers.current.image
              ? asFullAssetUrl(lessonMembers.current.image)
              : null,
            name: lessonMembers.current.name,
            role: lessonMembers.current.role,
          }}
          otherMember={{
            id: lessonMembers.other.userId,
            imageUrl: lessonMembers.other.image
              ? asFullAssetUrl(lessonMembers.other.image)
              : null,
            name: lessonMembers.other.name,
            //! TODO: gender is not in the response.
            //! TODO: gender should be optional
            gender: IUser.Gender.Male,
            incall: sessionManager.members.includes(lessonMembers.other.userId),
            role: lessonMembers.other.role,
          }}
          camera={{
            enabled: session.members.current.video,
            toggle: session.toggleCamera,
            error: !devices.info.camera.connected,
          }}
          mic={{
            enabled: session.members.current.audio,
            toggle: session.toggleMic,
            error: !devices.info.microphone.connected,
          }}
          speaking={session.members.current.speaking}
          join={() => {
            sessionManager.join();
            if (
              !sessionManager.members.includes(lessonMembers.other.userId) ||
              !session.members.current.stream
            )
              return;

            session.call({
              userId: lessonMembers.other.userId,
              stream: session.members.current.stream,
            });
            session.notifyUserMediaState();
          }}
        />
      ) : (
        <Session
          streams={streams}
          currentUserId={lessonMembers.current.userId}
          chat={{ enabled: false, toggle: () => alert("todo") }}
          camera={{
            enabled: session.members.current.video,
            toggle: session.toggleCamera,
            error: !devices.info.camera.connected,
          }}
          mic={{
            enabled: session.members.current.audio,
            toggle: session.toggleMic,
            error: !devices.info.microphone.connected,
          }}
          cast={{
            enabled: !!session.screen.stream,
            toggle: async () => {
              if (session.screen.stream) return session.screen.stop();
              if (session.members.other.screen)
                return setShowScreenDialog(true);
              return await session.screen.share();
            },
            error: !!session.screen.error,
          }}
          fullScreen={{
            enabled: false,
            toggle: () => alert("todo"),
          }}
          timer={{
            duration: lesson.data.lesson.duration,
            startAt: lesson.data.lesson.start,
          }}
          leave={() => {
            session.leave();
          }}
        />
      )}
    </div>
  );
};

export default Lesson;
