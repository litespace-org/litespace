import { ISession, IUser, Wss } from "@litespace/types";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Ready from "@/components/Session/Ready";
import { useSocket } from "@litespace/headless/socket";
import { Typography } from "@litespace/ui/Typography";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { RefreshCw } from "react-feather";
import { useUser } from "@litespace/headless/context/user";
import { useGetSessionToken } from "@litespace/headless/sessions";
import { sockets } from "@litespace/atlas";
import { env } from "@/lib/env";
import { useMediaCall } from "@/hooks/mediaCall";
import InSession from "@/components/Session/InSession";
import { CallError, Device } from "@/modules/MediaCall/types";
import Preview from "@/components/Session/Preview";
import Controllers, { Controller } from "@/components/Session/Controllers";
import { Dialogs, DialogTypes } from "@/components/Session/Dialogs";
import { RemoteMember } from "@/components/Session/types";
import { useToast } from "@litespace/ui/Toast";
import { useRender } from "@litespace/headless/common";
import { ConfirmationDialog } from "@litespace/ui/ConfirmationDialog";
import Microphone from "@litespace/assets/Microphone";
import { VideoPlayer } from "@litespace/ui/VideoPlayer";

const PreSession: React.FC<{
  type: ISession.Type;
  start: string;
  duration: number;
  sessionId: ISession.Id;
  /**
   * lessonId, interviewId... etc
   */
  sessionTypeId: number;
  member: RemoteMember;
}> = ({
  type,
  sessionId,
  sessionTypeId,
  start: sessionStart,
  duration: sessionDuration,
  member,
}) => {
  const intl = useFormatMessage();
  const toast = useToast();
  const { user } = useUser();
  const call = useMediaCall();
  const socket = useSocket();

  const howToEnableMicDialog = useRender();

  const [connectedOnce, setConnectedOnce] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [micGranted, setMicGranted] = useState<boolean>(false);

  const [dialog, setDialog] = useState<{
    visible: boolean;
    type: DialogTypes;
  }>({
    visible: false,
    type: "encourage-dialog",
  });

  useEffect(() => {
    call.manager?.media.detectDevices().then((list) => {
      setDevices([...list]);

      const audioDevice = list.find((d) => d.type === "mic");
      const camDevice = list.find((d) => d.type === "cam");

      if (audioDevice)
        call.manager
          ?.publishTrackFromDevice(audioDevice.id, "mic")
          .then(() => setMicGranted(true))
          .catch(() => setMicGranted(false));

      if (camDevice)
        call.manager
          ?.publishTrackFromDevice(camDevice.id, "cam")
          .catch(() => console.error("failed to publish cam track!"));
    });
  }, [call.manager]);

  useEffect(() => {
    if (!socket.connected) socket.reconnect();
    socket.socket?.emit(Wss.ClientEvent.PreJoinSession, { sessionId });
  }, [socket.connected, socket, sessionId]);

  const sessionAccessToken = useGetSessionToken(sessionId);

  const connect = useCallback(() => {
    setConnecting(true);
    call.manager?.session
      .connect(
        sockets.livekit[env.server],
        sessionAccessToken.data?.token || ""
      )
      .then(() => {
        setConnecting(false);
        setConnectedOnce(true);
      })
      .catch(() => {
        setConnecting(false);
        toast.error({ title: intl("labels.connection-error") });
      });
  }, [sessionAccessToken.data, call.manager?.session, intl, toast]);

  const controllers = useMemo(() => {
    const audio: Controller = {
      toggle: () => {
        const audioTrack = call.curMember?.tracks.mic;
        const videoTrack = call.curMember?.tracks.cam;
        if (!audioTrack) {
          const audioDevice = devices.find((d) => d.type === "mic");
          if (!audioDevice)
            return call.errorHandler?.throw(CallError.MicNotFound);
          return call.manager?.publishTrackFromDevice(audioDevice.id, "mic");
        }
        // turning the mic off
        if (audioTrack.enabled) {
          return call.curMember?.setMicStatus(false);
        }
        // turning the mic on
        if (!audioTrack.enabled) {
          if (!videoTrack?.enabled) {
            setDialog({
              type: "encourage-dialog",
              visible: true,
            });
          }
          return call.curMember?.setMicStatus(true);
        }
      },
      enabled: !!call.curMember?.tracks.mic?.enabled,
      error: !call.curMember?.tracks.mic,
    };

    const video: Controller = {
      toggle: () => {
        const videoTrack = call.curMember?.tracks.cam;
        if (!videoTrack) {
          const camDevice = devices.find((d) => d.type === "cam");
          if (!camDevice)
            return call.errorHandler?.throw(CallError.CamNotFound);
          return call.manager?.publishTrackFromDevice(camDevice.id, "cam");
        }
        // turning the cam off
        if (videoTrack.enabled) {
          setDialog({
            type: "discourage-dialog",
            visible: true,
          });
          return call.curMember?.setCamStatus(false);
        }
        // turning the cam on
        if (!videoTrack.enabled) {
          return call.curMember?.setCamStatus(true);
        }
      },
      enabled: !!call.curMember?.tracks.cam?.enabled,
      error: !call.curMember?.tracks.cam,
    };

    return {
      audio,
      video,
    };
  }, [call.curMember, call.manager, devices, call.errorHandler]);

  if (!user) return null;

  if (call.connected || connectedOnce)
    return (
      <InSession
        sessionId={sessionId}
        sessionTypeId={sessionTypeId}
        controllers={controllers}
        remoteMember={member}
        startDate={sessionStart}
        sessionDuration={sessionDuration}
      />
    );

  return (
    <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 md:mt-[10vh] max-h-full">
      {[IUser.Role.TutorManager, IUser.Role.Tutor].includes(user?.role) &&
      dialog.visible ? (
        <Dialogs
          type={dialog.type}
          setPermission={(perm) => {
            if (perm === "mic-only") {
              call.curMember?.setMicStatus(true);
            } else if (perm === "cam-only") {
              call.curMember?.setCamStatus(true);
            } else if (perm === "mic-and-camera") {
              call.curMember?.setMicStatus(true);
              call.curMember?.setCamStatus(true);
            }
          }}
          turnCamOff={() => call.curMember?.setCamStatus(false)}
          close={() => setDialog((prev) => ({ ...prev, visible: false }))}
        />
      ) : null}

      <div className="flex flex-col items-center justify-center gap-6 md:w-[480px] lg:w-[640px] h-full overflow-hidden">
        <div className="w-full max-h-[calc(100%-40px)] overflow-hidden aspect-mobile md:aspect-desktop">
          <Preview
            videoTrack={call.curMember?.tracks.cam}
            audio={!!call.curMember?.tracks.mic?.enabled}
            video={!!call.curMember?.tracks.cam?.enabled}
          />
        </div>

        <Controllers audio={controllers.audio} video={controllers.video} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="md:h-[calc(100%-24px-40px)] flex items-center justify-center">
          <Ready
            sessionId={sessionId}
            type={type}
            start={sessionStart}
            duration={sessionDuration}
            join={connect}
            // TODO: user howToEnableMicDialog.show once the video is available
            enableMic={controllers.audio.toggle}
            disabled={
              !socket.connected ||
              !sessionAccessToken.data?.token ||
              !micGranted
            }
            loading={connecting}
            micGranted={micGranted}
          />
        </div>

        {!socket.connected ? (
          <div className="flex justify-center items-center w-full border-2 border-destructive-700 bg-destructive-50 p-4 gap-2 rounded-lg">
            <Typography tag="span" className="text-destructive-700">
              {intl("labels.connection-error")}
            </Typography>
            <Button
              onClick={() => window.location.reload()}
              type="error"
              variant="secondary"
              endIcon={<RefreshCw className="w-full h-full" />}
            ></Button>
          </div>
        ) : null}
      </div>

      <ConfirmationDialog
        title={intl("session.how-to-enable-mic-dialog.title")}
        open={false} // TODO: use howToEnableMicDialog.open once the video is available
        close={howToEnableMicDialog.hide}
        actions={{
          primary: {
            label: intl("labels.got-it"),
            onClick: howToEnableMicDialog.hide,
          },
        }}
        icon={<Microphone />}
      >
        <VideoPlayer />
      </ConfirmationDialog>
    </div>
  );
};

export default PreSession;
