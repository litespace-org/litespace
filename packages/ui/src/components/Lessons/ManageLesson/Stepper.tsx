import { useFormatMessage } from "@/hooks";
import React, { useMemo } from "react";
import Check from "@litespace/assets/Check2";
import { Typography } from "@/components/Typography";
import { Step } from "@/components/Lessons/ManageLesson/types";
import cn from "classnames";

export const Stepper: React.FC<{ step: Step }> = ({ step }) => {
  const intl = useFormatMessage();
  const steps = useMemo(
    (): Array<{ index: number; label: string; step: Step }> => [
      {
        index: 1,
        label: intl("book-lesson.steps.date-selection"),
        step: "date-selection",
      },
      {
        index: 2,
        label: intl("book-lesson.steps.duration-selection"),
        step: "duration-selection",
      },
      {
        index: 3,
        label: intl("book-lesson.steps.time-selection"),
        step: "time-selection",
      },
      {
        index: 4,
        label: intl("book-lesson.steps.confirmation"),
        step: "confirmation",
      },
    ],
    [intl]
  );

  const stepIndex = useMemo(
    () => steps.find((option) => option.step === step)?.index || -1,
    [step, steps]
  );

  return (
    <div className="flex flex-row justify-center gap-4 md:gap-6">
      {steps.map(({ index, label }) => {
        const isCurrent = index === stepIndex;
        const isBefore = index < stepIndex;
        const isAfter = index > stepIndex;

        return (
          <div
            key={index}
            className="flex flex-col w-min gap-[3px] md:gap-2 flex-1"
          >
            <div className="flex flex-row gap-1 md:gap-4 items-center">
              <div
                className={cn(
                  "w-5 h-5 md:w-7 md:h-7 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0",
                  {
                    "bg-brand-700": isCurrent || isBefore,
                    "bg-natural-400": isAfter,
                  }
                )}
              >
                {isCurrent || isAfter ? (
                  <Typography
                    tag="span"
                    className="text-natural-50 text-body font-medium"
                  >
                    {index}
                  </Typography>
                ) : (
                  <Check />
                )}
              </div>
              <div className="h-[2px] w-full md:w-[83px] bg-natural-400">
                <div
                  className={cn("h-full", {
                    "w-2/3 bg-brand-700": isCurrent,
                    "w-full bg-brand-700": isBefore,
                    "opacity-0": isAfter,
                  })}
                />
              </div>
            </div>
            <Typography
              tag="span"
              className={cn("text-tiny md:text-start", {
                "text-brand-700": isBefore || isCurrent,
                "text-natural-400": isAfter,
              })}
            >
              {label}
            </Typography>
          </div>
        );
      })}
    </div>
  );
};
