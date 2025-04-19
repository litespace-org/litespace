import React from "react";
import { Typography } from "@/components/Typography";
import cn from "classnames";

export const Tabs: React.FC<{
  /**
   * The Id of the current tab
   */
  tab?: string;
  tabs: Array<{ id: string; label: string; important?: boolean }>;
  setTab: (id: string) => void;
}> = ({ tab, tabs, setTab }) => {
  return (
    <div className="border border-natural-200 rounded-xl flex items-center">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          className={cn(
            "relative px-5 py-4 group rounded-xl",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-offset-0 focus-visible:ring-secondary-600"
          )}
          onClick={() => setTab(t.id)}
        >
          <Typography
            tag="h6"
            className={cn(
              "font-normal text-body ",
              t.id === tab
                ? "text-brand-700"
                : "text-natural-500 group-hover:text-brand-500 group-active:text-brand-700"
            )}
          >
            {t.label}
          </Typography>
          {t.important ? (
            <div className="absolute top-2 right-5 bg-destructive-500 w-2 h-2 rounded-full" />
          ) : null}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
