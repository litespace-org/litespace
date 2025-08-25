import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { percentage, price } from "@litespace/utils";
import React, { useMemo, useRef, useState } from "react";
// import { PaymentMethods } from "@/components/Plans/PaymentMethods";
import { router } from "@/lib/routes";
import { IPlan } from "@litespace/types";
import { PlanCard } from "@litespace/ui/PlanCard";
import { Tabs } from "@litespace/ui/Tabs";
import { Web } from "@litespace/utils/routes";
import { Link } from "react-router-dom";
import { LocalId } from "@litespace/ui/locales";
import { Button } from "@litespace/ui/Button";

// type Plan = Pick<
//   IPlan.Self,
//   | "id"
//   | "weeklyMinutes"
//   | "baseMonthlyPrice"
//   | "monthDiscount"
//   | "quarterDiscount"
//   | "yearDiscount"
// >;

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
          tabs={["month", "quarter", "year"].map((id) => ({
            id: id.toString(),
            label: intl(`plan.labels-${id as IPlan.PeriodLiteral}`),
          }))}
        />
      </div>
    </div>
  );
};

export const Selector: React.FC<{
  plans: IPlan.FindApiResponse["list"];
}> = ({ plans }) => {
  const intl = useFormatMessage();

  // const ordered = useMemo(() => {
  //   console.log(plans);
  //   return orderBy(plans, (plan) => plan.weeklyMinutes, "asc");
  // }, [plans]);

  // const defaultPlanId = useMemo(() => {
  //   return first(ordered)?.id || 0;
  // }, [ordered]);

  // const [planId, setPlanId] = useState<number>(defaultPlanId);

  const reversPlans = useMemo(() => {
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
    <div className="flex flex-col gap-8 max-w-screen-xl mx-auto">
      <PlansPanel period={period} setPeriod={setPeriod} />

      <div className="grid grid-cols-1 grid-flow-row md:grid-cols-3 gap-6">
        {reversPlans.map((plan, i) => {
          const isFeatured = i === 1;

          return (
            <>
              <div
                key={i}
                className="relative lg:mt-10 flex flex-col items-center"
              >
                {isFeatured && (
                  <span className="hidden xl:inline-block text-center text-natural-100 absolute -top-14 left-1/2 -translate-x-1/2 font-normal px-4 py-2 mt-4 mr-4 bg-brand-500 font-cairo rounded-se-2xl rounded-ss-2xl pointer-events-none">
                    {intl("plans.card.advance.layout")}
                  </span>
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
                  subscriptionBotton={
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
            </>
          );
        })}
      </div>

      {/* <Link
          to={router.web({ route: Web.Checkout, period, planId })}
          tabIndex={-1}
          className="w-full"
        >
          <Button htmlType="button" size="large" className="mt-4 w-full">
            <Typography tag="span">{intl("plan.subscribe-now")}</Typography>
          </Button>
        </Link> */}
    </div>
  );
};

export default Selector;
