import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { formatMinutes, formatPercentage } from "@litespace/ui/utils";
import React, { useMemo } from "react";

const SubscriptionQouta: React.FC<{
  weeklyMinutes: number;
  remainingMinutes: number;
}> = ({ weeklyMinutes, remainingMinutes }) => {
  const intl = useFormatMessage();

  const progress = useMemo(() => {
    const percentage = (remainingMinutes / weeklyMinutes) * 100;
    if (percentage >= 100) return 100;
    return percentage;
  }, [remainingMinutes, weeklyMinutes]);

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

      <div className="relative w-[340px] h-2 bg-[#d9d9d9] rounded-[100px]">
        <div
          style={{ width: `${progress}%` }}
          className="absolute h-full top-0 right-0 bg-brand-600 rounded-[100px]"
        />
      </div>

      <Typography
        tag="span"
        className="text-natural-950 text-tiny font-semibold text-right"
      >
        {intl("navbar.rest-of-quota", {
          value: formatMinutes(remainingMinutes),
        })}
      </Typography>
    </div>
  );
};

export default SubscriptionQouta;
