import { router } from "@/lib/routes";
import { IPlan } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { LocalId } from "@litespace/ui/locales";
import { PlanCard } from "@litespace/ui/PlanCard";
import { Tabs } from "@litespace/ui/Tabs";
import { price } from "@litespace/utils";
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

      <div className="flex flex-col items-center md:grid md:grid-cols-2 xl:grid-cols-3 justify-items-center gap-4 lg:gap-6">
        {sortedPlans.map((plan, idx) => {
          const discount = () => {
            if (period === "month") return plan.monthDiscount;
            if (period === "quarter") return plan.quarterDiscount;
            return plan.yearDiscount;
          };

          return (
            <PlanCard
              key={idx}
              period={period}
              title={intl(titles.current[idx])}
              description={intl(description.current[idx][0])}
              features={description.current[idx].slice(1).map((f) => intl(f))}
              discount={discount()}
              monthlyPrice={price.unscale(plan.baseMonthlyPrice)}
              weeklyMinutes={plan.weeklyMinutes}
              subscriptionLink={router.web({
                route: Web.Checkout,
                planId: plan.id,
                period,
              })}
              mostCommon={idx === MOST_COMMON_PLAN_INDEX}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Selector;
