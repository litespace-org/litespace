import React from "react";
import { Check } from "react-feather";
import cn from "classnames";

export const Stepper: React.FC<{
  steps: Array<{
    label: string;
    value: number;
  }>;
  value: number;
}> = ({ steps, value }) => {
  return (
    <ol className="tw-flex tw-gap-6">
      {steps.map((step) => {
        const prev = step.value < value;
        const next = step.value > value;
        const current = step.value === value;
        return (
          <li
            key={step.value}
            className={cn(
              "tw-flex tw-flex-row tw-justify-center tw-items-center tw-py-2 tw-px-4 tw-rounded-3xl tw-text-base",
              "tw-transition-colors tw-duration-200",
              {
                "tw-bg-brand-500 tw-border hover:tw-bg-brand/50 tw-border-brand/30 hover:tw-border-brand":
                  current,
                "tw-bg-muted hover:tw-bg-selection": prev,
                "hover:tw-bg-surface-300": next,
              }
            )}
          >
            <Check className="tw-me-3.5 tw-text-foreground" />
            <span className="tw-flex-1 tw-inline-block tw-truncate">
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
};
