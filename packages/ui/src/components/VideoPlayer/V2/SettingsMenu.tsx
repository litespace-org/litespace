import { Typography } from "@/components/Typography";
import { useFormatMessage } from "@/hooks";
import Check3 from "@litespace/assets/Check3";
import LeftArrowHead from "@litespace/assets/LeftArrowHead";
import PlaybackSpeed from "@litespace/assets/PlaybackSpeed";
import RightArrowHead from "@litespace/assets/RightArrowHead";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import cn from "classnames";
import React, { useCallback, useState } from "react";

const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;

enum MenuSteps {
  Speed,
  Main,
}

export const SettingsMenu: React.FC<{
  children: React.ReactNode;
  playbackSpeed: number;
  container?: HTMLElement;
  toggleBar: (open: boolean) => void;
  setPlaybackSpeed: (rate: number) => void;
}> = ({
  children,
  container,
  playbackSpeed = 1,
  toggleBar,
  setPlaybackSpeed,
}) => {
  const intl = useFormatMessage();
  const [step, setStep] = useState<MenuSteps>(MenuSteps.Main);

  const handleStepChange = useCallback((step: MenuSteps) => {
    setStep(step);
  }, []);

  const handleSpeedChange = useCallback(
    (speed: number) => {
      setPlaybackSpeed(speed);
      handleStepChange(MenuSteps.Main);
    },
    [setPlaybackSpeed, handleStepChange]
  );

  return (
    <DropdownMenu.Root onOpenChange={toggleBar}>
      <DropdownMenu.Trigger
        className={cn("focus:outline-none", !children && "p-2")}
        type="button"
      >
        {children}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal container={container}>
        <DropdownMenu.Content
          asChild
          side="top"
          align="start"
          className="shadow-lesson-event-card rounded-lg bg-natural-50 z-video-player-settings-menu"
        >
          <div className={cn("flex flex-col gap-1 z-[5] w-[200px] p-1")}>
            {step === MenuSteps.Main ? (
              <button
                onClick={() => handleStepChange(MenuSteps.Speed)}
                type="button"
                className="flex items-center gap-1 justify-center p-1"
              >
                <div className="grow flex items-center gap-1">
                  <PlaybackSpeed />
                  <Typography
                    tag="span"
                    className={cn(
                      "font-semibold text-tiny",
                      "text-natural-800 font-semibold max-w-24"
                    )}
                  >
                    {intl("media.video.playback-speed")}
                  </Typography>
                </div>
                <Typography
                  tag="span"
                  className="font-semibold text-natural-800 text-tiny"
                >
                  {playbackSpeed === 1
                    ? intl("media.video.playback-speed.normal")
                    : playbackSpeed}
                </Typography>
                <span className="w-4 h-4 flex items-center justify-center cursor-pointer">
                  <LeftArrowHead />
                </span>
              </button>
            ) : (
              <>
                <div className="flex items-center justify-center border-b p-1 border-natural-800">
                  <div className="grow flex items-center gap-1">
                    <button
                      onClick={() => handleStepChange(MenuSteps.Main)}
                      className="w-4 h-4 flex items-center cursor-pointer"
                    >
                      <RightArrowHead />
                    </button>
                    <PlaybackSpeed />
                    <Typography
                      tag="span"
                      className={cn(
                        "text-natural-800 max-w-24 font-semibold text-tiny"
                      )}
                    >
                      {intl("media.video.playback-speed")}
                    </Typography>
                  </div>
                  <Typography
                    tag="span"
                    className="font-semibold text-natural-800 text-tiny"
                  >
                    {playbackSpeed === 1
                      ? intl("media.video.playback-speed.normal")
                      : playbackSpeed}
                  </Typography>
                </div>
                <div className="grid gap-1 justify-stretch">
                  {playbackSpeeds.map((speed) => (
                    <button
                      onClick={() => handleSpeedChange(speed)}
                      key={speed}
                      className={cn(
                        "rounded-lg p-1 cursor-pointer duration-300 text-right flex items-center gap-1",
                        speed === playbackSpeed
                          ? "bg-brand-700 text-natural-50 hover:bg-brand-700"
                          : "text-natural-600 hover:bg-natural-100 "
                      )}
                    >
                      {speed === playbackSpeed ? (
                        <div className="w-4 h-4 flex items-center justify-center">
                          {" "}
                          <Check3 className="w-2 h-2 [&>*]:fill-natural-50" />
                        </div>
                      ) : null}
                      {speed === 1
                        ? intl("media.video.playback-speed.normal")
                        : speed}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default SettingsMenu;
