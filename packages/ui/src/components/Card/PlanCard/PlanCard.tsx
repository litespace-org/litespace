import { Typography } from "@/components/Typography";
import { formatNumber } from "@/components/utils";
import { IPlan } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { PLAN_PERIOD_LITERAL_TO_MONTH_COUNT } from "@litespace/utils";
import cn from "classnames";
import React, { ReactNode, useMemo } from "react";
import { DiscountBadge } from "@/components/Card/PlanCard/DiscountBadge";
import { FeaturesList } from "@/components/Card/PlanCard/FeaturesList";

export const PlanCard: React.FC<{
  period: IPlan.PeriodLiteral;
  title: string;
  description: string;
  features: string[];
  discount: number;
  monthlyPrice: number;
  weeklyMinutes: number;
  subscriptionButton?: ReactNode;
  onSelect?: () => void;
}> = ({
  period,
  title,
  description,
  features,
  discount,
  monthlyPrice,
  weeklyMinutes,
  subscriptionButton,
  onSelect,
}) => {
  const totalPriceBeforeDiscount = useMemo(() => {
    const months = PLAN_PERIOD_LITERAL_TO_MONTH_COUNT[period];
    return monthlyPrice * months;
  }, [monthlyPrice, period]);

  const totalPriceAfterDiscount = useMemo(() => {
    return (totalPriceBeforeDiscount * (100 - discount)) / 100;
  }, [discount, totalPriceBeforeDiscount]);

  const intl = useFormatMessage();

  return (
    <div
      className={cn(
        "flex flex-col justify-between",
        "w-full h-full p-[24px] xl:p-[32px]",
        "max-w-[500px] md:max-w-max",
        "bg-natural-50 rounded-2xl border border-natural-100 shadow-md transition  hover:shadow-lg"
      )}
      onClick={onSelect}
    >
      <div
        className={cn(
          "font-bold font-cairo gap-2",
          "flex xl:flex-row md:flex-col md:items-start"
        )}
      >
        {/*For Tablet View */}
        <DiscountBadge
          discount={discount}
          className="hidden md:block xl:hidden"
        />

        <Typography
          tag="p"
          className="text-subtitle-2 font-bold text-natural-950 text-center"
        >
          {title}
        </Typography>

        {/* For Phone & PC View */}
        <DiscountBadge discount={discount} className="block md:max-xl:hidden" />
      </div>

      <Typography
        tag="p"
        className="mt-2 font-semibold text-tiny text-natural-700"
      >
        {description}
      </Typography>

      <FeaturesList features={features} />

      <div className="mt-[8px] xl:text-center">
        <Typography
          tag="p"
          className="flex font-bold text-subtitle-2 text-natural-950 whitespace-nowrap xl:text-[32px]"
        >
          {intl.rich("plan.weekly-minutes", { value: weeklyMinutes })}
        </Typography>

        <div className="flex xl:items-baseline text-center gap-1 mt-[4px] md:flex-col xl:mt-[8px] xl:gap-2 xl:flex-row">
          <Typography
            tag="span"
            className="flex font-bold text-[16px] text-natural-700 xl:text-[24px]"
          >
            {intl.rich("plan.price", { value: totalPriceAfterDiscount })}
          </Typography>

          {discount > 0 && (
            <Typography
              tag="span"
              className="text-start text-caption font-semibold text-natural-700 max-lg:mx-2 lg:ml-2"
            >
              {intl.rich("plan.instead-of", {
                value: (
                  <Typography
                    tag="span"
                    className={cn(
                      "text-tiny text-destructive-600 relative",
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
          )}
        </div>
      </div>
      {subscriptionButton}
    </div>
  );
};
