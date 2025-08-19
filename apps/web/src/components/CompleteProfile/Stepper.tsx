import React, { useMemo } from "react";
import Check from "@litespace/assets/Check2";
import cn from "classnames";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";

export type Step = "main-info" | "bio" | "fav-topics";

type Position = {
  isCurrent: boolean;
  isBefore: boolean;
  isAfter: boolean;
};

export const Stepper: React.FC<{ step: Step }> = ({ step }) => {
  const intl = useFormatMessage();
  const steps = useMemo(
    (): Array<{ index: number; label: string; step: Step }> => [
      {
        index: 1,
        label: intl("complete-profile.stepper.main-info"),
        step: "main-info",
      },
      {
        index: 2,
        label: intl("complete-profile.stepper.bio"),
        step: "bio",
      },
      {
        index: 3,
        label: intl("complete-profile.stepper.favourite-topics"),
        step: "fav-topics",
      },
    ],
    [intl]
  );

  const stepIndex = useMemo(
    () => steps.find((option) => option.step === step)?.index || -1,
    [step, steps]
  );

  return (
    <div className="w-full max-w-[324px] flex flex-row justify-center gap-4 md:gap-6">
      {steps.map(({ index, label }) => {
        const isCurrent = index === stepIndex;
        const isBefore = index < stepIndex;
        const isAfter = index > stepIndex;

        return (
          <TimeSlot
            key={index}
            position={{ isCurrent, isAfter, isBefore }}
            index={index}
            label={label}
          />
        );
      })}
    </div>
  );
};

const TimeSlot: React.FC<{
  index: number;
  position: Position;
  label: string;
}> = ({ index, position, label }) => {
  return (
    <div className="flex flex-col w-min gap-[3px] md:gap-2 flex-1">
      <div className="flex flex-row gap-1 md:gap-2 items-center">
        <Icon index={index} position={position} />
        <div className="h-[2px] w-[60px] bg-natural-400">
          <div
            className={cn("h-full w-full", {
              "bg-brand-500": position.isCurrent || position.isBefore,
              "opacity-0": position.isAfter,
            })}
          />
        </div>
      </div>
      <Typography
        tag="span"
        className={cn("text-tiny md:text-start", {
          "text-brand-500": position.isBefore || position.isCurrent,
          "text-natural-400": position.isAfter,
        })}
      >
        {label}
      </Typography>
    </div>
  );
};

const Icon: React.FC<{
  index: number;
  position: Position;
}> = ({ index, position }) => {
  return (
    <div
      className={cn(
        "w-5 h-5 md:w-6 md:h-6 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0",
        {
          "bg-brand-500": position.isCurrent || position.isBefore,
          "bg-natural-400": position.isAfter,
        }
      )}
    >
      {position.isCurrent || position.isAfter ? (
        <Typography
          tag="span"
          className="text-natural-50 text-body font-medium"
        >
          {index}
        </Typography>
      ) : (
        <Check className="[&>*]:stroke-natural-50" />
      )}
    </div>
  );
};

export default Stepper;
