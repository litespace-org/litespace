import { Typography } from "@/components/Typography";
import { formatMinutes, formatPercentage } from "@/components/utils";
import { useFormatMessage } from "@/hooks";
import cn from "classnames";
import React, { useMemo } from "react";

const SubscriptionQouta: React.FC<{
  totalMinutes: number;
  remainingMinutes: number;
}> = ({ totalMinutes, remainingMinutes }) => {
  const intl = useFormatMessage();

  const progress = useMemo(() => {
    const percentage = (remainingMinutes / totalMinutes) * 100;
    if (percentage >= 100) return 100;
    return percentage;
  }, [remainingMinutes, totalMinutes]);

  return (
    <div className="tw-flex tw-flex-col tw-gap-1">
      <div className="tw-flex tw-justify-between">
        <Typography
          tag="span"
          className="tw-text-natural-950 tw-text-caption tw-font-bold"
        >
          {intl("navbar.personal-quota")}
        </Typography>
        <Typography
          tag="span"
          className="tw-text-natural-950 tw-text-caption tw-font-normal"
        >
          {intl("navbar.quota-consumption", {
            value: formatPercentage(progress),
          })}
        </Typography>
      </div>
      <div
        className={cn(
          "tw-relative tw-w-[340px] tw-h-2 tw-bg-[#d9d9d9] tw-rounded-[100px]"
        )}
      >
        <div
          style={{ width: `${progress}%` }}
          className={cn(
            "tw-absolute tw-h-full tw-top-0 tw-right-0 tw-bg-brand-600 tw-rounded-[100px]"
          )}
        />
      </div>
      <Typography
        tag="span"
        className="tw-text-natural-950 tw-text-tiny tw-font-semibold"
      >
        {intl("navbar.rest-of-quota", {
          value: formatMinutes(remainingMinutes),
        })}
      </Typography>
    </div>
  );
};

export default SubscriptionQouta;
