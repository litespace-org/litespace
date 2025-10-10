import { track } from "@/lib/ga";
import { router } from "@/lib/routes";
import { IPlan } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { LocalId } from "@litespace/ui/locales";
import { PlanCard } from "@litespace/ui/PlanCard";
import { Tabs } from "@litespace/ui/Tabs";
import { nstr, percentage, price } from "@litespace/utils";
import { Web } from "@litespace/utils/routes";
import React, { useMemo, useRef, useState } from "react";

const MOST_COMMON_PLAN_INDEX = 1;

const PlansPanel: React.FC<{
  period: IPlan.PeriodLiteral;
  setPeriod(period: IPlan.PeriodLiteral): void;
}> = ({ period, setPeriod }) => {
  const intl = useFormatMessage();

  return (
    <div className="w-full flex justify-center">
      <div>
        <Tabs
          tab={period}
          setTab={(tab) => setPeriod(tab as IPlan.PeriodLiteral)}
          tabs={[
            { id: "month", label: intl(`plan.labels-month`) },
            { id: "quarter", label: intl("plan.labels-quarter") },
            { id: "year", label: intl("plan.labels-year") },
          ]}
        />
      </div>
    </div>
  );
};

export const Selector: React.FC<{
  plans: IPlan.FindApiResponse["list"];
}> = ({ plans }) => {
  const intl = useFormatMessage();

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => a.baseMonthlyPrice - b.baseMonthlyPrice);
  }, [plans]);

  const [period, setPeriod] = useState<IPlan.PeriodLiteral>("month");
  const titles = useRef<LocalId[]>([
    "plans.card.beginning.title",
    "plans.card.advance.title",
    "plans.card.professional.title",
  ]);

  const description = useRef<LocalId[][]>([
    [
      "plans.card.beginning.description",
      "plans.card.beginning.description-1",
      "plans.card.beginning.description-2",
    ],
    [
      "plans.card.advance.description",
      "plans.card.advance.description-1",
      "plans.card.advance.description-2",
    ],
    [
      "plans.card.professional.description",
      "plans.card.professional.description-1",
      "plans.card.professional.description-2",
    ],
  ]);

  return (
    <div className="flex flex-col gap-6 md:gap-[81px] max-w-screen-xl mx-auto">
      <PlansPanel period={period} setPeriod={setPeriod} />

      <div className="flex flex-col items-center md:flex-row justify-items-center justify-center gap-4 lg:gap-6">
        {sortedPlans.map((plan, idx) => {
          const index =
            idx < description.current.length
              ? idx
              : description.current.length - 1;

          const getDiscount = () => {
            if (period === "month") return plan.monthDiscount;
            if (period === "quarter") return plan.quarterDiscount;
            return plan.yearDiscount;
          };

          return (
            <PlanCard
              key={idx}
              period={period}
              title={intl(titles.current[index])}
              description={intl(description.current[index][0], {
                minutes: plan.weeklyMinutes,
              })}
              features={description.current[index].slice(1).map((f) => intl(f))}
              discount={percentage.unscale(getDiscount())}
              monthlyPrice={price.unscale(plan.baseMonthlyPrice)}
              weeklyMinutes={plan.weeklyMinutes}
              onSelect={() => {
                track("select_plan", "plans");
              }}
              subscriptionLink={router.web({
                route: Web.Checkout,
                query: {
                  type: "paid-plan",
                  planId: nstr(plan.id),
                  period,
                },
              })}
              mostCommon={index === MOST_COMMON_PLAN_INDEX}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Selector;
