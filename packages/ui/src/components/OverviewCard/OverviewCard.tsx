import { useFormatMessage } from "@/hooks";
import { LocalId } from "@/locales";
import React from "react";
import cn from "classnames";
import { Typography } from "@/components/Typography";

export const OverviewCard: React.FC<{
  icon: React.JSX.Element;
  value: string;
  color: "brand" | "secondary" | "warning" | "destructive";
  title: LocalId;
  className?: string;
}> = ({ value, icon, color, title, className }) => {
  const intl = useFormatMessage();

  return (
    <div
      className={cn(
        "p-4 bg-natural-50 rounded-2xl shadow-ls-x-small",
        "border border-transparent hover:border-natural-100 max-w-[215px]",
        "basis-full flex flex-col justify-between gap-2 relative overflow-hidden",
        className
      )}
    >
      <div
        className={cn(
          "absolute top-0 left-11 -translate-y-1/2 -translate-x-1/2",
          "w-[69px] h-[69px] rounded-full"
        )}
        style={{ background: `var(--${color}-100)` }}
      />
      <div
        className={cn(
          "absolute top-0 left-2 -translate-y-1/2 -translate-x-1/2",
          "w-[69px] h-[69px] rounded-full"
        )}
        style={{ background: `var(--${color}-200)` }}
      />
      <div className="flex items-center gap-2 z-10">
        <div
          className={cn("w-6 h-6 rounded-md flex justify-center items-center")}
          style={{ backgroundColor: `var(--${color}-500)` }}
        >
          {icon}
        </div>
        <Typography
          tag="h2"
          className="text-natural-600 text-caption font-normal"
        >
          {intl(title)}
        </Typography>
      </div>
      <Typography
        tag="p"
        className={cn(
          "text-natural-950 inline-block self-start border-b pb-1",
          "text-h3 font-semibold"
        )}
        style={{ borderBottomColor: `var(--${color}-500)` }}
      >
        {value}
      </Typography>
    </div>
  );
};
