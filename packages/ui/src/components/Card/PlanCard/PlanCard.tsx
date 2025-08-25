import { Button } from "@/components/Button";
import { Typography } from "@/components/Typography";
import { formatNumber } from "@/components/utils";
import CheckMark from "@litespace/assets/CheckMark";
import { IPlan } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import {
  percentage,
  PLAN_PERIOD_LITERAL_TO_MONTH_COUNT,
} from "@litespace/utils";
import cn from "classnames";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";

export const PlanCard: React.FC<{
  period: IPlan.PeriodLiteral;
  title: string;
  description: string;
  features: string[];
  discount: number;
  monthlyPrice: number;
  weeklyMinutes: number;
  subscriptionLink: string;
  mostCommon?: boolean;
  onSelect?: () => void;
}> = ({
  period,
  title,
  description,
  features,
  discount,
  monthlyPrice,
  weeklyMinutes,
  subscriptionLink,
  mostCommon = false,
  onSelect,
}) => {
  const intl = useFormatMessage();

  const totalPriceBeforeDiscount = useMemo(() => {
    const months = PLAN_PERIOD_LITERAL_TO_MONTH_COUNT[period];
    return monthlyPrice * months;
  }, [monthlyPrice, period]);

  const totalPriceAfterDiscount = useMemo(() => {
    return (
      totalPriceBeforeDiscount -
      (discount / totalPriceBeforeDiscount) * totalPriceBeforeDiscount
    );
  }, [discount, totalPriceBeforeDiscount]);

  return (
    <div
      className={cn(
        "md:last:col-span-2 xl:last:col-span-1 md:first:justify-self-end md:[&:nth-of-type(2)]:justify-self-start",
        "xl:first:justify-self-auto xl:[&>nth-of-type(2)]:justify-self-auto",
        "relative flex flex-col",
        "w-full h-full p-[24px] xl:p-[32px]",
        "min-w-[323px] max-w-[400px]",
        "bg-natural-50 rounded-2xl border border-natural-100"
      )}
      onClick={onSelect}
    >
      {mostCommon ? (
        <Typography
          tag="span"
          className={cn(
            "hidden md:inline-block text-caption text-center text-natural-100",
            "absolute -top-10 left-1/2 -translate-x-1/2 overflow-visible",
            "hidden md:inline-block whitespace-nowrap font-normal px-[16px] py-[10px] bg-brand-500 rounded-se-2xl rounded-ss-2xl pointer-events-none"
          )}
        >
          {intl("plans.card.advance.layout")}
        </Typography>
      ) : null}
      <div className={cn("flex gap-2 md:items-start mb-2")}>
        <Typography
          tag="p"
          className="text-subtitle-2 font-bold text-natural-950 text-center"
        >
          {title}
        </Typography>
        <DiscountBadge discount={discount} />
      </div>

      <Typography
        tag="p"
        className="font-semibold text-tiny text-natural-700 mb-4 min-h-[36px]"
      >
        {description}
      </Typography>

      <FeaturesList features={features} />

      <div className="mt-4 flex flex-col gap-1 lg:gap-2">
        <Typography
          tag="p"
          className="flex font-bold text-subtitle-2 text-natural-950 whitespace-nowrap xl:text-[32px]"
        >
          {intl.rich("plan.weekly-minutes", { value: weeklyMinutes })}
        </Typography>

        <div className="flex items-center md:items-start 2xl:items-center md:flex-col 2xl:flex-row gap-1 xl:gap-2">
          <Typography
            tag="span"
            className="flex font-bold text-[16px] text-natural-700 xl:text-[24px]"
          >
            {intl.rich("plan.price", { value: totalPriceAfterDiscount })}
          </Typography>

          {discount > 0 ? (
            <Typography
              tag="span"
              className="text-caption font-semibold text-natural-700"
            >
              {intl.rich("plan.instead-of", {
                value: (
                  <Typography
                    tag="span"
                    className={cn(
                      "relative text-tiny text-destructive-600",
                      'after:content-[""] after:absolute after:top-1/2 after:right-0 after:left-0 after:h-[1px] after:bg-destructive-600'
                    )}
                  >
                    {intl("labels.currency.egp", {
                      value: formatNumber(totalPriceBeforeDiscount, {
                        maximumFractionDigits: 2,
                      }),
                    })}
                  </Typography>
                ),
              })}
            </Typography>
          ) : null}
        </div>
      </div>
      <Link to={subscriptionLink} tabIndex={-1} className="w-full">
        <Button
          size="large"
          className="mt-6 w-full justify-center py-2 bg-primary-500 font-cairo hover:bg-brand-700"
        >
          {intl("plan.card.pay.btn")}
        </Button>
      </Link>
    </div>
  );
};

const FeaturesList: React.FC<{ features: string[] }> = ({ features }) => {
  return (
    <ul className="flex flex-col gap-2 mb-auto">
      {features.map((feature, idx) => (
        <li key={idx} className="flex gap-1">
          <CheckMark className="w-[14px] h-[14px] xl:w-[16px] xl:h-[16px] flex-shrink-0" />
          <Typography
            tag="span"
            className="font-normal text-tiny text-natural-700"
          >
            {feature}
          </Typography>
        </li>
      ))}
    </ul>
  );
};

const DiscountBadge: React.FC<{
  discount: number;
}> = ({ discount }) => {
  const intl = useFormatMessage();

  if (discount <= 0) return null;

  return (
    <Typography
      tag="p"
      className={
        "text-tiny font-semibold px-2 py-1 rounded-lg border bg-natural-100 text-natural-600"
      }
    >
      {intl.rich("plan.discount", {
        value: percentage.unscale(discount),
      })}
    </Typography>
  );
};
