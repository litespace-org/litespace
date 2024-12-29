import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Typography } from "@litespace/luna/Typography";
import React, { useEffect, useMemo, useState } from "react";
import { PreSession, PermissionsDialog } from "@litespace/luna/Session";
import { IUser } from "@litespace/types";
import { useFindLesson } from "@litespace/headless/lessons";
import { useParams } from "react-router-dom";
import { useUserContext } from "@litespace/headless/context/user";
import { asFullAssetUrl } from "@litespace/luna/backend";
import {
  useSessionV3,
  useDevices,
  useSessionMembers,
} from "@litespace/headless/sessions";

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
  const session = useSessionV3();
  const devices = useDevices();
  const sessionManager = useSessionMembers(lesson.data?.lesson.sessionId);

  useEffect(() => {
    if (
      devices.info.microphone.permissioned &&
      !session.userMedia.stream &&
      !devices.loading
    )
      session.userMedia.start(devices.info.camera.permissioned);
  }, [
    devices.info.camera.permissioned,
    devices.info.microphone.permissioned,
    devices.loading,
    session.userMedia,
  ]);

  if (!lessonMembers) return null;

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
          session.userMedia.start(enableVideoStream).then(() => {
            devices.recheck();
          });
          setPermission(permission);
        }}
        loading={
          session.userMedia.loading ||
          devices.loading ||
          session.userMedia.loading
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

      <PreSession
        stream={session.userMedia.stream}
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
          enabled: session.userMedia.video,
          toggle: session.userMedia.toggleCamera,
          error: !devices.info.camera.connected,
        }}
        mic={{
          enabled: session.userMedia.audio,
          toggle: session.userMedia.toggleMic,
          error: !devices.info.microphone.connected,
        }}
        speaking={session.speaking}
        join={() => {
          sessionManager.join();
        }}
      />
    </div>
  );
};

export default Lesson;
