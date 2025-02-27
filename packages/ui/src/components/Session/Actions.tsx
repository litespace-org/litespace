import { Void } from "@litespace/types";
import React, { useMemo } from "react";
import CallIncoming from "@litespace/assets/CallIncoming";
import { Button, ButtonType, ButtonVariant } from "@/components/Button";
import Microphone from "@litespace/assets/Microphone";
import MicrophoneSlash from "@litespace/assets/MicrophoneSlash";
import Video from "@litespace/assets/Video";
import VideoSlash from "@litespace/assets/VideoSlash";
import CastScreen from "@litespace/assets/CastScreen";
import Chat from "@litespace/assets/Chat";
import Error from "@litespace/assets/Error";
import cn from "classnames";

type Icon = "microphone" | "camera" | "screen" | "chat";
const iconsMap: Record<
  Icon,
  {
    on: React.FC<{ className?: string }>;
    off: React.FC<{ className?: string }>;
  }
> = {
  microphone: { on: Microphone, off: MicrophoneSlash },
  camera: { on: Video, off: VideoSlash },
  screen: { on: CastScreen, off: CastScreen },
  chat: { on: Chat, off: Chat },
};

export const Toggle: React.FC<{
  toggle: Void;
  enabled: boolean;
  icon: Icon;
  error?: boolean;
}> = ({ toggle, icon, enabled, error = false }) => {
  const icons = useMemo(() => iconsMap[icon], [icon]);
  const { varient, type } = useMemo((): {
    varient: ButtonVariant;
    type: ButtonType;
  } => {
    if (error) return { type: "error", varient: "secondary" };
    if (enabled) return { type: "main", varient: "primary" };
    return { type: "main", varient: "secondary" };
  }, [enabled, error]);

  return (
    <div className="tw-relative">
      <Button
        type={type}
        startIcon={
          enabled ? (
            <icons.on className="icon tw-w-4 tw-h-4" />
          ) : (
            <icons.off className="icon tw-w-4 tw-h-4" />
          )
        }
        variant={varient}
        onClick={toggle}
        size="large"
      />
      {error ? (
        <div
          className={cn(
            "tw-absolute -tw-top-2 -tw-left-2",
            "tw-bg-destructive-400 tw-absolute tw-w-6 tw-h-6 tw-flex tw-items-center tw-justify-center tw-rounded-full"
          )}
        >
          <Error className="tw-w-4 tw-h-4 [&>g>path]:tw-stroke-white" />
        </div>
      ) : null}
    </div>
  );
};

export const Actions: React.FC<{
  chat?: { toggle: Void; enabled: boolean };
  screen?: { toggle: Void; enabled: boolean; error?: boolean };
  camera?: { toggle: Void; enabled: boolean; error?: boolean };
  microphone?: { toggle: Void; enabled: boolean; error?: boolean };
  leave?: Void;
}> = ({ leave, chat, screen, camera, microphone }) => {
  return (
    <div
      dir="ltr"
      className="tw-flex tw-items-center tw-justify-center tw-gap-3 lg:tw-gap-5"
    >
      {chat ? (
        <Toggle toggle={chat.toggle} enabled={chat.enabled} icon="chat" />
      ) : null}

      {microphone ? (
        <Toggle
          toggle={microphone.toggle}
          enabled={microphone.enabled}
          error={microphone.error}
          icon="microphone"
        />
      ) : null}

      {camera ? (
        <Toggle
          toggle={camera.toggle}
          enabled={camera.enabled}
          error={camera.error}
          icon="camera"
        />
      ) : null}

      {screen ? (
        <Toggle
          toggle={screen.toggle}
          enabled={screen.enabled}
          error={screen.error}
          icon="screen"
        />
      ) : null}

      {leave ? (
        <Button
          type="error"
          size="large"
          variant="secondary"
          startIcon={<CallIncoming className="icon" />}
          onClick={leave}
        />
      ) : null}
    </div>
  );
};

export default Actions;
