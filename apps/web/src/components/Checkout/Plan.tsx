import React from "react";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { Button } from "@litespace/ui/Button";
import { Link } from "react-router-dom";
import { Web } from "@litespace/utils/routes";
import { IPlan } from "@litespace/types";
import { formatMinutes, formatNumber, formatWeeks } from "@litespace/ui/utils";
import { PLAN_PERIOD_LITERAL_TO_WEEK_COUNT, price } from "@litespace/utils";
import { LocalId } from "@litespace/ui/locales";
import {
  calculateTotalPriceAfterDiscount,
  calculateTotalPriceBeforeDiscount,
} from "@litespace/utils/plan";

const PLAN_PERIOD_LITERAL_TO_MESSAGE_ID: Record<IPlan.PeriodLiteral, LocalId> =
  {
    month: "checkout.plan.period.month",
    quarter: "checkout.plan.period.quarter",
    year: "checkout.plan.period.year",
  };

const Plan: React.FC<{ data: IPlan.Self; period: IPlan.PeriodLiteral }> = ({
  data,
  period,
}) => {
  const intl = useFormatMessage();

  return (
    <div className="flex flex-col gap-4 py-6 rounded-2xl border border-natural-100">
      <Typography tag="h1" className="text-subtitle-1 font-bold px-6">
        {intl("checkout.plan.summary")}
      </Typography>

      <div className="flex flex-col gap-2 px-6">
        <Typography tag="h2" className="text-subtitle-2 font-semibold">
          {intl(PLAN_PERIOD_LITERAL_TO_MESSAGE_ID[period])}
        </Typography>
        <Typography
          tag="span"
          className="text-caption lg:text-body font-normal"
        >
          {intl("checkout.plan.houry-quota", {
            hours: formatMinutes(data.weeklyMinutes),
            weeks: formatWeeks(PLAN_PERIOD_LITERAL_TO_WEEK_COUNT[period]),
          })}
        </Typography>
      </div>

      <div className="flex flex-col gap-2 py-6 border-t border-b border-natural-100">
        <div className="flex justify-between mx-6">
          <Typography
            tag="span"
            className="text-caption lg:text-body font-normal"
          >
            {intl("checkout.plan.month-price")}
          </Typography>
          <Typography
            tag="span"
            className="text-caption lg:text-body font-normal"
          >
            {intl("checkout.plan.price", {
              price: formatNumber(price.unscale(data.baseMonthlyPrice)),
            })}
          </Typography>
        </div>
        <div className="flex justify-between mx-6">
          <Typography
            tag="span"
            className="text-caption lg:text-body font-normal"
          >
            {intl("checkout.plan.total-price-before-discount")}
          </Typography>
          <Typography
            tag="span"
            className="text-caption lg:text-body font-normal"
          >
            {intl("checkout.plan.price", {
              price: formatNumber(
                calculateTotalPriceBeforeDiscount(data.baseMonthlyPrice, period)
              ),
            })}
          </Typography>
        </div>
      </div>

      <div className="flex justify-between px-6 mt-2 mb-4">
        <Typography tag="span" className="text-caption lg:text-body font-bold">
          {intl("checkout.plan.total-price-after-discount")}
        </Typography>
        <Typography tag="span" className="text-caption lg:text-body font-bold">
          {intl("checkout.plan.price", {
            price: formatNumber(calculateTotalPriceAfterDiscount(data, period)),
          })}
        </Typography>
      </div>

      <Link to={Web.PlansV2} className="px-6" tabIndex={-1}>
        <Button type="main" size="large" variant="secondary" className="w-full">
          {intl("checkout.plan.change-plan")}
        </Button>
      </Link>
    </div>
  );
};

export default Plan;
