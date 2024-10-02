import { range } from "lodash";
import React from "react";
import cn from "classnames";

const ratings = range(1, 6);

export const Rating: React.FC<{
  value?: number;
  onChange?: (value: number) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="tw-flex tw-gap-2">
      {ratings.map((rate) => (
        <span
          onClick={() => onChange && onChange(rate)}
          className={cn(
            "tw-bg-gray-100 hover:tw-bg-gray-200 tw-inline-block tw-cursor-pointer tw-font-cairo",
            "tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center",
            "tw-transition-all hover:tw-scale-110 tw-duration-200",
            "tw-shadow-lg tw-font-bold",
            rate === value && "tw-ring-2 tw-ring-blue-normal"
          )}
        >
          {rate}
        </span>
      ))}
    </div>
  );
};
