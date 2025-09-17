import { Void } from "@litespace/types";
import { Button, ButtonType, ButtonVariant } from "@litespace/ui/Button";
import { Menu } from "@litespace/ui/Menu";
import React, { useMemo, useState } from "react";
import CallIncoming from "@litespace/assets/CallIncoming";
import Video from "@litespace/assets/Video";
import Grid from "@litespace/assets/Grid";
import VideoSlash from "@litespace/assets/VideoSlash";
import CastScreen from "@litespace/assets/CastScreen";
import Chat from "@litespace/assets/Chat";
import Microphone from "@litespace/assets/Microphone";
import MicrophoneSlash from "@litespace/assets/MicrophoneSlash";
import ArrowDown from "@litespace/assets/ArrowDown";
import Error from "@litespace/assets/Error";
import cn from "classnames";
import { useRender } from "@litespace/headless/common";
import { useMediaCall } from "@/hooks/mediaCall";
import { Device } from "@/modules/MediaCall/types";

type Icon = "microphone" | "camera" | "blur" | "screen" | "chat";

export type Controller = {
  toggle: Void;
  enabled: boolean;
  error?: boolean;
  loading?: boolean;
  disabled?: boolean;
  indicator?: boolean;
  menu?: Array<{
    label: string;
    action: Void;
  }>;
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
  blur: { on: Grid, off: Grid },
  screen: { on: CastScreen, off: CastScreen },
  chat: { on: Chat, off: Chat },
};

export const Toggle: React.FC<Controller & { icon: Icon }> = ({
  toggle,
  icon,
  enabled,
  loading,
  error = false,
  indicator,
  menu,
}) => {
  const menuRender = useRender();

  const icons = useMemo(() => ICON_MAP[icon], [icon]);
  const { varient, type } = useMemo((): {
    varient: ButtonVariant;
    type: ButtonType;
  } => {
    if (error) return { type: "natural", varient: "primary" };
    if (enabled) return { type: "natural", varient: "bold" };
    return { type: "natural", varient: "primary" };
  }, [enabled, error]);

  return (
    <div className="relative">
      <div
        className={cn("relative flex", {
          "w-[88px] border border-1 border-button-natural-default rounded-lg":
            menu,
        })}
      >
        <Button
          className={cn({ "border-y-0 border-l-0": menu })}
          type={type}
          startIcon={
            enabled ? (
              <icons.on className="icon w-4 h-4" />
            ) : (
              <icons.off className="icon w-4 h-4" />
            )
          }
          variant={varient}
          onClick={toggle}
          size="large"
          loading={loading}
          disabled={loading}
        />

        {menu ? (
          <div className="flex items-center justify-center w-full">
            <Menu
              open={menuRender.open}
              setOpen={menuRender.toggle}
              actions={
                menu?.map((item) => ({
                  label: item.label || "empty",
                  onClick: item.action,
                })) || []
              }
            >
              <ArrowDown className="w-4 h-4 stroke-width-2 rotate-180" />
            </Menu>
          </div>
        ) : null}
      </div>

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

      {indicator ? (
        <>
          <span className="absolute h-2 w-2 top-[-2px] left-[-2px] animate-ping rounded-full bg-brand-700 opacity-75"></span>
          <span className="absolute h-2 w-2 top-[-2px] left-[-2px] rounded-full bg-brand-700"></span>
        </>
      ) : null}
    </div>
  );
};

const Controllers: React.FC<{
  audio: Controller;
  video: Controller;
  blur?: Controller;
  chat?: {
    toggle: Void;
    enabled: boolean;
    indicator?: boolean;
  };
  leave?: Void;
}> = ({ audio, video, blur, leave, chat }) => {
  const call = useMediaCall();

  const [devices, setDevices] = useState<Device[]>([]);

  const microphones = useMemo(
    () => devices.filter((d) => d.type === "mic") || [],
    [devices]
  );
  const cameras = useMemo(
    () => devices.filter((d) => d.type === "cam") || [],
    [devices]
  );

  return (
    <div
      dir="ltr"
      className="flex items-center justify-center gap-6"
      onClick={() => setDevices(call.manager?.media.getDevices() || [])}
    >
      <Toggle
        toggle={() => {
          setDevices(call.manager?.media.getDevices() || []);
          audio.toggle();
        }}
        enabled={audio.enabled}
        error={audio.error}
        loading={audio.loading}
        disabled={audio.disabled}
        icon="microphone"
        menu={microphones.map((m) => ({
          label: m.name,
          action: () => call.manager?.publishTrackFromDevice(m.id, m.type),
        }))}
      />

      <Toggle
        toggle={() => {
          setDevices(call.manager?.media.getDevices() || []);
          video.toggle();
        }}
        enabled={video.enabled}
        error={video.error}
        loading={video.loading}
        disabled={video.disabled}
        icon="camera"
        menu={cameras.map((m) => ({
          label: m.name,
          action: () => call.manager?.publishTrackFromDevice(m.id, m.type),
        }))}
      />

      {chat ? (
        <Toggle
          toggle={chat.toggle}
          enabled={chat.enabled}
          icon="chat"
          indicator={chat.indicator && !chat.enabled}
        />
      ) : null}

      {blur ? (
        <Toggle
          toggle={blur.toggle}
          enabled={blur.enabled}
          error={blur.error}
          loading={blur.loading}
          disabled={blur.disabled}
          icon="blur"
        />
      ) : null}

      {leave ? (
        <Button
          type="error"
          size="large"
          variant="primary"
          startIcon={<CallIncoming className="icon" />}
          onClick={leave}
        />
      ) : null}
    </div>
  );
};

export default Controllers;
