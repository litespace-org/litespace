"use client";

import React, { useMemo } from "react";
import cn from "classnames";
import { IPlan, Void } from "@litespace/types";
import { useFormatMessage } from "@/hooks/intl";
import { RadioButton } from "@litespace/ui/RadioButton";
import { Typography } from "@litespace/ui/Typography";
import { formatNumber } from "@litespace/ui/utils";
import {
  MINUTES_IN_HOUR,
  PLAN_PERIOD_LITERAL_TO_MONTH_COUNT,
  PLAN_PERIOD_LITERAL_TO_WEEK_COUNT,
} from "@litespace/utils";

function getHoursLabel(value: number) {
  if (value <= 10 && value >= 3) return "plan/labels/hours";
  return "plan/labels/hour";
}

const Row: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => {
  return (
    <div className="flex justify-between items-center">
      <Typography
        tag="h6"
        className="text-tiny lg:text-caption font-normal text-natural-950"
      >
        {label}
      </Typography>
      <div>{children}</div>
    </div>
  );
};

const Divider: React.FC = () => {
  return <div className="w-full border-b border-natural-100 my-2" />;
};

const PlanDetails: React.FC<{
  totalHours: number;
  monthlyPrice: number;
  totalPriceAfterDiscount: number;
  totalPriceBeforeDiscount: number;
  discount: number;
}> = ({
  totalHours,
  monthlyPrice,
  totalPriceAfterDiscount,
  totalPriceBeforeDiscount,
  discount,
}) => {
  const intl = useFormatMessage();
  return (
    <div>
      <Row label={intl("plan/total-hours")}>
        <Typography
          tag="p"
          className="text-tiny lg:text-caption text-natural-950 font-normal"
        >
          {intl(getHoursLabel(totalHours), { value: formatNumber(totalHours) })}
        </Typography>
      </Row>
      <Divider />
      <Row label={intl("plan/monthly-price")}>
        <Typography
          tag="p"
          className="text-tiny lg:text-caption text-natural-950 font-normal"
        >
          {intl("labels/currency/egp", { value: formatNumber(monthlyPrice) })}
        </Typography>
      </Row>
      <Divider />
      <Row label={intl("plan/total-price")}>
        <div className="flex flex-row items-center">
          <Typography
            tag="p"
            className="text-tiny lg:text-caption text-natural-950 font-bold"
          >
            {intl("labels/currency/egp", {
              value: formatNumber(totalPriceAfterDiscount, {
                maximumFractionDigits: 2,
              }),
            })}
          </Typography>
          {discount ? (
            <>
              &nbsp;
              <Typography tag="span" className="text-tiny text-natural-500">
                {intl.rich("plan/instead-of", {
                  value: () => (
                    <Typography
                      tag="span"
                      className={cn(
                        "text-tiny text-destructive-600 relative",
                        'after:content-[""] after:absolute after:top-1/2 after:right-0 after:left-0 after:h-[1px] after:bg-destructive-600'
                      )}
                    >
                      {intl("labels/currency/egp", {
                        value: formatNumber(totalPriceBeforeDiscount, {
                          maximumFractionDigits: 2,
                        }),
                      })}
                    </Typography>
                  ),
                })}
              </Typography>
            </>
          ) : null}
        </div>
      </Row>
    </div>
  );
};

export const PlanPeriod: React.FC<{
  period: IPlan.PeriodLiteral;
  select: Void;
  open: boolean;
  monthlyPrice: number;
  discount: number;
  weeklyMinutes: number;
}> = ({ period, select, open, discount, weeklyMinutes, monthlyPrice }) => {
  const intl = useFormatMessage();

  const totalHours = useMemo(() => {
    const weeks = PLAN_PERIOD_LITERAL_TO_WEEK_COUNT[period];
    return (weeks * weeklyMinutes) / MINUTES_IN_HOUR;
  }, [period, weeklyMinutes]);

  const totalPriceBeforeDiscount = useMemo(() => {
    const months = PLAN_PERIOD_LITERAL_TO_MONTH_COUNT[period];
    return monthlyPrice * months;
  }, [monthlyPrice, period]);

  const totalPriceAfterDiscount = useMemo(() => {
    return (totalPriceBeforeDiscount * (100 - discount)) / 100;
  }, [discount, totalPriceBeforeDiscount]);

  return (
    <div
      onClick={() => {
        if (!open) select();
      }}
      className={cn(
        "border border-natural-100 bg-natural-50 rounded-2xl p-4",
        !open && "cursor-pointer"
      )}
    >
      <div
        className={cn("flex flex-col gap-1", {
          "pb-2 mb-2 border-b border-natural-100": open,
        })}
      >
        <div
          className={cn("flex w-full", {
            "flex-col lg:flex-row gap-2 lg:gap-6 items-start lg:items-center":
              open,
            "flex-col gap-[10px]":
              (!open && period !== "month") || (!open && discount),
          })}
        >
          <div className="flex flex-row items-center gap-1">
            <RadioButton name="plan-period" onChange={select} checked={open} />
            <Typography
              tag="h6"
              className="text-body text-natural-950 font-bold"
            >
              {period === "month" ? intl("plan/labels/monthly/v2") : null}
              {period === "quarter" ? intl("plan/labels/quarter/v2") : null}
              {period === "year" ? intl("plan/labels/annual/v2") : null}
            </Typography>
          </div>

          <div className="flex gap-2">
            {discount ? (
              <Typography
                tag="span"
                className="border border-brand-600 bg-brand-50 rounded-[4px] px-2 py-[2px] text-tiny font-normal text-brand-600"
              >
                {intl("plan/labels/discount", {
                  value: formatNumber(discount, {
                    maximumFractionDigits: 2,
                  }),
                })}
              </Typography>
            ) : null}

            {/* <Installment period={period} /> */}
          </div>
        </div>
        {open ? (
          <Typography
            tag="span"
            className="text-tiny text-natural-800 font-semibold"
          >
            {period === "month" ? intl("plan/desc/monthly") : null}
            {period === "quarter" ? intl("plan/desc/quarter") : null}
            {period === "year" ? intl("plan/desc/annual") : null}
          </Typography>
        ) : null}
      </div>

      {open ? (
        <PlanDetails
          discount={discount}
          totalHours={totalHours}
          monthlyPrice={monthlyPrice}
          totalPriceAfterDiscount={totalPriceAfterDiscount}
          totalPriceBeforeDiscount={totalPriceBeforeDiscount}
        />
      ) : null}
    </div>
  );
};

// const Installment: React.FC<{ period: IPlan.PeriodLiteral }> = ({ period }) => {
//   const intl = useFormatMessage();

//   if (period === "month") return null;

//   return (
//     <Typography
//       tag="span"
//       className="border border-brand-600 bg-brand-50 rounded-[4px] px-2 py-[2px] text-tiny font-normal text-brand-600"
//     >
//       {period === "quarter" ? intl("plan.labels.installment-twice") : null}
//       {period === "year" ? intl("plan.labels.installment-four-times") : null}
//     </Typography>
//   );
// };

export default PlanPeriod;
