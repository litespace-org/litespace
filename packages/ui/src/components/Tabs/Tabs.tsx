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
    <div className="border border-natural-200 rounded-xl flex items-center">
      {tabs.map(({ id, label, important }) => (
        <button
          key={id}
          type="button"
          className={cn(
            "relative px-5 py-4 group rounded-xl",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-offset-0 focus-visible:ring-secondary-600"
          )}
          onClick={() => setTab(id)}
        >
          <Typography
            tag="h6"
            className={cn(
              "font-normal text-body whitespace-nowrap",
              id === tab
                ? "text-brand-700"
                : "text-natural-500 group-hover:text-brand-500 group-active:text-brand-700"
            )}
          >
            {label}
          </Typography>
          {important ? (
            <div className="absolute top-2 right-5 bg-destructive-500 w-2 h-2 rounded-full" />
          ) : null}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
