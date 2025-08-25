import { Typography } from "@/components/Typography";
import { formatNumber } from "@/components/utils";
import Correct from "@litespace/assets/CorrectCard";
import { IPlan } from "@litespace/types";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { PLAN_PERIOD_LITERAL_TO_MONTH_COUNT } from "@litespace/utils";
import cn from "classnames";
import React, { ReactNode, useMemo } from "react";

export const PlanCard: React.FC<{
  period: IPlan.PeriodLiteral;
  title: string;
  description: string;
  features: string[];
  discount: number;
  monthlyPrice: number;
  weeklyMinutes: number;
  subscriptionBotton?: ReactNode;
  onSelect?: () => void;
}> = ({
  period,
  title,
  description,
  features,
  discount,
  monthlyPrice,
  weeklyMinutes,
  subscriptionBotton,
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
      className="flex flex-col w-full h-full p-6 bg-natural-50 justify-between rounded-2xl border border-natural-100 shadow-md mx-6 lg:max-w-sm md:max-w-56 hover:shadow-lg transition"
      onClick={onSelect}
    >
      <div className="flex xl:flex-row md:flex-col md:items-start font-bold font-cairo gap-2">
        {/* This is for tablet view */}
        {discount > 0 && (
          <p className="hidden md:max-lg:block xl:hidden text-xs font-semibold px-2 py-1 rounded-lg bg-natural-100 md:mb-1 text-neutral-600">
            {discount}% خصم لفترة محدودة
          </p>
        )}

        <h3 className="text-xl text-center">{title}</h3>

        {discount > 0 && (
          <p className="block md:max-xl:hidden text-xs font-semibold px-2 py-1 rounded-lg bg-natural-100 md:mb-1 text-neutral-600">
            {discount}% خصم لفترة محدودة
          </p>
        )}
      </div>

      <p className="font-cairo mt-2 font-semibold text-xs text-natural-700">
        {description}
      </p>
      <div className="flex">
        <ul className="mt-4 font-normal space-y-2 text-natural-700 text-xs">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <Correct className="w-4 h-4 text-xs flex-shrink-0" />
              <span className="font-cairo text-natural-700 text-xs text-tiny">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="font-cairo md:mt-2 lg:mt-4 lg:text-center">
        <p className="flex xl:text-3xl sm:text-xl md:text-lg font-bold text-natural-950">
          {weeklyMinutes} دقيقه/اسبوع
        </p>
        <div className="text-center">
          <p className="flex sm:gap-1 md:flex-col lg:mt-4 lg:items-center lg:gap-3 xl:flex-row ">
            <span className="flex xl:text-2xl sm:text-base md:text-base font-bold text-natural-700">
              {totalPriceAfterDiscount} جنيه مصري
            </span>

            {discount > 0 && (
              <span className="text-start text-sm ml-2 font-cairo font-semibold text-neutral-700">
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
              </span>
            )}
          </p>
        </div>
      </div>
      {subscriptionBotton}

      {/* <Button
      size="large"
      className="mt-6 w-full justify-center py-2 bg-primary-500 font-cairo hover:bg-brand-700"
      >
        
        {intl("plan.card.pay.btn")}
      </Button> */}
    </div>
  );
};
