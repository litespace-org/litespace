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
    <div className="relative">
      <Button
        type={type}
        startIcon={
          enabled ? (
            <icons.on className="icon w-4 h-4" />
          ) : (
            <icons.off
              className={cn(
                "icon w-4 h-4",
                error && "[&_*]:stroke-destructive-700"
              )}
            />
          )
        }
        variant={varient}
        onClick={toggle}
        size="large"
      />
      {error ? (
        <div
          className={cn(
            "absolute -top-2 -left-2",
            "bg-destructive-50 absolute w-6 h-6 flex items-center justify-center rounded-full"
          )}
        >
          <Error className="w-4 h-4 [&>g>path]:stroke-destructive-600" />
        </div>
      ) : null}
    </div>
  );
};

export const Actions: React.FC<{
  chat?: { toggle: Void; enabled: boolean };
  screen?: { toggle: Void; enabled: boolean; error?: boolean };
  video?: { toggle: Void; enabled: boolean; error?: boolean };
  audio?: { toggle: Void; enabled: boolean; error?: boolean };
  leave?: Void;
}> = ({ leave, chat, screen, video, audio }) => {
  return (
    <div
      dir="ltr"
      className={cn("flex justify-center", {
        "gap-3 lg:gap-5": leave,
        "gap-6": !leave,
      })}
    >
      {chat ? (
        <Toggle toggle={chat.toggle} enabled={chat.enabled} icon="chat" />
      ) : null}

      {audio ? (
        <Toggle
          toggle={audio.toggle}
          enabled={audio.enabled}
          error={audio.error}
          icon="microphone"
        />
      ) : null}

      {video ? (
        <Toggle
          toggle={video.toggle}
          enabled={video.enabled}
          error={video.error}
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
