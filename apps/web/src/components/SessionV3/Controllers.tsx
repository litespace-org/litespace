import { Void } from "@litespace/types";
import { Button, ButtonType, ButtonVariant } from "@litespace/ui/Button";
import React, { useMemo } from "react";
import CallIncoming from "@litespace/assets/CallIncoming";
import Video from "@litespace/assets/Video";
import VideoSlash from "@litespace/assets/VideoSlash";
import CastScreen from "@litespace/assets/CastScreen";
import Chat from "@litespace/assets/Chat";
import Microphone from "@litespace/assets/Microphone";
import MicrophoneSlash from "@litespace/assets/MicrophoneSlash";
import Error from "@litespace/assets/Error";
import cn from "classnames";

type Icon = "microphone" | "camera" | "screen" | "chat";

export type Controller = {
  toggle: Void;
  enabled: boolean;
  error?: boolean;
};

const ICON_MAP: Record<
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
  const icons = useMemo(() => ICON_MAP[icon], [icon]);
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

const Controllers: React.FC<{
  audio: Controller;
  video: Controller;
  leave: Void;
}> = ({ audio, video, leave }) => {
  return (
    <div dir="ltr" className="flex items-center justify-center gap-6">
      <Toggle
        toggle={audio.toggle}
        enabled={audio.enabled}
        error={audio.error}
        icon="microphone"
      />

      <Toggle
        toggle={video.toggle}
        enabled={video.enabled}
        error={video.error}
        icon="camera"
      />

      <Button
        type="error"
        size="large"
        variant="primary"
        startIcon={<CallIncoming className="icon" />}
        onClick={leave}
      />
    </div>
  );
};

export default Controllers;
