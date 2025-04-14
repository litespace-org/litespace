import { useMediaQuery } from "@litespace/headless/mediaQuery";
import {
  isDeviceNotFound,
  isNotReadableError,
  isOverConstrainedError,
  isNotAllowed,
  Layout,
  useDevices,
  useSessionV5,
  layoutAspectRatio,
} from "@litespace/headless/sessions";
import { ISession, IUser, Void } from "@litespace/types";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  PermissionsDialog,
  Props as PermissionsDialogProps,
} from "@/components/Session/PermissionsDialog";
import { getEmailUserName, safePromise } from "@litespace/utils";
import PreSession from "@/components/SessionV5/PreSession";
import Session from "@/components/SessionV5/Session";
import { Controller } from "@/components/SessionV5/Controllers";
import { useLogger } from "@litespace/headless/logger";
import { capture } from "@/lib/sentry";
import { useToast } from "@litespace/ui/Toast";
import { useFormatMessage } from "@litespace/ui/hooks/intl";

const Main: React.FC<{
  resourceId: number;
  sessionId: ISession.Id;
  type: ISession.Type;
  self: IUser.Self;
  start: string;
  duration: number;
  member: {
    id: number;
    name: string | null;
    gender: IUser.Gender;
    role: IUser.Role;
    image: string | null;
  };
  onLeave: Void;
}> = ({ self, member, sessionId, start, duration, onLeave }) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const logger = useLogger();
  const [reRequestPermission, setReRequestPermission] =
    useState<boolean>(false);
  const mq = useMediaQuery();
  const [permission, setPermission] =
    useState<PermissionsDialogProps["loading"]>();
  const devices = useDevices();
  const session = useSessionV5({
    selfId: self.id,
    memberId: member.id,
    sessionId,
    onMemberJoin() {
      const audio = new Audio("/join-session.mp3");
      audio.play();
    },
    onMemberLeave() {
      const audio = new Audio("/leave-session.mp3");
      audio.play();
    },
  });

  const layout = useMemo((): Layout => {
    if (mq.xl) return "desktop";
    if (mq.sm) return "tablet";
    return "mobile";
  }, [mq.sm, mq.xl]);

  const onVideoToggle = useCallback(() => {
    if (!devices.info.camera.permissioned) return setReRequestPermission(true);
    return session.userMedia.toggleCamera();
  }, [devices.info.camera.permissioned, session.userMedia]);

  const onToggleAudio = useCallback(() => {
    if (!devices.info.microphone.permissioned)
      return setReRequestPermission(true);
    return session.userMedia.toggleMic();
  }, [devices.info.microphone.permissioned, session.userMedia]);

  const onUserMediaError = useCallback(
    (error: Error, permission: PermissionsDialogProps["loading"]) => {
      // Ref: https://blog.addpipe.com/common-getusermedia-errors/
      logger.error("Unable to capture user media stream", error);
      const id = "user-media-error";
      capture(error);
      if (isDeviceNotFound(error))
        return toast.error({
          id,
          title: intl(
            permission === "mic-only"
              ? "session.device-not-found-error.mic.title"
              : "session.device-not-found-error.mic-and-cam.title"
          ),
          description: intl(
            permission === "mic-only"
              ? "session.device-not-found-error.mic.desc"
              : "session.device-not-found-error.mic-and-cam.desc"
          ),
        });

      if (isNotReadableError(error))
        return toast.error({
          id,
          title: intl("session.not-readable-error.title"),
          description: intl("session.not-readable-error.desc"),
        });

      if (isOverConstrainedError(error))
        return toast.error({
          id,
          title: intl("session.over-constrained-error.title"),
          description: intl("session.over-constrained-error.desc"),
        });

      if (isNotAllowed(error))
        return toast.error({
          id,
          title: intl("session.not-allowed.title"),
          description: intl("session.not-allowed.desc"),
        });

      toast.error({
        id,
        title: intl("session.unexpected-error.title"),
        description: intl("session.unexpected-error.desc"),
      });
    },
    [intl, logger, toast]
  );

  const leave = useCallback(() => {
    session.leave();
    onLeave();
  }, [onLeave, session]);

  /**
   * Capture user media stream incase we already have the permission to do so.
   *
   * @note at least we should have the permission to access the microphone to be
   * able to capture the media silently.
   */
  useEffect(() => {
    if (
      devices.info.microphone.permissioned &&
      !session.userMedia.loading &&
      !session.userMedia.stream &&
      !session.userMedia.error &&
      !devices.loading
    )
      session.userMedia.capture({
        video: devices.info.camera.permissioned,
        silent: true,
        layout,
      });
  }, [
    devices.info.camera.permissioned,
    devices.info.microphone.permissioned,
    devices.loading,
    session.userMedia,
    layout,
  ]);

  const memberStream = useMemo(() => {
    const stream = session.peer.stream;
    if (!stream) return null;
    /**
     * The sound will not work incase the user joined the session without his
     * video enabled. That's why we isolate the audio tracks from the video
     * tracks into a new stream.
     *
     * Tip: Try to comment out the line below and use the user stream directly.
     * You should not hear the other user under the right conditions.
     */
    if (!session.member.video) return new MediaStream(stream.getAudioTracks());
    return stream;
  }, [session.member.video, session.peer.stream]);

  const videoController: Controller = useMemo(
    () => ({
      enabled: session.userMedia.video,
      toggle: onVideoToggle,
      error:
        !devices.info.camera.connected || !devices.info.camera.permissioned,
    }),
    [
      devices.info.camera.connected,
      devices.info.camera.permissioned,
      session.userMedia.video,
      onVideoToggle,
    ]
  );

  const audioController: Controller = useMemo(
    () => ({
      enabled: session.userMedia.audio,
      toggle: onToggleAudio,
      error:
        !devices.info.microphone.connected ||
        !devices.info.microphone.permissioned,
    }),
    [
      devices.info.microphone.connected,
      devices.info.microphone.permissioned,
      session.userMedia.audio,
      onToggleAudio,
    ]
  );

  return (
    <div className="h-full">
      <PermissionsDialog
        onSubmit={async (permission) => {
          /**
           * @note Microphone is required all cases.
           * @note User cannot enable video without microphone.
           */
          setPermission(permission);
          const video = permission === "mic-and-camera";
          const result = await safePromise(
            session.userMedia.capture({ video, layout })
          );
          if (result instanceof Error) onUserMediaError(result, permission);

          /**
           * Once we captured the meida stream, the devices permissions state
           * needs to be updated.
           */
          devices.recheck();
          setPermission(undefined);
          setReRequestPermission(false);
        }}
        loading={session.userMedia.loading ? permission : undefined}
        /**
         * Permissions dialog should be auto-rendred incase we don't have the
         * permission to access the microphone.
         */
        open={
          !!session.userMedia.error ||
          reRequestPermission ||
          !devices.info.microphone.permissioned
        }
        devices={{
          mic: devices.info.microphone.connected,
          camera: devices.info.camera.connected,
          /**
           * For privacy reasons, not all browsers will allow us to see if the
           * user has connected speakers/headphones or not.
           *
           * It the user responsibility to check that he has a working
           * speakers/headphones.
           */
          speakers: true,
        }}
        /**
         * Permissions dialog is only closable incase the user is re-requesting
         * the permission (e.g., requesting the permission to enable camera
         * during the session)
         */
        close={
          reRequestPermission
            ? () => {
                setReRequestPermission(false);
              }
            : undefined
        }
      />

      {!session.manager.joined ? (
        <PreSession
          self={{
            id: self.id,
            image: self.image,
            name: self.name || getEmailUserName(self.email),
            stream: session.userMedia.stream,
            audio: session.userMedia.audio,
            video: session.userMedia.video,
            speaking: session.userMedia.speaking,
          }}
          member={{
            id: member.id,
            gender: member.gender,
            role: member.role,
            joined: session.manager.hasJoined(member.id),
          }}
          join={session.join}
          disabled={devices.error || !session.manager.listening}
          loading={session.manager.joining || session.manager.loadingMembers}
          error={
            !devices.info.microphone.connected ||
            !devices.info.microphone.permissioned
          }
          start={start}
          duration={duration}
          video={videoController}
          audio={audioController}
        />
      ) : null}

      {session.manager.joined && session.userMedia.stream ? (
        <Session
          selfStream={session.userMedia.stream}
          selfId={self.id}
          selfName={self.name || getEmailUserName(self.email)}
          selfImage={self.image}
          selfAudio={session.userMedia.audio}
          selfVideo={session.userMedia.video}
          selfSpeaking={session.userMedia.speaking}
          memberStream={memberStream}
          memberId={member.id}
          memberName={member.name}
          memberImage={member.image}
          memberAudio={session.member.audio}
          memberVideo={session.member.video}
          memberSpeaking={session.member.speaking}
          audioController={audioController}
          videoController={videoController}
          movableStreamAspectRatio={layoutAspectRatio[layout].aspectRatio}
          connecting={
            session.peer.connectionState === "connecting" ||
            session.peer.iceGatheringState === "gathering" ||
            session.peer.iceConnectionState === "checking"
          }
          leave={leave}
        />
      ) : null}
    </div>
  );
};

export default Main;
