import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { Typography } from "@litespace/ui/Typography";
import { formatMinutes, formatPercentage } from "@litespace/ui/utils";
import React, { useMemo } from "react";
import Info from "@litespace/assets/Info";
import cn from "classnames";

const SubscriptionQouta: React.FC<{
  weeklyMinutes: number;
  remainingMinutes: number;
  isFreeTrial?: boolean;
}> = ({ weeklyMinutes, remainingMinutes, isFreeTrial = false }) => {
  const intl = useFormatMessage();

  const remaining = useMemo(() => {
    const percentage = (remainingMinutes / weeklyMinutes) * 100;
    if (percentage >= 100) return 100;
    return percentage;
  }, [remainingMinutes, weeklyMinutes]);

  const consumption = useMemo(() => {
    const safeRemaining = Number.isNaN(remaining) ? 0 : remaining;
    return 100 - safeRemaining;
  }, [remaining]);

  const titleMessage = isFreeTrial
    ? "navbar.subscription.free-trial"
    : "navbar.subscription.personal-quota";

  const remainingMessage = isFreeTrial
    ? "navbar.subscription.free-trial-rest"
    : "navbar.subscription.rest-of-quota";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between">
        <div className="flex flex-row items-center gap-1">
          <Info className="w-4 h-4 [&>*]:fill-brand-600" />
          <Typography
            tag="span"
            className="text-natural-950 text-caption font-bold"
          >
            {intl(titleMessage)}
          </Typography>
        </div>

        <Typography
          tag="span"
          className={cn(
            "text-natural-950 text-caption font-normal",
            consumption <= 0 ? "hidden" : "block"
          )}
        >
          {intl("navbar.subscription.quota-consumption", {
            value: formatPercentage(consumption),
          })}
        </Typography>
      </div>

      <div className="relative w-[340px] h-2 bg-[#d9d9d9] rounded-[100px]">
        <div
          style={{ width: `${remaining}%` }}
          className="absolute h-full top-0 right-0 bg-brand-600 rounded-[100px]"
        />
      </div>

      <Typography
        tag="span"
        className="text-natural-950 text-tiny font-semibold text-right"
      >
        {intl(remainingMessage, {
          value: formatMinutes(remainingMinutes),
        })}
      </Typography>
    </div>
  );
};

export default SubscriptionQouta;
