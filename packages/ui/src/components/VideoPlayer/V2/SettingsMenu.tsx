import React, { useCallback, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Typography } from "@/components/Typography";
import cn from "classnames";
import { useFormatMessage } from "@/hooks";
import RightArrowHead from "@litespace/assets/RightArrowHead";
import LeftArrowHead from "@litespace/assets/LeftArrowHead";
import PlaybackSpeed from "@litespace/assets/PlaybackSpeed";
import Check3 from "@litespace/assets/Check3";

const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;

enum MenuSteps {
  Speed,
  Main,
}

export const SettingsMenu: React.FC<{
  children: React.ReactNode;
  playbackSpeed: number;
  setPlaybackSpeed: (rate: number) => void;
}> = ({ children, playbackSpeed = 1, setPlaybackSpeed }) => {
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
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={cn("focus:tw-outline-none", !children && "tw-p-2")}
        type="button"
      >
        {children}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="top"
          align="start"
          className={cn(
            "tw-shadow-lesson-event-card tw-rounded-lg tw-bg-natural-50 "
          )}
        >
          <div
            className={cn(
              "tw-flex tw-flex-col tw-gap-1 tw-z-[5] tw-w-[200px] tw-p-1"
            )}
          >
            {step === MenuSteps.Main ? (
              <button
                onClick={() => handleStepChange(MenuSteps.Speed)}
                type="button"
                className="tw-flex tw-items-center tw-gap-1 tw-justify-center tw-p-1"
              >
                <div className="tw-grow tw-flex tw-items-center tw-gap-1">
                  <PlaybackSpeed />
                  <Typography
                    tag="label"
                    className={cn(
                      "tw-font-semibold tw-text-tiny",
                      "tw-text-natural-800 tw-font-semibold tw-max-w-24",
                    )}
                  >
                    {intl("media.video.playback-speed")}
                  </Typography>
                </div>
                <Typography
                  tag="label"
                  className="tw-font-semibold tw-text-natural-800 tw-text-tiny"
                >
                  {playbackSpeed === 1
                    ? intl("media.video.playback-speed.normal")
                    : playbackSpeed}
                </Typography>
                <span className="tw-w-4 tw-h-4 tw-flex tw-items-center tw-justify-center tw-cursor-pointer">
                  <LeftArrowHead />
                </span>
              </button>
            ) : (
              <>
                <div className="tw-flex tw-items-center tw-justify-center tw-border-b tw-p-1 tw-border-natural-800">
                  <div className="tw-grow tw-flex tw-items-center tw-gap-1">
                    <button
                      onClick={() => handleStepChange(MenuSteps.Main)}
                      className="tw-w-4 tw-h-4 tw-flex tw-items-center tw-cursor-pointer"
                    >
                      <RightArrowHead />
                    </button>
                    <PlaybackSpeed />
                    <Typography
                      tag="label"
                      className={cn(
                        "tw-text-natural-800 tw-font-semibold tw-max-w-24 tw-font-semibold tw-text-tiny"
                      )}
                    >
                      {intl("media.video.playback-speed")}
                    </Typography>
                  </div>
                  <Typography
                    tag="label"
                    className="tw-font-semibold tw-text-natural-800 tw-text-tiny"
                  >
                    {playbackSpeed === 1
                      ? intl("media.video.playback-speed.normal")
                      : playbackSpeed}
                  </Typography>
                </div>
                <div className="tw-grid tw-gap-1 tw-justify-stretch">
                  {playbackSpeeds.map((speed) => (
                    <button
                      onClick={() => handleSpeedChange(speed)}
                      key={speed}
                      className={cn(
                        "tw-rounded-lg tw-p-1 tw-cursor-pointer tw-duration-300 tw-text-right tw-flex tw-items-center tw-gap-1",
                        speed === playbackSpeed
                          ? "tw-bg-brand-700 tw-text-natural-50 hover:tw-bg-brand-700"
                          : "tw-text-natural-600 hover:tw-bg-natural-100 "
                      )}
                    >
                      {speed === playbackSpeed ? (
                        <div className="tw-w-4 tw-h-4 tw-flex tw-items-center tw-justify-center">
                          {" "}
                          <Check3 />
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
