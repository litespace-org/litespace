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
    <div className="flex flex-col gap-1">
      <div className="flex justify-between">
        <Typography
          tag="span"
          className="text-natural-950 text-caption font-bold"
        >
          {intl("navbar.personal-quota")}
        </Typography>
        <Typography
          tag="span"
          className="text-natural-950 text-caption font-normal"
        >
          {intl("navbar.quota-consumption", {
            value: formatPercentage(progress),
          })}
        </Typography>
      </div>
      <div
        className={cn("relative w-[340px] h-2 bg-[#d9d9d9] rounded-[100px]")}
      >
        <div
          style={{ width: `${progress}%` }}
          className={cn(
            "absolute h-full top-0 right-0 bg-brand-600 rounded-[100px]"
          )}
        />
      </div>
      <Typography
        tag="span"
        className="text-natural-950 text-tiny font-semibold"
      >
        {intl("navbar.rest-of-quota", {
          value: formatMinutes(remainingMinutes),
        })}
      </Typography>
    </div>
  );
};

export default SubscriptionQouta;
