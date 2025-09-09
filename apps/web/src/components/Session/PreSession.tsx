import { ISession, IUser } from "@litespace/types";
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
import Session from "@/components/Session/Session";
import { RemoteMember } from "@/components/Session/types";
import { Device } from "@/modules/MediaCall/types";
import Preview from "./Preview";
import Controllers, { Controller } from "./Controllers";
import { Dialogs, DialogTypes } from "./Dialogs";

const PreSession: React.FC<{
  type: ISession.Type;
  start: string;
  duration: number;
  sessionId: ISession.Id;
  member: RemoteMember;
}> = ({
  type,
  sessionId,
  member,
  start: sessionStart,
  duration: sessionDuration,
}) => {
  const intl = useFormatMessage();
  const { user } = useUser();
  const call = useMediaCall();
  const socket = useSocket();

  const [connected, setConnected] = useState<boolean>(false);
  const [devices, setDevices] = useState<Device[]>([]);

  const [dialog, setDialog] = useState<{
    visible: boolean;
    type: DialogTypes;
  }>({
    visible: false,
    type: "encourage-dialog",
  });

  useEffect(() => {
    call.manager?.media.listDevices().then((list) => setDevices([...list]));
  }, [call.manager]);

  useEffect(() => {
    if (!socket.connected) socket.reconnect();
  }, [socket.connected, socket.reconnect]);

  const sessionAccessToken = useGetSessionToken(sessionId);

  const connect = useCallback(() => {
    call.manager?.session
      .connect(
        sockets.livekit[env.server],
        sessionAccessToken.data?.token || ""
      )
      .then(() => setConnected(true));
  }, [sessionAccessToken.data]);

  const controllers = useMemo(() => {
    const audio: Controller = {
      toggle: () => {
        const audioTrack = call.curMember?.tracks.mic;
        const videoTrack = call.curMember?.tracks.cam;
        if (!audioTrack) return;
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
        if (!videoTrack) return;
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
  }, [call.curMember, call.manager]);

  if (!user) return null;

  if (connected)
    return (
      <Session
        localMember={user}
        remoteMember={member}
        leave={() => call.manager?.session.disconnect()}
      />
    );

  return (
    <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 md:mt-28 max-h-full">
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
            type={type}
            start={sessionStart}
            duration={sessionDuration}
            join={connect}
            disabled={!socket.connected || !sessionAccessToken.data?.token}
            loading={sessionAccessToken.isPending}
            remoteMember={{
              id: 0,
              role: IUser.Role.Tutor,
              gender: IUser.Gender.Male,
              joined: false,
            }}
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

        <div className="flex overflow-auto">
          <div>
            Microphones:
            {devices
              ? devices
                  .filter((d) => d.type === "mic")
                  .map((d, i) => (
                    <Button
                      key={i}
                      variant="secondary"
                      onClick={() => call.manager?.publishTrackFromDevice(d.id)}
                    >
                      {d.name}
                    </Button>
                  ))
              : null}
          </div>

          <div>
            Cameras:
            {devices
              ? devices
                  .filter((d) => d.type === "cam")
                  .map((d, i) => (
                    <Button
                      key={i}
                      variant="secondary"
                      onClick={() => call.manager?.publishTrackFromDevice(d.id)}
                    >
                      {d.name}
                    </Button>
                  ))
              : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreSession;
