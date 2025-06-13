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
    <div className="flex flex-col py-4 lg:py-6 rounded-2xl border border-natural-100">
      <Typography
        tag="h1"
        className="text-body lg:text-subtitle-1 font-bold px-4 lg:px-6 mb-2 lg:mb-4"
      >
        {intl("checkout.plan.summary")}
      </Typography>

      <div className="flex flex-col gap-2 px-4 pb-4 md:pb-5 lg:pb-4 lg:px-6">
        <Typography
          tag="h2"
          className="text-caption lg:text-subtitle-2 font-bold lg:font-semibold"
        >
          {intl(PLAN_PERIOD_LITERAL_TO_MESSAGE_ID[period])}
        </Typography>
        <Typography
          tag="span"
          className="text-caption lg:text-body font-medium md:font-normal"
        >
          {intl("checkout.plan.houry-quota", {
            hours: formatMinutes(data.weeklyMinutes),
            weeks: formatWeeks(PLAN_PERIOD_LITERAL_TO_WEEK_COUNT[period]),
          })}
        </Typography>
      </div>

      <div className="flex flex-col gap-2 p-4 md:pb-5 lg:p-6 border-y border-natural-100">
        <div className="flex justify-between">
          <Typography
            tag="span"
            className="text-caption lg:text-body font-semibold md:font-normal"
          >
            {intl("checkout.plan.month-price")}
          </Typography>
          <Typography
            tag="span"
            className="text-caption lg:text-body font-semibold md:font-normal"
          >
            {intl("labels.currency.egp", {
              value: formatNumber(price.unscale(data.baseMonthlyPrice)),
            })}
          </Typography>
        </div>
        <div className="flex justify-between">
          <Typography
            tag="span"
            className="text-caption lg:text-body font-semibold md:font-normal"
          >
            {intl("checkout.plan.total-price-before-discount")}
          </Typography>
          <Typography
            tag="span"
            className="text-caption lg:text-body font-semibold md:font-normal"
          >
            {intl("labels.currency.egp", {
              value: formatNumber(
                calculateTotalPriceBeforeDiscount(data.baseMonthlyPrice, period)
              ),
            })}
          </Typography>
        </div>
      </div>

      <div className="flex justify-between px-4 lg:px-6 mt-4 lg:mt-6">
        <Typography
          tag="span"
          className="text-caption lg:text-body font-semibold md:font-bold"
        >
          {intl("checkout.plan.total-price-after-discount")}
        </Typography>
        <Typography
          tag="span"
          className="text-caption lg:text-body font-semibold md:font-bold"
        >
          {intl("labels.currency.egp", {
            value: formatNumber(calculateTotalPriceAfterDiscount(data, period)),
          })}
        </Typography>
      </div>

      <Link to={Web.Plans} className="px-4 lg:px-6 mt-6 lg:mt-8" tabIndex={-1}>
        <Button type="main" size="large" variant="secondary" className="w-full">
          <Typography
            tag="span"
            className="text text-caption md:text-body font-semibold md:font-medium"
          >
            {intl("checkout.plan.change-plan")}
          </Typography>
        </Button>
      </Link>
    </div>
  );
};

export default Plan;
