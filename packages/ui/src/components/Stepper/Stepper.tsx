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
    <ol className="flex gap-6">
      {steps.map((step) => {
        const prev = step.value < value;
        const next = step.value > value;
        const current = step.value === value;
        return (
          <li
            key={step.value}
            className={cn(
              "flex flex-row justify-center items-center py-2 px-4 rounded-3xl text-base",
              "transition-colors duration-200",
              {
                "bg-brand-500 border hover:bg-brand/50 border-brand/30 hover:border-brand":
                  current,
                "bg-muted hover:bg-selection": prev,
                "hover:bg-surface-300": next,
              }
            )}
          >
            <Check className="me-3.5 text-foreground" />
            <span className="flex-1 inline-block truncate">{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
};

export default Stepper;
