import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { Typography } from "@litespace/luna/Typography";
import React, { useEffect, useMemo, useState } from "react";
import { PreSession, PermissionsDialog } from "@litespace/luna/Session";
import { IUser } from "@litespace/types";
import { useFindLesson } from "@litespace/headless/lessons";
import { useParams } from "react-router-dom";
import { useUser } from "@litespace/headless/context/user";
import { asFullAssetUrl } from "@litespace/luna/backend";
import { useSessionV3, useDevices } from "@litespace/headless/sessions";

const Lesson: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const intl = useFormatMessage();
  const { user } = useUser();

  // ============================ Lesson ================================
  const lessonId = useMemo(() => {
    if (!id) return;
    const lessonId = Number(id);
    if (Number.isNaN(lessonId)) return;
    return lessonId;
  }, [id]);

  const lesson = useFindLesson(lessonId);

  const members = useMemo(() => {
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

  useEffect(() => {
    if (devices.info.microphone.permissioned && !session.userMedia.stream)
      session.userMedia.start({
        audio: true,
        video: devices.info.camera.permissioned
          ? { width: 1280, height: 720 }
          : false,
      });
  }, [
    devices.info.camera.permissioned,
    devices.info.microphone.permissioned,
    session.userMedia,
  ]);

  if (!members) return null;

  return (
    <div className="max-w-screen-3xl mx-auto w-full p-6">
      <div className="mb-6 flex flex-row items-center justify-start gap-1">
        <Typography
          element="subtitle-2"
          weight="bold"
          className="text-natural-950"
        >
          {intl("lesson.title")}
          {members.other.name ? "/" : null}
        </Typography>
        {members.other.name ? (
          <Typography
            element="subtitle-2"
            weight="bold"
            className="text-brand-700"
          >
            {members.other.name}
          </Typography>
        ) : null}
      </div>

      <PermissionsDialog
        onSubmit={(permission) => {
          session.userMedia
            .start({
              audio: true, // microphone is a requirement.
              video:
                permission === "mic-and-camera"
                  ? { width: 1280, height: 720 }
                  : false,
            })
            .then(() => {
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
      />

      <PreSession
        stream={session.userMedia.stream}
        currentMember={{
          id: members.current.userId,
          imageUrl: members.current.image
            ? asFullAssetUrl(members.current.image)
            : null,
          name: members.current.name,
          role: members.current.role,
        }}
        otherMember={{
          id: members.other.userId,
          imageUrl: members.other.image
            ? asFullAssetUrl(members.other.image)
            : null,
          name: members.other.name,
          //! TODO: gender is not in the response.
          //! TODO: gender should be optional
          gender: IUser.Gender.Male,
          incall: false,
          role: members.other.role,
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
          alert("soon!");
        }}
      />
    </div>
  );
};

export default Lesson;
