import React, { useMemo } from "react";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { Button } from "@litespace/ui/Button";
import { Link } from "react-router-dom";
import { Web } from "@litespace/utils/routes";
import { IPlan } from "@litespace/types";
import { formatDuration, formatNumber, formatWeeks } from "@litespace/ui/utils";
import {
  MILLISECONDS_IN_SECOND,
  percentage,
  SECONDS_IN_MINUTE,
} from "@litespace/utils";

const PlanInfo: React.FC<{ data: IPlan.Self; period: IPlan.PeriodLiteral }> = ({
  data,
  period,
}) => {
  const intl = useFormatMessage();

  const months = useMemo(() => {
    console.log(period);
    if (period === "month") return 1;
    if (period === "quarter") return 3;
    if (period === "year") return 12;
    return 0;
  }, [period]);

  const planTitle = useMemo(() => {
    if (period === "month") return intl("checkout.plan.period.month");
    if (period === "quarter") return intl("checkout.plan.period.quarter");
    if (period === "year") return intl("checkout.plan.period.year");
    return "";
  }, [period, intl]);

  const discount = useMemo(() => {
    console.log(data.quarterDiscount);
    if (period === "month") return percentage.unscale(data.monthDiscount) / 100;
    if (period === "quarter")
      return percentage.unscale(data.quarterDiscount) / 100;
    if (period === "year") return percentage.unscale(data.yearDiscount) / 100;
    return 0;
  }, [period, data]);

  return (
    <div className="flex flex-col gap-4 py-6 rounded-2xl border border-natural-100">
      <Typography tag="h1" className="text-subtitle-1 font-bold px-6">
        {intl("checkout.plan.summary")}
      </Typography>

      <div className="flex flex-col gap-2 px-6">
        <Typography tag="h2" className="text-subtitle-2 font-semibold">
          {planTitle}
        </Typography>
        <Typography
          tag="span"
          className="text-caption lg:text-body font-normal"
        >
          {intl("checkout.plan.houry-quota", {
            hours: formatDuration(
              data.weeklyMinutes * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND
            ),
            weeks: formatWeeks(months * 4),
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
              price: formatNumber(data.baseMonthlyPrice),
            })}
          </Typography>
        </div>
        <div className="flex justify-between mx-6">
          <Typography
            tag="span"
            className="text-caption lg:text-body font-normal"
          >
            {intl("checkout.plan.total-price")}
          </Typography>
          <Typography
            tag="span"
            className="text-caption lg:text-body font-normal"
          >
            {intl("checkout.plan.price", {
              price: formatNumber(data.baseMonthlyPrice * months),
            })}
          </Typography>
        </div>
      </div>

      <div className="flex justify-between px-6 mt-2 mb-4">
        <Typography tag="span" className="text-caption lg:text-body font-bold">
          {intl("checkout.plan.current-payment")}
        </Typography>
        <Typography tag="span" className="text-caption lg:text-body font-bold">
          {intl("checkout.plan.price", {
            price: formatNumber(
              data.baseMonthlyPrice * months * (1 - discount)
            ),
          })}
        </Typography>
      </div>

      <Link to={Web.PlansV2} className="px-6" tabIndex={-1}>
        <Button
          type="main"
          size="large"
          variant="secondary"
          className="w-full"
          disabled={false}
          loading={false}
        >
          {intl("checkout.plan.change-plan")}
        </Button>
      </Link>
    </div>
  );
};

export default PlanInfo;
