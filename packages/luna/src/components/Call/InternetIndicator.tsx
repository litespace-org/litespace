import React from "react";
import cn from "classnames";
import ExclamationMark from "@litespace/assets/ExclamationMark";
import { useFormatMessage } from "@/hooks";

export const InternetIndicator: React.FC = () => {
  const intl = useFormatMessage();
  return (
    <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
      <div
        className={cn(
          "tw-rounded-full tw-w-16 tw-h-16 tw-backdrop-blur-[15px] tw-p-4 tw-bg-[rgba(51, 38, 0, 0.6)]"
        )}
      >
        <ExclamationMark />
      </div>
      <div
        className={cn(
          "tw-rounded-full tw-h-16 tw-backdrop-blur-[15px] tw-p-4 tw-bg-[rgba(51, 38, 0, 0.6)]"
        )}
      >
        {intl("call.internet.problem")}
      </div>
    </div>
  );
};
