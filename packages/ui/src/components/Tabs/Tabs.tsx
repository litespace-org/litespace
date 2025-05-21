import React from "react";
import { Typography } from "@/components/Typography";
import cn from "classnames";
import { Void } from "@litespace/types";

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
    <div className="border border-natural-200 rounded-xl flex items-center justify-between w-full">
      {tabs.map(({ id, label, important }) => (
        <Tab
          key={id}
          select={() => setTab(id)}
          active={tab === id}
          label={label}
          important={important}
        />
      ))}
    </div>
  );
};

const Tab: React.FC<{
  select: Void;
  active: boolean;
  label: string;
  important?: boolean;
}> = ({ select, active, label, important }) => {
  return (
    <button
      type="button"
      className={cn(
        "relative px-[5.5px] md:px-5 py-3 md:py-4 group rounded-xl w-full",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-offset-0 focus-visible:ring-secondary-600",
        "flex items-center justify-center"
      )}
      onClick={select}
    >
      <Typography
        tag="h6"
        className={cn(
          "relative font-normal text-tiny md:text-body whitespace-nowrap w-fit",
          active
            ? "text-brand-700"
            : "text-natural-500 group-hover:text-brand-500 group-active:text-brand-700"
        )}
      >
        {label}
        {important ? <Important /> : null}
      </Typography>
    </button>
  );
};

const Important: React.FC = () => {
  return (
    <div className="absolute -top-1 right-0 bg-destructive-600 w-1 h-1 rounded-full" />
  );
};

export default Tabs;
