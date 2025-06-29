"use client";

import React, { useMemo, useState } from "react";
import { RadioButton } from "@litespace/ui/RadioButton";
import { Typography } from "@litespace/ui/Typography";
import cn from "classnames";
import { formatDuration } from "@litespace/ui/utils";
import {
  MILLISECONDS_IN_SECOND,
  percentage,
  price,
  SECONDS_IN_MINUTE,
} from "@litespace/utils";
import { PaymentMethods } from "@/components/Plans";
import { IPlan } from "@litespace/types";
import { PlanPeriod } from "@/components/Plans";
import { first, orderBy } from "lodash";
import Link from "next/link";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";
import { Button } from "@litespace/ui/Button";
import { useFormatMessage } from "@/hooks/intl";

type Plan = Pick<
  IPlan.Self,
  | "id"
  | "weeklyMinutes"
  | "baseMonthlyPrice"
  | "monthDiscount"
  | "quarterDiscount"
  | "yearDiscount"
>;

const PlansPanel: React.FC<{
  plans: Plan[];
  planId: number;
  setPlanId(planId: number): void;
}> = ({ plans, planId, setPlanId }) => {
  const intl = useFormatMessage();
  return (
    <div className="w-full md:w-fit lg:w-[276px] flex flex-col gap-4">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={cn(
            "bg-[#FCFCFC] border border-natural-100 rounded-2xl shadow-plan-card-v2 p-4",
            "flex flex-row gap-1 lg:gap-2 items-center cursor-pointer"
          )}
          onClick={() => setPlanId(plan.id)}
        >
          <RadioButton
            name="planId"
            id={plan.id.toString()}
            onChange={() => setPlanId(plan.id)}
            checked={plan.id === planId}
            className="gap-2"
          />

          <Typography
            tag="label"
            className="text-tiny lg:text-caption font-bold text-natural-950 cursor-pointer"
            htmlFor={plan.id.toString()}
          >
            {intl("plan/labels/per-week", {
              value: formatDuration(
                plan.weeklyMinutes * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND
              ),
            })}
          </Typography>
        </div>
      ))}
    </div>
  );
};

export const Selector: React.FC<{
  plans: IPlan.FindApiResponse["list"];
}> = ({ plans }) => {
  const intl = useFormatMessage();

  const ordered = useMemo(() => {
    return orderBy(plans, (plan) => plan.weeklyMinutes, "asc");
  }, [plans]);

  const defaultPlanId = useMemo(() => {
    return first(ordered)?.id || 0;
  }, [ordered]);

  const [planId, setPlanId] = useState<number>(defaultPlanId);
  const [period, setPeriod] = useState<IPlan.PeriodLiteral>("month");

  const plan = useMemo(
    () => ordered.find((plan) => plan.id === planId),
    [ordered, planId]
  );

  if (!plan) return null;

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row gap-4 lg:gap-6 max-w-[400px] md:max-w-none lg:max-w-screen-xl",
        "mx-auto px-4 xs:px-0 md:px-8 pb-16 md:pb-[105px] lg:pb-40"
      )}
    >
      <PlansPanel
        plans={ordered}
        planId={planId}
        setPlanId={(planId) => setPlanId(planId)}
      />

      <Typography
        tag="h5"
        className="text-body font-bold text-natural-950 md:hidden"
      >
        {intl("plan/period/select")}
      </Typography>

      <div className="flex-1">
        <div className="flex flex-col gap-4">
          <PlanPeriod
            period="month"
            open={period === "month"}
            select={() => setPeriod("month")}
            discount={percentage.unscale(plan.monthDiscount)}
            monthlyPrice={price.unscale(plan.baseMonthlyPrice)}
            weeklyMinutes={plan.weeklyMinutes}
          />
          <PlanPeriod
            period="quarter"
            open={period === "quarter"}
            select={() => setPeriod("quarter")}
            discount={percentage.unscale(plan.quarterDiscount)}
            monthlyPrice={price.unscale(plan.baseMonthlyPrice)}
            weeklyMinutes={plan.weeklyMinutes}
          />
          <PlanPeriod
            period="year"
            open={period === "year"}
            select={() => setPeriod("year")}
            discount={percentage.unscale(plan.yearDiscount)}
            monthlyPrice={price.unscale(plan.baseMonthlyPrice)}
            weeklyMinutes={plan.weeklyMinutes}
          />
        </div>

        <Link
          href={router.web({
            route: Web.Register,
            role: "student",
            query: { redirect: Web.Plans },
            full: true,
          })}
          tabIndex={-1}
        >
          <Button htmlType="button" size="large" className="mt-4 w-full">
            <Typography tag="span" className="text">
              {intl("plan/subscribe-now")}
            </Typography>
          </Button>
        </Link>
      </div>

      <PaymentMethods />
    </div>
  );
};

export default Selector;
