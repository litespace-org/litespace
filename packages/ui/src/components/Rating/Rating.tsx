import { range } from "lodash";
import React from "react";
import cn from "classnames";

const ratings = range(1, 6);

export const Rating: React.FC<{
  value?: number;
  onChange?: (value: number) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="flex gap-2">
      {ratings.map((rate) => (
        <span
          onClick={() => onChange && onChange(rate)}
          className={cn(
            "bg-gray-100 hover:bg-gray-200 inline-block cursor-pointer font-cairo",
            "w-10 h-10 rounded-full flex items-center justify-center",
            "transition-all hover:scale-110 duration-200",
            "shadow-lg font-bold",
            rate === value && "ring-2 ring-blue-normal"
          )}
        >
          {rate}
        </span>
      ))}
    </div>
  );
};
