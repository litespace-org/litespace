import { useFormatMessage } from "@/hooks";
import React, { useMemo } from "react";
import Check from "@litespace/assets/Check2";
import { Typography } from "@/components/Typography";
import { Step } from "@/components/Lessons/BookLesson/types";
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
    <div className="tw-flex tw-flex-row tw-gap-6">
      {steps.map(({ index, label }) => {
        const isCurrent = index === stepIndex;
        const isBefore = index < stepIndex;
        const isAfter = index > stepIndex;

        return (
          <div key={index} className="tw-flex tw-flex-col">
            <div className="tw-flex tw-flex-row tw-gap-4 tw-items-center tw-mb-2">
              <div
                className={cn(
                  "tw-w-7 tw-h-7 tw-rounded-full tw-overflow-hidden tw-flex tw-items-center tw-justify-center",
                  {
                    "tw-bg-brand-700": isCurrent || isBefore,
                    "tw-bg-natural-400": isAfter,
                  }
                )}
              >
                {isCurrent || isAfter ? (
                  <Typography
                    element="body"
                    weight="medium"
                    className="tw-text-natural-50"
                  >
                    {index}
                  </Typography>
                ) : (
                  <Check />
                )}
              </div>
              <div className="tw-h-[2px] tw-w-20 tw-bg-natural-400">
                <div
                  className={cn("tw-h-full", {
                    "tw-w-2/3 tw-bg-brand-700": isCurrent,
                    "tw-w-full tw-bg-brand-700": isBefore,
                    "tw-opacity-0": isAfter,
                  })}
                />
              </div>
            </div>
            <Typography
              element="tiny-text"
              className={cn({
                "tw-text-brand-700": isBefore || isCurrent,
                "tw-text-natural-400": isAfter,
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
