import { range } from "lodash";
import React from "react";
import cn from "classnames";

const ratings = range(1, 6);

export const Rating: React.FC<{
  value?: number;
  onChange?: (value: number) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="ui-flex ui-gap-2">
      {ratings.map((rate) => (
        <span
          onClick={() => onChange && onChange(rate)}
          className={cn(
            "ui-bg-gray-100 hover:ui-bg-gray-200 ui-inline-block ui-cursor-pointer ui-font-cairo",
            "ui-w-10 ui-h-10 ui-rounded-full ui-flex ui-items-center ui-justify-center",
            "ui-transition-all hover:ui-scale-110 ui-duration-200",
            "ui-shadow-lg ui-font-bold",
            rate === value && "ui-ring-2 ui-ring-blue-normal"
          )}
        >
          {rate}
        </span>
      ))}
    </div>
  );
};
