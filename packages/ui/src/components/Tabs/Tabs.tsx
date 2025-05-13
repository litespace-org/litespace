import React from "react";
import { Typography } from "@/components/Typography";
import cn from "classnames";

export const Tabs = <T extends string>({
  tab,
  tabs,
  setTab,
}: {
  /**
   * The Id of the current tab
   */
  tab?: T;
  tabs: Array<{ id: T; label: string; important?: boolean }>;
  setTab: (id: T) => void;
}) => {
  return (
    <div className="border border-natural-200 rounded-xl flex items-center md:w-fit md:max-w-full overflow-x-auto">
      {tabs.map(({ id, label, important }) => (
        <button
          key={id}
          type="button"
          className={cn(
            "relative px-[5.5px] md:px-5 py-3 md:py-4 group rounded-xl",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-offset-0 focus-visible:ring-secondary-600"
          )}
          onClick={() => setTab(id)}
        >
          <Typography
            tag="h6"
            className={cn(
              "font-normal text-tiny md:text-body whitespace-nowrap",
              id === tab
                ? "text-brand-700"
                : "text-natural-500 group-hover:text-brand-500 group-active:text-brand-700"
            )}
          >
            {label}
          </Typography>
          {important ? (
            <div className="absolute top-2 right-1 md:right-5 bg-destructive-600 w-1 h-1 md:w-2 md:h-2 rounded-full" />
          ) : null}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
