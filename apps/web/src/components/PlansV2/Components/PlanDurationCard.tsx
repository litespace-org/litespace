import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { RadioButton } from "@litespace/ui/RadioButton";
import { Typography } from "@litespace/ui/Typography";
import { formatNumber } from "@litespace/ui/utils";
import cn from "classnames";
import React from "react";

export type PlanDuration = "month" | "quarter" | "year";

export const PlanDurationCard: React.FC<{
  duration: PlanDuration;
  isOpen: boolean;
  discount: number;
  setPlanDuration: (duration: PlanDuration) => void;
  children: React.ReactNode;
}> = ({ duration, isOpen, setPlanDuration, discount, children }) => {
  const intl = useFormatMessage();

  return (
    <div className="border border-transparent hover:border-natural-100 bg-natural-50 rounded-2xl p-4">
      <div
        className={cn("flex flex-col gap-1", {
          "pb-2 border-b border-natural-100": isOpen,
        })}
      >
        <div
          className={cn("flex", {
            "flex-row gap-6 items-center": isOpen,
            "flex-col gap-[10px]":
              (!isOpen && duration !== "month") || (!isOpen && discount),
          })}
        >
          <RadioButton
            label={
              <Typography
                tag="h6"
                className="text-body text-natural-950 font-bold"
              >
                {duration === "month" ? intl("plan.labels.monthly.v2") : null}
                {duration === "quarter" ? intl("plan.labels.quarter.v2") : null}
                {duration === "year" ? intl("plan.labels.annual.v2") : null}
              </Typography>
            }
            name="plan-category"
            onChange={() => setPlanDuration(duration)}
            className="gap-1"
          />
          <div className="flex gap-2">
            {discount ? (
              <Typography
                tag="span"
                className="border border-brand-600 bg-brand-50 rounded-[4px] px-2 py-[2px] text-tiny font-normal text-brand-600"
              >
                {intl("plan.labels.discount", {
                  value: formatNumber(discount, {
                    maximumFractionDigits: 2,
                  }),
                })}
              </Typography>
            ) : null}
            {duration !== "month" ? (
              <Typography
                tag="span"
                className="border border-brand-600 bg-brand-50 rounded-[4px] px-2 py-[2px] text-tiny font-normal text-brand-600"
              >
                {duration === "quarter"
                  ? intl("plan.labels.installment-twice")
                  : null}
                {duration === "year"
                  ? intl("plan.labels.installment-four-times")
                  : null}
              </Typography>
            ) : null}
          </div>
        </div>
        {isOpen ? (
          <Typography
            tag="span"
            className="text-tiny text-natural-800 font-semibold"
          >
            {duration === "month" ? intl("plan.desc.monthly") : null}
            {duration === "quarter" ? intl("plan.desc.quarter") : null}
            {duration === "year" ? intl("plan.desc.annual") : null}
          </Typography>
        ) : null}
      </div>

      {isOpen ? children : null}
    </div>
  );
};

export const Row: React.FC<{
  label: string;
  isLast?: boolean;
  className?: string;
  children: React.ReactNode;
}> = ({ label, isLast = false, className, children }) => {
  return (
    <div
      className={cn(
        "flex justify-between items-center",
        "border-natural-100",
        isLast ? "pt-2" : "py-2 border-b"
      )}
    >
      <Typography
        tag="h6"
        className="text-caption font-normal text-natural-950"
      >
        {label}
      </Typography>
      <Typography
        tag="h6"
        className={cn("text-caption text-natural-950", className)}
      >
        {children}
      </Typography>
    </div>
  );
};
