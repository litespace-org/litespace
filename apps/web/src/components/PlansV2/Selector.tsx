import React, { useMemo, useState } from "react";
import { RadioButton } from "@litespace/ui/RadioButton";
import { Typography } from "@litespace/ui/Typography";
import cn from "classnames";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { formatNumber } from "@litespace/ui/utils";
import {
  getAnnualHours,
  getHoursLabel,
  getMonthlyHours,
  getPlanCost,
  getPriceAfterDiscount,
  getQuarterHours,
} from "@/components/PlansV2";
import { Button } from "@litespace/ui/Button";
import { MINUTES_IN_HOUR } from "@litespace/utils";
import {
  PaymentMethods,
  PlanDuration,
  PlanDurationCard,
  Row,
} from "@/components/PlansV2";

const PLAN_DURATIONS: Array<PlanDuration> = ["month", "quarter", "year"];

export const Selector: React.FC<{
  plans: Array<{
    id: number;
    weeklyMinutes: number;
    baseMonthlyPrice: number; // scaled
    monthDiscount: number; // scaled
    quarterDiscount: number; // scaled
    yearDiscount: number; // scaled
  }>;
  onSelect: ({
    planId,
    duration,
  }: {
    planId: number;
    duration: "month" | "quarter" | "year";
  }) => void;
  loading: boolean;
}> = ({ plans, loading, onSelect }) => {
  const intl = useFormatMessage();
  const [checkedId, setCheckedId] = useState<number>(() => plans[0].id);
  const [planDuration, setPlanDuration] = useState<null | PlanDuration>(null);

  const plan = useMemo(
    () => plans.find((plan) => plan.id === checkedId),
    [checkedId, plans]
  );

  return (
    <div className="flex gap-4">
      <div className="min-w-[276px] flex-1 flex flex-col gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "bg-natural-50 border border-transparent hover:border-natural-100 rounded-2xl shadow-plan-card-v2 p-4",
              "flex flex-col gap-4"
            )}
          >
            <RadioButton
              label={
                <Typography
                  tag="h6"
                  className="text-caption font-bold text-natural-950"
                >
                  {plan.weeklyMinutes / MINUTES_IN_HOUR <= 10 &&
                  plan.weeklyMinutes / MINUTES_IN_HOUR >= 3
                    ? intl("plan.labels.hours-per-week", {
                        value: formatNumber(
                          plan.weeklyMinutes / MINUTES_IN_HOUR,
                          {
                            maximumFractionDigits: 0,
                          }
                        ),
                      })
                    : intl("plan.labels.hour-per-week", {
                        value: formatNumber(
                          plan.weeklyMinutes / MINUTES_IN_HOUR,
                          {
                            maximumFractionDigits: 0,
                          }
                        ),
                      })}
                </Typography>
              }
              name="planName"
              onChange={() => setCheckedId(plan.id)}
              checked={plan.id === checkedId}
              className="gap-2"
            />
          </div>
        ))}
      </div>
      <div className="flex-auto">
        <div className="flex flex-col gap-4">
          {plan &&
            PLAN_DURATIONS.map((duration) => {
              const monthlyHours = getMonthlyHours(plan.weeklyMinutes);
              const quarterHours = getQuarterHours(plan.weeklyMinutes);
              const annualHours = getAnnualHours(plan.weeklyMinutes);

              const planCost = (dur: PlanDuration) =>
                getPlanCost(plan.baseMonthlyPrice, dur);

              const priceAfterDiscount = (
                discount: number,
                duration: PlanDuration
              ) =>
                getPriceAfterDiscount(
                  plan.baseMonthlyPrice,
                  discount,
                  duration
                );

              if (duration === "month")
                return (
                  <PlanDurationCard
                    key={duration}
                    discount={plan.monthDiscount}
                    duration="month"
                    isOpen={planDuration === "month"}
                    setPlanDuration={() => setPlanDuration("month")}
                  >
                    <Row label={intl("plan.total-hours")}>
                      {intl(getHoursLabel(monthlyHours), {
                        value: formatNumber(monthlyHours, {
                          maximumFractionDigits: 0,
                        }),
                      })}
                    </Row>
                    <Row label={intl("plan.monthly-price")}>
                      {intl("global.currency.egp", {
                        value: formatNumber(planCost("month"), {
                          maximumFractionDigits: 2,
                        }),
                      })}
                    </Row>
                    <Row
                      label={intl("plan.total-price")}
                      className="font-bold"
                      isLast
                    >
                      {intl("global.currency.egp", {
                        value: formatNumber(
                          priceAfterDiscount(plan.monthDiscount, "month"),
                          { maximumFractionDigits: 2 }
                        ),
                      })}
                      {plan.monthDiscount ? (
                        <>
                          &nbsp; {/* white space equal to {" "} */}
                          <Typography
                            tag="span"
                            className="text-natural-500 text-tiny font-normal"
                          >
                            {intl("plan.instead-of")}
                          </Typography>
                          &nbsp; {/* white space equal to {" "} */}
                          <Typography
                            tag="span"
                            className={cn(
                              "text-tiny text-destructive-600 font-normal inline-block relative",
                              'after:content-[""] after:absolute after:top-1/2 after:right-0 after:left-0 after:h-[1px] after:bg-destructive-600'
                            )}
                          >
                            {intl("global.currency.egp", {
                              value: formatNumber(planCost("month"), {
                                maximumFractionDigits: 2,
                              }),
                            })}
                          </Typography>
                        </>
                      ) : null}
                    </Row>
                  </PlanDurationCard>
                );

              if (duration === "quarter")
                return (
                  <PlanDurationCard
                    key={duration}
                    discount={plan.quarterDiscount}
                    duration="quarter"
                    isOpen={planDuration === "quarter"}
                    setPlanDuration={() => setPlanDuration("quarter")}
                  >
                    <Row label={intl("plan.total-hours")}>
                      {intl(getHoursLabel(quarterHours), {
                        value: formatNumber(quarterHours, {
                          maximumFractionDigits: 0,
                        }),
                      })}
                    </Row>
                    <Row label={intl("plan.quarter-price")}>
                      {intl("global.currency.egp", {
                        value: formatNumber(planCost("quarter"), {
                          maximumFractionDigits: 2,
                        }),
                      })}
                    </Row>
                    <Row
                      label={intl("plan.total-price")}
                      className="font-bold"
                      isLast
                    >
                      {intl("global.currency.egp", {
                        value: formatNumber(
                          priceAfterDiscount(plan.quarterDiscount, "quarter"),
                          { maximumFractionDigits: 2 }
                        ),
                      })}
                      {plan.quarterDiscount ? (
                        <>
                          &nbsp; {/* white space equal to {" "} */}
                          <Typography
                            tag="span"
                            className="text-natural-500 text-tiny font-normal"
                          >
                            {intl("plan.instead-of")}
                          </Typography>
                          &nbsp; {/* white space equal to {" "} */}
                          <Typography
                            tag="span"
                            className={cn(
                              "text-tiny text-destructive-600 font-normal inline-block relative",
                              'after:content-[""] after:absolute after:top-1/2 after:right-0 after:left-0 after:h-[1px] after:bg-destructive-600'
                            )}
                          >
                            {intl("global.currency.egp", {
                              value: formatNumber(planCost("quarter"), {
                                maximumFractionDigits: 2,
                              }),
                            })}
                          </Typography>
                        </>
                      ) : null}
                    </Row>
                  </PlanDurationCard>
                );

              return (
                <PlanDurationCard
                  key={duration}
                  discount={plan.yearDiscount}
                  duration="year"
                  isOpen={planDuration === "year"}
                  setPlanDuration={() => setPlanDuration("year")}
                >
                  <Row label={intl("plan.total-hours")}>
                    {intl(getHoursLabel(annualHours), {
                      value: formatNumber(annualHours, {
                        maximumFractionDigits: 0,
                      }),
                    })}
                  </Row>
                  <Row label={intl("plan.annual-price")}>
                    {intl("global.currency.egp", {
                      value: formatNumber(planCost("year"), {
                        maximumFractionDigits: 2,
                      }),
                    })}
                  </Row>
                  <Row
                    label={intl("plan.total-price")}
                    className="font-bold"
                    isLast
                  >
                    {intl("global.currency.egp", {
                      value: formatNumber(
                        priceAfterDiscount(plan.yearDiscount, "year"),
                        { maximumFractionDigits: 2 }
                      ),
                    })}
                    {plan.monthDiscount ? (
                      <>
                        &nbsp; {/* white space equal to {" "} */}
                        <Typography
                          tag="span"
                          className="text-natural-500 text-tiny font-normal"
                        >
                          {intl("plan.instead-of")}
                        </Typography>
                        &nbsp; {/* white space equal to {" "} */}
                        <Typography
                          tag="span"
                          className={cn(
                            "text-tiny text-destructive-600 font-normal inline-block relative",
                            'after:content-[""] after:absolute after:top-1/2 after:right-0 after:left-0 after:h-[1px] after:bg-destructive-600'
                          )}
                        >
                          {intl("global.currency.egp", {
                            value: formatNumber(planCost("year"), {
                              maximumFractionDigits: 2,
                            }),
                          })}
                        </Typography>
                      </>
                    ) : null}
                  </Row>
                </PlanDurationCard>
              );
            })}
        </div>
        <Button
          size="large"
          onClick={() => {
            if (!plan || !planDuration) return;

            onSelect({
              planId: plan.id,
              duration: planDuration,
            });
          }}
          loading={loading}
          disabled={!planDuration || loading}
          className="mt-4 w-full"
        >
          <Typography tag="span" className="">
            {intl("plan.subscribe-now")}
          </Typography>
        </Button>
      </div>
      <PaymentMethods />
    </div>
  );
};

export default Selector;
