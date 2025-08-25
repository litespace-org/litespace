import React from "react";
import cn from "classnames";
import { useFormatMessage } from "@/hooks";
import { Typography } from "@/components/Typography";

export const DiscountBadge: React.FC<{
  discount: number;
  className?: string;
}> = ({ discount, className }) => {
  const intl = useFormatMessage();

  if (discount <= 0) return null;

  return (
    <Typography
      tag="p"
      className={cn(
        "text-tiny font-semibold px-2 py-1 rounded-lg border bg-natural-100 md:mb-1 text-natural-600",
        className
      )}
    >
      {intl.rich("plan.discount", {
        value: discount,
      })}
    </Typography>
  );
};
