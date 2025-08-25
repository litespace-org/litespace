import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { percentage, price } from "@litespace/utils";
import React, { useMemo, useRef, useState } from "react";
import { router } from "@/lib/routes";
import { IPlan } from "@litespace/types";
import { PlanCard } from "@litespace/ui/PlanCard";
import { Tabs } from "@litespace/ui/Tabs";
import { Web } from "@litespace/utils/routes";
import { Link } from "react-router-dom";
import { LocalId } from "@litespace/ui/locales";
import { Button } from "@litespace/ui/Button";
import { Typography } from "@litespace/ui/Typography";
import cn from "classnames";

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
    <div className="flex flex-col gap-[81px] max-w-screen-xl mx-auto">
      <PlansPanel period={period} setPeriod={setPeriod} />

      <div className="grid grid-cols-1 grid-flow-row md:grid-cols-3 gap-6">
        {sortedPlans.map((plan, i) => {
          const featuredLayoutIndex = 1;
          const Layout = i === featuredLayoutIndex;

          return (
            <div key={i} className="relative flex flex-col items-center">
              {Layout && (
                <Typography
                  tag="span"
                  className={cn(
                    "text-caption text-center text-natural-100",
                    "absolute -top-10 z-10 left-1/2 -translate-x-1/2 overflow-visible",
                    "hidden md:inline-block whitespace-nowrap font-normal px-[16px] py-[10px] bg-brand-500 rounded-se-2xl rounded-ss-2xl pointer-events-none"
                  )}
                >
                  {intl("plans.card.advance.layout")}
                </Typography>
              )}
              <PlanCard
                key={i}
                period={period}
                title={intl(titles.current[i])}
                description={intl(description.current[i][0])}
                features={description.current[i].slice(1).map((f) => intl(f))}
                discount={
                  period === "month"
                    ? percentage.unscale(plan.monthDiscount)
                    : period === "quarter"
                      ? percentage.unscale(plan.quarterDiscount)
                      : percentage.unscale(plan.yearDiscount)
                }
                monthlyPrice={price.unscale(plan.baseMonthlyPrice)}
                weeklyMinutes={plan.weeklyMinutes}
                subscriptionButton={
                  <Link
                    to={router.web({
                      route: Web.Checkout,
                      planId: plan.id,
                      period,
                    })}
                    className="w-full"
                  >
                    <Button
                      size="large"
                      className="mt-6 w-full justify-center py-2 bg-primary-500 font-cairo hover:bg-brand-700"
                    >
                      {intl("plan.card.pay.btn")}
                    </Button>
                  </Link>
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Selector;
